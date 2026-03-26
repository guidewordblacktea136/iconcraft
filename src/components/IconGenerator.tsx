import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Download, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  Palette, 
  Square, 
  Circle, 
  Info,
  ChevronRight,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/src/lib/utils";

// --- Types ---
type IconStyle = 'Flat' | '3D' | 'Minimalist' | 'Glassmorphism' | 'Line Art' | 'Pixel Art' | 'Watercolor' | 'Cyberpunk' | 'Claymorphism';
type IconShape = 'Square' | 'Circle' | 'Squircle';

interface GenerationState {
  loading: boolean;
  error: string | null;
  imageUrl: string | null;
  message: string;
}

// --- Constants ---
const STYLES: { name: IconStyle; description: string }[] = [
  { name: 'Flat', description: 'Clean, 2D design with bold colors' },
  { name: '3D', description: 'Realistic depth, shadows, and textures' },
  { name: 'Minimalist', description: 'Simple shapes and limited palette' },
  { name: 'Glassmorphism', description: 'Frosted glass effect with transparency' },
  { name: 'Line Art', description: 'Elegant outlines and minimal fills' },
  { name: 'Pixel Art', description: 'Retro 8-bit style aesthetics' },
  { name: 'Watercolor', description: 'Soft, artistic hand-painted feel' },
  { name: 'Cyberpunk', description: 'Neon colors and futuristic tech vibes' },
  { name: 'Claymorphism', description: 'Soft, rounded, clay-like 3D shapes' },
];

const SHAPES: { name: IconShape; icon: React.ReactNode }[] = [
  { name: 'Square', icon: <Square className="w-4 h-4" /> },
  { name: 'Circle', icon: <Circle className="w-4 h-4" /> },
  { name: 'Squircle', icon: <div className="w-4 h-4 border-2 border-current rounded-lg" /> },
];

const LOADING_MESSAGES = [
  "Analyzing your creative vision...",
  "Sketching initial concepts...",
  "Applying artistic styles...",
  "Refining details and edges...",
  "Polishing the final icon...",
  "Almost there, making it perfect...",
];

export default function IconGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<IconStyle>('3D');
  const [selectedShape, setSelectedShape] = useState<IconShape>('Squircle');
  const [generation, setGeneration] = useState<GenerationState>({
    loading: false,
    error: null,
    imageUrl: null,
    message: '',
  });

  // Cycle through loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generation.loading) {
      let index = 0;
      setGeneration(prev => ({ ...prev, message: LOADING_MESSAGES[0] }));
      interval = setInterval(() => {
        index = (index + 1) % LOADING_MESSAGES.length;
        setGeneration(prev => ({ ...prev, message: LOADING_MESSAGES[index] }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [generation.loading]);

  const generateIcon = async () => {
    if (!prompt.trim()) return;

    setGeneration({
      loading: true,
      error: null,
      imageUrl: null,
      message: LOADING_MESSAGES[0],
    });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const fullPrompt = `Professional app icon, ${prompt}, ${selectedStyle} style, ${selectedShape} shape, high quality, centered, isolated on a clean white background, professional design, vector aesthetic, clean edges, high resolution, 4k, masterpiece.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneration({
          loading: false,
          error: null,
          imageUrl,
          message: '',
        });
      } else {
        throw new Error("No image was generated. Please try a different prompt.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setGeneration({
        loading: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred",
        imageUrl: null,
        message: '',
      });
    }
  };

  const downloadIcon = () => {
    if (!generation.imageUrl) return;
    const link = document.createElement('a');
    link.href = generation.imageUrl;
    link.download = `icon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">IconCraft AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Gallery
            </button>
            <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Pricing
            </button>
            <div className="h-4 w-px bg-gray-200 mx-2" />
            <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[400px_1fr] gap-12">
        {/* Controls Sidebar */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              <ImageIcon className="w-4 h-4" />
              <span>Describe your icon</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A minimalist rocket ship launching into space with a glowing trail"
              className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-base"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              <Layers className="w-4 h-4" />
              <span>Choose Style</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <button
                  key={style.name}
                  onClick={() => setSelectedStyle(style.name)}
                  className={cn(
                    "p-3 text-left rounded-xl border transition-all group",
                    selectedStyle === style.name
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-0.5 transition-colors",
                    selectedStyle === style.name ? "text-blue-700" : "text-gray-900"
                  )}>
                    {style.name}
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight">
                    {style.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
              <Palette className="w-4 h-4" />
              <span>Icon Shape</span>
            </div>
            <div className="flex gap-3">
              {SHAPES.map((shape) => (
                <button
                  key={shape.name}
                  onClick={() => setSelectedShape(shape.name)}
                  className={cn(
                    "flex-1 py-3 flex flex-col items-center gap-2 rounded-xl border transition-all",
                    selectedShape === shape.name
                      ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  {shape.icon}
                  <span className="text-xs font-medium">{shape.name}</span>
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={generateIcon}
            disabled={generation.loading || !prompt.trim()}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
              generation.loading || !prompt.trim()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
            )}
          >
            {generation.loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Icon
              </>
            )}
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-[40px] border border-gray-200 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {generation.loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center gap-6 text-center px-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-pulse" />
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Creating Magic</h3>
                  <p className="text-gray-500 animate-pulse">{generation.message}</p>
                </div>
              </motion.div>
            ) : generation.imageUrl ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-8 w-full max-w-md"
              >
                <div className={cn(
                  "relative group shadow-2xl transition-all duration-500",
                  selectedShape === 'Circle' ? 'rounded-full' : 
                  selectedShape === 'Squircle' ? 'rounded-[22%]' : 'rounded-none',
                  "overflow-hidden aspect-square w-full max-w-[320px] bg-gray-50"
                )}>
                  <img
                    src={generation.imageUrl}
                    alt="Generated Icon"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={downloadIcon}
                      className="p-4 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={generateIcon}
                      className="p-4 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"
                    >
                      <RefreshCw className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={downloadIcon}
                      className="flex-1 py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                    <button
                      className="flex-1 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                    >
                      <Layers className="w-4 h-4" />
                      Copy SVG
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Icons are generated at 1024x1024 resolution
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6 text-center px-8"
              >
                <div className="w-32 h-32 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-200" />
                </div>
                <div className="space-y-2 max-w-xs">
                  <h3 className="text-xl font-semibold">Your Icon Awaits</h3>
                  <p className="text-gray-500">Enter a prompt and choose a style to start generating unique icons for your next project.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {['SaaS Dashboard', 'Fitness Tracker', 'Music Player', 'AI Assistant'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setPrompt(tag)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-600 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {generation.error && (
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {generation.error}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Gemini 2.5 Flash</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">API</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
          </div>
          <p className="text-sm text-gray-400">© 2026 IconCraft AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
