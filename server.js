const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Initialize Vertex AI
let vertexAI;
try {
  vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: 'us-central1'
  });
} catch (error) {
  console.error('Failed to initialize Vertex AI:', error);
  console.log('Make sure GOOGLE_CLOUD_PROJECT environment variable is set');
}

// Get the generative model
const model = vertexAI ? vertexAI.preview.getGenerativeModel({
  model: 'gemini-1.5-flash',
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
}) : null;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!model) {
      return res.status(500).json({ 
        error: 'AI service not available. Please check server configuration.' 
      });
    }

    const { message, userContext, userData } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    // Personalize the prompt based on user data
    const userName = userData?.name || 'there';
    const systemPrompt = `You are Calmish, a warm, empathetic wellness companion for women over 40. 
    You're supportive, gentle, and understanding. Always address the user by name (${userName}) when possible.
    
    Your responses should be:
    - Warm and validating
    - Supportive without being dismissive
    - Practical but gentle
    - Understanding of life transitions
    - Encouraging self-care and boundaries
    
    Keep responses concise but meaningful, typically 2-4 sentences unless more detail is needed.
    If someone shares something difficult, acknowledge their feelings before offering support.`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        ...(userContext || [])
      ]
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    res.json({
      response: response.text(),
      timestamp: new Date().toISOString(),
      sessionId: req.ip // Simple session tracking
    });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Provide user-friendly error messages
    let errorMessage = "I'm having trouble connecting right now. Please try again later.";
    
    if (error.message.includes('quota')) {
      errorMessage = "I'm currently experiencing high demand. Please try again in a few minutes.";
    } else if (error.message.includes('safety')) {
      errorMessage = "I want to make sure I provide helpful and safe responses. Could you rephrase that?";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aiAvailable: !!model 
  });
});

// Get usage stats (for monitoring)
app.get('/api/stats', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    aiAvailable: !!model
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Calmish AI server running on port ${PORT}`);
  console.log(`AI Service: ${model ? 'Available' : 'Not Available'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});