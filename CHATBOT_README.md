# IIIT NR Alumni Portal - AI Chatbot Integration

## 🤖 Overview

An intelligent AI chatbot powered by Google's Gemini 2.5 Flash API has been integrated into the Alumni Portal. The chatbot provides contextual assistance about the portal's features, navigation, and functionality.

## 📁 Files Added

1. **chatbot.css** - Styling matching the portal's dark theme with purple/indigo accents
2. **chatbot.js** - Core chatbot functionality and Gemini API integration
3. **chatbot-config.js** - Configuration file for API key setup
4. **CHATBOT_README.md** - This documentation file

## 🚀 Setup Instructions

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### Step 2: Configure API Key

Open `chatbot-config.js` and replace the placeholder with your API key:

```javascript
const GEMINI_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### Step 3: Add to HTML Pages

Add these lines before the closing `</body>` tag in each HTML file:

```html
<!-- AI Chatbot -->
<link rel="stylesheet" href="chatbot.css">
<script src="chatbot.js"></script>
<script src="chatbot-config.js"></script>
```

**Files to update:**
- loginfinal.html
- dashboard.html
- mainad.html
- mainalu.html
- mainst.html
- profile.html
- create_profile.html
- announcements.html

## ✨ Features

### Core Capabilities
- **Context-Aware**: Has full knowledge of the portal's structure and features
- **Role-Based Help**: Understands different user roles (Admin, Alumni, Student)
- **Conversation Memory**: Maintains context throughout the conversation
- **Smart Formatting**: Supports bold, italic, code formatting in responses

### User Interface
- **Corner Positioning**: Fixed at bottom-right corner, non-intrusive
- **Smooth Animations**: Modern slide-in/fade effects
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Matches the existing portal design
- **Typing Indicator**: Shows when AI is generating response

### Help Topics
The chatbot can assist with:
- Portal navigation and features
- Profile management
- Alumni directory search and filtering
- Announcements system
- Role-based permissions
- Technical troubleshooting
- General IIIT NR alumni network information

## 🎨 Design Integration

The chatbot follows the existing design system:
- **Colors**: Purple/indigo gradients (#667eea, #764ba2)
- **Typography**: Inter font family
- **Dark Theme**: Background #1a202c, surfaces #2d3748
- **Accessibility**: Keyboard navigation, reduced motion support
- **Responsive**: Mobile-first approach

## 💡 Usage Examples

Users can ask questions like:
- "How do I update my profile?"
- "What's the difference between alumni and student roles?"
- "How can I filter alumni by company?"
- "Where do I find job announcements?"
- "How do I delete a profile?" (Admin only)
- "What is the IIIT NR Alumni Portal?"

## 🔒 Security Best Practices

### API Key Protection

**DO:**
- Store API keys in environment variables (production)
- Use a backend proxy to hide keys from client
- Add `chatbot-config.js` to `.gitignore`
- Rotate keys regularly

**DON'T:**
- Commit API keys to version control
- Share keys publicly
- Use production keys in development
- Hard-code keys in the main JavaScript file

### Production Setup

For production environments, consider:

1. **Backend Proxy Approach:**
```javascript
// Instead of calling Gemini directly, call your backend
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage })
});
```

2. **Environment Variables:**
```javascript
const API_KEY = process.env.GEMINI_API_KEY;
```

3. **API Key Restrictions:**
- Set up key restrictions in Google Cloud Console
- Limit to specific domains/IPs
- Set usage quotas

## 🔧 Customization

### Modify System Context

Edit the `systemContext` in `chatbot.js` to customize the chatbot's knowledge:

```javascript
this.systemContext = `Your custom context here...`;
```

### Change Appearance

Modify `chatbot.css` to match different themes:
- Update color variables for different accent colors
- Adjust positioning (bottom-left, top-right, etc.)
- Change dimensions for larger/smaller chat window

### Adjust AI Parameters

In `chatbot.js`, modify the `generationConfig`:

```javascript
generationConfig: {
  temperature: 0.7,    // Creativity (0-1)
  topK: 40,           // Diversity
  topP: 0.95,         // Nucleus sampling
  maxOutputTokens: 1024, // Response length
}
```

## 🐛 Troubleshooting

### Chatbot doesn't appear
- Check browser console for errors
- Verify all three files are loaded (CSS, JS, config)
- Check file paths are correct

### API errors
- Verify API key is correct and active
- Check API quota limits
- Ensure internet connection is stable
- Check browser console for detailed error messages

### Styling issues
- Verify `chatbot.css` is loaded before `chatbot.js`
- Check for CSS conflicts with existing styles
- Clear browser cache

## 📊 API Usage & Limits

### Free Tier (Gemini API)
- **Rate Limit**: 60 requests per minute
- **Daily Quota**: 1,500 requests per day
- **Token Limit**: 32,000 tokens per request

### Monitoring Usage
Monitor API usage at: https://console.cloud.google.com/

## 🔄 Updates & Maintenance

### Updating the Chatbot
1. Keep `chatbot.js` version controlled
2. Test changes in development first
3. Back up `chatbot-config.js` before updates
4. Monitor error logs after updates

### Version Information
- **Current Version**: 1.0.0
- **Gemini Model**: gemini-2.0-flash-exp
- **Last Updated**: October 2025

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Support

For issues or questions:
1. Check this documentation first
2. Review browser console for errors
3. Check [Google AI Studio docs](https://ai.google.dev/docs)
4. Contact your portal administrator

## 📝 License

This chatbot integration is part of the IIIT NR Alumni Portal project.

---

**Note**: Remember to never commit your actual API key to version control. Always use environment variables or a secure configuration management system in production.
