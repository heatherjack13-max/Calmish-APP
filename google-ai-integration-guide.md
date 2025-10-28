# Google AI Integration Guide for Calmish

## Overview
This guide will walk you through integrating Google's Gemini API into Calmish to provide real AI-powered chat functionality in the Support section.

## Step 1: Set Up Google Cloud Project

### 1.1 Create a Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account or create a new one
3. You may need to provide billing information (Google offers a free tier with $300 credit)

### 1.2 Create a New Project
1. Click on the project dropdown at the top of the console
2. Click "New Project"
3. Name your project "Calmish-AI" or similar
4. Click "Create"

### 1.3 Enable Required APIs
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - "Vertex AI API"
   - "Gemini API" (if available separately)
   - "AI Platform Training & Prediction API"

## Step 2: Get API Credentials

### 2.1 Create API Key (For Development)
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Important**: Restrict the API key:
   - Set application restrictions (HTTP referrers)
   - Add your domain (e.g., `https://yourdomain.com/*`)
   - Restrict to specific APIs (Vertex AI, Gemini)

### 2.2 Set Up Service Account (For Production)
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Name: "Calmish-AI-Service"
4. Grant these roles:
   - "Vertex AI User"
   - "Service Usage Consumer"
5. Create and download the JSON key file

## Step 3: Install Required Dependencies

For server-side integration (recommended for security):

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and authenticate
gcloud init
gcloud auth application-default login

# Install Node.js client library (if using Node.js backend)
npm install @google-cloud/vertexai
```

## Step 4: Implement Server-Side API Integration

### 4.1 Create a Simple Node.js Backend

Create `server.js`:

```javascript
const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: 'your-project-id',
  location: 'us-central1'
});

const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-pro',
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userContext } = req.body;
    
    const chat = model.startChat({
      history: userContext || [],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    res.json({
      response: response.text(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4.2 Deploy to Cloud Platform

Deploy to Google Cloud Run, Heroku, or similar platform:

```bash
# Deploy to Google Cloud Run
gcloud run deploy calmish-ai-server \
  --source . \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id
```

## Step 5: Update Calmish Frontend

### 5.1 Update support.html Chat Function

Replace the simulated AI responses with real API calls:

```javascript
// In support.html, update the sendMessage function
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message to chat
  addMessage(message, 'user');
  input.value = '';
  
  try {
    // Call your backend API
    const response = await fetch('https://your-backend-url/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        userContext: getConversationHistory()
      })
    });
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    addMessage(data.response, 'ai');
    
  } catch (error) {
    console.error('Error:', error);
    addMessage("I'm having trouble connecting right now. Please try again later.", 'ai');
  }
}
```

## Step 6: Cost Management

### 6.1 Monitor Usage
1. Go to Google Cloud Console > Billing
2. Set up budget alerts
3. Monitor API usage in "APIs & Services" > "Dashboard"

### 6.2 Optimize Costs
- Use smaller models (gemini-pro vs gemini-ultra) for testing
- Implement caching for common queries
- Set up rate limiting in your backend
- Use appropriate token limits

## Step 7: Security Best Practices

### 7.1 Never Expose API Keys in Client Code
- Always use server-side API calls
- Implement proper CORS settings
- Use environment variables for credentials

### 7.2 Implement Rate Limiting
```javascript
// Add rate limiting to your backend
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/chat', limiter);
```

### 7.3 Input Validation
```javascript
// Validate and sanitize user input
const validator = require('validator');

function validateInput(input) {
  if (!input || input.length > 1000) {
    throw new Error('Invalid input length');
  }
  return validator.escape(input); // Sanitize HTML
}
```

## Step 8: Testing

### 8.1 Test Different Scenarios
- Test with various user inputs
- Test error handling
- Test rate limiting
- Test conversation memory

### 8.2 Monitor Performance
- Track response times
- Monitor error rates
- Set up alerts for issues

## Step 9: Deployment Checklist

- [ ] API keys secured and restricted
- [ ] Backend deployed and tested
- [ ] Frontend updated with correct API endpoints
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Monitoring set up
- [ ] Budget alerts configured

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure your backend has proper CORS configuration
2. **Authentication errors**: Check API key restrictions and service account permissions
3. **Rate limiting**: Implement proper rate limiting and retry logic
4. **Cost concerns**: Monitor usage and implement caching

### Getting Help
- Google Cloud Documentation: https://cloud.google.com/docs
- Gemini API Documentation: https://cloud.google.com/vertex-ai/docs/generative-ai
- Community Support: https://cloud.google.com/support

## Next Steps

1. Implement conversation memory and context
2. Add user preference learning
3. Integrate with user wellness data
4. Add multilingual support
5. Implement advanced safety features
6. Add analytics and insights

## Important Notes

- **Security First**: Never expose API keys in client-side code
- **Cost Management**: Start with free tier and monitor usage closely
- **Privacy**: Implement proper data handling and privacy policies
- **Compliance**: Ensure compliance with healthcare/wellness app regulations
- **User Experience**: Maintain Calmish's gentle, supportive tone in all AI interactions

This integration will transform Calmish from a simulated chat to a truly intelligent wellness companion that can provide personalized, empathetic support to women navigating life transitions.