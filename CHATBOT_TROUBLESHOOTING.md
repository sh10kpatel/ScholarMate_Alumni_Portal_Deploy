# 🔧 Chatbot Troubleshooting Guide

## Issue Fixed: Wrong Model Name

**Problem:** The chatbot was using `gemini-2.5-flash-exp` which doesn't exist.

**Solution:** Changed to `gemini-2.0-flash-exp` (the correct model name).

---

## How to Test If It's Working Now

### Method 1: Open Any Portal Page
1. Open any page (e.g., `loginfinal.html`)
2. Click the purple chat button in bottom-right corner
3. Type: "Hello, are you working?"
4. You should get a response from the AI

### Method 2: Use the Test Page
1. Open `test-gemini-api.html` in your browser
2. It will automatically test the API connection
3. You'll see if the API key is valid and working

### Method 3: Check Browser Console
1. Open any portal page
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Click the chatbot and send a message
5. Look for any error messages

---

## What Was Changed

### File: `chatbot.js`

**Line 12 - Changed from:**
```javascript
this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent';
```

**To:**
```javascript
this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
```

**Also Added Better Error Logging:**
- Shows detailed error messages in console
- Displays API response status
- Logs full error details for debugging

---

## Common Issues & Solutions

### 1. "API Key Not Configured"
**Cause:** API key is missing or invalid

**Solution:**
- Check `chatbot-config.js` - your key should be there
- Get a new key from: https://makersuite.google.com/app/apikey
- Make sure there are no extra spaces or quotes

### 2. "API request failed: 400"
**Cause:** Bad request (usually model name or request format)

**Solution:**
- ✅ Already fixed! (Changed model name)
- If still occurs, use `test-gemini-api.html` to test different models

### 3. "API request failed: 403"
**Cause:** API key is invalid or expired

**Solution:**
- Generate a new API key
- Update `chatbot-config.js` with the new key
- Clear browser cache (Ctrl+F5)

### 4. "API request failed: 429"
**Cause:** Rate limit exceeded (too many requests)

**Solution:**
- Wait 1 minute before trying again
- Free tier limit: 60 requests/minute
- Consider upgrading if you need more

### 5. "API request failed: 500"
**Cause:** Google's server error

**Solution:**
- Wait a few minutes and try again
- Check Google AI Status: https://status.cloud.google.com/

---

## Available Gemini Models

If `gemini-2.0-flash-exp` doesn't work, try these alternatives:

| Model Name | Speed | Quality | Cost |
|------------|-------|---------|------|
| `gemini-2.0-flash-exp` | ⚡⚡⚡ Fast | 🌟🌟🌟 Good | 💰 Free |
| `gemini-1.5-flash` | ⚡⚡ Very Fast | 🌟🌟 Good | 💰 Free |
| `gemini-1.5-pro` | ⚡ Moderate | 🌟🌟🌟🌟 Excellent | 💰💰 Paid |
| `gemini-pro` | ⚡ Moderate | 🌟🌟🌟 Very Good | 💰 Free |

**To change model:**
1. Open `chatbot.js`
2. Find line 12
3. Replace model name in the URL
4. Save and refresh browser

---

## Verify Your API Key

### Quick Test:
```javascript
// Open browser console (F12) on any page and run:
console.log('API Key:', window.alumniChatbot.apiKey);
```

You should see your API key (starting with `AIza...`)

### Test API Key Directly:
1. Open `test-gemini-api.html`
2. It will show:
   - API Key (masked)
   - Endpoint URL
   - Test results

---

## Debug Mode

### Enable Detailed Logging:

Open browser console (F12) and run:
```javascript
// See all chatbot internals
console.log('Chatbot:', window.alumniChatbot);
console.log('API Key:', window.alumniChatbot.apiKey);
console.log('Endpoint:', window.alumniChatbot.apiEndpoint);
console.log('History:', window.alumniChatbot.conversationHistory);
```

### Clear Conversation History:
```javascript
window.alumniChatbot.conversationHistory = [];
console.log('History cleared');
```

---

## Still Not Working?

### Step 1: Clear Everything
```
1. Close all browser tabs
2. Clear browser cache (Ctrl+Shift+Delete)
3. Reopen the page
4. Try again
```

### Step 2: Test With New API Key
```
1. Go to: https://makersuite.google.com/app/apikey
2. Create a NEW API key
3. Update chatbot-config.js
4. Save and test
```

### Step 3: Check Browser Compatibility
```
Minimum requirements:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
```

### Step 4: Test Internet Connection
```
1. Open: https://www.google.com
2. If it works, internet is fine
3. If not, check your network connection
```

---

## What to Check in Console

When you send a message, you should see:
```
✓ Chatbot API key configured
API response: { candidates: [...] }
```

If you see errors like:
```
❌ Gemini API error: {...}
Response status: 400
```

This tells you what's wrong. Common status codes:
- **400**: Bad request (wrong model or format)
- **403**: Invalid API key
- **429**: Too many requests
- **500**: Google server error

---

## Testing Checklist

- [ ] `test-gemini-api.html` shows ✅ Success
- [ ] Browser console shows "✓ Chatbot API key configured"
- [ ] Chat button appears in bottom-right corner
- [ ] Clicking button opens chat window
- [ ] Welcome message appears
- [ ] Can type and send messages
- [ ] Bot responds with relevant answers
- [ ] No errors in console

---

## Quick Fixes Applied

✅ **Fixed model name** from `gemini-2.5-flash-exp` → `gemini-2.0-flash-exp`  
✅ **Added detailed error logging** for easier debugging  
✅ **Created test page** (`test-gemini-api.html`)  
✅ **API key is configured** in `chatbot-config.js`

---

## Your Current Configuration

```javascript
API Key: AIzaSyDc0PqBef8induTcFbamtV4ACs9znir-es
Model: gemini-2.0-flash-exp
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

**This should be working now!** 🎉

---

## Need More Help?

1. Open `test-gemini-api.html` - see exact error
2. Check browser console (F12) - see detailed logs
3. Try different model names using the test page
4. Verify API key at: https://makersuite.google.com/app/apikey

The chatbot should work now with the corrected model name!
