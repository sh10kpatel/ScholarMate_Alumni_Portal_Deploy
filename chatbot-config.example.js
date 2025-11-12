/**
 * Chatbot Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to chatbot-config.js
 * 2. Get your free Gemini API key from: https://makersuite.google.com/app/apikey
 * 3. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key
 * 4. Save the file
 * 
 * SECURITY NOTE:
 * - For production, use environment variables or a backend proxy
 * - Never commit real API keys to version control
 * - The chatbot-config.js file is in .gitignore to prevent accidental commits
 */

// Set your Gemini API key here
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

// Initialize chatbot with API key when it's ready
(function initChatbotConfig() {
  function setApiKey() {
    if (window.alumniChatbot) {
      if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
        window.alumniChatbot.apiKey = GEMINI_API_KEY;
        console.log('✓ Chatbot API key configured');
      } else {
        console.warn('⚠ Chatbot API key not configured. Please set your API key in chatbot-config.js');
        console.log('Get your free API key from: https://makersuite.google.com/app/apikey');
      }
    } else {
      // Retry if chatbot isn't initialized yet
      setTimeout(setApiKey, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setApiKey);
  } else {
    setApiKey();
  }
})();
