import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/productModels.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- Category Detection Class ---
class ProductCategoryDetector {
  constructor() {
    this.categoryMap = {
      'Electronics & Audio': {
        keywords: ['headphones', 'earbuds', 'mic', 'bluetooth', 'speaker', 'jbl', 'sony'],
        patterns: [/\bnoise cancel/i]
      },
      'Electronics & Mobile': {
        keywords: ['mobile', 'iphone', 'samsung', 'oneplus', 'charger']
      },
      'Electronics & Computing': {
        keywords: ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse']
      },
      'Home & Kitchen': {
        keywords: ['kitchen', 'microwave', 'fridge', 'blender']
      },
      'Fashion & Clothing': {
        keywords: ['shirt', 'jeans', 'dress', 'sneakers']
      },
      'Health & Beauty': {
        keywords: ['skincare', 'lotion', 'perfume']
      }
    };
    this.brandCategories = {
      'jbl': 'Electronics & Audio',
      'sony': 'Electronics & Audio',
      'apple': 'Electronics & Mobile',
      'samsung': 'Electronics & Mobile',
      'oneplus': 'Electronics & Mobile'
    };
  }

  detectCategory(name) {
    const text = name.toLowerCase();
    const scores = {};
    Object.keys(this.categoryMap).forEach(c => (scores[c] = 0));

    Object.entries(this.categoryMap).forEach(([category, config]) => {
      config.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) scores[category] += 2;
      });
      if (config.patterns) {
        config.patterns.forEach(pat => {
          if (pat.test(text)) scores[category] += 4;
        });
      }
    });

    Object.entries(this.brandCategories).forEach(([brand, category]) => {
      if (text.includes(brand)) scores[category] += 3;
    });

    const maxScore = Math.max(...Object.values(scores));
    return maxScore === 0 ? 'General' : Object.keys(scores).find(k => scores[k] === maxScore);
  }
}

const categoryDetector = new ProductCategoryDetector();

const cleanPrice = (text) => {
  const match = text?.replace(/[^\d.]/g, '');
  return parseFloat(match) || 0;
};

const extractJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*?\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Invalid JSON from Gemini');
  }
};

const scrapeProductDetails = async (url) => {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(data);

  const title = $('title').first().text().trim();
  const price = cleanPrice($('[class*=price], .price, span[class*=Price]').first().text().trim());
  const image = $('img').first().attr('src') || '';

  return {
    name: title || 'Unknown Product',
    price,
    image,
    category: categoryDetector.detectCategory(title)
  };
};

// --- Controller Functions ---

export const parseProduct = async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: "Product link is required" });

  try {
    new URL(link);
    const prompt = `
      Extract product info from this e-commerce URL: ${link}
      Return JSON like:
      {
        "name": "...",
        "price": 123,
        "image": "..."
      }
      Respond with only the JSON.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    let productData = extractJSON(response);

    if (!productData.name) throw new Error("AI didn't return name");
    const category = categoryDetector.detectCategory(productData.name);

    return res.status(200).json({
      name: productData.name,
      price: cleanPrice(productData.price),
      image: productData.image,
      category,
      source: link
    });
  } catch (err) {
    console.warn("Gemini failed, falling back to scraping:", err.message);
    try {
      const scraped = await scrapeProductDetails(link);
      return res.status(200).json({ ...scraped, source: link });
    } catch (error) {
      return res.status(500).json({ error: "Failed to parse product link" });
    }
  }
};

export const parseAndSaveProduct = async (req, res) => {
  const { link, userId, targetDate, contributionType, contributionAmount } = req.body;
  if (!link || !userId || !targetDate || !contributionType || !contributionAmount)
    return res.status(400).json({ error: "All fields required" });

  try {
    let productData;
    try {
      const prompt = `
        Extract product info from this e-commerce URL: ${link}
        Return JSON like:
        {
          "name": "...",
          "price": 123,
          "image": "..."
        }
        Respond with only the JSON.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      productData = extractJSON(response);
    } catch {
      productData = await scrapeProductDetails(link);
    }

    const newProduct = new Product({
      userId,
      title: productData.name,
      price: cleanPrice(productData.price),
      imageUrl: productData.image,
      category: categoryDetector.detectCategory(productData.name),
      productUrl: link,
      targetDate: new Date(targetDate),
      contributionType,
      contributionAmount,
      savedAmount: 0
    });

    const saved = await newProduct.save();
    return res.status(201).json({
      message: "Saved successfully",
      product: saved
    });

  } catch (error) {
    return res.status(500).json({ error: "Failed to parse and save product" });
  }
};

export const getUserProducts = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "User ID required" });

  const products = await Product.find({ userId }).sort({ createdAt: -1 });
  return res.status(200).json({ products, count: products.length });
};

export const updateSavedAmount = async (req, res) => {
  const { productId } = req.params;
  const { savedAmount } = req.body;
  if (!productId || savedAmount === undefined)
    return res.status(400).json({ error: "Product ID and savedAmount required" });

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { savedAmount: Number(savedAmount) },
    { new: true, runValidators: true }
  );

  if (!updatedProduct)
    return res.status(404).json({ error: "Product not found" });

  await updatedProduct.save(); // ✅ fixed line

  return res.status(200).json({
    message: "Updated saved amount",
    product: updatedProduct
  });
};

export const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  if (!productId) return res.status(400).json({ error: "Product ID required" });

  const deleted = await Product.findByIdAndDelete(productId);
  if (!deleted) return res.status(404).json({ error: "Not found" });

  return res.status(200).json({ message: "Deleted", deletedProduct: deleted });
};

export const parseProductWithScraping = async (req, res) => {
  try {
    const { link } = req.body;
    if (!link) return res.status(400).json({ error: "Product link is required" });

    const productData = await scrapeProductDetails(link);
    return res.status(200).json({ ...productData, source: link });
  } catch (err) {
    return res.status(500).json({ error: "Scraping failed" });
  }
};
