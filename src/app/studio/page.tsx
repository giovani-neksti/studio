'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getNicheConfig, nicheConfigs, NicheKey } from '@/lib/niche-config';
import { buildEnglishPrompt } from '@/lib/prompt-builder';
import { Sidebar } from '@/components/Sidebar';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { GalleryModal } from '@/components/GalleryModal';
import { PricingModal } from '@/components/PricingModal';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut, Gem, ChevronDown, Images, CreditCard, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nicheParam = searchParams.get('niche') as NicheKey | null;
  const config = getNicheConfig(nicheParam);
  const niche = nicheParam && nicheParam in nicheConfigs ? nicheParam : 'jewelry';

  const [selections, setSelections] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [credits, setCredits] = useState(5);
  const [imageIndex, setImageIndex] = useState(0);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  const [nicheMenuOpen, setNicheMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!selections.bgTab) {
      setSelections(prev => ({ ...prev, bgTab: 'solid', displayTab: 'expositor' }));
    }
  }, []);

  const handleSelect = (key: string, value: string) => {
    setSelections((prev) => {
      if (prev[key] === value && key !== 'bgTab' && key !== 'displayTab') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const hasUpload = Object.keys(selections).some(k => k.startsWith('upload_'));
  const hasPreviewContent = isGenerating || !!imageUrl;

  const processImageForAI = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], "imagem_processada.jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleGenerate = async () => {
    if (credits <= 0) return;
    if (!hasUpload) {
      alert("Por favor, selecione uma categoria e faça o upload de pelo menos uma imagem do produto.");
      return;
    }

    setIsGenerating(true);
    setImageUrl(null);

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    try {
      const uploadKeys = Object.keys(selections).filter(k => k.startsWith('upload_') && selections[k]);
      if (uploadKeys.length === 0) throw new Error("Nenhuma imagem encontrada");

      const formData = new FormData();
      formData.append('niche', niche);

      for (const key of uploadKeys) {
        const originalFile = selections[key] as File;
        const processedFile = await processImageForAI(originalFile);
        formData.append('files', processedFile);
      }

      const cleanSelections = { ...selections };
      uploadKeys.forEach(k => delete cleanSelections[k]);
      cleanSelections.uploadedCategories = uploadKeys.map(k => k.replace('upload_', ''));
      formData.append('selections', JSON.stringify(cleanSelections));

      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao comunicar com a IA');

      setImageUrl(data.url);
      setRecentImages(prev => [data.url, ...prev].slice(0, 12));
      setImageIndex((i) => i + 1);
      setCredits((c) => c - 1);

    } catch (e: any) {
      console.error(e);
      alert("Houve um erro ao gerar a imagem: " + e.message);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const switchNiche = (n: NicheKey) => {
    if (n !== 'jewelry') return;
    router.push(`/studio?niche=${n}`);
    setNicheMenuOpen(false);
    setSelections({ bgTab: 'solid', displayTab: 'expositor' });
    setImageUrl(null);
  };

  const canGenerate = !isGenerating && credits > 0 && hasUpload;

  const liveSelections = { ...selections };
  const uploadKeys = Object.keys(selections).filter(k => k.startsWith('upload_') && selections[k]);
  if (uploadKeys.length > 0) {
    liveSelections.uploadedCategories = uploadKeys.map(k => k.replace('upload_', ''));
  }
  const currentPrompt = buildEnglishPrompt(niche, liveSelections);

  return (
    <div className={`${config.themeClass} flex flex-col h-[100dvh] w-full overflow-hidden bg-[var(--background)]`}>

      {/* ═══════════════════════════════════════ HEADER — Glassmorphic ═══════════════════════════════════════ */}
      <header className="h-14 md:h-16 flex-shrink-0 flex items-center justify-between px-3 md:px-5 border-b border-white/[0.06] bg-[var(--card)]/80 backdrop-blur-xl backdrop-saturate-150 z-40 relative">
        <div className="flex items-center gap-2 md:gap-4 h-full">
          <div className="flex items-center h-full cursor-pointer py-2 active:scale-[0.97] transition-transform" onClick={() => router.push('/')}>
            <img src="/logo.png" alt="Logo joIAs" className="h-9 md:h-12 lg:h-14 w-auto object-contain" />
          </div>
          <div className="hidden sm:block h-5 w-px bg-white/[0.08]" />
          <div className="relative">
            <button onClick={() => setNicheMenuOpen(!nicheMenuOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[var(--foreground)] text-xs md:text-sm transition-all duration-200 active:scale-[0.97]">
              <span className="text-sm">{config.icon}</span>
              <span className="font-medium hidden xs:inline">{config.label}</span>
              <ChevronDown className={`w-3 h-3 text-[var(--muted-foreground)] transition-transform duration-300 ${nicheMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {nicheMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-[var(--card)]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50">
                {Object.entries(nicheConfigs).map(([key, cfg]) => {
                  const isEnabled = key === 'jewelry';
                  return (
                    <button
                      key={key}
                      onClick={isEnabled ? () => switchNiche(key as NicheKey) : undefined}
                      disabled={!isEnabled}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] transition-all text-left active:scale-[0.98] ${isEnabled ? 'hover:bg-white/[0.06]' : 'grayscale opacity-40 cursor-not-allowed'} ${key === niche ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)]'}`}
                    >
                      <span className="text-lg">{cfg.icon}</span>
                      <div className="flex flex-col">
                        <span>{cfg.label}</span>
                        {!isEnabled && <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-medium">Em breve</span>}
                      </div>
                      {key === niche && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.08] text-xs font-semibold whitespace-nowrap bg-white/[0.03]" style={{ color: credits > 2 ? 'var(--primary)' : '#ef4444' }}>
            <Gem className="w-3 h-3" />{credits} <span className="hidden sm:inline">Créditos</span>
          </div>
          <Button variant="default" size="sm" onClick={() => setIsPricingOpen(true)} className="gap-1.5 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-xs hidden lg:flex h-7 rounded-lg active:scale-[0.97] transition-transform">
            <CreditCard className="w-3.5 h-3.5" />Assinatura
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/[0.04] text-xs h-7 px-2 rounded-lg active:scale-[0.97] transition-transform">
            <LogOut className="w-3 h-3" /><span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      {/* ═══════════════════════════════════════ BODY ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">

        {/* ─── Desktop Sidebar ─── */}
        <div className={`hidden md:flex flex-col min-h-0 border-r border-white/[0.06] bg-[var(--card)] transition-all duration-300 ease-in-out shrink-0
          ${isSidebarOpen ? 'w-[30%] lg:w-[320px] xl:w-[380px]' : 'w-0 overflow-hidden border-r-0'}`}
        >
          <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} />
        </div>

        {/* ─── Desktop Sidebar Toggle ─── */}
        <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-300" style={{ transform: `translate(${isSidebarOpen ? 'min(calc(30vw), 380px)' : '0px'}, -50%)` }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-5 h-12 bg-[var(--card)]/90 backdrop-blur-xl border border-white/[0.08] rounded-r-lg shadow-lg hover:bg-white/[0.06] transition-all active:scale-[0.95] focus:outline-none -ml-[1px]"
            title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ─── Mobile Bottom Sheet Backdrop ─── */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ─── Mobile Bottom Sheet Sidebar ─── */}
        <div className={`md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[var(--card)] rounded-t-[1.75rem] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ height: '85dvh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-10 h-[5px] bg-white/20 rounded-full" />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} />
          </div>
        </div>

        {/* ─── Main Content Area ─── */}
        <main className="flex-1 flex flex-col bg-[var(--background)] relative min-h-0 overflow-hidden">

          {/* Desktop Generate Button */}
          <div className="hidden md:block flex-shrink-0 px-8 pt-6 pb-2 z-10">
            <button onClick={handleGenerate} disabled={!canGenerate} className="w-full relative overflow-hidden group flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98] shadow-lg hover:shadow-2xl bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white border border-white/10">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {isGenerating ? (
                <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Criando Magia...</span></>
              ) : (
                <><Sparkles className="w-5 h-5 text-yellow-200" /><span>{hasUpload ? 'Gerar Imagem de Alta Conversão' : 'Faça upload de uma peça'}</span></>
              )}
            </button>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ImagePreviewCard
              isGenerating={isGenerating}
              imageUrl={imageUrl}
              selections={selections}
              niche={niche}
              onGenerate={handleGenerate}
              livePrompt={currentPrompt}
            />
          </div>

          {/* Desktop Gallery Strip */}
          {recentImages.length > 0 && (
            <div className="hidden md:flex flex-shrink-0 h-[88px] border-t border-white/[0.06] bg-[var(--card)]/60 backdrop-blur-lg px-6 py-3 items-center transition-all">
              <div className="flex flex-col h-full justify-center">
                <button onClick={() => setIsGalleryOpen(true)} className="group flex items-center gap-2 focus:outline-none text-left mb-2 active:scale-[0.97] transition-transform">
                  <span className="text-[11px] font-bold text-[var(--foreground)]/70 group-hover:text-[var(--primary)] transition-colors uppercase tracking-widest">Galeria</span>
                  <Images className="w-3 h-3 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                </button>
                <div className="flex items-center gap-2">
                  {recentImages.slice(0, 8).map((img, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-white/[0.08] cursor-pointer hover:border-[var(--primary)] transition-all hover:scale-110 active:scale-95 shadow-sm" onClick={() => setImageUrl(img)}>
                      <img src={img} alt={`Recente ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════════════════════════ MOBILE STICKY BOTTOM BAR ═══════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--card)]/80 backdrop-blur-2xl border-t border-white/[0.06]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Config Button */}
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] active:scale-[0.93] transition-all shrink-0">
            <Layers className="w-5 h-5 text-[var(--foreground)]" />
          </button>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={!canGenerate} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-[14px] transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white shadow-lg border border-white/10">
            {isGenerating ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span className="text-[13px]">Gerando...</span></>
            ) : (
              <><Sparkles className="w-4 h-4 text-yellow-200" /><span>{hasUpload ? 'Gerar Imagem' : 'Upload primeiro'}</span></>
            )}
          </button>

          {/* Credits Pill */}
          <div className="flex items-center gap-1 px-2.5 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold shrink-0" style={{ color: credits > 2 ? 'var(--primary)' : '#ef4444' }}>
            <Gem className="w-3.5 h-3.5" />{credits}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ OVERLAYS ═══════════════════════════════════════ */}
      {nicheMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setNicheMenuOpen(false)} />}
      <GalleryModal isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} niche={niche} images={recentImages} />
      <PricingModal isOpen={isPricingOpen} onOpenChange={setIsPricingOpen} />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] flex items-center justify-center bg-[#09090b]"><div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" /></div>}>
      <StudioContent />
    </Suspense>
  );
}