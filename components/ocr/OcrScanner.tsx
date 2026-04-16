import { useState } from 'react';
import { Camera, Upload, Copy, Check, Trash2, FileText, Info, Scan, Sparkles, Wand2, RefreshCw, Languages, Share2, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CameraViewfinder } from '@/src/components/CameraViewfinder';
import { ImageUploader } from '@/src/components/ImageUploader';
import { motion, AnimatePresence } from 'motion/react';
import { fixOCRText, detectHandwriting, detectLanguage } from '@/src/services/geminiService';
import { preloadOCRModels } from '@/src/lib/ocr';
import { useEffect } from 'react';

interface OCRHistoryItem {
  id: string;
  text: string;
  confidence: number;
  timestamp: number;
  isFixed?: boolean;
  isHandwriting?: boolean;
  detectedLang?: string;
  lang: string;
}

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [currentResult, setCurrentResult] = useState<{ text: string; confidence: number; isFixed?: boolean; isHandwriting?: boolean; detectedLang?: string; lang: string } | null>(null);
  const [history, setHistory] = useState<OCRHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('auto'); // 'auto', 'eng', or 'jpn'

  useEffect(() => {
    // Pre-load both models to warm up the persistent worker
    preloadOCRModels('eng+jpn').catch(console.error);
  }, []);

  const handleOCRResult = async (text: string, confidence: number, lang: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    let finalLang = lang;
    let detectedLang = undefined;

    // AI-powered language detection if set to auto
    if (lang === 'auto') {
      detectedLang = await detectLanguage(trimmedText);
      finalLang = detectedLang;
    }

    // Detect handwriting in background
    const isHandwriting = await detectHandwriting(trimmedText, finalLang);

    setCurrentResult({ text: trimmedText, confidence, lang: finalLang, isHandwriting, detectedLang });
    
    const newItem: OCRHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: trimmedText,
      confidence,
      timestamp: Date.now(),
      lang: finalLang,
      isHandwriting,
      detectedLang
    };
    
    setHistory(prev => [newItem, ...prev].slice(0, 10));
  };

  const handleFixWithAI = async () => {
    if (!currentResult || isFixing) return;

    setIsFixing(true);
    try {
      const fixedText = await fixOCRText(currentResult.text, currentResult.lang, currentResult.isHandwriting);
      setCurrentResult(prev => prev ? { ...prev, text: fixedText, isFixed: true } : null);
    } catch (err) {
      console.error('Fix Error:', err);
    } finally {
      setIsFixing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VisionOCR Extracted Text',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy if share is not supported
      copyToClipboard(text);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentResult(null);
  };

  return (
    <div className="min-h-screen bg-[#E6E6E6] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#151619] rounded-lg flex items-center justify-center">
                <Scan className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#151619]">VisionOCR</h1>
            </div>
            <p className="text-muted-foreground text-sm">On-device optical character recognition</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/50 border-black/10 text-black/60 font-mono text-[10px] uppercase tracking-wider">
              Offline Mode
            </Badge>
            <Badge variant="outline" className="bg-white/50 border-black/10 text-black/60 font-mono text-[10px] uppercase tracking-wider">
              AI Enhanced
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Scanner Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between bg-white/50 p-2 rounded-xl border border-black/5">
              <div className="flex items-center gap-2 px-2">
                <Languages className="w-4 h-4 text-black/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Target Language</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant={language === 'auto' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setLanguage('auto')}
                  className="h-8 text-xs rounded-lg"
                >
                  Auto
                </Button>
                <Button 
                  variant={language === 'eng' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setLanguage('eng')}
                  className="h-8 text-xs rounded-lg"
                >
                  English
                </Button>
                <Button 
                  variant={language === 'jpn' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setLanguage('jpn')}
                  className="h-8 text-xs rounded-lg"
                >
                  日本語
                </Button>
              </div>
            </div>

            <Tabs defaultValue="camera" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/5 p-1">
                <TabsTrigger value="camera" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Viewfinder
                </TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="camera" className="m-0">
                  <CameraViewfinder 
                    onResult={handleOCRResult} 
                    isProcessing={isProcessing} 
                    setIsProcessing={setIsProcessing} 
                    language={language === 'auto' ? 'eng+jpn' : language}
                  />
                </TabsContent>
                <TabsContent value="upload" className="m-0">
                  <ImageUploader 
                    onResult={handleOCRResult} 
                    isProcessing={isProcessing} 
                    setIsProcessing={setIsProcessing} 
                    language={language === 'auto' ? 'eng+jpn' : language}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Current Result */}
            <AnimatePresence mode="wait">
              {currentResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-none shadow-xl overflow-hidden">
                    <CardHeader className="bg-[#151619] text-white py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-white/60" />
                          <CardTitle className="text-sm font-medium">
                            {currentResult.isFixed ? 'AI Corrected Text' : 'Extracted Text'}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {!currentResult.isFixed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isFixing}
                              onClick={handleFixWithAI}
                              className="h-8 text-[10px] uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border-none rounded-full px-3"
                            >
                              {isFixing ? (
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                currentResult.isHandwriting ? <PenTool className="w-3 h-3 mr-1 text-amber-400" /> : <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                              )}
                              {isFixing ? 'AI is thinking...' : (currentResult.isHandwriting ? 'Optimize Handwriting' : 'Fix with AI')}
                            </Button>
                          )}
                          <Badge className="bg-white/10 text-white border-none font-mono text-[10px]">
                            {Math.round(currentResult.confidence)}% Confidence
                          </Badge>
                          {currentResult.detectedLang && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono text-[10px] flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              {currentResult.detectedLang === 'jpn' ? 'Detected: 日本語' : 'Detected: English'}
                            </Badge>
                          )}
                          {currentResult.isHandwriting && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-mono text-[10px] flex items-center gap-1">
                              <PenTool className="w-3 h-3" />
                              Handwriting Detected
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-white hover:bg-white/10"
                              onClick={() => copyToClipboard(currentResult.text)}
                              title="Copy to clipboard"
                            >
                              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-white hover:bg-white/10"
                              onClick={() => handleShare(currentResult.text)}
                              title="Share text"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[200px] w-full p-6 bg-white">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-[#151619] leading-relaxed">
                          {currentResult.text}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* History / Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-black/40">History</CardTitle>
                  {history.length > 0 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-black/40 hover:text-destructive" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col">
                {history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
                      <Info className="w-6 h-6 text-black/20" />
                    </div>
                    <p className="text-sm text-black/40">No scans yet. Start by using the viewfinder or uploading an image.</p>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div 
                          key={item.id} 
                          className="group p-3 rounded-lg border border-black/5 bg-white hover:border-black/20 transition-all cursor-pointer"
                          onClick={() => setCurrentResult({ text: item.text, confidence: item.confidence, isFixed: item.isFixed })}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-black/40">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-black/5 text-black/60 border-none">
                              {Math.round(item.confidence)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-black/70 line-clamp-2 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                <Separator className="my-4 bg-black/5" />
                
                <div className="p-4 bg-black/5 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Technical Info</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-black/40">Engine</p>
                      <p className="text-xs font-medium">Tesseract.js v5</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-black/40">Optimization</p>
                      <p className="text-xs font-medium">Persistent Worker</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-black/40">Processing</p>
                      <p className="text-xs font-medium">WASM / On-Device</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-black/40">Models</p>
                      <p className="text-xs font-medium">Pre-loaded</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-center">
        <p className="text-[10px] font-mono text-black/30 uppercase tracking-[0.2em]">
          VisionOCR &copy; 2024 &bull; Built with Tesseract.js & React
        </p>
      </footer>
    </div>
  );
}
