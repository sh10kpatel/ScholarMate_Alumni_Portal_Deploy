/**
 * IIIT NR Alumni Portal Chatbot
 * Powered by Google Gemini 2.5 Flash API
 * 
 * This chatbot provides intelligent assistance for the Alumni Portal
 * with full context about the website's features and functionality.
 */

class AlumniChatbot {
  constructor(config = {}) {
    this.apiKey = config.apiKey || 'AIzaSyDc0PqBef8induTcFbamtV4ACs9znir-es';
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    this.conversationHistory = [];
    this.isOpen = false;
    this.isTyping = false;
    
    // System context about the website
    this.systemContext = `You are an AI assistant for the IIIT Naya Raipur Alumni Portal. 

WEBSITE CONTEXT:
- This is an alumni management platform for IIIT Naya Raipur students, alumni, and administrators
- The portal helps connect alumni, share opportunities, and maintain community engagement

USER ROLES:
1. Alumni: Can view profiles, announcements, and update their own profile
2. Student: Can browse alumni profiles, filter by company/batch/branch, and view announcements
3. Administrator: Full access - can manage profiles, create announcements, delete profiles

KEY FEATURES:
- Alumni Directory: Browse and search alumni by name, company, batch, branch
- Profile Management: Users can view and edit their profiles with photo, contact info, education, experience, certificates
- Announcements: Job postings, internships, events, and general announcements
- Filters: Search by branch (CSE, ECE, DSAI), batch (2020, 2021, 2022), company (Google, Microsoft, Amazon, etc.)
- Export: Download alumni data as JSON

PAGES AVAILABLE:
- Login Page (loginfinal.html): Role-based login (Alumni/Student/Administrator)
- Dashboard (dashboard.html): Main welcome page after login
- Admin Portal (mainad.html): Full management features with sidebar menu
- Alumni Portal (mainalu.html): Alumni-specific features with profile management
- Student Portal (mainst.html): Student view with limited editing capabilities
- Profile Page (profile.html): Detailed profile view and editing
- Create Profile (create_profile.html): New profile creation form
- Announcements (announcements.html): View and manage announcements

TECHNICAL DETAILS:
- Backend API: Node.js + Express on port 4000
- Database: MySQL with fallback to SQLite/in-memory
- Frontend: Vanilla JavaScript + TailwindCSS
- Authentication: Session-based with bcrypt password hashing

HELPFUL TIPS FOR USERS:
- Use the search bar to find alumni by name or keywords
- Filter options help narrow down results quickly
- Click hamburger menu (on admin page) for quick navigation
- Profile photos are stored in /uploads directory
- API status is shown at bottom of alumni listing pages

Your role is to:
- Answer questions about the portal features
- Guide users on how to use different functions
- Explain the differences between user roles
- Help troubleshoot common issues
- Provide information about IIIT Naya Raipur alumni network

Be helpful, concise, and friendly. If you don't know something specific about the portal, suggest checking the documentation or contacting administrators.`;

    this.init();
  }

  init() {
    this.createChatbotUI();
    this.attachEventListeners();
    this.addWelcomeMessage();
  }

  createChatbotUI() {
    // Create chatbot container
    const chatbotHTML = `
      <div id="alumni-chatbot" class="alumni-chatbot">
        <!-- Chat Button -->
        <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chat" title="Chat with AI Assistant">
          <svg class="chatbot-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Chat Window -->
        <div id="chatbot-window" class="chatbot-window">
          <div class="chatbot-header">
            <div class="chatbot-header-content">
              <div class="chatbot-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v4"/>
                  <line x1="8" y1="16" x2="8" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
              </div>
              <div class="chatbot-info">
                <h3>Alumni Assistant</h3>
                <p class="chatbot-status">
                  <span class="status-dot"></span>
                  Online
                </p>
              </div>
            </div>
            <button id="chatbot-close" class="chatbot-close-btn" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div id="chatbot-messages" class="chatbot-messages">
            <!-- Messages will be inserted here -->
          </div>

          <div class="chatbot-input-container">
            <textarea 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Ask me anything about the portal..."
              rows="1"
              maxlength="500"
            ></textarea>
            <button id="chatbot-send" class="chatbot-send-btn" aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          <div class="chatbot-footer">
            Powered by <strong>Gemini 2.5 Flash</strong>
          </div>
        </div>
      </div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    toggleBtn?.addEventListener('click', () => this.toggleChat());
    closeBtn?.addEventListener('click', () => this.closeChat());
    sendBtn?.addEventListener('click', () => this.sendMessage());
    
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    input?.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    
    if (this.isOpen) {
      window?.classList.add('open');
      toggle?.classList.add('open');
      setTimeout(() => document.getElementById('chatbot-input')?.focus(), 300);
    } else {
      window?.classList.remove('open');
      toggle?.classList.remove('open');
    }
  }

  closeChat() {
    this.isOpen = false;
    document.getElementById('chatbot-window')?.classList.remove('open');
    document.getElementById('chatbot-toggle')?.classList.remove('open');
  }

  addWelcomeMessage() {
    const welcomeText = `👋 Hello! I'm your AI assistant for the IIIT NR Alumni Portal.

I can help you with:
• Understanding portal features
• Navigating different pages
• Finding alumni profiles
• Managing your profile
• Understanding user roles
• Troubleshooting issues

What would you like to know?`;

    this.addMessage(welcomeText, 'bot');
  }

  addMessage(text, sender = 'user') {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' 
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    // Convert markdown-like formatting to HTML
    const formattedText = this.formatMessage(text);
    bubble.innerHTML = formattedText;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom with smooth animation
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }

  formatMessage(text) {
    // Convert markdown-like syntax to HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/•/g, '•'); // Bullet points
    
    return formatted;
  }

  addTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(bubble);
    messagesContainer.appendChild(typingDiv);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input?.value.trim();
    
    if (!message || this.isTyping) return;
    
    // Add user message
    this.addMessage(message, 'user');
    input.value = '';
    input.style.height = 'auto';
    
    // Add to history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });
    
    // Show typing indicator
    this.isTyping = true;
    this.addTypingIndicator();
    
    try {
      const response = await this.callGeminiAPI(message);
      this.removeTypingIndicator();
      this.addMessage(response, 'bot');
      
      // Add to history
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: response }]
      });
      
      // Keep history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessage('Sorry, I encountered an error. Please try again or check if your API key is configured correctly.', 'bot');
      console.error('Chatbot error:', error);
    } finally {
      this.isTyping = false;
    }
  }

  async callGeminiAPI(userMessage) {
    // Check if API key is configured
    if (!this.apiKey) {
      return `⚠️ **API Key Not Configured**

To use the chatbot, you need to set up your Google Gemini API key.

**Steps:**
1. Get a free API key from: https://makersuite.google.com/app/apikey
2. Add this code to your page:
\`\`\`javascript
window.alumniChatbot.apiKey = 'YOUR_API_KEY_HERE';
\`\`\`

Need help? Contact your administrator.`;
    }

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: this.systemContext }]
        },
        ...this.conversationHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
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

    const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid API response format');
  }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.alumniChatbot = new AlumniChatbot({
      // API key should be set externally for security
      // Example: window.alumniChatbot.apiKey = 'YOUR_API_KEY';
    });
  });
} else {
  window.alumniChatbot = new AlumniChatbot({});
}
