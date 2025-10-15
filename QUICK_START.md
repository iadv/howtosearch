# 🚀 Quick Start Guide

## Your App is Ready! 

The development server is already running at:
### **http://localhost:3000**

## ✅ What You Have

A fully functional "How To Search" web app with:
- ✨ Beautiful, modern UI with shadcn/ui components
- 🤖 Claude AI integration for intelligent responses
- 🖼️ Gemini image generation (fallback mode active)
- 📱 Fully responsive design
- 🎨 Smooth animations with Framer Motion
- 🎯 Real-time chat and image carousel

## 🎯 Try It Now

1. **Open your browser**: http://localhost:3000
2. **Try these questions**:
   - "How to tie a tie"
   - "How to make coffee"
   - "How to change a tire"
   - "How to fold origami"

## 🔑 API Configuration

Your API keys are configured in `.env.local`:
- ✅ Claude API Key (Anthropic)
- ✅ Gemini API Key (Google)
- ✅ Lambda Endpoint (AWS)

## 📁 Project Structure

```
howtosearch/
├── app/
│   ├── api/
│   │   ├── chat/                    # Claude AI endpoint
│   │   ├── generate-images/         # Gemini Imagen (main)
│   │   └── generate-images-fallback/ # Placeholder images
│   ├── page.tsx                     # Main app page
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── components/
│   ├── ui/                          # shadcn components
│   ├── ChatInterface.tsx            # Chat UI
│   └── ImageCarousel.tsx            # Image display
└── lib/
    └── utils.ts                     # Utilities
```

## 🎨 Key Features

### 1. Chat Interface
- Clean, modern design
- Real-time responses
- Message history
- Loading states
- Suggested questions

### 2. Image Carousel
- Automatic image display
- Smooth transitions
- Thumbnail navigation
- Full-screen images
- Loading animations

### 3. AI Integration
- Claude 3.5 Sonnet for chat
- Smart image detection
- Automatic prompt generation
- Parallel processing

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 Environment Variables

Located in `.env.local`:
```bash
CLAUDE_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSy...
LAMBDA_API_ENDPOINT=https://...
```

## 🎨 Customization

### Colors & Theme
Edit `app/globals.css` and `tailwind.config.ts`

### AI Behavior
Modify system prompt in `app/api/chat/route.ts`

### Layout
Adjust grid in `app/page.tsx`

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

### Missing Dependencies
```bash
npm install
```

### API Errors
- Check `.env.local` file exists
- Verify API keys are correct
- Check Anthropic/Google Cloud console

## 📚 Documentation

- **README.md** - Project overview
- **USAGE_GUIDE.md** - Detailed usage instructions
- **This file** - Quick start reference

## 🚀 Next Steps

1. **Test the app** - Try different "how to" questions
2. **Customize** - Change colors, layout, or behavior
3. **Deploy** - Use Vercel, Netlify, or your preferred platform
4. **Enhance** - Add new features like history, favorites, etc.

## 💡 Pro Tips

1. **Ask specific questions** for better results
2. **Use the carousel** to review visual steps
3. **Try follow-up questions** to dive deeper
4. **Check the thumbnails** for quick navigation
5. **Monitor API usage** to stay within limits

## 🎉 You're All Set!

Your "How To Search" app is ready to use. Open http://localhost:3000 and start asking questions!

---

**Need help?** Check USAGE_GUIDE.md for detailed information.

