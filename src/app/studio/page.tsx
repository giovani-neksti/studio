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
import { Sparkles, LogOut, Gem, ChevronDown, Images, CreditCard, ChevronLeft, ChevronRight, SlidersHorizontal, Check, ShieldCheck, History, Sun, Moon, Layers } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { NeuralBackground } from '@/components/NeuralBackground';
import { isAdmin } from '@/lib/admin';

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, session, loading: authLoading, signOut } = useAuth();
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
  const [showBatch, setShowBatch] = useState(false);

  // Auth guard — redirect to /auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  const userIsAdmin = isAdmin(user?.email);

  // Load credits from database (admins get infinite)
  useEffect(() => {
    if (!user) return;
    if (isAdmin(user.email)) {
      setCredits(999);
      setCreditsLoading(false);
      return;
    }
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

  const hasUpload = Object.keys(selections).some(k => k.startsWith('upload_') && !!selections[k]) 
    || (showBatch && selections.batchFiles && selections.batchFiles.length > 0);
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

    const isBatchMode = showBatch && selections.batchFiles && selections.batchFiles.length > 0;
    const requiredCredits = isBatchMode ? selections.batchFiles.length : 1;

    if (!userIsAdmin && (credits ?? 0) < requiredCredits) {
      alert(`Créditos insuficientes. Você tem ${credits} mas precisa de ${requiredCredits}.`);
      return;
    }

    setIsGenerating(true);
    setImageUrl(null);

    // No mobile, escondemos o wizard modal imediatamente para ele ver os resultados gerando/espinando
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    try {
      const cleanSelections = { ...selections };
      
      if (isBatchMode) {
        // Remove file references from payload
        Object.keys(cleanSelections).forEach(k => {
          if (k.startsWith('upload_') || k === 'batchFiles') delete cleanSelections[k];
        });
        cleanSelections.uploadedCategories = [selections.category || ''];

        const bFiles = selections.batchFiles as File[];
        let successCount = 0;

        for (let i = 0; i < bFiles.length; i++) {
          const originalFile = bFiles[i];
          const processedFile = await processImageForAI(originalFile);
          
          const formData = new FormData();
          formData.append('niche', niche);
          formData.append('files', processedFile);
          formData.append('selections', JSON.stringify(cleanSelections));

          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
            body: formData,
          });
          const data = await res.json();
          
          if (res.ok && data.url) {
            setRecentImages(prev => [data.url, ...prev].slice(0, 12));
            if (i === 0) setImageUrl(data.url); // Mostra a primeira que gerar
            setImageIndex((idx) => idx + 1);
            successCount++;

            if (!userIsAdmin) {
              const creditRes = await fetch('/api/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user!.id }),
              });
              if (creditRes.ok) {
                const creditData = await creditRes.json();
                setCredits(creditData.credits);
              } else {
                setCredits((c) => Math.max(0, (c ?? 0) - 1));
              }
            }
          } else {
             console.error(`Falha ao gerar o item ${i+1}: ${data.error}`);
          }
        }
        
        if (successCount === 0) {
          throw new Error("Nenhuma imagem em lote pôde ser gerada com sucesso.");
        }
      } else {
        // --- MODO SINGLE ORIGINAL ---
        const uploadKeys = Object.keys(selections).filter(k => k.startsWith('upload_') && selections[k]);
        if (uploadKeys.length === 0) throw new Error("Nenhuma imagem encontrada");

        // Remove file refernces
        uploadKeys.forEach(k => delete cleanSelections[k]);
        if (cleanSelections.batchFiles) delete cleanSelections.batchFiles;
        cleanSelections.uploadedCategories = uploadKeys.map(k => k.replace('upload_', ''));

        const formData = new FormData();
        formData.append('niche', niche);

        for (const key of uploadKeys) {
          const originalFile = selections[key] as File;
          const processedFile = await processImageForAI(originalFile);
          formData.append('files', processedFile);
        }

        formData.append('selections', JSON.stringify(cleanSelections));

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Erro ao comunicar com a IA');

        setImageUrl(data.url);
        setRecentImages(prev => [data.url, ...prev].slice(0, 12));
        setImageIndex((i) => i + 1);

        if (!userIsAdmin) {
          const creditRes = await fetch('/api/credits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user!.id }),
          });
          if (creditRes.ok) {
             const creditData = await creditRes.json();
             setCredits(creditData.credits);
          } else {
             setCredits((c) => Math.max(0, (c ?? 0) - 1));
          }
        }
      }

    } catch (e: any) {
      console.error(e);
      alert("Houve um erro ao gerar a imagem: " + e.message);
      if (window.innerWidth < 768) setIsSidebarOpen(true);
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

  const { mode: themeMode, toggle: toggleTheme, isDark } = useTheme();

  if (authLoading || !user) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--outline-variant)] border-t-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${config.themeClass}${isDark ? '' : ' light'} flex flex-col h-[100dvh] w-full overflow-hidden bg-[var(--background)]`}>

      {/* Neural network animated background — gold variant */}
      <NeuralBackground variant="gold" />

      {/* ── M3 Small Top App Bar ── */}
      <header className="theme-jewelry h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-[var(--surface-container)] z-40 relative border-b border-[var(--outline-variant)]/20">
        {/* Left: Logo + Niche Selector */}
        <div className="flex items-center gap-3 h-full">
          <div className="flex items-center h-full cursor-pointer py-2" onClick={() => router.push('/')}>
            <img src="/logo_joias.png" alt="Logo" className="h-20 md:h-24 w-auto object-contain" />
          </div>

          {/* M3 Filled Tonal Button as niche selector */}
          <div className="relative">
            <button
              onClick={() => setNicheMenuOpen(!nicheMenuOpen)}
              aria-expanded={nicheMenuOpen}
              aria-haspopup="listbox"
              aria-label={`Nicho selecionado: ${config.label}. Clique para alterar`}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--shape-full)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] md3-label-medium transition-all duration-[var(--duration-short4)] hover:elevation-1 state-layer"
            >
              <span className="text-sm" aria-hidden="true">{config.icon}</span>
              <span className="font-semibold hidden sm:inline">{config.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-[var(--duration-short4)] ${nicheMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {/* M3 Menu */}
            {nicheMenuOpen && (
              <div role="listbox" aria-label="Nichos disponíveis" className="absolute top-full left-0 mt-1 w-56 bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 rounded-[var(--shape-extra-small)] overflow-hidden z-50 elevation-3 animate-scale-in origin-top-left">
                {Object.entries(nicheConfigs).map(([key, cfg]) => {
                  const isEnabled = key === 'jewelry';
                  const isSelected = key === niche;
                  return (
                    <button
                      key={key}
                      role="option"
                      aria-selected={isSelected}
                      onClick={isEnabled ? () => switchNiche(key as NicheKey) : undefined}
                      disabled={!isEnabled}
                      className={`w-full flex items-center gap-3 px-3 py-3 md3-body-medium transition-colors duration-[var(--duration-short4)] text-left
                        ${isEnabled ? 'hover:bg-[var(--on-surface-variant)]/8' : 'opacity-38 cursor-not-allowed'}
                        ${isSelected ? 'bg-[var(--secondary-container)]' : ''}`}
                    >
                      <span className="text-lg w-7 text-center" aria-hidden="true">{cfg.icon}</span>
                      <div className="flex flex-col flex-1">
                        <span className={isSelected ? 'font-semibold text-[var(--on-secondary-container)]' : ''}>{cfg.label}</span>
                        {!isEnabled && <span className="md3-label-small text-[var(--outline)]">Em breve</span>}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />}
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
            style={{ color: userIsAdmin || (credits ?? 0) > 1 ? 'var(--primary)' : 'var(--error)' }}
          >
            <Gem className="w-3.5 h-3.5" />{creditsLoading ? '...' : userIsAdmin ? '∞' : credits ?? 0} <span className="hidden sm:inline">Créditos</span>
          </div>

          {/* Batch Mode Toggle */}
          <button
            onClick={() => setShowBatch(!showBatch)}
            aria-pressed={showBatch}
            aria-label={showBatch ? 'Desativar modo batch' : 'Ativar geração em batch (até 10 produtos)'}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-[var(--shape-full)] md3-label-medium transition-all duration-[var(--duration-short4)]
              ${showBatch
                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                : 'bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Batch</span>
          </button>

          {/* Desktop: My Generations */}
          <button
            onClick={() => router.push('/studio/geracoes')}
            className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-[var(--shape-full)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] md3-label-medium transition-all duration-[var(--duration-short4)] hover:elevation-1 state-layer"
          >
            <History className="w-3.5 h-3.5" />Minhas Gerações
          </button>

          {/* Desktop: Subscription — M3 Filled Tonal Button */}
          <button
            onClick={() => setIsPricingOpen(true)}
            className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-medium transition-all duration-[var(--duration-short4)] hover:elevation-1 state-layer"
          >
            <CreditCard className="w-3.5 h-3.5" />Assinatura
          </button>

          {/* Desktop: Admin — visible only for admins */}
          {isAdmin(user?.email) && (
            <button
              onClick={() => router.push('/admin')}
              className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-[var(--shape-full)] text-[var(--on-surface-variant)] md3-label-medium transition-colors duration-[var(--duration-short4)] hover:bg-[var(--on-surface-variant)]/8"
            >
              <ShieldCheck className="w-3.5 h-3.5" /><span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Theme Toggle — M3 Icon Button */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            className="flex items-center justify-center w-9 h-9 rounded-[var(--shape-full)] text-[var(--on-surface-variant)] transition-colors duration-[var(--duration-short4)] hover:bg-[var(--on-surface-variant)]/8"
          >
            {isDark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
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
          <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} onGenerate={handleGenerate} canGenerate={canGenerate} isGenerating={isGenerating} hasUpload={hasUpload} showBatch={showBatch} onToggleBatch={() => setShowBatch(!showBatch)} />
        </div>

        {/* Desktop Sidebar Toggle — M3 Icon Button */}
        <div
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-[var(--duration-medium4)] ease-[var(--easing-emphasized)]"
          style={{ left: isSidebarOpen ? '320px' : '0px' }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
            aria-expanded={isSidebarOpen}
            className="flex items-center justify-center w-6 h-12 bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/30 border-l-0 rounded-r-[var(--shape-medium)] hover:bg-[var(--surface-container-highest)] transition-colors duration-[var(--duration-short4)]"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4 text-[var(--on-surface-variant)]" aria-hidden="true" /> : <ChevronRight className="w-4 h-4 text-[var(--on-surface-variant)]" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Scrim */}
        {isSidebarOpen && (
          <div
            aria-hidden="true"
            className="md:hidden fixed inset-0 bg-[var(--on-surface)]/32 z-40 transition-opacity duration-[var(--duration-medium2)]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Full-Screen Modal — M3 Pattern Adaptation */}
        <div
          className={`md:hidden fixed top-0 inset-x-0 h-[100dvh] z-[100] flex flex-col bg-[var(--surface-container-low)] transition-transform duration-[var(--duration-long2)] ease-[var(--easing-emphasized)]
            ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex flex-col flex-1 min-h-0">
            <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} onGenerate={handleGenerate} canGenerate={canGenerate} isGenerating={isGenerating} hasUpload={hasUpload} showBatch={showBatch} onToggleBatch={() => setShowBatch(!showBatch)} />
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
                    <button key={idx} aria-label={`Visualizar imagem recente ${idx + 1}`} onClick={() => setImageUrl(img)} className="w-10 h-10 rounded-[var(--shape-small)] overflow-hidden border border-[var(--outline-variant)]/30 cursor-pointer hover:border-[var(--primary)] transition-colors duration-[var(--duration-short4)]">
                      <img src={img} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile FAB removed — generation is now handled inside the wizard footer (Sidebar step 4) */}

      {/* ── Mobile Bottom Navigation — M3 Navigation Bar ── */}
      <nav
        aria-label="Navegação principal"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface-container)] border-t border-[var(--outline-variant)]/20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-20 px-2">
          {[
            { id: 'compose', icon: <SlidersHorizontal className="w-[22px] h-[22px]" />, label: 'Compor', action: () => setIsSidebarOpen(true) },
            { id: 'gallery', icon: <History className="w-[22px] h-[22px]" />, label: 'Histórico', action: () => router.push('/studio/geracoes') },
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
      {nicheMenuOpen && <div aria-hidden="true" className="fixed inset-0 z-30" onClick={() => setNicheMenuOpen(false)} />}
      <GalleryModal isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} niche={niche} images={recentImages} themeClass={config.themeClass} />
      <PricingModal isOpen={isPricingOpen} onOpenChange={setIsPricingOpen} userEmail={user?.email} userId={user?.id} />
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
