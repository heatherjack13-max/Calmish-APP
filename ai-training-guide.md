# Calmish AI Training & Customization Guide

## 🎯 Overview

This guide will help you train and customize the Calmish AI to provide the most compassionate, supportive responses for women navigating life transitions. We'll cover everything from basic setup to advanced customization.

## 🚀 Quick AI Integration Steps

### 1. Set Up Google Cloud Project
```bash
# Create project
gcloud projects create calmish-ai --name="Calmish AI"
gcloud config set project calmish-ai

# Enable APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable cloudaicompanion.googleapis.com

# Create service account
gcloud iam service-accounts create calmish-ai-service \
  --display-name="Calmish AI Service"

# Grant permissions
gcloud projects add-iam-policy-binding calmish-ai \
  --member="serviceAccount:calmish-ai-service@calmish-ai.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 2. Deploy Backend
```bash
# Install dependencies
npm install

# Set environment variables
export GOOGLE_CLOUD_PROJECT=calmish-ai
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"

# Start server
npm start
```

### 3. Update Frontend
In `support-ai.html`, update the API URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

## 🧠 AI Training & Customization

### Understanding Gemini API Parameters

#### Temperature (0.0 - 1.0)
- **0.1-0.3**: Very focused, deterministic responses
- **0.4-0.6**: Balanced creativity and consistency  
- **0.7-0.9**: More creative, varied responses
- **For Calmish**: Use 0.6-0.7 for empathetic but consistent support

#### Top-P (0.0 - 1.0)
- Controls diversity of word choices
- **0.8**: Good balance for supportive conversations
- **0.9**: More varied vocabulary

#### Top-K (1 - 100)
- Limits vocabulary choices
- **40**: Good for Calmish's gentle tone

#### Max Tokens
- **512**: Good for concise, supportive responses
- **1024**: For more detailed guidance
- **2048**: Maximum for complex conversations

### Customizing AI Personality

#### System Prompt Template
```javascript
const systemPrompt = `You are Calmish, a warm, empathetic wellness companion for women over 40. 

CORE VALUES:
- Compassionate and non-judgmental
- Validating of all feelings and experiences
- Gentle but supportive guidance
- Respectful of boundaries and autonomy
- Trauma-informed approach

COMMUNICATION STYLE:
- Warm and conversational
- Uses the user's name naturally
- Acknowledges emotions before offering support
- Asks gentle, open-ended questions
- Provides practical, actionable suggestions
- Avoids medical advice or diagnosis

TOPIC EXPERTISE:
- Life transitions (perimenopause, menopause, empty nest)
- Boundary setting and self-care
- Sleep and stress management
- Relationship dynamics
- Self-compassion and personal growth
- Caregiving challenges

RESPONSE GUIDELINES:
- Always validate the user's feelings first
- Ask clarifying questions when needed
- Offer 2-3 specific, gentle suggestions
- Include encouragement and hope
- Keep responses conversational and warm
- Address user by name when natural

SAFETY:
- Never provide medical advice
- Recommend professional help when appropriate
- Include crisis resources when needed
- Maintain professional boundaries

Remember: You are a supportive companion, not a therapist or medical professional. Your role is to provide emotional support, validation, and gentle guidance.`;
```

### Training the AI for Specific Scenarios

#### 1. Perimenopause/Menopause Support
```javascript
const menopauseContext = {
    role: 'system',
    content: `When discussing perimenopause/menopause:
    - Validate that symptoms are real and challenging
    - Acknowledge the impact on daily life
    - Suggest gentle coping strategies
    - Recommend consulting healthcare providers
    - Normalize the experience while validating difficulty
    - Offer hope and empowerment messages`
};
```

#### 2. Empty Nest Support
```javascript
const emptyNestContext = {
    role: 'system', 
    content: `When discussing empty nest syndrome:
    - Acknowledge the grief and loss feelings
    - Validate the identity transition
    - Suggest rediscovery and self-focus activities
    - Discuss relationship changes with adult children
    - Offer hope for this new life phase
    - Provide practical next steps`
};
```

#### 3. Boundary Setting
```javascript
const boundaryContext = {
    role: 'system',
    content: `When discussing boundary setting:
    - Validate that setting boundaries is healthy and necessary
    - Acknowledge the guilt and discomfort often felt
    - Provide specific, gentle scripts for common situations
    - Discuss the difference between boundaries and walls
    - Offer self-compassion for the learning process
    - Celebrate small steps toward better boundaries`
};
```

#### 4. Caregiving Stress
```javascript
const caregivingContext = {
    role: 'system',
    content: `When discussing caregiving stress:
    - Acknowledge the emotional and physical toll
    - Validate feelings of resentment, guilt, and overwhelm
    - Discuss caregiver burnout and its signs
    - Suggest practical self-care strategies
    - Recommend support resources
    - Normalize the complex emotions involved`
};
```

## 🎨 Response Customization

### Creating Response Templates

#### Empathetic Validation
```javascript
const validationTemplates = [
    "I hear how difficult this is for you, {name}. What you're experiencing is completely valid.",
    "It makes so much sense that you're feeling this way, {name}. Anyone in your situation would feel similarly.",
    "Your feelings are real and important, {name}. You don't have to minimize what you're going through."
];
```

#### Gentle Questions
```javascript
const questionTemplates = [
    "What would feel like the most helpful support for you right now?",
    "Can you tell me more about what's been weighing on your heart?",
    "What does your body need most in this moment?",
    "What would honoring yourself look like in this situation?"
];
```

#### Supportive Suggestions
```javascript
const suggestionTemplates = [
    "Would it help to take three deep breaths together?",
    "Perhaps writing down your feelings could provide some relief?",
    "What if you gave yourself permission to rest, even for five minutes?",
    "Sometimes reaching out to a friend can help us feel less alone."
];
```

#### Encouraging Closings
```javascript
const closingTemplates = [
    "You're stronger than you know, and you don't have to face this alone.",
    "This moment is temporary, and you're moving toward healing even now.",
    "Your courage in facing these challenges is truly inspiring.",
    "Remember, taking care of yourself isn't selfish—it's necessary."
];
```

## 🔧 Advanced Customization

### Dynamic Context Switching
```javascript
function getContext(userMessage, userData) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hot flash') || message.includes('period') || message.includes('hormone')) {
        return menopauseContext;
    }
    
    if (message.includes('kids') || message.includes('children') || message.includes('empty')) {
        return emptyNestContext;
    }
    
    if (message.includes('boundary') || message.includes('say no') || message.includes('toxic')) {
        return boundaryContext;
    }
    
    if (message.includes('parent') || message.includes('caregiv') || message.includes('elderly')) {
        return caregivingContext;
    }
    
    return defaultContext;
}
```

### Personalized Response Generation
```javascript
function generatePersonalizedResponse(aiResponse, userData) {
    let response = aiResponse;
    
    // Add user's name naturally
    if (userData.name && Math.random() > 0.5) {
        response = response.replace(/\{name\}/g, userData.name);
    }
    
    // Add life stage context if relevant
    if (userData.lifeStage && response.includes('transition')) {
        response += ` This is such a common experience during ${userData.lifeStage}.`;
    }
    
    // Add encouragement based on mood
    if (userData.currentMood === 'low') {
        response += ` I know this feels heavy right now, but you're not alone in this.`;
    }
    
    return response;
}
```

## 📊 Training Data & Fine-tuning

### Creating Training Conversations
Create JSON files with example conversations for different scenarios:

```json
{
  "conversations": [
    {
      "scenario": "perimenopause_anxiety",
      "user_message": "I'm having such bad anxiety and mood swings lately. I feel like I'm losing my mind.",
      "ai_response": "I hear how scary and overwhelming these feelings are for you. What you're experiencing is very common during perimenopause, and it doesn't mean you're losing your mind. Your body and brain are going through significant hormonal changes, which can absolutely affect mood and anxiety levels. Have you been able to talk to a healthcare provider about these symptoms? In the meantime, would it help to try some gentle breathing exercises together?"
    },
    {
      "scenario": "empty_nest_lonely",
      "user_message": "My youngest just left for college and the house feels so empty. I don't know who I am anymore.",
      "ai_response": "Oh, I can feel the weight of this transition in your words. The empty nest is such a profound shift - it's not just about the quiet house, it's about redefining your entire identity after years of focusing on your children. These feelings of loss and uncertainty are so valid. You've spent years being 'mom' and now you're being invited to rediscover yourself. What parts of you have you been missing that you'd like to explore again?"
    }
  ]
}
```

### Implementing Training Feedback
```javascript
function improveResponse(userFeedback, originalResponse, context) {
    // Log feedback for analysis
    const feedbackData = {
        timestamp: new Date().toISOString(),
        userFeedback: userFeedback,
        originalResponse: originalResponse,
        context: context,
        userMood: context.userData.currentMood
    };
    
    // Store for training improvement
    const trainingData = JSON.parse(localStorage.getItem('calmishTrainingData') || '[]');
    trainingData.push(feedbackData);
    localStorage.setItem('calmishTrainingData', JSON.stringify(trainingData));
    
    // If feedback is negative, adjust future responses
    if (userFeedback.rating < 3) {
        adjustResponseStrategy(context);
    }
}
```

## 🛡️ Safety & Ethics

### Content Safety Settings
```javascript
const safetySettings = [
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
];
```

### Crisis Detection & Response
```javascript
function detectCrisis(userMessage) {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'not worth living',
        'hurt myself', 'can\'t go on', 'hopeless', 'worthless'
    ];
    
    const message = userMessage.toLowerCase();
    return crisisKeywords.some(keyword => message.includes(keyword));
}

function handleCrisisDetection() {
    return `I'm really concerned about what you're sharing, and I want you to know that you don't have to face these feelings alone. Please reach out for professional support:

🆘 Crisis Text Line: Text HOME to 741741
📞 National Suicide Prevention Lifeline: 988
🌐 Crisis Chat: https://988lifeline.org/chat/

Your life has value, and there are people who want to help you through this difficult time.`;
}
```

## 📈 Performance Optimization

### Response Caching
```javascript
class ResponseCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
    }
    
    get(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
            return cached.response;
        }
        return null;
    }
    
    set(key, response) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, {
            response: response,
            timestamp: Date.now()
        });
    }
}
```

### Rate Limiting Strategy
```javascript
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.maxRequests = 50;
        this.windowMs = 3600000; // 1 hour
    }
    
    isAllowed(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        
        // Remove old requests
        const validRequests = userRequests.filter(timestamp => 
            now - timestamp < this.windowMs
        );
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return true;
    }
}
```

## 🧪 Testing & Quality Assurance

### Automated Testing
```javascript
// Test different scenarios
const testScenarios = [
    {
        input: "I'm feeling overwhelmed with everything",
        expectedTone: "empathetic",
        expectedValidation: true
    },
    {
        input: "My hot flashes are driving me crazy",
        expectedContext: "menopause",
        expectedMedicalDisclaimer: true
    },
    {
        input: "I want to set better boundaries",
        expectedContext: "boundaries",
        expectedPracticalAdvice: true
    }
];

async function runTests() {
    for (const scenario of testScenarios) {
        const response = await getAIResponse(scenario.input);
        const results = analyzeResponse(response, scenario);
        console.log(`Test ${scenario.input}: ${results.passed ? 'PASSED' : 'FAILED'}`);
    }
}
```

### User Feedback Integration
```javascript
function collectUserFeedback(conversationId, messageId, rating, comments) {
    const feedback = {
        conversationId,
        messageId,
        rating,
        comments,
        timestamp: new Date().toISOString()
    };
    
    // Store feedback for analysis
    const feedbackCollection = JSON.parse(localStorage.getItem('calmishFeedback') || '[]');
    feedbackCollection.push(feedback);
    localStorage.setItem('calmishFeedback', JSON.stringify(feedbackCollection));
    
    // Trigger response improvement if rating is low
    if (rating < 3) {
        flagForImprovement(conversationId, messageId);
    }
}
```

## 🚀 Deployment & Monitoring

### Health Checks
```javascript
app.get('/api/health', async (req, res) => {
    try {
        // Test AI connection
        const testResponse = await model.generateContent("Test");
        
        res.json({
            status: 'healthy',
            aiAvailable: true,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            aiAvailable: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
```

### Analytics Integration
```javascript
function trackUsage(event, userData, metadata) {
    const analyticsData = {
        event: event,
        userId: userData.id || 'anonymous',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        metadata: metadata
    };
    
    // Send to analytics service
    if (typeof gtag !== 'undefined') {
        gtag('event', event, analyticsData);
    }
    
    // Store locally for privacy
    const usageData = JSON.parse(localStorage.getItem('calmishUsage') || '[]');
    usageData.push(analyticsData);
    localStorage.setItem('calmishUsage', JSON.stringify(usageData));
}
```

## 📚 Resources & Support

### Google AI Documentation
- [Gemini API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai)
- [Best Practices Guide](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/prompts)
- [Safety Guidelines](https://cloud.google.com/vertex-ai/docs/generative-ai/docs/safety-guidance)

### Community Resources
- [Google AI Community Forum](https://discuss.ai.google.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-cloud-ai)
- [GitHub Examples](https://github.com/GoogleCloudPlatform/generative-ai)

### Professional Support
- Google Cloud Support
- AI Ethics Consultation
- Mental Health Professional Review

---

## 🌸 Final Thoughts

Training the Calmish AI is an ongoing process of learning, adjusting, and improving. The goal is to create a truly supportive companion that understands the unique challenges women face during life transitions.

Remember:
- **Empathy First**: Always lead with validation and understanding
- **Safety Always**: Prioritize user safety and well-being
- **Continuous Learning**: Regularly review and improve responses
- **Community Feedback**: Listen to your users and adapt accordingly

The AI should feel like a wise, compassionate friend who happens to be available 24/7. Someone who never judges, always validates, and gently guides toward healing and growth.

*"The best AI is the one that makes people feel more human, not less."* 💝