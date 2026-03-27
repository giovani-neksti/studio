'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getNicheConfig, nicheConfigs, NicheKey } from '@/lib/niche-config';
import { buildEnglishPrompt } from '@/lib/prompt-builder';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { GalleryModal } from '@/components/GalleryModal';
import { PricingModal } from '@/components/PricingModal';
import { Sparkles, LogOut, Gem, ChevronDown, Images, CreditCard, ChevronLeft, ChevronRight, SlidersHorizontal, Check } from 'lucide-react';
import { NeuralBackground } from '@/components/NeuralBackground';

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const nicheParam = searchParams.get('niche') as NicheKey | null;
  const config = getNicheConfig(nicheParam);
  const niche = nicheParam && nicheParam in nicheConfigs ? nicheParam : 'jewelry';

  const [selections, setSelections] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  const [nicheMenuOpen, setNicheMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth guard — redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  // Load credits from database
  useEffect(() => {
    if (!user) return;
    setCreditsLoading(true);
    fetch(`/api/credits?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setCredits(data.credits ?? 0);
      })
      .catch(() => setCredits(0))
      .finally(() => setCreditsLoading(false));
  }, [user]);

  useEffect(() => {
    setIsSidebarOpen(true);
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
    if (!credits || credits <= 0) return;
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

      // Decrement credit in database
      const creditRes = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id }),
      });
      const creditData = await creditRes.json();
      if (creditRes.ok) {
        setCredits(creditData.credits);
      } else {
        setCredits((c) => Math.max(0, (c ?? 0) - 1));
      }

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

  const canGenerate = !isGenerating && (credits ?? 0) > 0 && hasUpload && !creditsLoading;

  const liveSelections = { ...selections };
  const uploadKeys = Object.keys(selections).filter(k => k.startsWith('upload_') && selections[k]);
  if (uploadKeys.length > 0) {
    liveSelections.uploadedCategories = uploadKeys.map(k => k.replace('upload_', ''));
  }
  const currentPrompt = buildEnglishPrompt(niche, liveSelections);

  const activeNav = isSidebarOpen ? 'compose' : isGalleryOpen ? 'gallery' : isPricingOpen ? 'plans' : '';

  if (authLoading || !user) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--outline-variant)] border-t-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${config.themeClass} flex flex-col h-[100dvh] w-full overflow-hidden bg-[var(--background)]`}>

      {/* Neural network animated background — gold variant */}
      <NeuralBackground variant="gold" />

      {/* ── M3 Small Top App Bar ── */}
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-[var(--surface-container)] z-40 relative border-b border-[var(--outline-variant)]/20">
        {/* Left: Logo + Niche Selector */}
        <div className="flex items-center gap-3 h-full">
          <div className="flex items-center h-full cursor-pointer py-2" onClick={() => router.push('/')}>
            <img src="/logo_joias.png" alt="Logo" className="h-20 md:h-24 w-auto object-contain" />
          </div>

          {/* M3 Filled Tonal Button as niche selector */}
          <div className="relative">
            <button
              onClick={() => setNicheMenuOpen(!nicheMenuOpen)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--shape-full)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] md3-label-medium transition-all duration-[var(--duration-short4)] hover:elevation-1 state-layer"
            >
              <span className="text-sm">{config.icon}</span>
              <span className="font-semibold hidden sm:inline">{config.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-[var(--duration-short4)] ${nicheMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* M3 Menu */}
            {nicheMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 rounded-[var(--shape-extra-small)] overflow-hidden z-50 elevation-3 animate-scale-in origin-top-left">
                {Object.entries(nicheConfigs).map(([key, cfg]) => {
                  const isEnabled = key === 'jewelry';
                  const isSelected = key === niche;
                  return (
                    <button
                      key={key}
                      onClick={isEnabled ? () => switchNiche(key as NicheKey) : undefined}
                      disabled={!isEnabled}
                      className={`w-full flex items-center gap-3 px-3 py-3 md3-body-medium transition-colors duration-[var(--duration-short4)] text-left
                        ${isEnabled ? 'hover:bg-[var(--on-surface-variant)]/8' : 'opacity-38 cursor-not-allowed'}
                        ${isSelected ? 'bg-[var(--secondary-container)]' : ''}`}
                    >
                      <span className="text-lg w-7 text-center">{cfg.icon}</span>
                      <div className="flex flex-col flex-1">
                        <span className={isSelected ? 'font-semibold text-[var(--on-secondary-container)]' : ''}>{cfg.label}</span>
                        {!isEnabled && <span className="md3-label-small text-[var(--outline)]">Em breve</span>}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[var(--primary)]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Credits Badge + Desktop Actions */}
        <div className="flex items-center gap-2">
          {/* M3 Badge-style credits */}
          <div
            className="flex items-center gap-1.5 h-8 px-3 rounded-[var(--shape-full)] bg-[var(--surface-container-highest)] md3-label-medium"
            style={{ color: (credits ?? 0) > 1 ? 'var(--primary)' : 'var(--error)' }}
          >
            <Gem className="w-3.5 h-3.5" />{creditsLoading ? '...' : credits ?? 0} <span className="hidden sm:inline">Créditos</span>
          </div>

          {/* Desktop: Subscription — M3 Filled Tonal Button */}
          <button
            onClick={() => setIsPricingOpen(true)}
            className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-medium transition-all duration-[var(--duration-short4)] hover:elevation-1 state-layer"
          >
            <CreditCard className="w-3.5 h-3.5" />Assinatura
          </button>

          {/* Desktop: Logout — M3 Text Button */}
          <button
            onClick={() => { signOut(); router.push('/'); }}
            className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-[var(--shape-full)] text-[var(--on-surface-variant)] md3-label-medium transition-colors duration-[var(--duration-short4)] hover:bg-[var(--on-surface-variant)]/8"
          >
            <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative z-[2]">

        {/* Desktop Sidebar — M3 Side Sheet */}
        <div className={`hidden md:flex flex-col min-h-0 bg-[var(--surface-container-low)] transition-all duration-[var(--duration-medium4)] ease-[var(--easing-emphasized)] shrink-0
          ${isSidebarOpen ? 'w-[320px] xl:w-[360px] border-r border-[var(--outline-variant)]/20' : 'w-0 overflow-hidden'}`}
        >
          <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} onGenerate={handleGenerate} canGenerate={canGenerate} isGenerating={isGenerating} hasUpload={hasUpload} />
        </div>

        {/* Desktop Sidebar Toggle — M3 Icon Button */}
        <div
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-[var(--duration-medium4)] ease-[var(--easing-emphasized)]"
          style={{ left: isSidebarOpen ? '320px' : '0px' }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-6 h-12 bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 border-l-0 rounded-r-[var(--shape-medium)] hover:bg-[var(--surface-container-highest)] transition-colors duration-[var(--duration-short4)]"
            title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4 text-[var(--on-surface-variant)]" /> : <ChevronRight className="w-4 h-4 text-[var(--on-surface-variant)]" />}
          </button>
        </div>

        {/* Mobile Scrim */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-[var(--on-surface)]/32 z-40 transition-opacity duration-[var(--duration-medium2)]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Bottom Sheet — M3 Pattern */}
        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[var(--surface-container-low)] rounded-t-[var(--shape-extra-large)] elevation-4 transition-transform duration-[var(--duration-long2)] ease-[var(--easing-emphasized)]
            ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ height: '85dvh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* M3 Bottom Sheet Drag Handle */}
          <div className="w-full flex justify-center pt-3.5 pb-2 shrink-0 cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-8 h-1 bg-[var(--on-surface-variant)]/40 rounded-[var(--shape-full)]" />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} onGenerate={handleGenerate} canGenerate={canGenerate} isGenerating={isGenerating} hasUpload={hasUpload} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-transparent relative min-h-0 overflow-hidden">

          {/* Desktop Generate Button — M3 Filled Button */}
          <div className="hidden md:block flex-shrink-0 px-6 pt-5 pb-2 z-10">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-[var(--shape-full)] md3-label-large transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] disabled:opacity-[0.38] disabled:cursor-not-allowed bg-[var(--primary)] text-[var(--on-primary)] hover:elevation-1 state-layer"
            >
              {isGenerating ? (
                <><div className="w-5 h-5 rounded-full border-2 border-current/30 border-t-current animate-spin" /><span>Gerando...</span></>
              ) : (
                <><Sparkles className="w-5 h-5" /><span>{hasUpload ? 'Gerar Imagem' : 'Envie uma foto primeiro'}</span></>
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

          {/* Desktop Gallery Strip — M3 Surface Container */}
          {recentImages.length > 0 && (
            <div className="hidden md:flex flex-shrink-0 h-20 border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container)] px-6 py-3 items-center">
              <div className="flex flex-col h-full justify-center">
                <button onClick={() => setIsGalleryOpen(true)} className="flex items-center gap-2 mb-2 text-left group">
                  <span className="md3-label-small text-[var(--on-surface-variant)] uppercase tracking-wider">Galeria</span>
                  <Images className="w-3.5 h-3.5 text-[var(--on-surface-variant)] group-hover:text-[var(--primary)] transition-colors" />
                </button>
                <div className="flex items-center gap-2">
                  {recentImages.slice(0, 8).map((img, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-[var(--shape-small)] overflow-hidden border border-[var(--outline-variant)]/30 cursor-pointer hover:border-[var(--primary)] transition-colors duration-[var(--duration-short4)]" onClick={() => setImageUrl(img)}>
                      <img src={img} alt={`Recente ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Extended FAB — M3 Pattern ── */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="md:hidden fixed z-35 right-4 h-14 px-5 rounded-[var(--shape-large)] md3-label-large elevation-3 flex items-center gap-2.5 transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] active:scale-[0.96] disabled:opacity-[0.38] disabled:shadow-none bg-[var(--primary-container)] text-[var(--on-primary-container)]"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        {isGenerating ? (
          <><div className="w-5 h-5 rounded-full border-2 border-current/30 border-t-current animate-spin" /><span>Gerando...</span></>
        ) : (
          <><Sparkles className="w-5 h-5" /><span>{hasUpload ? 'Gerar' : 'Upload'}</span></>
        )}
      </button>

      {/* ── Mobile Bottom Navigation — M3 Navigation Bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface-container)] border-t border-[var(--outline-variant)]/20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-20 px-2">
          {[
            { id: 'compose', icon: <SlidersHorizontal className="w-[22px] h-[22px]" />, label: 'Compor', action: () => setIsSidebarOpen(true) },
            { id: 'gallery', icon: <Images className="w-[22px] h-[22px]" />, label: 'Galeria', action: () => setIsGalleryOpen(true) },
            { id: 'plans', icon: <CreditCard className="w-[22px] h-[22px]" />, label: 'Planos', action: () => setIsPricingOpen(true) },
            { id: 'logout', icon: <LogOut className="w-[22px] h-[22px]" />, label: 'Sair', action: () => { signOut(); router.push('/'); } },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col items-center gap-1 min-w-[64px] py-2 group"
              >
                {/* M3 Active Indicator Pill */}
                <div className={`flex items-center justify-center w-16 h-8 rounded-[var(--shape-full)] transition-all duration-[var(--duration-medium1)] ease-[var(--easing-standard)]
                  ${isActive ? 'bg-[var(--secondary-container)]' : 'group-hover:bg-[var(--on-surface-variant)]/8'}`}
                >
                  <span className={`transition-colors duration-[var(--duration-medium1)] ${isActive ? 'text-[var(--on-secondary-container)]' : 'text-[var(--on-surface-variant)]'}`}>{item.icon}</span>
                </div>
                <span className={`md3-label-small transition-colors duration-[var(--duration-medium1)] ${isActive ? 'text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)]'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Overlays ── */}
      {nicheMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setNicheMenuOpen(false)} />}
      <GalleryModal isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} niche={niche} images={recentImages} themeClass={config.themeClass} />
      <PricingModal isOpen={isPricingOpen} onOpenChange={setIsPricingOpen} />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={
      <div className="h-[100dvh] flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--outline-variant)] border-t-[var(--primary)] animate-spin" />
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
