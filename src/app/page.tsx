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

      // CORREÇÃO: Processa cada ficheiro selecionado e anexa à chave "files" que o backend (route.ts) espera
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
    <div className={`${config.themeClass} fixed inset-0 w-full flex flex-col overflow-hidden bg-[var(--background)]`}>
      <header className="h-16 md:h-20 flex-shrink-0 flex items-center justify-between px-3 md:px-5 border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-sm z-30 relative shrink-0">
        <div className="flex items-center gap-2 md:gap-4 h-full">
          <div className="flex items-center h-full cursor-pointer py-2 md:py-3" onClick={() => router.push('/')}>
            <img src="/logo.png" alt="Logo joIAs" className="h-12 md:h-14 lg:h-16 w-auto object-contain" />
          </div>
          <div className="hidden sm:block h-6 w-px bg-[var(--border)]" />
          <div className="relative">
            <button onClick={() => setNicheMenuOpen(!nicheMenuOpen)} className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] text-xs md:text-sm transition-colors duration-150">
              <span className="text-sm md:text-base">{config.icon}</span>
              <span className="font-medium hidden xs:inline">{config.label}</span>
              <ChevronDown className={`w-3 h-3 md:w-3.5 md:h-3.5 text-[var(--muted-foreground)] transition-transform ${nicheMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {nicheMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-48 md:w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50">
                {Object.entries(nicheConfigs).map(([key, cfg]) => {
                  const isEnabled = key === 'jewelry';
                  return (
                    <button
                      key={key}
                      onClick={isEnabled ? () => switchNiche(key as NicheKey) : undefined}
                      disabled={!isEnabled}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 md:py-3 text-xs md:text-sm transition-colors text-left ${isEnabled ? 'hover:bg-[var(--accent)]' : 'grayscale opacity-50 cursor-not-allowed'} ${key === niche ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)]'}`}
                    >
                      <span className="text-lg">{cfg.icon}</span>
                      <div className="flex flex-col">
                        <span className={`${key !== niche && isEnabled ? 'text-[var(--foreground)]' : ''}`}>{cfg.label}</span>
                        {!isEnabled && <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 font-medium">Lançamento em breve</span>}
                      </div>
                      {key === niche && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full border text-xs md:text-sm font-semibold whitespace-nowrap" style={{ borderColor: credits > 2 ? 'var(--primary)' : '#ef4444', color: credits > 2 ? 'var(--primary)' : '#ef4444', backgroundColor: credits > 2 ? 'var(--niche-glow, rgba(255,255,255,0.05))' : 'rgba(239,68,68,0.08)' }}>
            <Gem className="w-3 h-3 md:w-3.5 md:h-3.5" />{credits} <span className="hidden sm:inline">Créditos</span>
          </div>
          <Button variant="default" size="sm" onClick={() => setIsPricingOpen(true)} className="gap-2 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 text-xs md:text-sm hidden lg:flex h-8">
            <CreditCard className="w-3.5 h-3.5" />Adquirir Assinatura
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-1.5 md:gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] text-xs md:text-sm h-8 px-2 md:px-3">
            <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5" /><span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        <div
          className={`flex flex-col min-h-0 border-t md:border-t-0 md:border-r border-[var(--border)] order-2 md:order-1 bg-[var(--card)] z-30 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isSidebarOpen
              ? `w-full ${hasPreviewContent ? 'h-[60%] rounded-t-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.15)] md:h-full md:rounded-none md:shadow-none translate-y-0' : 'flex-1'} md:shrink-0 md:flex-none md:w-[30%] lg:w-[320px] xl:w-[380px] opacity-100`
              : 'w-full h-0 md:h-full md:w-0 opacity-0 md:opacity-0 translate-y-full md:translate-y-0 overflow-hidden border-none'}`}
        >
          <div className="w-full h-full flex flex-col min-h-0 relative">
            {/* Handle for bottom sheet on mobile */}
            {hasPreviewContent && (
              <div 
                className="md:hidden w-full flex justify-center pt-3 pb-2 cursor-pointer absolute top-0 left-0 right-0 z-50 rounded-t-[2rem]"
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="w-12 h-1.5 bg-[var(--border)] rounded-full hover:bg-[var(--primary)]/50 transition-colors" />
              </div>
            )}
            <div className={`flex flex-col h-full w-full min-h-0 ${hasPreviewContent ? 'pt-6 md:pt-0' : ''}`}>
              <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} />
            </div>
          </div>
        </div>

        <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-300 ease-in-out" style={{ transform: `translate(${isSidebarOpen ? 'min(calc(30vw), 380px)' : '0px'}, -50%)` }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-5 h-12 bg-[var(--card)] border border-[var(--border)] rounded-r-lg shadow-md hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors focus:outline-none -ml-[1px]"
            title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="md:hidden absolute bottom-4 right-4 z-40 transition-opacity">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[var(--primary)] to-purple-600 text-white rounded-full shadow-[0_8px_30px_rgba(var(--primary-rgb),0.4)] font-bold text-[15px] active:scale-95 transition-all"
            >
              <Layers className="w-5 h-5" /> Configurar Imagem
            </button>
          )}
        </div>

        <main className={`flex flex-col bg-[var(--background)] order-1 md:order-2 relative min-h-0 overflow-hidden transition-all duration-300
            ${isSidebarOpen
            ? `${hasPreviewContent ? 'h-[40%] md:flex-1 md:h-full md:shrink' : 'h-auto shrink-0 border-b border-[var(--border)] md:border-b-0'} `
            : 'h-full flex-1 md:shrink'}`}
        >
          <div className={`flex-shrink-0 px-4 pt-4 md:px-8 md:pt-6 ${hasPreviewContent ? 'pb-1' : 'pb-4 md:pb-2'} z-10 bg-[var(--background)]`}>
            <button onClick={handleGenerate} disabled={!canGenerate} className="w-full relative overflow-hidden group flex items-center justify-center gap-2 md:gap-3 py-3.5 md:py-4 px-4 md:px-6 rounded-[1.25rem] md:rounded-2xl font-bold text-[15px] md:text-base transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95 hover:shadow-2xl shadow-lg bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white border border-white/10 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity">
              {isGenerating ? (
                <><div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Criando Magia...</span></>
              ) : (
                <><Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-200" /><span>{hasUpload ? 'Gerar Imagem de Alta Conversão' : 'Faça upload de uma peça'}</span>{credits > 0 && hasUpload && <span className="ml-1 opacity-80 text-xs md:text-sm font-normal hidden xs:inline tracking-wide font-mono bg-white/20 px-1.5 py-0.5 rounded-md">−1 crd</span>}</>
              )}
            </button>
          </div>

          <div className={`overflow-hidden flex flex-col min-h-0 flex-1 ${hasPreviewContent ? '' : 'hidden md:flex md:flex-1'}`}>
            <ImagePreviewCard
              isGenerating={isGenerating}
              imageUrl={imageUrl}
              selections={selections}
              niche={niche}
              onGenerate={handleGenerate}
              livePrompt={currentPrompt}
            />
          </div>

          {recentImages.length > 0 && (
            <div className="hidden md:flex flex-shrink-0 h-[96px] border-t border-[var(--border)] bg-[var(--card)] px-6 py-3 items-center justify-between transition-all duration-300 shrink-0">
              <div className="flex flex-col h-full justify-center">
                <button onClick={() => setIsGalleryOpen(true)} className="group flex items-center gap-2 focus:outline-none text-left mb-2">
                  <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors uppercase tracking-wider">Galeria de Criações</span><Images className="w-3.5 h-3.5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                </button>
                <div className="flex items-center gap-2">
                  {recentImages.slice(0, 8).map((img, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-md overflow-hidden border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-colors shadow-sm" onClick={() => setImageUrl(img)}>
                      <img src={img} alt={`Recente ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {nicheMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setNicheMenuOpen(false)} />}
      <GalleryModal isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} niche={niche} images={recentImages} />
      <PricingModal isOpen={isPricingOpen} onOpenChange={setIsPricingOpen} />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#09090b]"><div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" /></div>}>
      <StudioContent />
    </Suspense>
  );
}