# Calmish AI Deployment Guide

## Overview
This guide will help you deploy Calmish with Google AI integration to production.

## Prerequisites
- Google Cloud account with billing enabled
- Node.js 16+ installed
- Basic knowledge of web deployment

## Step 1: Backend Deployment

### Option A: Google Cloud Run (Recommended)

1. **Build and deploy to Cloud Run:**
```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Deploy to Cloud Run
gcloud run deploy calmish-ai-server \
  --source . \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --region us-central1
```

2. **Get your service URL:**
```bash
gcloud run services describe calmish-ai-server --region=us-central1
```

### Option B: Heroku

1. **Create Heroku app:**
```bash
heroku create calmish-ai-server
```

2. **Set environment variables:**
```bash
heroku config:set GOOGLE_CLOUD_PROJECT=your-project-id
heroku config:set FRONTEND_URL=https://your-frontend-url.com
```

3. **Deploy:**
```bash
git add .
git commit -m "Deploy Calmish AI server"
git push heroku main
```

### Option C: Railway

1. **Install Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Deploy:**
```bash
railway login
railway init
railway up
```

## Step 2: Frontend Updates

### Update API URL
In `support-ai.html`, update the API_BASE_URL:

```javascript
// Production
const API_BASE_URL = 'https://your-backend-url.com';

// For testing with local backend
// const API_BASE_URL = 'http://localhost:3001';
```

### Security Configuration
Update CORS settings in `server.js`:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com', // Your production domain
  credentials: true
}));
```

## Step 3: Google Cloud Configuration

### 1. Create Service Account
```bash
# Create service account
gcloud iam service-accounts create calmish-ai-service \
  --display-name="Calmish AI Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:calmish-ai-service@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:calmish-ai-service@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer"
```

### 2. Create and Download Service Account Key
```bash
# Create key
gcloud iam service-accounts keys create ~/calmish-ai-key.json \
  --iam-account=calmish-ai-service@$PROJECT_ID.iam.gserviceaccount.com

# Set environment variable (for local testing)
export GOOGLE_APPLICATION_CREDENTIALS=~/calmish-ai-key.json
```

### 3. For Cloud Run Deployment
```bash
# Deploy with service account
gcloud run deploy calmish-ai-server \
  --source . \
  --service-account=calmish-ai-service@$PROJECT_ID.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --region us-central1
```

## Step 4: Environment Variables

### Required Environment Variables
```bash
# Backend (.env)
GOOGLE_CLOUD_PROJECT=your-project-id
FRONTEND_URL=https://your-frontend-url.com
PORT=3001

# Optional
LOG_LEVEL=info
DATABASE_URL=postgresql://... (for conversation storage)
REDIS_URL=redis://... (for caching)
```

### Frontend Configuration
```javascript
// In support-ai.html
const API_BASE_URL = 'https://your-backend-url.com';
```

## Step 5: Database Setup (Optional)

### PostgreSQL for Conversation Storage
If you want to store conversations persistently:

```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    user_message TEXT,
    ai_response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 6: Monitoring & Analytics

### Set Up Google Cloud Monitoring
```bash
# Enable monitoring APIs
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Create monitoring dashboard
gcloud monitoring dashboards create --config-from-file=monitoring-dashboard.json
```

### Basic Monitoring Dashboard
```json
{
  "displayName": "Calmish AI Monitoring",
  "gridLayout": {
    "columns": 2,
    "widgets": [
      {
        "title": "Request Count",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"custom.googleapis.com/calmish/requests\"",
                "aggregation": {"perSeriesAligner": "ALIGN_RATE"}
              }
            }
          }]
        }
      },
      {
        "title": "Response Time",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"custom.googleapis.com/calmish/response_time\"",
                "aggregation": {"perSeriesAligner": "ALIGN_MEAN"}
              }
            }
          }]
        }
      }
    ]
  }
}
```

## Step 7: Cost Optimization

### Set Up Budget Alerts
```bash
# Create budget
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Calmish AI Budget" \
  --budget-amount=50.00 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90
```

### Rate Limiting Configuration
```javascript
// In server.js - adjust based on your needs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Rate limit exceeded. Please try again later.'
});
```

## Step 8: Security Best Practices

### 1. API Key Security
- Never expose API keys in frontend code
- Use environment variables for all secrets
- Implement proper CORS settings
- Use HTTPS only

### 2. Input Validation
```javascript
// Enhanced validation
function validateInput(input) {
  if (!input || input.length > 2000) {
    throw new Error('Invalid input length');
  }
  // Basic XSS protection
  return validator.escape(input);
}
```

### 3. Rate Limiting
```javascript
// Stricter rate limiting for production
const productionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour per IP
  message: 'Too many requests. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Step 9: Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create test script
artillery quick --count 10 --num 5 https://your-backend-url.com/api/health
```

### Integration Testing
```javascript
// test/integration.test.js
const request = require('supertest');
const app = require('../server');

describe('AI Chat API', () => {
  test('should respond to chat messages', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        message: 'Hello, I need support',
        userData: { name: 'Test User' }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.response).toBeDefined();
  });
});
```

## Step 10: Deployment Checklist

### Pre-deployment
- [ ] API keys secured and restricted
- [ ] Backend deployed and tested
- [ ] Frontend updated with correct API endpoints
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Monitoring set up
- [ ] Budget alerts configured
- [ ] HTTPS enabled
- [ ] Service account properly configured

### Post-deployment
- [ ] Test all functionality
- [ ] Verify AI responses are working
- [ ] Check monitoring dashboards
- [ ] Test error scenarios
- [ ] Verify cost tracking
- [ ] Document any issues

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend domain is allowed
   - Ensure proper headers are set

2. **Authentication Errors**
   - Verify service account has correct permissions
   - Check if API is enabled
   - Validate credentials file

3. **Rate Limiting**
   - Monitor API usage in Google Cloud Console
   - Implement caching for common queries
   - Consider upgrading to paid tier if needed

4. **Performance Issues**
   - Check server resources
   - Implement caching
   - Optimize database queries
   - Use CDN for static assets

### Getting Help
- Google Cloud Documentation: https://cloud.google.com/docs
- Gemini API Documentation: https://cloud.google.com/vertex-ai/docs/generative-ai
- Google Cloud Support: https://cloud.google.com/support
- Community: Stack Overflow with tags [google-cloud] [gemini-api]

## Next Steps

1. **Analytics Integration**
   - Add user behavior tracking
   - Implement conversation analytics
   - Monitor user satisfaction

2. **Advanced Features**
   - Multi-language support
   - Voice input/output
   - Integration with wellness data
   - Personalized recommendations

3. **Scaling**
   - Implement auto-scaling
   - Add load balancing
   - Set up multiple regions
   - Implement caching strategies

4. **Compliance**
   - HIPAA compliance (if handling health data)
   - GDPR compliance for EU users
   - Data retention policies
   - Privacy policy updates

## Cost Estimates

### Monthly Costs (Estimated)
- Google Cloud Run: $5-20 (depending on usage)
- Gemini API: $10-50 (depending on conversation volume)
- Monitoring: $5-10
- Database (optional): $10-25
- **Total: $30-105/month**

### Cost Optimization Tips
1. Use smaller models for testing
2. Implement caching for common queries
3. Set up budget alerts
4. Monitor usage regularly
5. Use free tier when possible

## Support

For deployment support:
1. Check this guide thoroughly
2. Review Google Cloud documentation
3. Test locally first
4. Use staging environment
5. Monitor logs and metrics

Remember: Always test thoroughly in a staging environment before deploying to production!