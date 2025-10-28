# Calmish Deployment Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Deploy Frontend (5 minutes)
1. Push this code to GitHub
2. Go to vercel.com
3. Connect your GitHub repository
4. Deploy with default settings
5. Copy your live URL

### Step 2: Set Up Google Cloud AI (3 minutes)
1. Go to console.cloud.google.com
2. Create new project "calmish-ai"
3. Enable Vertex AI API
4. Create service account with Vertex AI User role
5. Download JSON credentials file

### Step 3: Deploy Backend (2 minutes)
1. Go to render.com
2. Create web service
3. Use Node.js settings
4. Set environment variables:
   - GOOGLE_CLOUD_PROJECT=your-project-id
5. Deploy

### Step 4: Connect (2 minutes)
1. In support-ai.html, update API_BASE_URL to your backend URL
2. Test the connection
3. Verify everything works

## ✅ Success Checklist
- [ ] App loads at your URL
- [ ] Authentication works
- [ ] Watercolor emojis display
- [ ] AI responds (if backend connected)
- [ ] All pages accessible
- [ ] Mobile experience good

## 🎨 Customization
- Change colors in CSS variables
- Train AI personality in server.js
- Add new features and content
- Modify watercolor emoji styling

## 📞 Need Help?
- Check documentation folder
- Review platform docs
- Test in browser console
- Check network connections

---
**Ready? Start with Step 1!** 🌸
