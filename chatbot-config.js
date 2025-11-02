/**
 * Chatbot Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your free Gemini API key from: https://makersuite.google.com/app/apikey
 * 2. Replace 'YOUR_GEMINI_API_KEY_HERE' below with your actual API key
 * 3. Save this file
 * 
 * SECURITY NOTE:
 * - For production, use environment variables or a backend proxy
 * - Never commit real API keys to version control
 * - Add this file to .gitignore if using Git
 */

// Set your Gemini API key here
const GEMINI_API_KEY = 'AIzaSyDc0PqBef8induTcFbamtV4ACs9znir-es';

// Initialize chatbot with API key when it's ready
(function initChatbotConfig() {
  function setApiKey() {
    if (window.alumniChatbot) {
      if (GEMINI_API_KEY) {
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
