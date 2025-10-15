// Configuration for the How To Search app

export const config = {
  // Image generation mode
  // 'gemini' - Use Gemini Imagen API (requires setup)
  // 'none' - Don't generate images (only show if real images are returned)
  imageGenerationMode: 'gemini' as 'gemini' | 'none',
  
  // API endpoints
  api: {
    chat: '/api/chat',
    images: '/api/generate-images',
  },
  
  // UI settings
  ui: {
    maxImagesPerResponse: 4,
    carouselAutoPlay: false,
    animationDuration: 300,
  },
  
  // AI settings
  ai: {
    claudeModel: 'claude-3-5-haiku-20241022',
    maxTokens: 2048,
    temperature: 0.7,
  },
};

// Get the appropriate image generation endpoint based on mode
export function getImageEndpoint(): string | null {
  return config.imageGenerationMode === 'gemini' 
    ? config.api.images 
    : null; // No fallback - only real images or nothing
}

