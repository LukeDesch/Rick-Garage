import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Cpu, Zap, Image as ImageIcon, Loader2, Send, AlertCircle, Database, Globe, ChevronRight, Menu, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const DEVICES = [
  {
    id: 'portal-gun',
    name: 'The Portal Gun',
    purpose: 'Dimension-hopping and interdimensional travel.',
    components: 'Often requires portal fluid, which can be modified or changed (e.g., green to black/blue) for specific tracking or to overcome barriers.',
    functionality: 'Able to create portals to virtually any dimension in the Central Finite Curve.'
  },
  {
    id: 'space-cruiser',
    name: 'The Space Cruiser',
    powerSource: 'A Microverse-based powercell, which is a miniature universe designed to generate power.',
    engine: 'Dark-matter based engine.',
    keyFeatures: 'Disintegrator gun, laser minigun, cloaking (invisibility), auto-park, cloning pod, and AI, often voiced as a self-aware system.',
    defense: 'Highly durable, capable of surviving high-impact, and features automatic weapons systems.'
  },
  {
    id: 'operation-phoenix',
    name: 'Operation Phoenix (Cloning Project)',
    purpose: 'To transfer Rick’s brain/consciousness into a new clone body upon death.',
    location: 'Underneath the Smith residence garage.',
    design: 'A complex system of pods and cloning vats designed to secure his immortality.'
  },
  {
    id: 'meeseeks-box',
    name: 'Meeseeks Box',
    purpose: 'Summons a Meeseeks, a blue creature whose sole purpose is to fulfill a single request and then cease to exist.',
    design: 'A small button-operated box.'
  },
  {
    id: 'microverse-battery',
    name: 'Microverse Battery',
    purpose: 'A compact battery containing a universe, used to fuel the ship.'
  },
  {
    id: 'particle-beam-watch',
    name: 'Particle Beam Wrist Watch',
    purpose: 'A wearable device that fires a green laser, capable of vaporizing targets, often used as a weapon, or in conjunction with a snake holster.'
  },
  {
    id: 'translator',
    name: 'Translator',
    purpose: 'A device that translates any language into English.'
  }
];

function DeviceDetails({ device }: { device: any }) {
  const entries = Object.entries(device).filter(([key]) => !['id', 'name', 'purpose'].includes(key));
  
  return (
    <div className="max-w-3xl space-y-6">
      {entries.map(([key, value]) => (
        <div key={key} className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-mono text-emerald-500/80 uppercase tracking-widest mb-3">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <p className="text-zinc-300 leading-relaxed">{value as string}</p>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="text-zinc-500 italic">No additional specifications available in the current blueprint database.</div>
      )}
    </div>
  );
}

function BlueprintVisualizer({ device }: { device: any }) {
  const [prompt, setPrompt] = useState(`A highly detailed, sci-fi schematic blueprint of ${device.name}. Technical drawing, glowing neon lines on dark background.`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key is missing.");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });
      
      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setImageUrl(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }
      if (!foundImage) throw new Error("No image data returned from the model.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6 h-full flex flex-col pb-8">
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 flex-shrink-0">
        <div className="flex gap-4 items-start">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Visualizer Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none h-24"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-end h-full">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-[50px] bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Rendering...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Generate Blueprint
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[400px]">
        {imageUrl ? (
          <img src={imageUrl} alt={`Generated blueprint of ${device.name}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        ) : (
          <div className="text-center text-zinc-600 flex flex-col items-center gap-4">
            <ImageIcon className="w-12 h-12 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-widest">Awaiting Render Command</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AiAnalysis({ device }: { device: any }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, grounding?: any[]}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key is missing.");
      const ai = new GoogleGenAI({ apiKey });
      
      const deviceContext = JSON.stringify(device, null, 2);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are Rick's Garage AI. You assist with analyzing device blueprints. 
Context about the current device:
${deviceContext}

User Question: ${userMsg}`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const urls = chunks.map((c: any) => c.web?.uri).filter(Boolean);
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text || "No response generated.",
        grounding: urls.length > 0 ? urls : undefined
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl h-full flex flex-col bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden pb-8">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
            <Cpu className="w-12 h-12 opacity-20" />
            <p className="text-center max-w-md">
              Ask the Garage AI to analyze the {device.name}, find real-world scientific equivalents, or expand on its theoretical physics.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {msg.role === 'user' ? <Terminal className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
            </div>
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-zinc-800 text-zinc-200 rounded-tr-sm' 
                  : 'bg-zinc-900/80 border border-zinc-800/50 text-zinc-300 rounded-tl-sm'
              }`}>
                <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
              {msg.grounding && msg.grounding.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.grounding.map((url, j) => (
                    <a 
                      key={j} 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{new URL(url).hostname}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="text-sm text-zinc-500">Analyzing databanks...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-zinc-950 border-t border-zinc-800/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about ${device.name}...`}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-3.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 text-zinc-400 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-zinc-400 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
  const [activeTab, setActiveTab] = useState<'details' | 'visualizer' | 'ai'>('details');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex overflow-hidden relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 border-r border-zinc-800/50 bg-zinc-900 flex flex-col transition-transform duration-300 transform 
        lg:relative lg:translate-x-0 lg:bg-zinc-900/20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <Terminal className="w-6 h-6" />
              <h1 className="font-display font-bold text-xl tracking-tight text-zinc-100">Rick's Garage</h1>
            </div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Blueprint Terminal v1.37</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {DEVICES.map(device => (
            <button
              key={device.id}
              onClick={() => {
                setSelectedDevice(device);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                selectedDevice.id === device.id 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-zinc-800/50 border border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="font-medium">{device.name}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedDevice.id === device.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950">
        <div className="p-6 lg:p-8 border-b border-zinc-800/50 flex-shrink-0 flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl lg:text-4xl font-display font-bold text-zinc-100 mb-1 lg:mb-4">{selectedDevice.name}</h2>
            <p className="text-sm lg:text-lg text-zinc-400 max-w-3xl leading-relaxed line-clamp-1 lg:line-clamp-none">{selectedDevice.purpose}</p>
          </div>
        </div>

        <div className="flex border-b border-zinc-800/50 px-4 lg:px-8 gap-4 lg:gap-8 flex-shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'details', label: 'Specs', fullLabel: 'Specifications', icon: Database },
            { id: 'visualizer', label: 'Visual', fullLabel: 'Visualizer', icon: ImageIcon },
            { id: 'ai', label: 'AI', fullLabel: 'AI Analysis', icon: Cpu }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium hidden lg:inline">{tab.fullLabel}</span>
              <span className="font-medium lg:hidden">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedDevice.id}-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'details' && <DeviceDetails device={selectedDevice} />}
              {activeTab === 'visualizer' && <BlueprintVisualizer device={selectedDevice} />}
              {activeTab === 'ai' && <AiAnalysis device={selectedDevice} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <MainApp />;
}
