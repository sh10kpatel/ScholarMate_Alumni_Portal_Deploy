/**
 * Production-Ready Backend Proxy for Gemini API
 * 
 * This file shows how to add a secure backend proxy to hide your Gemini API key
 * Add this to your server/index.js file to make the chatbot production-ready
 */

// Add this at the top with other requires
// const fetch = require('node-fetch'); // Uncomment if using Node < 18

// Add this endpoint to your Express server
// Place it with your other API routes (after app.use(express.json()))

/**
 * Chatbot Proxy Endpoint
 * POST /api/chatbot
 * 
 * Request body:
 * {
 *   "message": "user message",
 *   "history": [...conversation history...]
 * }
 */
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get API key from environment variable (SECURE)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set in environment');
      return res.status(500).json({ error: 'Chatbot service not configured' });
    }

    // System context about the portal
    const systemContext = `You are an AI assistant for the IIIT Naya Raipur Alumni Portal. 

WEBSITE CONTEXT:
- This is an alumni management platform for IIIT Naya Raipur students, alumni, and administrators
- The portal helps connect alumni, share opportunities, and maintain community engagement

USER ROLES:
1. Alumni: Can view profiles, announcements, and update their own profile
2. Student: Can browse alumni profiles, filter by company/batch/branch, and view announcements
3. Administrator: Full access - can manage profiles, create announcements, delete profiles

KEY FEATURES:
- Alumni Directory: Browse and search alumni by name, company, batch, branch
- Profile Management: Users can view and edit their profiles
- Announcements: Job postings, internships, events
- Filters: Search by branch (CSE, ECE, DSAI), batch, company

Your role is to help users understand and navigate the portal effectively.`;

    // Build request for Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemContext }]
      }
    ];

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      contents.push(...history);
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const requestBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to get response from AI service' 
      });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      return res.json({ 
        response: aiResponse,
        success: true 
      });
    }
    
    return res.status(500).json({ error: 'Invalid response from AI service' });

  } catch (error) {
    console.error('Chatbot proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Add this endpoint to your server/index.js file
 * 
 * 2. Set environment variable:
 *    - Create .env file in server/ directory
 *    - Add: GEMINI_API_KEY=your_actual_api_key_here
 *    - Install dotenv: npm install dotenv
 *    - Add to top of index.js: require('dotenv').config();
 * 
 * 3. Update chatbot.js to use this endpoint:
 *    Replace the callGeminiAPI method with:
 * 
 *    async callGeminiAPI(userMessage) {
 *      const response = await fetch('/api/chatbot', {
 *        method: 'POST',
 *        headers: { 'Content-Type': 'application/json' },
 *        body: JSON.stringify({
 *          message: userMessage,
 *          history: this.conversationHistory
 *        })
 *      });
 * 
 *      if (!response.ok) {
 *        throw new Error(`Request failed: ${response.status}`);
 *      }
 * 
 *      const data = await response.json();
 *      return data.response;
 *    }
 * 
 * 4. Remove API key from chatbot-config.js (not needed with proxy)
 * 
 * 5. Add to .gitignore:
 *    .env
 *    server/.env
 * 
 * BENEFITS:
 * - ✅ API key hidden from client
 * - ✅ More secure
 * - ✅ Can add rate limiting
 * - ✅ Can add user authentication
 * - ✅ Can log usage
 * - ✅ Production-ready
 * 
 * OPTIONAL ENHANCEMENTS:
 * - Add rate limiting (express-rate-limit)
 * - Add user authentication check
 * - Add request logging
 * - Add caching for common questions
 * - Add usage analytics
 */

// Example .env file content:
/*
GEMINI_API_KEY=your_actual_api_key_here
PORT=4000
*/

// Example enhanced version with rate limiting:
/*
const rateLimit = require('express-rate-limit');

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: { error: 'Too many requests, please try again later' }
});

app.post('/api/chatbot', chatbotLimiter, async (req, res) => {
  // ... same code as above
});
*/
