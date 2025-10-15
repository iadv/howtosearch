# How To Search - Usage Guide

## 🚀 Quick Start

Your app is now running at **http://localhost:3000**

## 📋 Features Overview

### 1. **Natural Language Chat Interface**
- Ask any "how to" question in plain English
- Get detailed, step-by-step instructions from Claude AI
- Beautiful, modern chat interface with smooth animations

### 2. **Visual Learning with AI-Generated Images**
- Automatic image generation for visual learners
- Images appear in a sleek carousel on the right side
- Navigate through multiple images with thumbnails
- Images automatically append as you chat

### 3. **Smart AI Integration**
- **Claude 3.5 Sonnet**: Provides intelligent, context-aware responses
- **Gemini Imagen**: Generates relevant instructional images
- Seamless coordination between chat and image generation

## 💡 Example Questions to Try

1. **"How to tie a tie"**
   - Get step-by-step instructions
   - See visual guides for each knot step

2. **"How to make the perfect espresso"**
   - Learn the process with detailed steps
   - View images of proper technique

3. **"How to change a car tire"**
   - Safety instructions included
   - Visual guide for each step

4. **"How to fold a paper airplane"**
   - Detailed folding instructions
   - Images showing each fold

5. **"How to set up a home office"**
   - Ergonomic tips and best practices
   - Layout and organization visuals

## 🎨 UI Components

### Chat Interface (Left/Main Panel)
- **Welcome Screen**: Shows suggested questions to get started
- **Message Bubbles**: User messages in purple, AI responses in gray
- **Input Field**: Type your question and press Enter or click Send
- **Loading Indicator**: Shows when AI is thinking

### Image Carousel (Right Panel)
- **Main Display**: Large, clear view of the current image
- **Navigation**: Left/Right arrows to browse images
- **Thumbnails**: Quick preview strip at the bottom
- **Image Counter**: Shows current position (e.g., "1 / 4")
- **Loading State**: Beautiful animation while images generate

## 🔧 How It Works (Technical Flow)

```
User Question
    ↓
Claude AI Analysis
    ↓
Text Response + Image Decision
    ↓
If images needed → Generate prompts
    ↓
Gemini Imagen API
    ↓
Images appear in carousel
```

### Claude Response Format
Claude analyzes each question and responds with:
```json
{
  "response": "Step-by-step instructions...",
  "needsImages": true,
  "imageCount": 3,
  "imagePrompts": [
    "Clear image showing step 1",
    "Detailed view of step 2",
    "Final result"
  ]
}
```

## 🎯 Best Practices

### For Users
1. **Be Specific**: "How to tie a Windsor knot" vs "How to tie"
2. **Ask Follow-ups**: Continue the conversation for clarifications
3. **Review Images**: Use the carousel to study visual steps
4. **Try Suggestions**: Click the example questions if you're unsure what to ask

### For Developers
1. **API Keys**: Keep your `.env.local` file secure
2. **Rate Limits**: Monitor your API usage on Claude and Gemini dashboards
3. **Customization**: Edit `tailwind.config.ts` for theme changes
4. **System Prompt**: Modify `/app/api/chat/route.ts` for different AI behavior

## 🔐 Environment Variables

Required in `.env.local`:
```bash
CLAUDE_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSy...
LAMBDA_API_ENDPOINT=https://... (optional)
```

## 🎨 Customization Guide

### Change Colors
Edit `app/globals.css` to modify the color scheme:
```css
--primary: 262.1 83.3% 57.8%; /* Purple accent */
```

### Adjust Layout
Modify `app/page.tsx` grid layout:
```tsx
// Change column ratio
<div className="grid-cols-1 lg:grid-cols-3"> 
// 2/3 for chat, 1/3 for images
```

### Modify AI Behavior
Edit the system prompt in `app/api/chat/route.ts`:
```typescript
const systemPrompt = `Your custom instructions...`;
```

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Images Not Loading
1. Check GEMINI_API_KEY in `.env.local`
2. Verify API quota on Google Cloud Console
3. Check browser console for errors

### Chat Not Responding
1. Verify CLAUDE_API_KEY is correct
2. Check Anthropic API status
3. Look at terminal for error messages

### Build Errors
```bash
# Type check
npm run build

# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📱 Mobile Responsiveness

The app automatically adapts to mobile:
- Chat and images stack vertically on small screens
- Touch-friendly buttons and controls
- Optimized for portrait and landscape modes

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables on Vercel
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

## 📊 Performance Tips

1. **Image Optimization**: Next.js automatically optimizes images
2. **Edge Runtime**: API routes use edge for faster response
3. **Lazy Loading**: Components load only when needed
4. **Streaming**: Consider implementing streaming responses for longer instructions

## 🔮 Future Enhancements

- [ ] Save favorite how-to's
- [ ] Share generated guides
- [ ] Video generation support
- [ ] Multi-language support
- [ ] Voice input for questions
- [ ] Export guides as PDF
- [ ] User authentication
- [ ] History of past searches

## 📄 License

MIT - Feel free to use and modify for your projects!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

**Enjoy using How To Search! 🎉**

For questions or support, check the README.md or open an issue.

