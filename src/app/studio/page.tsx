'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getNicheConfig, nicheConfigs, NicheKey } from '@/lib/niche-config';
import { Sidebar } from '@/components/Sidebar';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { GalleryModal } from '@/components/GalleryModal';
import { PricingModal } from '@/components/PricingModal';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  LogOut,
  Gem,
  ChevronDown,
  Images,
  CreditCard,
} from 'lucide-react';

// Unsplash image sets per niche (mock – real AI generation in prod)
const mockImages: Record<string, string[]> = {
  jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90',
    'https://images.unsplash.com/photo-1573408301185-9519f94da5de?w=800&q=90',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=90',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90',
  ],
  clothing: [
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=90',
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=90',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=90',
  ],
  shoes: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=90',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=90',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=90',
  ],
};

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nicheParam = searchParams.get('niche') as NicheKey | null;
  const config = getNicheConfig(nicheParam);
  const niche = nicheParam && nicheParam in nicheConfigs ? nicheParam : 'jewelry';

  const [selections, setSelections] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Gallery and credits
  const [credits, setCredits] = useState(5);
  const [imageIndex, setImageIndex] = useState(0);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  
  // UI States
  const [nicheMenuOpen, setNicheMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Default selections for Sidebar logic
  useEffect(() => {
    if (!selections.bgTab) {
      setSelections(prev => ({ ...prev, bgTab: 'solid', displayTab: 'expositor' }));
    }
  }, []);

  const handleSelect = (key: string, value: string) => {
    setSelections((prev) => {
      // Toggle off if already selected (except for tabs which are radio-like)
      if (prev[key] === value && key !== 'bgTab' && key !== 'displayTab') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const generatePromptLog = () => {
    const uploadKeys = Object.keys(selections).filter(k => k.startsWith('upload_'));
    const uploads = uploadKeys.map(k => `${k.replace('upload_', '')}: ${selections[k]}`);
    
    const uploadStr = uploads.length > 0 ? `[Uploads: ${uploads.join(', ')}]` : '[Upload: nenhum]';
    const bgStr = `[Fundo: ${selections.background || 'Não selecionado'}]`;
    const displayStr = `[Exibição: ${selections.display || 'Não selecionado'}]`;
    const textStr = selections.text ? `[Texto: "${selections.text}" na tipografia ${selections.typography || 'Padrão'}]` : '';
    
    console.log(`%c🎨 Prompt do User (50%): %c${uploadStr} + ${bgStr} + ${displayStr} ${textStr}`, 'color: #D4AF37; font-weight: bold', 'color: white');
    console.log(`%c🤖 Prompt do BD (50%): %c[Lente Macro 100mm, Iluminação de Estúdio, 8k, Octane Render, produto em foco, ultra-realista]`, 'color: #3B82F6; font-weight: bold', 'color: gray');
    console.log(`%c🚀 Enviando requisição para Vision Model / ComfyUI Server...`, 'color: #10B981; font-weight: bold');
  };

  const hasUpload = Object.keys(selections).some(k => k.startsWith('upload_'));

  const handleGenerate = async () => {
    if (credits <= 0) return;
    
    // REQUIRE at least upload to generate
    if (!hasUpload) {
      alert("Por favor, selecione uma categoria e faça o upload de pelo menos uma imagem do produto.");
      return;
    }

    setIsGenerating(true);
    setImageUrl(null);
    
    // Simulate prompt building
    generatePromptLog();

    try {
      const uploadKey = Object.keys(selections).find(k => k.startsWith('upload_') && selections[k]);
      if (!uploadKey) throw new Error("Imagem não encontrada");
      
      const file = selections[uploadKey] as File;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('niche', niche);
      
      // Clone selections sem o objeto File para poder enviar como string JSON
      const cleanSelections = { ...selections };
      delete cleanSelections[uploadKey];
      formData.append('selections', JSON.stringify(cleanSelections));
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
         throw new Error(data.error || 'Erro ao comunicar com a IA');
      }
      
      setImageUrl(data.url);
      setRecentImages(prev => [data.url, ...prev].slice(0, 12));
      setImageIndex((i) => i + 1);
      setCredits((c) => c - 1);
    } catch (e: any) {
      console.error(e);
      alert("Houve um erro ao gerar a imagem: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => router.push('/');

  const switchNiche = (n: string) => {
    router.push(`/studio?niche=${n}`);
    setNicheMenuOpen(false);
    setSelections({ bgTab: 'solid', displayTab: 'expositor' });
    setImageUrl(null);
  };

  const canGenerate = !isGenerating && credits > 0 && hasUpload;

  return (
    <div className={`${config.themeClass} h-screen flex flex-col overflow-hidden`}>
      {/* Top Navigation Bar */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-sm z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-[var(--primary-foreground)] font-bold text-xs">S</span>
            </div>
            <span className="text-[var(--foreground)] font-bold text-sm">Studio AI</span>
          </div>

          <div className="h-5 w-px bg-[var(--border)]" />

          {/* Niche switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setNicheMenuOpen(!nicheMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--muted)] 
                border border-[var(--border)] text-[var(--foreground)] text-sm transition-colors duration-150"
            >
              <span>{config.icon}</span>
              <span className="font-medium">{config.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--muted-foreground)] transition-transform ${nicheMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {nicheMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50">
                {Object.entries(nicheConfigs).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => switchNiche(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--accent)] text-left
                      ${key === niche ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)]'}`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                    {key === niche && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Credits + Logout */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold"
            style={{
              borderColor: credits > 2 ? 'var(--primary)' : '#ef4444',
              color: credits > 2 ? 'var(--primary)' : '#ef4444',
              backgroundColor: credits > 2 ? 'var(--niche-glow, rgba(255,255,255,0.05))' : 'rgba(239,68,68,0.08)',
            }}
          >
            <Gem className="w-3.5 h-3.5" />
            {credits} Créditos
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsPricingOpen(true)}
            className="gap-2 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-sm hidden sm:flex"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Adquirir Assinatura
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] text-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content: Sidebar + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (30%) */}
        <div className="w-[30%] min-w-[280px] max-w-[380px] flex-shrink-0 overflow-hidden">
          <Sidebar
            config={config}
            niche={niche}
            selections={selections}
            onSelect={handleSelect}
          />
        </div>

        {/* Main Area (70%) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
          {/* Generate button pinned at top */}
          <div className="flex-shrink-0 px-8 pt-5 pb-3">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:opacity-90 active:scale-[0.99]"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                boxShadow: canGenerate ? `0 4px 32px var(--niche-glow, rgba(255,255,255,0.1))` : undefined,
              }}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                  <span>Construindo Composição...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{hasUpload ? 'Gerar Imagem de Alta Conversão' : 'Faça upload de uma peça para gerar'}</span>
                  {credits > 0 && hasUpload && (
                    <span className="ml-1 opacity-60 text-sm font-normal">
                      (−1 crédito)
                    </span>
                  )}
                </>
              )}
            </button>

            {credits === 0 && (
              <p className="text-center text-sm text-red-400 mt-2 flex items-center justify-center gap-1">
                Você não tem mais créditos. 
                <span className="underline cursor-pointer hover:text-red-300">Adquirir mais créditos →</span>
              </p>
            )}
          </div>

          {/* Image Preview (main area) */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <ImagePreviewCard
              isGenerating={isGenerating}
              imageUrl={imageUrl}
              selections={selections}
              niche={niche}
              onGenerate={handleGenerate}
            />
          </div>

          {/* Bottom Strip: Recent Images & Gallery Button */}
          {recentImages.length > 0 && (
            <div className="flex-shrink-0 h-[104px] border-t border-[var(--border)] bg-[var(--card)] px-6 py-4 flex items-center justify-between">
              
              <div className="flex flex-col h-full justify-center">
                <button 
                  onClick={() => setIsGalleryOpen(true)}
                  className="group flex items-center gap-2 focus:outline-none text-left mb-1.5"
                >
                  <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Galeria de Criações</span>
                  <Images className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                </button>

                <div className="flex items-center gap-2">
                  {recentImages.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="w-12 h-12 rounded-md overflow-hidden border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors" onClick={() => setImageUrl(img)}>
                      <img src={img} alt={`Recente ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          )}
        </main>
      </div>

      {/* Click outside to close niche menu */}
      {nicheMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setNicheMenuOpen(false)} />
      )}

      {/* Gallery Modal */}
      <GalleryModal 
        isOpen={isGalleryOpen} 
        onOpenChange={setIsGalleryOpen} 
        niche={niche} 
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onOpenChange={setIsPricingOpen}
      />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
