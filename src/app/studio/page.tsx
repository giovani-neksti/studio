'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { getNicheConfig } from '@/lib/niche-config';
import { buildEnglishPrompt } from '@/lib/prompt-builder';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { ImagePreviewCard } from '@/components/ImagePreviewCard';
import { GalleryModal } from '@/components/GalleryModal';
import { PricingModal } from '@/components/PricingModal';
import { Sparkles, LogOut, Gem, Images, CreditCard, ChevronLeft, ChevronRight, SlidersHorizontal, Check, ShieldCheck, History, Sun, Moon, Layers, Plus } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { NeuralBackground } from '@/components/NeuralBackground';
import { isAdmin } from '@/lib/admin';

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, session, loading: authLoading, signOut } = useAuth();
  const nicheParam = searchParams.get('niche');
  const config = getNicheConfig(nicheParam);
  const niche = nicheParam === 'jewelry' ? 'jewelry' : 'jewelry'; // only one niche supported

  const [selections, setSelections] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Toast amigável — substitui alert() com mensagens que não assustam o cliente
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'warn' } | null>(null);
  const showToast = useCallback((message: string, type: 'info' | 'warn' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

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
    // Auto-open wizard only on desktop — on mobile, show bottom nav first
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
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
    try {
      // Read file as data URL (compatible with all mobile browsers)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      return await new Promise<File>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Mobile: compressão agressiva para upload rápido (iPhone fotos = 12MP+)
          // Desktop: qualidade um pouco maior pois upload é mais rápido
          const isMobile = window.innerWidth < 768;
          const MAX_SIZE = isMobile ? 768 : 1024;
          const QUALITY = isMobile ? 0.65 : 0.80;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], "imagem_processada.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', QUALITY);
        };
        img.onerror = () => resolve(file);
        img.src = dataUrl;
      });
    } catch {
      // Fallback: return original file if anything fails
      return file;
    }
  };

  const handleGenerate = async () => {
    const isBatchMode = showBatch && selections.batchFiles && selections.batchFiles.length > 0;
    const requiredTokens = isBatchMode ? selections.batchFiles.length * 5 : 1;

    if (!userIsAdmin && (credits ?? 0) < 1) {
      showToast("Seus tokens acabaram — faça uma recarga para continuar criando", "warn");
      return;
    }

    // Track timestamp before generation to detect images created during this request
    const generationStartedAt = new Date().toISOString();

    setIsGenerating(true);
    setImageUrl(null);

    // No mobile, escondemos o wizard modal imediatamente para ele ver os resultados gerando/espinando
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // Recovery: se nginx cortar a conexão, faz polling rápido para encontrar a imagem
    const recoverFromTimeout = async (): Promise<string | null> => {
      await new Promise(r => setTimeout(r, 2000));

      // Poll 15× a cada 3s = 45s de recovery (cobre geração de até ~90s total)
      for (let attempt = 0; attempt < 15; attempt++) {
        try {
          const res = await fetch('/api/generations?page=1', {
            headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
          });
          if (!res.ok) break;
          const data = await res.json();
          const latest = data.generations?.[0];
          if (latest && new Date(latest.created_at) > new Date(generationStartedAt)) {
            return latest.generated_image_url;
          }
        } catch { /* ignore */ }
        await new Promise(r => setTimeout(r, 3000));
      }
      return null;
    };

    const refreshCredits = async () => {
      if (userIsAdmin) return;
      try {
        const creditRes = await fetch(`/api/credits?userId=${user!.id}`);
        if (creditRes.ok) {
          const creditData = await creditRes.json();
          setCredits(creditData.credits);
        } else {
          setCredits((c) => Math.max(0, (c ?? 0) - 1));
        }
      } catch { setCredits((c) => Math.max(0, (c ?? 0) - 1)); }
    };

    let generatedSuccessfully = false;
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

          try {
            const res = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
              body: formData,
            });

            let data: any;
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              data = await res.json();
            } else {
              // Timeout or non-JSON — try to recover
              console.warn(`[Batch ${i + 1}] Resposta não-JSON (${res.status}), tentando recuperar...`);
              const recoveredUrl = await recoverFromTimeout();
              data = recoveredUrl ? { url: recoveredUrl } : { error: 'Timeout na conexão.' };
            }

            if ((res.ok || data.url) && data.url) {
              setRecentImages(prev => [data.url, ...prev].slice(0, 12));
              if (i === 0) setImageUrl(data.url);
              setImageIndex((idx) => idx + 1);
              successCount++;
              await refreshCredits();
            } else {
              console.error(`Falha ao gerar o item ${i + 1}: ${data.error}`);
            }
          } catch (fetchErr: any) {
            // Network error / timeout — try recovery
            console.warn(`[Batch ${i + 1}] Erro de rede: ${fetchErr.message}, tentando recuperar...`);
            const recoveredUrl = await recoverFromTimeout();
            if (recoveredUrl) {
              setRecentImages(prev => [recoveredUrl, ...prev].slice(0, 12));
              if (i === 0) setImageUrl(recoveredUrl);
              setImageIndex((idx) => idx + 1);
              successCount++;
              await refreshCredits();
            }
          }
        }

        if (successCount === 0) {
          throw new Error("Não foi dessa vez — tente novamente em alguns segundos");
        }
        generatedSuccessfully = successCount > 0;
      } else {
        // --- MODO SINGLE — com auto-retry silencioso ---
        const uploadKeys = Object.keys(selections).filter(k => k.startsWith('upload_') && selections[k]);
        if (uploadKeys.length === 0) throw new Error("Envie uma foto do produto para começar");

        // Remove file references and UI-only keys
        uploadKeys.forEach(k => delete cleanSelections[k]);
        if (cleanSelections.batchFiles) delete cleanSelections.batchFiles;
        delete cleanSelections.categories;
        cleanSelections.uploadedCategories = uploadKeys.map(k => k.replace('upload_', ''));

        // Processar imagens UMA vez (reutilizadas no retry)
        const processedFiles: File[] = [];
        for (const key of uploadKeys) {
          const originalFile = selections[key] as File;
          processedFiles.push(await processImageForAI(originalFile));
        }
        const selectionsJson = JSON.stringify(cleanSelections);

        let imageResultUrl: string | null = null;
        const MAX_CLIENT_RETRIES = 1; // 1 retry = 2 tentativas total

        for (let clientAttempt = 0; clientAttempt <= MAX_CLIENT_RETRIES; clientAttempt++) {
          if (clientAttempt > 0) {
            // Antes do retry, verificar se a imagem já foi gerada (evita cobrar 2x)
            console.log('[Single] Verificando se imagem já existe antes do retry...');
            const recovered = await recoverFromTimeout();
            if (recovered) { imageResultUrl = recovered; break; }
            console.log(`[Single] Auto-retry silencioso (tentativa ${clientAttempt + 1})`);
            await new Promise(r => setTimeout(r, 1500));
          }

          // Reconstruir FormData (stream consumido pelo fetch anterior)
          const formData = new FormData();
          formData.append('niche', niche);
          for (const pf of processedFiles) formData.append('files', pf);
          formData.append('selections', selectionsJson);

          try {
            const res = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
              body: formData,
            });

            let data: any;
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              data = await res.json();
            } else {
              console.warn(`[Single] Resposta não-JSON (${res.status}), tentando recuperar...`);
              const recoveredUrl = await recoverFromTimeout();
              if (recoveredUrl) {
                data = { url: recoveredUrl };
              } else if (clientAttempt < MAX_CLIENT_RETRIES) {
                continue; // retry silencioso
              } else {
                throw new Error('Está demorando mais que o normal — tente novamente, costuma ser rápido!');
              }
            }

            // Erros definitivos — NÃO fazer retry
            if (res.status === 401 || res.status === 403 || res.status === 429) {
              throw new Error(data.error || 'Erro na geração');
            }

            // Erros retryáveis (500, 502) — retry silencioso
            if (!res.ok && !data.url) {
              if (clientAttempt < MAX_CLIENT_RETRIES) {
                console.warn(`[Single] Server ${res.status}, auto-retry...`);
                continue;
              }
              // Última tentativa — mostrar mensagem do server (inclui info de refund)
              throw new Error(data.refunded
                ? 'A IA está instável no momento. Seu crédito foi devolvido — tente novamente!'
                : data.error || 'Não foi dessa vez — tente novamente em alguns segundos');
            }

            imageResultUrl = data.url;
            break; // sucesso
          } catch (fetchErr: any) {
            // Erro de rede — tentar recovery + retry
            if (fetchErr.message?.includes('fetch') || fetchErr.message?.includes('network') || fetchErr.name === 'TypeError') {
              console.warn('[Single] Erro de rede, tentando recuperar...', fetchErr.message);
              imageResultUrl = await recoverFromTimeout();
              if (imageResultUrl) break;
              if (clientAttempt < MAX_CLIENT_RETRIES) continue;
              throw new Error('Sua conexão oscilou — tente novamente, costuma funcionar!');
            }
            throw fetchErr;
          }
        }

        if (imageResultUrl) {
          setImageUrl(imageResultUrl);
          setRecentImages(prev => [imageResultUrl!, ...prev].slice(0, 12));
          setImageIndex((i) => i + 1);
          generatedSuccessfully = true;
          await refreshCredits();
        }
      }

    } catch (e: any) {
      console.error('Erro na geração:', e);
      if (!generatedSuccessfully) {
        showToast(e.message || 'Não foi dessa vez — tente novamente em alguns segundos', 'warn');
        if (window.innerWidth < 768) setIsSidebarOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };



  const handleNewImage = () => {
    setSelections({ bgTab: 'solid', displayTab: 'expositor' });
    setImageUrl(null);
    setResetKey(k => k + 1);
    setIsSidebarOpen(true);
  };

  const canGenerate = !isGenerating && (credits ?? 0) >= 1 && hasUpload && !creditsLoading;

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

      {/* ── M3 Small Top App Bar — Mobile-First ── */}
      <header className="theme-jewelry flex-shrink-0 flex items-center justify-between px-2 sm:px-3 md:px-6 bg-[var(--surface-container)] z-40 relative border-b border-[var(--outline-variant)]/20 h-14 md:h-16">
        {/* Left: Logo */}
        <div className="flex items-center h-full shrink-0">
          <div className="flex items-center h-full cursor-pointer py-1" onClick={() => router.push('/')}>
            <img src="/logo_joias.png" alt="Logo" className="h-12 sm:h-14 md:h-20 w-auto object-contain" />
          </div>
        </div>

        {/* Right: Credits Badge + Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          {/* M3 Badge-style credits — compact on mobile */}
          <div
            className="flex items-center gap-1.5 h-8 md:h-9 px-2.5 md:px-3.5 rounded-[var(--shape-full)] bg-[var(--surface-container-highest)] md3-label-large text-sm"
            style={{ color: userIsAdmin || (credits ?? 0) >= 1 ? 'var(--primary)' : 'var(--error)' }}
          >
            <Gem className="w-3.5 h-3.5 md:w-4 md:h-4" />{creditsLoading ? '...' : userIsAdmin ? '∞' : credits ?? 0} <span className="hidden sm:inline text-xs md:text-sm">Tokens</span>
          </div>

          {/* Desktop: My Generations — M3 Tonal Button */}
          <button
            onClick={() => router.push('/studio/geracoes')}
            className="hidden md:flex m3-btn-tonal h-10 px-4 gap-2 md3-label-large state-layer"
          >
            <History className="w-4 h-4" />Gerações
          </button>

          {/* Desktop: Subscription — M3 Filled Button */}
          <button
            onClick={() => setIsPricingOpen(true)}
            className="hidden md:flex m3-btn-filled h-10 px-5 gap-2 md3-label-large state-layer"
          >
            <CreditCard className="w-4 h-4" />Planos
          </button>

          {/* Desktop: Admin */}
          {isAdmin(user?.email) && (
            <button
              onClick={() => router.push('/admin')}
              className="hidden md:flex m3-btn-text h-10 gap-2 md3-label-large text-[var(--on-surface-variant)]"
            >
              <ShieldCheck className="w-4 h-4" />Admin
            </button>
          )}

          {/* Theme Toggle — M3 Standard Icon Button */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-[var(--shape-full)] text-[var(--on-surface-variant)] transition-colors duration-[var(--duration-short4)] hover:bg-[var(--on-surface-variant)]/8 m3-touch-target"
          >
            {isDark ? <Sun className="w-[18px] h-[18px] md:w-5 md:h-5" aria-hidden="true" /> : <Moon className="w-[18px] h-[18px] md:w-5 md:h-5" aria-hidden="true" />}
          </button>

          {/* Desktop: Logout — M3 Icon Button */}
          <button
            onClick={() => { signOut(); router.push('/'); }}
            aria-label="Sair"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-[var(--shape-full)] text-[var(--on-surface-variant)] transition-colors duration-[var(--duration-short4)] hover:bg-[var(--on-surface-variant)]/8"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative z-[2]">

        {/* Desktop Sidebar — M3 Side Sheet */}
        <div className={`hidden md:flex flex-col min-h-0 bg-[var(--surface-container-low)] transition-all duration-[var(--duration-medium4)] ease-[var(--easing-emphasized)] shrink-0
          ${isSidebarOpen ? 'w-[320px] xl:w-[360px] border-r border-[var(--outline-variant)]/20' : 'w-0 overflow-hidden'}`}
        >
          <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} onGenerate={handleGenerate} canGenerate={canGenerate} isGenerating={isGenerating} hasUpload={hasUpload} showBatch={showBatch} onToggleBatch={() => setShowBatch(!showBatch)} resetKey={resetKey} onClose={() => setIsSidebarOpen(false)} />
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

        {/* Mobile Scrim — behind fullscreen wizard for transition smoothness */}
        {isSidebarOpen && (
          <div
            aria-hidden="true"
            className="md:hidden fixed inset-0 bg-[var(--on-surface)]/32 z-40 pointer-events-none transition-opacity duration-[var(--duration-medium2)]"
          />
        )}

        {/* Mobile Full-Screen Modal — M3 Pattern Adaptation */}
        <div
          className={`md:hidden fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[var(--surface-container-low)] transition-transform duration-[var(--duration-long2)] ease-[var(--easing-emphasized)]
            ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          {/* Mobile Wizard Top Bar — M3 Top App Bar */}
          <div className="flex-shrink-0 flex items-center justify-between h-16 px-2 border-b border-[var(--outline-variant)]/15 bg-[var(--surface-container)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-center w-12 h-12 rounded-[var(--shape-full)] text-[var(--on-surface-variant)] transition-colors hover:bg-[var(--on-surface-variant)]/8 m3-touch-target"
              aria-label="Fechar configurações"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="md3-title-large text-[var(--foreground)]">Configurações</span>
            <div className="w-12" aria-hidden="true" />
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <Sidebar config={config} niche={niche} selections={selections} onSelect={handleSelect} onGenerate={handleGenerate} canGenerate={canGenerate} isGenerating={isGenerating} hasUpload={hasUpload} showBatch={showBatch} onToggleBatch={() => setShowBatch(!showBatch)} resetKey={resetKey} onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-transparent relative min-h-0 overflow-hidden">

          {/* Desktop Generate / New Image Button — M3 Filled Button */}
          <div className="hidden md:block flex-shrink-0 px-6 pt-5 pb-2 z-10">
            {imageUrl && !isGenerating ? (
              <button
                onClick={handleNewImage}
                className="w-full m3-btn-outlined h-14 gap-3 md3-title-small transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] state-layer"
              >
                <Plus className="w-5 h-5" /><span>Nova Imagem</span>
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full m3-btn-filled h-14 gap-3 md3-title-small transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] disabled:opacity-[0.38] disabled:cursor-not-allowed state-layer"
              >
                {isGenerating ? (
                  <><div className="w-5 h-5 rounded-full border-2 border-current/30 border-t-current animate-spin" /><span>Gerando...</span></>
                ) : (
                  <><Sparkles className="w-5 h-5" /><span>{hasUpload ? 'Gerar Imagem' : 'Envie uma foto primeiro'}</span></>
                )}
              </button>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ImagePreviewCard
              isGenerating={isGenerating}
              imageUrl={imageUrl}
              selections={selections}
              niche={niche}
              onGenerate={handleGenerate}
              onNewImage={handleNewImage}
              livePrompt={currentPrompt}
            />
          </div>

          {/* Desktop Gallery Strip — M3 Surface Container */}
          {recentImages.length > 0 && (
            <div className="hidden md:flex flex-shrink-0 h-20 border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container)] px-6 py-3 items-center">
              <div className="flex flex-col h-full justify-center">
                <button onClick={() => setIsGalleryOpen(true)} className="flex items-center gap-2 mb-2 text-left group">
                  <span className="md3-label-medium text-[var(--on-surface-variant)] uppercase tracking-wider">Galeria</span>
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
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface-container)] border-t border-[var(--outline-variant)]/15 transition-transform duration-[var(--duration-medium2)] ease-[var(--easing-standard)] ${isSidebarOpen ? 'translate-y-full' : 'translate-y-0'}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-20 px-2">
          {[
            { id: 'compose', icon: <SlidersHorizontal className="w-6 h-6" />, label: 'Compor', action: () => setIsSidebarOpen(true) },
            { id: 'gallery', icon: <History className="w-6 h-6" />, label: 'Histórico', action: () => router.push('/studio/geracoes') },
            { id: 'plans', icon: <CreditCard className="w-6 h-6" />, label: 'Planos', action: () => setIsPricingOpen(true) },
            { id: 'logout', icon: <LogOut className="w-6 h-6" />, label: 'Sair', action: () => { signOut(); router.push('/'); } },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col items-center gap-1 min-w-[64px] py-2 group m3-touch-target"
              >
                {/* M3 Active Indicator Pill — 64×32 per spec */}
                <div className={`flex items-center justify-center w-16 h-8 rounded-[var(--shape-full)] transition-all duration-[var(--duration-medium1)] ease-[var(--easing-standard)]
                  ${isActive ? 'bg-[var(--secondary-container)] animate-nav-indicator' : 'group-active:bg-[var(--on-surface-variant)]/12'}`}
                >
                  <span className={`transition-colors duration-[var(--duration-medium1)] ${isActive ? 'text-[var(--on-secondary-container)]' : 'text-[var(--on-surface-variant)]'}`}>{item.icon}</span>
                </div>
                <span className={`md3-label-large transition-colors duration-[var(--duration-medium1)] ${isActive ? 'text-[var(--on-surface)] font-medium' : 'text-[var(--on-surface-variant)]'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Overlays ── */}

      <GalleryModal isOpen={isGalleryOpen} onOpenChange={setIsGalleryOpen} niche={niche} images={recentImages} themeClass={config.themeClass} />
      <PricingModal isOpen={isPricingOpen} onOpenChange={setIsPricingOpen} userEmail={user?.email} userId={user?.id} />

      {/* Toast M3 Snackbar — mensagens amigáveis sem parecer erro */}
      {toast && (
        <div
          onClick={() => setToast(null)}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md animate-fade-up cursor-pointer"
        >
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl backdrop-blur-sm ${toast.type === 'warn'
              ? 'bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/30'
              : 'bg-[var(--surface-container-highest)] border border-[var(--outline-variant)]/30'
            }`}>
            <span className="text-lg shrink-0">{toast.type === 'warn' ? '💡' : '✨'}</span>
            <p className="md3-body-medium text-[var(--on-surface)] flex-1">{toast.message}</p>
          </div>
        </div>
      )}
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
