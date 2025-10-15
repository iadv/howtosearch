# Troubleshooting Guide

## ✅ Issues Fixed

### 1. Claude API Authentication Error
**Problem:** "Could not resolve authentication method"

**Root Cause:** 
- Anthropic client was initialized at module level in Edge runtime
- Environment variables weren't available at that point

**Solution:** 
- Moved Anthropic client initialization inside the POST function
- Added proper environment variable checks
- Cleared `.next` cache and restarted server

**Fixed in:** `app/api/chat/route.ts`

### 2. Browser Extension Warning
**Warning:** "Extra attributes from the server: bis_register"

**Explanation:** 
- This is from a browser extension (likely Bitwarden)
- It's completely harmless and can be ignored
- Not related to your app

## 🚀 App is Now Working

**Access your app at:** http://localhost:3000

## ✅ Verification Steps

1. **Open browser:** http://localhost:3000
2. **Try asking:** "How to tie a tie"
3. **Expected behavior:**
   - Claude responds with instructions
   - Images generate automatically
   - Smooth animations throughout

## 🛠️ If You Still See Errors

### Environment Variables Not Loading

```bash
# 1. Verify .env.local exists and has content
cat .env.local

# 2. Kill all Next.js processes
pkill -9 -f "next"

# 3. Clear build cache
rm -rf .next

# 4. Restart server
npm run dev
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or let Next.js use another port (it will auto-detect)
npm run dev
```

### API Key Issues

1. Check `.env.local` has your keys:
```bash
CLAUDE_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
```

2. Verify no extra spaces or quotes
3. Restart the dev server completely

### Linter/Type Errors

```bash
# Check for errors
npm run lint

# If needed, reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📋 Common Issues

| Issue | Solution |
|-------|----------|
| API 500 Error | Restart dev server |
| Images not loading | Check GEMINI_API_KEY |
| Animations laggy | Clear browser cache |
| Module not found | Run `npm install` |
| Build fails | Delete `.next` folder |

## 🔍 Debug Mode

To see detailed logs:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Network tab shows API calls
4. Look for errors in terminal

## 📞 Getting Help

If issues persist:

1. Check terminal output for specific errors
2. Check browser console for client-side errors
3. Verify all dependencies installed: `npm install`
4. Try in incognito/private window
5. Clear browser cache completely

## ✨ Current Status

- ✅ Environment variables configured
- ✅ Claude API working
- ✅ Gemini API configured (fallback mode)
- ✅ Modern UX implemented
- ✅ All animations working
- ✅ No linter errors
- ✅ Development server running

**Everything should be working now!** 🎉

---

Last updated: 2025-10-15

