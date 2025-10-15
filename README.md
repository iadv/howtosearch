# How To Search - AI-Powered Visual Guide

A beautiful, modern web application that helps users learn how to do anything with AI-powered step-by-step instructions and visual guides.

## Features

- 🤖 **AI-Powered Chat**: Natural language interface powered by Claude AI
- 🖼️ **Visual Guides**: Automatic image generation using Gemini's Imagen
- 🎨 **Modern UI**: Built with Next.js, shadcn/ui, and Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Real-time Updates**: Images appear as you chat
- 🎯 **Smart Image Generation**: AI determines when visuals would help

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI Chat**: Claude 3.5 Sonnet (Anthropic)
- **Image Generation**: Gemini Imagen (Google)
- **Language**: TypeScript

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with your API keys:
   ```
   CLAUDE_API_KEY=your_claude_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. **User asks a question**: e.g., "How to tie a tie"
2. **Claude analyzes** and provides step-by-step instructions
3. **Claude determines** if visual aids would help
4. **If needed**, generates image prompts for key steps
5. **Gemini creates** instructional images
6. **Images appear** in the carousel, latest first

## Project Structure

```
howtosearch/
├── app/
│   ├── api/
│   │   ├── chat/              # Claude API integration
│   │   └── generate-images/   # Gemini image generation
│   ├── layout.tsx
│   ├── page.tsx               # Main app page
│   └── globals.css
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── ChatInterface.tsx      # Chat component
│   └── ImageCarousel.tsx      # Image display component
└── lib/
    └── utils.ts               # Utility functions
```

## Customization

- **Colors**: Modify `tailwind.config.ts` and `app/globals.css`
- **AI Behavior**: Edit the system prompt in `app/api/chat/route.ts`
- **Image Style**: Adjust prompts in the image generation flow

## Deployment

Deploy easily on Vercel:

```bash
vercel deploy
```

Make sure to add your environment variables in the Vercel dashboard.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

