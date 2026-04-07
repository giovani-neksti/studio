'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Download, RefreshCw, Check, Camera, Layers, Maximize, Palette, Box, Plus } from 'lucide-react';
import { useShareImage } from '@/hooks/useShareImage';
import { ShareToast } from './ShareToast';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

interface ImagePreviewCardProps {
  isGenerating: boolean;
  imageUrl: string | null;
  selections: Record<string, string>;
  niche: string;
  onGenerate: () => void;
  onNewImage?: () => void;
  livePrompt?: string;
}

const loadingMessages = [
  "Enviando imagem para o motor de IA...",
  "Analisando formato e escala da peça...",
  "Detectando contornos e materiais...",
  "Preparando iluminação de estúdio...",
  "Ajustando luzes de estúdio (Rim Lighting)...",
  "Calculando refrações e caustics (Ray-Tracing)...",
  "Configurando cenário e composição...",
  "Renderizando texturas e materiais 8K...",
  "Processando sombras e reflexos...",
  "Integrando sombras orgânicas no cenário...",
  "Refinando detalhes da superfície...",
  "Otimizando cores e contraste...",
  "Aplicando correção de pele e brilho...",
  "Finalizando composição profissional...",
  "Quase lá, ajustes finais...",
];

// Quality checks que aparecem conforme o usuário seleciona opções
interface QualityCheck {
  icon: React.ReactNode;
  label: string;
  detail: string;
}

function buildQualityChecks(selections: Record<string, string>, niche: string): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const iconClass = "w-3.5 h-3.5";

  // Sempre presente quando tem pelo menos uma seleção
  const hasAny = Object.keys(selections).some(k =>
    !['bgTab', 'displayTab', 'batchFiles'].includes(k) && selections[k]
  );

  if (!hasAny) return [];

  // Upload detectado
  const hasUpload = Object.keys(selections).some(k => k.startsWith('upload_') && selections[k]);
  if (hasUpload) {
    checks.push({
      icon: <Camera className={iconClass} />,
      label: "Produto detectado",
      detail: "Análise de contornos, escala e reflexos ativada"
    });
  }

  // Formato selecionado
  if (selections.format) {
    const formatLabels: Record<string, string> = {
      '1:1': 'Feed Instagram/Facebook',
      '4:5': 'Post Retrato otimizado',
      '9:16': 'Story/Reels vertical',
      '1.91:1': 'Banner horizontal',
    };
    checks.push({
      icon: <Maximize className={iconClass} />,
      label: "Enquadramento profissional",
      detail: formatLabels[selections.format] || `Ratio ${selections.format} configurado`
    });
  }

  // Cor de fundo
  if (selections.solidColor || selections.bgScenario) {
    checks.push({
      icon: <Palette className={iconClass} />,
      label: "Cenário de estúdio",
      detail: selections.bgScenario
        ? "Iluminação ambiental adaptada ao cenário"
        : "Fundo sólido com gradiente de luz natural"
    });
  }

  // Expositor / Display
  if (selections.display || selections.humanModel) {
    checks.push({
      icon: <Box className={iconClass} />,
      label: selections.humanModel ? "Modelo IA selecionada" : "Expositor configurado",
      detail: selections.humanModel
        ? "Pose, iluminação de pele e composição ajustadas"
        : "Sombras de contato e reflexos sob o expositor"
    });
  }


  // Props / Adereços
  if (selections.prop && selections.prop !== 'none') {
    checks.push({
      icon: <Layers className={iconClass} />,
      label: "Composição avançada",
      detail: "Profundidade de campo e elementos decorativos integrados"
    });
  }

  // Texto na imagem
  if (selections.text) {
    checks.push({
      icon: <Sparkles className={iconClass} />,
      label: "Tipografia editorial",
      detail: "Texto renderizado com sombra e contraste otimizados"
    });
  }

  // Categoria específica
  if (selections.category) {
    checks.push({
      icon: <Sparkles className={iconClass} />,
      label: "Motor IA especializado",
      detail: `Prompt otimizado para ${selections.category.toLowerCase()}`
    });
  }

  return checks;
}

export function ImagePreviewCard({ isGenerating, imageUrl, selections, niche, onGenerate, onNewImage, livePrompt }: ImagePreviewCardProps) {
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const { canShare, isSharing, shareImage, toast, dismissToast } = useShareImage();

  const qualityChecks = useMemo(() => buildQualityChecks(selections, niche), [selections, niche]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      setMessageIndex(0);
      return;
    }
    // First messages cycle faster, then slow down to cover up to ~2min
    // 0-5: every 5s (25s), 6-10: every 8s (40s), 11+: every 12s (48s) = ~113s total
    const getDelay = (idx: number) => idx < 5 ? 5000 : idx < 10 ? 8000 : 12000;

    let timeout: ReturnType<typeof setTimeout>;
    const advance = () => {
      setMessageIndex((prev) => {
        const next = prev < loadingMessages.length - 1 ? prev + 1 : prev;
        timeout = setTimeout(advance, getDelay(next));
        return next;
      });
    };
    timeout = setTimeout(advance, getDelay(0));
    return () => clearTimeout(timeout);
  }, [isGenerating]);

  const format = selections.format || '1:1';
  const aspectClass = format.includes('9:16') ? 'aspect-[9/16]' : format.includes('4:5') ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full gap-4 md:gap-5 px-4 py-3 md:px-8 md:py-5 overflow-y-auto no-scrollbar min-h-0 pb-24 md:pb-6">

      {/* IMAGE / LOADING — M3 Card */}
      <div className={`relative ${aspectClass} w-full max-w-[500px] h-full max-h-[50vh] md:max-h-[65vh] shrink-0 overflow-hidden rounded-[var(--shape-extra-large)] border border-[var(--outline-variant)]/20 bg-[var(--surface-container-low)]/60 backdrop-blur-sm transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] mx-auto`}>
        {isGenerating ? (
          <div aria-busy="true" aria-label="Gerando imagem" className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[var(--surface-container-low)] z-10 px-8 text-center">
            {/* M3 Circular Progress Indicator */}
            <div className="relative flex items-center justify-center" aria-hidden="true">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-[3px] border-[var(--surface-container-highest)] border-t-[var(--primary)] animate-spin" />
              <Sparkles className="absolute w-5 h-5 text-[var(--primary)]" />
            </div>

            <div className="h-12 flex items-center justify-center">
              <p aria-live="polite" aria-atomic="true" className="md3-body-large text-[var(--foreground)]">
                {loadingMessages[messageIndex]}{dots}
              </p>
            </div>

            {/* M3 Linear Progress Indicator — caps at 92% so it never looks "done" prematurely */}
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(92, Math.round(((messageIndex + 1) / loadingMessages.length) * 92))}
              aria-label="Progresso da geração"
              className="w-full max-w-[220px] h-1 bg-[var(--surface-container-highest)] rounded-[var(--shape-full)] overflow-hidden"
            >
              <div
                className={`h-full rounded-[var(--shape-full)] bg-[var(--primary)] transition-all duration-1000 ease-out ${messageIndex >= loadingMessages.length - 1 ? 'animate-pulse' : ''}`}
                style={{ width: `${Math.min(92, ((messageIndex + 1) / loadingMessages.length) * 92)}%` }}
              />
            </div>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Resultado IA" className="w-full h-full object-cover animate-scale-in" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-transparent">
            <div className="w-18 h-18 rounded-[var(--shape-large)] bg-[var(--primary)]/8 border border-[var(--primary)]/15 flex items-center justify-center mb-5" style={{ width: 72, height: 72 }}>
              <Sparkles className="w-9 h-9 text-[var(--primary)]/50" />
            </div>
            <p className="text-[var(--on-surface-variant)] md3-title-medium max-w-[280px] leading-relaxed">
              Configure as opções e gere sua imagem profissional.
            </p>
          </div>
        )}
      </div>

      {/* QUALITY CHECKS — M3 Outlined Card */}
      {qualityChecks.length > 0 && !imageUrl && (
        <div className="hidden md:block w-full max-w-[480px] m3-card-outlined text-left shrink-0">
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <p className="md3-title-small text-[var(--primary)]">Qualidade da Composição</p>
          </div>
          <div className="flex flex-col gap-3">
            {qualityChecks.map((check, i) => (
              <div
                key={i}
                className="flex items-start gap-3 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)]/12 text-[var(--primary)] mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="md3-label-large text-[var(--foreground)]">{check.label}</span>
                  <span className="md3-body-small text-[var(--on-surface-variant)]">{check.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS — M3 Button Group (equal-width grid) */}
      {imageUrl && (
        <div className={`grid shrink-0 mb-4 md:mb-8 mt-2 w-full max-w-[500px] gap-3 ${canShare ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <button
            onClick={onGenerate}
            className="m3-btn-outlined !flex w-full h-12 gap-2 md3-title-small m3-touch-target justify-center"
          >
            <RefreshCw className="w-4.5 h-4.5 shrink-0" /> <span className="truncate">Regenerar</span>
          </button>
          <button
            onClick={() => window.open(imageUrl)}
            className="m3-btn-filled !flex w-full h-12 gap-2 md3-title-small state-layer m3-touch-target justify-center"
          >
            <Download className="w-4.5 h-4.5 shrink-0" /> <span className="truncate">Baixar HD</span>
          </button>
          {canShare && (
            <button
              onClick={() => shareImage(imageUrl, `neksti_${Date.now()}.png`)}
              disabled={isSharing}
              aria-label="Compartilhar imagem no Instagram ou outras redes"
              className="flex items-center justify-center w-full gap-2 h-12 rounded-[var(--shape-full)] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white md3-title-small transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] hover:opacity-90 active:scale-[0.97] disabled:opacity-50 m3-touch-target"
            >
              <InstagramIcon className="w-4.5 h-4.5 shrink-0" />
              <span className="truncate">Postar</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile "Nova Imagem" — resets and goes to step 1 */}
      {imageUrl && onNewImage && (
        <button
          onClick={onNewImage}
          className="md:hidden shrink-0 m3-btn-outlined !flex w-full max-w-[500px] h-12 gap-2 md3-title-small m3-touch-target justify-center mb-6"
        >
          <Plus className="w-4.5 h-4.5 shrink-0" /> <span>Nova Imagem</span>
        </button>
      )}

      <ShareToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
