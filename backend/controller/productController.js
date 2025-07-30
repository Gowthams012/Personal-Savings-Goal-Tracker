import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/productModels.js'; // Import your Product model

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Intelligent Category Detection System
class ProductCategoryDetector {
  constructor() {
    this.categoryMap = {
      'Electronics & Audio': {
        keywords: [
          'headphones', 'headphone', 'earphones', 'earphone', 'earbuds', 'earbud',
          'headset', 'speakers', 'speaker', 'soundbar', 'bluetooth', 'wireless',
          'audio', 'microphone', 'mic', 'amplifier', 'subwoofer', 'tweeter',
          'bass', 'stereo', 'noise cancelling', 'anc', 'tws', 'airpods',
          'beats', 'sony', 'bose', 'jbl', 'boat', 'sennheiser'
        ],
        patterns: [
          /\b(in-ear|on-ear|over-ear)\b/i,
          /\bwith mic\b/i,
          /\bnoise cancel/i,
          /\bbass\s*heads?\b/i
        ]
      },
      'Electronics & Mobile': {
        keywords: [
          'smartphone', 'phone', 'mobile', 'iphone', 'android', 'samsung',
          'oneplus', 'xiaomi', 'realme', 'oppo', 'vivo', 'pixel', 'huawei',
          'case', 'cover', 'screen protector', 'charger', 'power bank',
          'cable', 'adapter', 'wireless charger', 'magsafe', 'fast charging'
        ]
      },
      'Electronics & Computing': {
        keywords: [
          'laptop', 'computer', 'desktop', 'monitor', 'keyboard', 'mouse',
          'webcam', 'processor', 'cpu', 'gpu', 'ram', 'ssd', 'hdd',
          'motherboard', 'graphics card', 'gaming', 'mechanical keyboard',
          'dell', 'hp', 'lenovo', 'asus', 'acer', 'macbook', 'imac'
        ]
      },
      'Home & Kitchen': {
        keywords: [
          'kitchen', 'cookware', 'utensils', 'appliances', 'microwave',
          'refrigerator', 'washing machine', 'dishwasher', 'blender',
          'mixer', 'grinder', 'toaster', 'kettle', 'cooker', 'pan'
        ]
      },
      'Fashion & Clothing': {
        keywords: [
          'shirt', 'pants', 'jeans', 'dress', 'jacket', 'sweater',
          'hoodie', 't-shirt', 'kurta', 'saree', 'shoes', 'sneakers',
          'boots', 'sandals', 'bag', 'handbag', 'backpack', 'wallet'
        ]
      },
      'Health & Beauty': {
        keywords: [
          'skincare', 'makeup', 'cosmetics', 'cream', 'lotion', 'serum',
          'shampoo', 'conditioner', 'soap', 'perfume', 'deodorant',
          'toothbrush', 'toothpaste', 'vitamin', 'supplement'
        ]
      }
    };

    this.brandCategories = {
      'boat': 'Electronics & Audio',
      'jbl': 'Electronics & Audio',
      'sony': 'Electronics & Audio',
      'bose': 'Electronics & Audio',
      'beats': 'Electronics & Audio',
      'apple': 'Electronics & Mobile',
      'samsung': 'Electronics & Mobile',
      'oneplus': 'Electronics & Mobile',
      'xiaomi': 'Electronics & Mobile'
    };
  }

  detectCategory(productName, price = 0) {
    const text = productName.toLowerCase();
    const scores = {};

    Object.keys(this.categoryMap).forEach(category => {
      scores[category] = 0;
    });

    Object.entries(this.categoryMap).forEach(([category, config]) => {
      config.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          const exactMatch = new RegExp(`\\b${keyword.toLowerCase()}\\b`).test(text);
          scores[category] += exactMatch ? 3 : 1;
        }
      });

      if (config.patterns) {
        config.patterns.forEach(pattern => {
          if (pattern.test(text)) {
            scores[category] += 5;
          }
        });
      }
    });

    Object.entries(this.brandCategories).forEach(([brand, category]) => {
      if (text.includes(brand.toLowerCase())) {
        scores[category] += 4;
      }
    });

    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return 'General';
    }

    const detectedCategory = Object.keys(scores).find(category => scores[category] === maxScore);
    return detectedCategory || 'General';
  }
}

const categoryDetector = new ProductCategoryDetector();

const cleanPrice = (text) => {
  if (!text) return 0;
  const priceMatch = text.replace(/[^\d.]/g, '');
  return parseFloat(priceMatch) || 0;
};

const extractJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    
    throw new Error('No valid JSON found in response');
  }
};

const scrapeProductDetails = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    const selectors = {
      title: [
        'h1[data-automation-id="product-title"]', // Walmart
        '#productTitle', // Amazon
        'h1.x-item-title-label', // eBay
        '.pdp-product-name',
        '.product-title',
        'h1',
        '.title'
      ],
      price: [
        '[data-automation-id="product-price"]',
        '.a-price-whole',
        '.price',
        '.current-price',
        '.sale-price',
        '.regular-price'
      ],
      image: [
        '[data-automation-id="hero-image"] img',
        '#landingImage',
        '.product-image img',
        '.hero-image img',
        '.main-image img'
      ]
    };

    const extractText = (selectors) => {
      for (const selector of selectors) {
        const element = $(selector).first();
        if (element.length) {
          return element.text().trim();
        }
      }
      return '';
    };

    const extractImageUrl = (selectors) => {
      for (const selector of selectors) {
        const element = $(selector).first();
        if (element.length) {
          return element.attr('src') || element.attr('data-src') || '';
        }
      }
      return '';
    };

    const name = extractText(selectors.title);
    const price = cleanPrice(extractText(selectors.price));

    return {
      name,
      price,
      image: extractImageUrl(selectors.image),
      category: categoryDetector.detectCategory(name, price)
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to scrape product details');
  }
};

// Parse product and return data (without saving to DB)
export const parseProduct = async (req, res) => {
  try {
    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ error: "Product link is required" });
    }
    
    try {
      new URL(link);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    
    let productData = null;
    
    try {
      const prompt = `
        Extract product information from this e-commerce URL: ${link}
        
        Please return ONLY a valid JSON object with the following structure:
        {
          "name": "product name",
          "price": number (just the numeric value),
          "image": "image URL"
        }
        
        If you cannot access the URL directly, please indicate that in the response.
        Do not include any markdown formatting or additional text.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      console.log('Gemini response:', response);
      
      productData = extractJSON(response);
      
      if (!productData.name || productData.name.includes('cannot access')) {
        throw new Error('AI could not extract product details');
      }
    } catch (aiError) {
      console.log('AI extraction failed, falling back to web scraping:', aiError.message);
      productData = await scrapeProductDetails(link);
    }
    
    if (!productData.name) {
      return res.status(400).json({ error: "Could not extract product name" });
    }
    
    if (typeof productData.price === 'string') {
      productData.price = cleanPrice(productData.price);
    }
    
    // Detect category using intelligent system
    const category = categoryDetector.detectCategory(productData.name, productData.price);
    
    const finalProductData = {
      name: productData.name || 'Unknown Product',
      price: productData.price || 0,
      image: productData.image || '',
      category: category,
      source: link
    };
    
    return res.status(200).json(finalProductData);
  } catch (error) {
    console.error("Parsing error:", error);
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({ error: "Request timeout - the website took too long to respond" });
    } else if (error.message.includes('Network Error')) {
      return res.status(503).json({ error: "Network error - unable to reach the website" });
    } else if (error.message.includes('404')) {
      return res.status(404).json({ error: "Product page not found" });
    }
    
    return res.status(500).json({ 
      error: "Failed to parse product link",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Parse product and save to MongoDB
export const parseAndSaveProduct = async (req, res) => {
  try {
    const { 
      link, 
      userId, 
      targetDate, 
      contributionType, 
      contributionAmount 
    } = req.body;
    
    // Validate required fields
    if (!link || !userId || !targetDate || !contributionType || !contributionAmount) {
      return res.status(400).json({ 
        error: "Missing required fields: link, userId, targetDate, contributionType, contributionAmount" 
      });
    }
    
    if (!['monthly', 'daily'].includes(contributionType)) {
      return res.status(400).json({ 
        error: "contributionType must be either 'monthly' or 'daily'" 
      });
    }
    
    try {
      new URL(link);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    
    let productData = null;
    
    // Extract product data (same logic as parseProduct)
    try {
      const prompt = `
        Extract product information from this e-commerce URL: ${link}
        
        Please return ONLY a valid JSON object with the following structure:
        {
          "name": "product name",
          "price": number (just the numeric value),
          "image": "image URL"
        }
        
        If you cannot access the URL directly, please indicate that in the response.
        Do not include any markdown formatting or additional text.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      console.log('Gemini response:', response);
      
      productData = extractJSON(response);
      
      if (!productData.name || productData.name.includes('cannot access')) {
        throw new Error('AI could not extract product details');
      }
    } catch (aiError) {
      console.log('AI extraction failed, falling back to web scraping:', aiError.message);
      productData = await scrapeProductDetails(link);
    }
    
    if (!productData.name) {
      return res.status(400).json({ error: "Could not extract product name" });
    }
    
    if (typeof productData.price === 'string') {
      productData.price = cleanPrice(productData.price);
    }
    
    // Detect category
    const category = categoryDetector.detectCategory(productData.name, productData.price);
    
    // Create new product document with correct field mapping
    const newProduct = new Product({
      userId: userId,
      title: productData.name, // name -> title
      price: productData.price || 0,
      imageUrl: productData.image || '', // image -> imageUrl
      category: category,
      productUrl: link, // source -> productUrl
      targetDate: new Date(targetDate),
      contributionType: contributionType,
      contributionAmount: Number(contributionAmount),
      savedAmount: 0 // Default value
    });
    
    // Save to MongoDB
    const savedProduct = await newProduct.save();
    
    return res.status(201).json({
      message: "Product parsed and saved successfully",
      product: savedProduct
    });
    
  } catch (error) {
    console.error("Parse and save error:", error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: "Product already exists for this user"
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({ error: "Request timeout - the website took too long to respond" });
    } else if (error.message.includes('Network Error')) {
      return res.status(503).json({ error: "Network error - unable to reach the website" });
    } else if (error.message.includes('404')) {
      return res.status(404).json({ error: "Product page not found" });
    }
    
    return res.status(500).json({ 
      error: "Failed to parse and save product",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all products for a user
export const getUserProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const products = await Product.find({ userId }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      products: products,
      count: products.length
    });
    
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ 
      error: "Failed to fetch products"
    });
  }
};

// Update saved amount for a product
export const updateSavedAmount = async (req, res) => {
  try {
    const { productId } = req.params;
    const { savedAmount } = req.body;
    
    if (!productId || savedAmount === undefined) {
      return res.status(400).json({ 
        error: "Product ID and saved amount are required" 
      });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { savedAmount: Number(savedAmount) },
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    return res.status(200).json({
      message: "Saved amount updated successfully",
      product: updatedProduct
    });
    
  } catch (error) {
    console.error("Update saved amount error:", error);
    return res.status(500).json({ 
      error: "Failed to update saved amount"
    });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    return res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct: deletedProduct
    });
    
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ 
      error: "Failed to delete product"
    });
  }
};

// Original scraping-only function (kept for compatibility)
export const parseProductWithScraping = async (req, res) => {
  try {
    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ error: "Product link is required" });
    }
    try {
      new URL(link);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }
    const productData = await scrapeProductDetails(link);
    return res.status(200).json({
      ...productData,
      source: link
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return res.status(500).json({ 
      error: "Failed to scrape product details",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}