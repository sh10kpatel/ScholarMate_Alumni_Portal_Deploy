# 🚀 Quick Setup Guide - AI Chatbot

## ✅ Installation Complete!

The AI chatbot has been successfully integrated into all pages of the Alumni Portal.

## 📋 Next Steps

### 1. Get Your Free API Key (Required)

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### 2. Configure the Chatbot

Open the file `chatbot-config.js` and add your API key:

```javascript
const GEMINI_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

**Important**: Replace `'YOUR_ACTUAL_API_KEY_HERE'` with your actual Gemini API key.

### 3. Test the Chatbot

1. Open any page of the portal in your browser
2. Look for the purple chat button in the bottom-right corner
3. Click it to open the chat window
4. Try asking: "What can you help me with?"

## 🎯 Pages Updated

The chatbot has been added to:
- ✅ loginfinal.html (Login Page)
- ✅ dashboard.html (Dashboard)
- ✅ mainad.html (Admin Portal)
- ✅ mainalu.html (Alumni Portal)
- ✅ mainst.html (Student Portal)
- ✅ profile.html (Profile Page)
- ✅ create_profile.html (Create Profile)
- ✅ announcements.html (Announcements)

## 💡 How It Works

The chatbot:
- Appears as a floating button in the bottom-right corner
- Matches your website's purple/indigo theme
- Has full context about the Alumni Portal
- Can answer questions about features, navigation, and functionality
- Works on all devices (desktop, tablet, mobile)

## 🔍 Example Questions to Try

- "How do I update my profile?"
- "What's the difference between alumni and student roles?"
- "How can I filter alumni by company?"
- "Where do I find job announcements?"
- "Explain the portal features"

## 🎨 Customization (Optional)

### Change Position
Edit `chatbot.css` line 12-14:
```css
.alumni-chatbot {
  bottom: 20px;  /* Change this */
  right: 20px;   /* Or this */
}
```

### Change Colors
Edit `chatbot.css` line 24:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change these hex colors */
```

## ⚠️ Security Important

### For Development:
- API key in `chatbot-config.js` is fine for testing

### For Production:
- **DO NOT** commit your API key to Git/GitHub
- Add `chatbot-config.js` to `.gitignore`
- Consider using a backend proxy to hide the API key

Example `.gitignore`:
```
chatbot-config.js
node_modules/
.env
```

## 🐛 Troubleshooting

### Chatbot button doesn't appear
- Check browser console (F12) for errors
- Verify all 3 files are in the project root:
  - chatbot.css
  - chatbot.js
  - chatbot-config.js
- Clear browser cache and refresh

### "API Key Not Configured" message
- Open `chatbot-config.js`
- Make sure you replaced the placeholder text with your real API key
- Save the file
- Refresh the browser

### Chat doesn't respond
- Check if API key is valid
- Verify internet connection
- Check browser console for error messages
- Ensure you haven't exceeded API quota (60 req/min free tier)

## 📊 API Limits (Free Tier)

- **Rate Limit**: 60 requests per minute
- **Daily Quota**: 1,500 requests per day
- **Token Limit**: 32,000 tokens per request

Monitor usage: https://console.cloud.google.com/

## 📚 Documentation

For detailed information, see:
- `CHATBOT_README.md` - Complete documentation
- Google AI Studio docs: https://ai.google.dev/docs

## 🎉 You're All Set!

The chatbot is ready to use once you configure your API key. Enjoy!

---

**Need Help?**
- Check the browser console for errors
- Review `CHATBOT_README.md` for detailed docs
- Test with simple questions first
