import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class ProductCategoryDetector {
  constructor() {
    this.categoryMap = {
      'Electronics & Audio': {
        keywords: [
          'headphones', 'earphones', 'earbuds', 'headset', 'speakers', 'soundbar',
          'bluetooth', 'wireless', 'microphone', 'amplifier', 'subwoofer',
          'stereo', 'noise cancelling', 'tws', 'airpods', 'bose', 'jbl', 'sony', 'boat'
        ],
        patterns: [
          /\b(in-ear|on-ear|over-ear)\b/i,
          /\bwith mic\b/i,
          /\bnoise cancel/i
        ]
      },
      'Electronics & Mobile': {
        keywords: ['smartphone', 'iphone', 'android', 'samsung', 'oneplus', 'realme', 'charger', 'mobile', 'phone']
      },
      'Electronics & Computing': {
        keywords: ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'ram', 'ssd', 'macbook', 'computer']
      },
      'Home & Kitchen': {
        keywords: ['microwave', 'refrigerator', 'blender', 'toaster', 'kettle', 'cooker', 'appliance']
      },
      'Fashion & Clothing': {
        keywords: ['shirt', 'pants', 'jeans', 'dress', 'shoes', 'handbag', 'wallet', 'clothing', 'fashion']
      },
      'Health & Beauty': {
        keywords: ['skincare', 'makeup', 'lotion', 'serum', 'shampoo', 'vitamin', 'cosmetic']
      }
    };

    this.brandCategories = {
      'boat': 'Electronics & Audio',
      'jbl': 'Electronics & Audio',
      'sony': 'Electronics & Audio',
      'bose': 'Electronics & Audio',
      'apple': 'Electronics & Mobile',
      'samsung': 'Electronics & Mobile',
      'oneplus': 'Electronics & Mobile'
    };
  }

  detectCategory(text, price = 0) {
    const t = text.toLowerCase();
    const scores = {};
    Object.keys(this.categoryMap).forEach(cat => scores[cat] = 0);

    for (const [cat, cfg] of Object.entries(this.categoryMap)) {
      for (const kw of cfg.keywords) {
        if (t.includes(kw)) scores[cat] += 2;
      }
      if (cfg.patterns) {
        for (const pattern of cfg.patterns) {
          if (pattern.test(t)) scores[cat] += 5;
        }
      }
    }

    for (const [brand, cat] of Object.entries(this.brandCategories)) {
      if (t.includes(brand)) scores[cat] += 4;
    }

    const maxScore = Math.max(...Object.values(scores));
    return maxScore ? Object.keys(scores).find(c => scores[c] === maxScore) : 'General';
  }
}

const categoryDetector = new ProductCategoryDetector();

// Enhanced price cleaning function
const cleanPrice = (text) => {
  if (!text) return 0;
 
  console.log(`Cleaning price text: "${text}"`);
 
  // Convert to string and handle various currency formats
  let cleanText = text.toString()
    .replace(/₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|¥|JPY|CNY/gi, '') // Remove currency symbols
    .replace(/[^\d.,]/g, '') // Keep only digits, commas, and dots
    .trim();
 
  if (!cleanText) return 0;
 
  // Handle different number formats
  if (cleanText.includes(',') && cleanText.includes('.')) {
    // Format like 1,23,456.78 - remove commas, keep dot as decimal
    cleanText = cleanText.replace(/,/g, '');
  } else if (cleanText.includes(',') && !cleanText.includes('.')) {
    // Format like 1,23,456 - remove commas
    cleanText = cleanText.replace(/,/g, '');
  }
 
  const value = parseFloat(cleanText) || 0;
  console.log(`Final price value: ${value}`);
  return value;
};

// Enhanced price extraction with site-specific logic
const extractPricesFromPage = ($, url) => {
  const prices = [];
  const domain = new URL(url).hostname.toLowerCase();
  
  // Comprehensive price selectors for different e-commerce sites
  const priceSelectors = [
    // Generic selectors
    '[data-testid*="price"]', '.price', '.product-price', '#price',
    '[class*="price"]', '[id*="price"]', '.cost', '.amount', '.value',
    '[class*="cost"]', '[class*="amount"]', '.final-price', '.selling-price',
    
    // Amazon specific
    '.a-price-range', '.a-offscreen', '.a-price .a-offscreen', 
    '#priceblock_dealprice', '#priceblock_ourprice', '.a-price-current',
    
    // Flipkart specific
    '._30jeq3._16Jk6d', '._30jeq3', '.CEmiEU', '._1_WHN1',
    
    // Myntra specific
    '.pdp-price', '.product-discountedPrice', '.product-price',
    
    // Ajio specific
    '.prod-sp', '.price-text',
    
    // Nykaa specific
    '.product-price', '.price-show',
    
    // Common patterns
    '[data-price]', '[data-original-price]', '[data-sale-price]',
    '.current-price', '.sale-price', '.offer-price', '.discounted-price',
    '.product-cost', '.item-price', '.buy-price', '.mrp-price'
  ];
  
  // Extract prices from each selector
  priceSelectors.forEach(selector => {
    $(selector).each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const dataPrice = $el.attr('data-price') || $el.attr('content') || $el.attr('value');
      
      // Try text content first
      if (text) {
        const price = cleanPrice(text);
        if (price > 0) {
          prices.push({
            price,
            source: 'text',
            selector,
            text,
            element: $el.prop('tagName'),
            classes: $el.attr('class') || ''
          });
        }
      }
      
      // Try data attributes
      if (dataPrice) {
        const price = cleanPrice(dataPrice);
        if (price > 0) {
          prices.push({
            price,
            source: 'data-attribute',
            selector,
            text: dataPrice,
            element: $el.prop('tagName'),
            classes: $el.attr('class') || ''
          });
        }
      }
    });
  });
  
  // Extract from JSON-LD structured data
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const jsonData = JSON.parse($(el).html());
      const extractPriceFromJson = (obj) => {
        if (obj && typeof obj === 'object') {
          if (obj.price) {
            const price = cleanPrice(obj.price);
            if (price > 0) {
              prices.push({
                price,
                source: 'json-ld',
                selector: 'script[type="application/ld+json"]',
                text: obj.price.toString(),
                element: 'script',
                classes: 'structured-data'
              });
            }
          }
          if (obj.offers && obj.offers.price) {
            const price = cleanPrice(obj.offers.price);
            if (price > 0) {
              prices.push({
                price,
                source: 'json-ld-offers',
                selector: 'script[type="application/ld+json"]',
                text: obj.offers.price.toString(),
                element: 'script',
                classes: 'structured-data'
              });
            }
          }
          // Recursively check nested objects
          Object.values(obj).forEach(value => {
            if (typeof value === 'object') {
              extractPriceFromJson(value);
            }
          });
        }
      };
      extractPriceFromJson(jsonData);
    } catch (e) {
      // Ignore JSON parsing errors
    }
  });
  
  // Extract from meta tags
  $('meta[property*="price"], meta[name*="price"]').each((i, el) => {
    const content = $(el).attr('content');
    if (content) {
      const price = cleanPrice(content);
      if (price > 0) {
        prices.push({
          price,
          source: 'meta-tag',
          selector: 'meta',
          text: content,
          element: 'meta',
          classes: 'meta-data'
        });
      }
    }
  });
  
  // Fallback: search for currency patterns in page text
  const bodyText = $('body').text();
  const currencyMatches = bodyText.match(/₹\s?[\d,]+(\.\d{2})?/g) || [];
  currencyMatches.forEach(match => {
    const price = cleanPrice(match);
    if (price > 10 && price < 10000000) { // Reasonable price range
      prices.push({
        price,
        source: 'text-pattern',
        selector: 'body-text-search',
        text: match,
        element: 'text',
        classes: 'pattern-match'
      });
    }
  });
  
  return prices;
};

// Smart price selection logic
const selectBestPrice = (prices, domain) => {
  if (prices.length === 0) return 0;
  
  console.log(`Found ${prices.length} potential prices:`, prices.map(p => `${p.price} (${p.source})`));
  
  // Remove duplicates
  const uniquePrices = [];
  const seenPrices = new Set();
  prices.forEach(priceObj => {
    if (!seenPrices.has(priceObj.price)) {
      seenPrices.add(priceObj.price);
      uniquePrices.push(priceObj);
    }
  });
  
  // Scoring system to pick the most likely current selling price
  const scoredPrices = uniquePrices.map(priceObj => {
    let score = 0;
    const { price, source, selector, text, classes } = priceObj;
    
    // Higher score for structured data
    if (source === 'json-ld' || source === 'json-ld-offers') score += 10;
    if (source === 'meta-tag') score += 8;
    
    // Higher score for specific price-related classes/selectors
    if (classes.includes('current') || classes.includes('selling')) score += 5;
    if (classes.includes('final') || classes.includes('offer')) score += 4;
    if (classes.includes('discounted') || classes.includes('sale')) score += 3;
    
    // Lower score for MRP/original price indicators
    if (classes.includes('mrp') || classes.includes('original') || classes.includes('crossed')) score -= 5;
    if (text.toLowerCase().includes('mrp') || text.toLowerCase().includes('was')) score -= 3;
    
    // Reasonable price range gets bonus
    if (price >= 50 && price <= 500000) score += 2;
    
    // Site-specific scoring
    if (domain.includes('amazon')) {
      if (selector.includes('a-price-current') || selector.includes('a-offscreen')) score += 3;
    } else if (domain.includes('flipkart')) {
      if (selector.includes('_30jeq3') || selector.includes('CEmiEU')) score += 3;
    }
    
    return { ...priceObj, score };
  });
  
  // Sort by score (highest first), then by price (lowest first for same score)
  scoredPrices.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.price - b.price;
  });
  
  console.log('Scored prices:', scoredPrices.map(p => `${p.price} (score: ${p.score})`));
  
  return scoredPrices[0]?.price || 0;
};

// Get page content with multiple strategies
const getPageContent = async (url) => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
  };

  try {
    const response = await axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
   
    return response.data;
  } catch (error) {
    console.log('Primary request failed, trying with minimal headers...');
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProductBot/1.0)' },
        timeout: 10000,
        validateStatus: (status) => status < 500
      });
      if (response.status === 403 || response.status === 429) throw new Error(`Blocked (${response.status})`);
      return response.data;
    } catch (fallbackError) {
      console.log('Minimal headers fetch failed, trying headless browser...');
      // Final fallback: render page with Puppeteer to bypass CDN protections
      return await getPageWithPuppeteer(url);
    }
  }
};

const getPageWithPuppeteer = async (url) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
};

// Enhanced AI-powered product extraction
const extractWithAI = async (url, htmlContent = null) => {
  try {
    let prompt;
   
    if (htmlContent) {
      const $ = cheerio.load(htmlContent);
      const title = $('title').text();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Extract price information from various sources
      const allPrices = extractPricesFromPage($, url);
      const priceContext = allPrices.length > 0 
        ? `\nFound prices on page: ${allPrices.map(p => `₹${p.price} (from ${p.source})`).join(', ')}`
        : '';
      
      const bodyText = $('body').text().substring(0, 3000);
     
      prompt = `
Extract product information from this e-commerce page content.

Page Title: ${title}
Meta Description: ${metaDescription}
URL: ${url}${priceContext}

Page Content (excerpt): ${bodyText}

Please analyze and return ONLY a valid JSON object:
{
  "name": "exact product name (not page title)",
  "price": numeric_value_only,
  "image": "full_image_url_if_found",
  "description": "brief product description",
  "brand": "brand name if identifiable"
}

CRITICAL PRICE EXTRACTION RULES:
- Extract the CURRENT SELLING PRICE (the price customer actually pays)
- IGNORE crossed-out prices, MRP, or "was" prices
- Look for terms like "Deal Price", "Offer Price", "Sale Price", "Current Price"
- If multiple prices exist, choose the LOWEST active selling price
- Price should be numeric only (remove ₹, $, commas, etc.)
- If you see structured price data above, prioritize those values

Important:
- Name should be the actual product name, not website name
- If cannot extract reliable data, return: {"error": "extraction_failed"}
- Return only JSON, no explanations
`;
    } else {
      prompt = `
Extract product information from this URL: ${url}

Please analyze the page and return ONLY a valid JSON object:
{
  "name": "exact product name",
  "price": numeric_value_only,
  "image": "full_image_url_if_found", 
  "description": "brief product description",
  "brand": "brand name if identifiable"
}

Focus on finding the current selling price (not MRP or crossed-out prices).
If cannot extract, return: {"error": "extraction_failed"}
Return only JSON, no explanations.
`;
    }

    console.log('Sending request to AI...');
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
   
    console.log('AI Response:', responseText);
   
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
   
    const extractedData = JSON.parse(jsonMatch[0]);
   
    if (extractedData.error) {
      throw new Error(`AI extraction failed: ${extractedData.error}`);
    }
   
    return {
      name: extractedData.name || 'Product Name Not Found',
      price: cleanPrice(extractedData.price) || 0,
      image: extractedData.image || '',
      description: extractedData.description || '',
      brand: extractedData.brand || '',
      category: categoryDetector.detectCategory(extractedData.name || '', cleanPrice(extractedData.price) || 0)
    };
   
  } catch (error) {
    console.error('AI extraction error:', error.message);
    throw error;
  }
};

// Enhanced HTML parsing with improved price detection
const basicHtmlExtraction = async (url, htmlContent) => {
  try {
    const $ = cheerio.load(htmlContent);
    const domain = new URL(url).hostname.toLowerCase();

    const titleSelectors = [
      'h1', '[data-testid*="title"]', '[data-testid*="name"]', '.product-title',
      '.product-name', '#product-title', '#product-name', '.title',
      '[class*="title"]', '[class*="name"]', '[id*="title"]', '[id*="name"]'
    ];

    const imageSelectors = [
      '.product-image img', '.main-image', '[data-testid*="image"] img',
      'img[alt*="product"]', 'img[src*="product"]', '.gallery img',
      '[class*="image"] img', '.hero img'
    ];

    // Extract title
    let name = '';
    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim();
        if (text.length > 5 && !/buy|shop|cart/i.test(text)) {
          name = text;
          break;
        }
      }
    }

    // Extract prices using enhanced logic
    const allPrices = extractPricesFromPage($, url);
    const price = selectBestPrice(allPrices, domain);

    // Extract image
    let image = '';
    for (const selector of imageSelectors) {
      const element = $(selector).first();
      if (element.length) {
        image = element.attr('src') || element.attr('data-src') || element.attr('data-original') || '';
        if (image.startsWith('//')) image = 'https:' + image;
        if (image && !image.includes('placeholder')) break;
      }
    }

    return {
      name: name || 'Product Name Not Found',
      price: price,
      image: image,
      category: categoryDetector.detectCategory(name, price),
      description: '',
      brand: ''
    };

  } catch (error) {
    console.error('Basic extraction error:', error.message);
    throw error;
  }
};

// Main export function
export const fetchProduct = async (link) => {
  if (!link) throw new Error("Link is required");

  console.log(`\n=== Fetching product from: ${link} ===`);

  try {
    // Strategy 1: Fetch HTML + Enhanced extraction
    console.log('🌐 Fetching page content...');
    let htmlContent;
    try {
      htmlContent = await getPageContent(link);
      console.log('Page content fetched successfully');
    } catch (fetchError) {
      console.log('Failed to fetch page content:', fetchError.message);
      throw new Error(`Cannot access the webpage: ${fetchError.message}`);
    }

    // Strategy 2: AI extraction with HTML content (primary method)
    console.log('🤖 Trying AI extraction with page content...');
    try {
      const aiResult = await extractWithAI(link, htmlContent);
      if (aiResult.name !== 'Product Name Not Found' || aiResult.price > 0) {
        console.log(' AI + HTML extraction successful!');
        return aiResult;
      }
    } catch (aiError) {
      console.log(' AI + HTML extraction failed:', aiError.message);
    }

    // Strategy 3: Enhanced HTML parsing fallback
    console.log('🔧 Trying enhanced HTML parsing...');
    const basicResult = await basicHtmlExtraction(link, htmlContent);
   
    if (basicResult.name !== 'Product Name Not Found' || basicResult.price > 0) {
      console.log('Enhanced HTML extraction provided data');
      return {
        ...basicResult,
        note: 'Extracted using enhanced HTML parsing'
      };
    }

    // Strategy 4: AI-only extraction (last resort)
    console.log('🤖 Trying AI-only extraction as fallback...');
    try {
      const aiResult = await extractWithAI(link);
      if (aiResult.name !== 'Product Name Not Found' || aiResult.price > 0) {
        console.log('AI-only extraction provided some data');
        return {
          ...aiResult,
          note: 'Extracted using AI-only method - may be less accurate'
        };
      }
    } catch (aiError) {
      console.log('❌ AI-only extraction failed:', aiError.message);
    }

    console.log('All extraction methods provided limited results');
    return {
      name: 'Product Name Not Available',
      price: 0,
      image: '',
      category: 'General',
      description: '',
      brand: '',
      error: 'Could not extract complete product information',
      url: link
    };

  } catch (error) {
    console.error('❌ Complete extraction failure:', error.message);
    throw new Error(`Failed to extract product information: ${error.message}`);
  }
};