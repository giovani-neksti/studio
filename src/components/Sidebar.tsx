'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { NicheConfig } from '@/lib/niche-config';
import { Input } from '@/components/ui/input';
import {
  Layers,
  Image as ImageIcon,
  Maximize2,
  Check,
  BoxSelect,
  AlignVerticalSpaceAround,
  UploadCloud,
  Type as TypeIcon,
  Camera,
  X,
  // Jewelry icons
  Circle,
  Sparkle,
  Diamond,
  Link,
  Crown,
  Droplet,
  Heart,
  Flower2,
  Gem,
  // Clothing icons
  Shirt,
  RectangleVertical,
  ShoppingBag,
  // Shoe icons
  Footprints,
  // Display icons
  User,
  Box,
  Landmark,
  Triangle,
  Hand,
  Square,
  Wind,
  PersonStanding,
  Package,
  RotateCcw,
  Ruler,
  Cuboid,
  Tag,
  Minus,
  Grip,
  Sparkles,
  Loader2,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';

interface SidebarProps {
  config: NicheConfig;
  niche: string;
  selections: Record<string, any>;
  onSelect: (key: string, value: any) => void;
  onGenerate?: () => void;
  canGenerate?: boolean;
  isGenerating?: boolean;
  hasUpload?: boolean;
  showBatch?: boolean;
  onToggleBatch?: () => void;
}

const ICON_CLASS = 'w-6 h-6 transition-colors duration-[var(--duration-short4)]';

const getCategoryIcon = (cat: string): ReactNode => {
  if (cat.includes('Colar')) return <Circle className={ICON_CLASS} />;
  if (cat.includes('Brinco')) return <Sparkle className={ICON_CLASS} />;
  if (cat.includes('Anel')) return <Diamond className={ICON_CLASS} />;
  if (cat.includes('Pulseira')) return <Link className={ICON_CLASS} />;
  if (cat.includes('Tiara')) return <Crown className={ICON_CLASS} />;
  if (cat.includes('Broche')) return <Flower2 className={ICON_CLASS} />;
  if (cat.includes('Pingente')) return <Droplet className={ICON_CLASS} />;
  if (cat.includes('Pandora')) return <Gem className={ICON_CLASS} />;
  if (cat.includes('Camisa') || cat.includes('Blusa')) return <Shirt className={ICON_CLASS} />;
  if (cat.includes('Calça') || cat.includes('Saia')) return <RectangleVertical className={ICON_CLASS} />;
  if (cat.includes('Vestido')) return <Crown className={ICON_CLASS} />;
  if (cat.includes('Casaco')) return <Shirt className={ICON_CLASS} />;
  if (cat.includes('Acessórios')) return <ShoppingBag className={ICON_CLASS} />;
  if (cat.includes('Tênis') || cat.includes('Esportivo')) return <Footprints className={ICON_CLASS} />;
  if (cat.includes('Salto')) return <Footprints className={ICON_CLASS} />;
  if (cat.includes('Bota')) return <Footprints className={ICON_CLASS} />;
  if (cat.includes('Sapato')) return <Footprints className={ICON_CLASS} />;
  return <Tag className={ICON_CLASS} />;
};

const DISPLAY_ICON_CLASS = 'w-5 h-5 md:w-6 md:h-6 transition-colors duration-[var(--duration-short4)]';

const getDisplayIcon = (id: string): ReactNode => {
  switch (id) {
    case 'bust':           return <User className={DISPLAY_ICON_CLASS} />;
    case 'box':            return <Box className={DISPLAY_ICON_CLASS} />;
    case 'pedestal':       return <Landmark className={DISPLAY_ICON_CLASS} />;
    case 'cone':           return <Triangle className={DISPLAY_ICON_CLASS} />;
    case 'velvet_hand':    return <Hand className={DISPLAY_ICON_CLASS} />;
    case 'cushion':        return <Square className={DISPLAY_ICON_CLASS} />;
    case 'surface':        return <Minus className={DISPLAY_ICON_CLASS} />;
    case 'floating':       return <Wind className={DISPLAY_ICON_CLASS} />;
    case 'ghost_mannequin':return <PersonStanding className={DISPLAY_ICON_CLASS} />;
    case 'hanger_wood':    return <Grip className={DISPLAY_ICON_CLASS} />;
    case 'hanger_metal':   return <Grip className={DISPLAY_ICON_CLASS} />;
    case 'flat_lay_folded':return <Square className={DISPLAY_ICON_CLASS} />;
    case 'flat_lay_open':  return <Shirt className={DISPLAY_ICON_CLASS} />;
    case 'clothesline':    return <Minus className={DISPLAY_ICON_CLASS} />;
    case 'acrylic_box':    return <Cuboid className={DISPLAY_ICON_CLASS} />;
    case 'dynamic_angle':  return <RotateCcw className={DISPLAY_ICON_CLASS} />;
    case 'shoebox_top':    return <Package className={DISPLAY_ICON_CLASS} />;
    default:               return <Ruler className={DISPLAY_ICON_CLASS} />;
  }
};

/* ── M3 Segmented Button (unchanged) ── */
function SegmentedButton({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex h-10 rounded-[var(--shape-full)] border border-[var(--outline)]/40 overflow-hidden mb-4 bg-[var(--surface-container)]/30 p-0.5">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 md3-label-medium rounded-[var(--shape-full)] transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)]
              ${isActive
                ? 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)] elevation-1'
                : 'text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8'}`}
          >
            {isActive && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Step Progress Bar ── */
const STEP_LABELS = ['Produtos', 'Ambiente', 'Exibição', 'Assinatura', 'Formato'];
const STEP_TITLES = [
  'Produtos & Categorias',
  'Ambientação & Adereços',
  'Tipo de Exibição',
  'Assinatura Visual',
  'Formato de Saída',
];
const STEP_ICONS = [
  <Layers className="w-4 h-4" />,
  <ImageIcon className="w-4 h-4" />,
  <BoxSelect className="w-4 h-4" />,
  <TypeIcon className="w-4 h-4" />,
  <Maximize2 className="w-4 h-4" />,
];

function StepProgress({ current }: { current: number }) {
  const total = 5;
  return (
    <div className="flex-shrink-0 px-4 md:px-5 pt-3.5 pb-2">
      {/* Pills */}
      <div className="flex items-center gap-1 mb-2.5">
        {Array.from({ length: total }).map((_, i) => {
          const done    = i < current;
          const active  = i === current;
          return (
            <div
              key={i}
              className={`h-[5px] rounded-[var(--shape-full)] transition-all duration-[var(--duration-medium3)] ease-[var(--easing-standard)]
                ${active ? 'flex-[3] bg-[var(--primary)]' : done ? 'flex-1 bg-[var(--primary)]/50' : 'flex-1 bg-[var(--outline-variant)]/40'}`}
            />
          );
        })}
      </div>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="md3-label-small text-[var(--on-surface-variant)]">
          Passo {current + 1} de {total}
        </span>
        <span className="md3-label-small text-[var(--primary)] font-semibold flex items-center gap-1">
          {STEP_ICONS[current]}
          {STEP_LABELS[current]}
        </span>
      </div>
    </div>
  );
}

/* ── Main Sidebar / Wizard ── */
export function Sidebar({
  config,
  niche,
  selections,
  onSelect,
  onGenerate,
  canGenerate,
  isGenerating,
  hasUpload,
  showBatch,
  onToggleBatch,
}: SidebarProps) {
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [animDir, setAnimDir]         = useState<'fwd' | 'bck'>('fwd');

  const bgTab      = selections.bgTab      || 'solid';
  const displayTab = selections.displayTab || 'expositor';

  const activeCategory  = selections.category;
  const activeUploadKey = activeCategory ? `upload_${activeCategory}` : null;

  const hasScenarios = !!(config.scenarios   && config.scenarios.length   > 0);
  const hasMaterials = !!(config.materialOptions && config.materialOptions.length > 0);
  const hasProps     = !!(config.propOptions  && config.propOptions.length  > 0);

  // Computed locally from selections — always reactive, no prop timing lag
  const localHasUpload = Object.keys(selections).some(
    (k) => k.startsWith('upload_') && !!selections[k]
  ) || (selections.batchFiles && selections.batchFiles.length > 0);

  // Auto-fill text sub-options when text is typed
  useEffect(() => {
    if (selections.text) {
      if (!selections.textPosition) onSelect('textPosition', 'bottom');
      if (!selections.textSize)     onSelect('textSize',     'medium');
      if (!selections.textColor)    onSelect('textColor',    'white');
    }
  }, [selections.text]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadKey) {
      const file = e.target.files[0];
      const MAX_SIZE      = 10 * 1024 * 1024;
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert('Formato não suportado. Use JPG, PNG ou WebP.');
        e.target.value = '';
        return;
      }
      if (file.size > MAX_SIZE) {
        alert('Arquivo muito grande. O limite é 10 MB.');
        e.target.value = '';
        return;
      }
      onSelect(activeUploadKey, file);
    }
  };

  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    
    const validFiles = files.filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE);
    if (validFiles.length < files.length) {
      alert('Alguns arquivos foram ignorados por tamanho (máx 10MB) ou formato inválido.');
    }
    
    const currentBatch = (selections.batchFiles as File[]) || [];
    const newTotal = [...currentBatch, ...validFiles].slice(0, 10);
    onSelect('batchFiles', newTotal);
    e.target.value = '';
  };

  const removeBatchFile = (index: number) => {
    const currentBatch = (selections.batchFiles as File[]) || [];
    const newBatch = currentBatch.filter((_, i) => i !== index);
    if (newBatch.length === 0) {
      const { batchFiles, ...rest } = selections;
      onSelect('batchFiles', null); // clear
    } else {
      onSelect('batchFiles', newBatch);
    }
  };

  // Whether user can advance from a given step
  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0: return !!localHasUpload;
      case 1: return !!selections.background;
      case 2: return !!selections.display;
      case 3: return true; // optional step
      default: return false;
    }
  };

  const goNext = () => {
    setAnimDir('fwd');
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setAnimDir('bck');
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  // ── Step Contents ──────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {

      /* ── STEP 0: Produtos & Categorias ── */
      case 0:
        return (
          <div className="space-y-5">

            {/* Normal / Batch toggle */}
            <div>
              <p className="md3-label-small text-[var(--on-surface-variant)] mb-2 uppercase tracking-wider">Modo de Upload</p>
              <div className="flex h-11 rounded-[var(--shape-full)] border border-[var(--outline)]/40 overflow-hidden bg-[var(--surface-container)]/30 p-0.5 gap-0.5">
                <button
                  onClick={() => showBatch && onToggleBatch?.()}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 md3-label-medium rounded-[var(--shape-full)] transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)]
                    ${!showBatch
                      ? 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)] elevation-1'
                      : 'text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8'}`}
                >
                  {!showBatch && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                  Normal
                </button>
                <button
                  onClick={() => !showBatch && onToggleBatch?.()}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 md3-label-medium rounded-[var(--shape-full)] transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)]
                    ${showBatch
                      ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)] elevation-1'
                      : 'text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8'}`}
                >
                  {showBatch && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  Batch
                </button>
              </div>
              {showBatch && (
                <p className="md3-body-small text-[var(--on-surface-variant)] mt-2 px-1">
                  Gere até 10 fotos. Selecione a categoria, anexe as imagens e configure o estilo delas a seguir.
                </p>
              )}
            </div>

            {/* Categories + Upload */}
            <div>
              <p className="md3-label-small text-[var(--on-surface-variant)] mb-2 uppercase tracking-wider">Categoria do Produto</p>
              <div className="grid grid-cols-2 gap-2">
                    {config.categories.map((cat) => {
                      const uploadKey       = `upload_${cat}`;
                      const hasUploadForCat = !!selections[uploadKey];
                      const isActive        = selections.category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => onSelect('category', cat)}
                          aria-pressed={isActive}
                          className={`group/cat relative flex flex-col items-center justify-center p-3 md:p-3.5 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] min-h-[68px]
                            ${isActive
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                              : 'border-[var(--outline-variant)]/40 bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8 hover:text-[var(--primary)]'}`}
                        >
                          {hasUploadForCat && (
                            <div aria-hidden="true" className="absolute top-1.5 right-1.5 w-4 h-4 rounded-[var(--shape-full)] bg-green-600 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <span className="mb-1.5">{getCategoryIcon(cat)}</span>
                          <span className={`md3-label-small leading-tight text-center ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)] group-hover/cat:text-[var(--primary)]'}`}>
                            {cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload area */}
                {activeCategory && (
                  <div>
                    {showBatch ? (
                      <div className="space-y-4">
                        {((selections.batchFiles as File[])?.length > 0) ? (
                          <div className="space-y-3">
                            <p className="md3-label-small text-[var(--on-surface-variant)] uppercase tracking-wider">Imagens Adicionadas ({(selections.batchFiles as File[]).length}/10)</p>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {(selections.batchFiles as File[]).map((file, idx) => (
                                <div key={idx} className="relative aspect-square rounded-[var(--shape-small)] overflow-hidden border border-[var(--outline-variant)]/40 bg-[var(--surface-container-high)]">
                                  <img src={URL.createObjectURL(file)} alt="thumb" className="w-full h-full object-cover" />
                                  <button onClick={() => removeBatchFile(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--surface-container-highest)]/90 flex items-center justify-center text-[var(--on-surface)] hover:bg-[var(--error)] hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {((selections.batchFiles as File[])?.length || 0) < 10 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-[var(--outline-variant)]/40 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 text-[var(--on-surface-variant)] rounded-[var(--shape-small)] transition-colors">
                                  <UploadCloud className="w-5 h-5 mb-1 text-[var(--primary)]" />
                                  <span className="text-[10px] text-[var(--primary)]">Adicionar</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-6 border-2 border-dashed border-[var(--outline-variant)]/50 rounded-[var(--shape-medium)] text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-[var(--duration-short4)] flex flex-col items-center justify-center min-h-[100px]"
                          >
                            <Layers className="w-8 h-8 mb-2 text-[var(--primary)]/80" aria-hidden="true" />
                            <p className="md3-title-small text-[var(--foreground)] mb-1">Upload em Lote</p>
                            <span className="md3-body-small text-[var(--on-surface-variant)]">Selecione até 10 fotos</span>
                          </button>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={handleBatchFileUpload} tabIndex={-1} aria-hidden="true" />
                      </div>
                    ) : (
                      selections[activeUploadKey!] ? (
                        <div className="p-3 md:p-4 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-[var(--shape-medium)] flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-6 h-6 rounded-[var(--shape-full)] bg-green-600 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="md3-body-small font-medium text-[var(--foreground)] truncate">
                              {selections[activeUploadKey!].name}
                            </span>
                          </div>
                          <button
                            onClick={() => onSelect(activeUploadKey!, null)}
                            className="md3-label-medium text-[var(--error)] ml-2 px-3 py-1.5 rounded-[var(--shape-full)] hover:bg-[var(--error)]/10 transition-colors duration-[var(--duration-short4)] shrink-0"
                          >
                            Remover
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            aria-label="Tirar foto com câmera"
                            className="p-4 border-2 border-dashed border-[var(--outline-variant)]/50 rounded-[var(--shape-medium)] text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-[var(--duration-short4)] flex flex-col items-center justify-center min-h-[80px]"
                          >
                            <input type="file" ref={cameraInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" onChange={handleFileUpload} tabIndex={-1} aria-hidden="true" />
                            <Camera className="w-6 h-6 mb-2 text-[var(--primary)]" aria-hidden="true" />
                            <span className="md3-label-small text-[var(--primary)]">Tirar Foto</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Selecionar imagem da galeria"
                            className="p-4 border-2 border-dashed border-[var(--outline-variant)]/50 rounded-[var(--shape-medium)] text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-[var(--duration-short4)] flex flex-col items-center justify-center min-h-[80px]"
                          >
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={handleFileUpload} tabIndex={-1} aria-hidden="true" />
                            <UploadCloud className="w-6 h-6 mb-2 text-[var(--primary)]" aria-hidden="true" />
                            <span className="md3-label-small text-[var(--primary)]">Galeria</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Material */}
                {hasMaterials && (
                  <div>
                    <label htmlFor="select-material" className="md3-label-small text-[var(--on-surface-variant)] mb-2 block uppercase tracking-wider">
                      Material Predominante
                    </label>
                    <select
                      id="select-material"
                      value={selections.material || ''}
                      onChange={(e) => onSelect('material', e.target.value)}
                      className="w-full h-11 px-3 rounded-[var(--shape-extra-small)] md3-body-medium border border-[var(--outline)]/40 bg-transparent text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-colors duration-[var(--duration-short4)] outline-none"
                    >
                      <option value="" disabled>Selecione o Material</option>
                      {config.materialOptions?.map((mat) => (
                        <option key={mat.id} value={mat.id}>{mat.label}</option>
                      ))}
                    </select>
                  </div>
                )}
          </div>
        );

      /* ── STEP 1: Ambientação & Adereços ── */
      case 1:
        return (
          <div className="space-y-5">
            {hasScenarios && (
              <SegmentedButton
                options={[
                  { id: 'solid',    label: 'Cor Sólida' },
                  { id: 'scenario', label: 'Cenário IA'  },
                ]}
                value={bgTab}
                onChange={(v) => onSelect('bgTab', v)}
              />
            )}

            {(!hasScenarios || bgTab === 'solid') ? (
              <div>
                <p className="md3-label-small text-[var(--on-surface-variant)] mb-2 uppercase tracking-wider">Cor de Fundo</p>
                <div className="grid grid-cols-5 gap-2">
                  {config.solidColors.map((color) => (
                    <button
                      key={color.name}
                      aria-label={color.name}
                      aria-pressed={selections.background === color.name}
                      onClick={() => { onSelect('background', color.name); onSelect('backgroundHex', color.hex); }}
                      className={`aspect-square rounded-[var(--shape-full)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] hover:scale-110 ${selections.background === color.name ? 'ring-2 ring-offset-2 ring-[var(--primary)] ring-offset-[var(--surface-container-low)] scale-110' : 'border-[var(--outline-variant)]/30'}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="md3-label-small text-[var(--on-surface-variant)] mb-2 uppercase tracking-wider">Cenário</p>
                <div className="grid grid-cols-2 gap-2">
                  {config.scenarios?.map((scenario) => (
                    <button
                      key={scenario.title}
                      onClick={() => onSelect('background', scenario.title)}
                      className={`text-left p-3 rounded-[var(--shape-medium)] border md3-label-medium transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)]
                        ${selections.background === scenario.title
                          ? 'border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]'
                          : 'border-[var(--outline-variant)]/40 text-[var(--foreground)] hover:bg-[var(--on-surface-variant)]/8'}`}
                    >
                      {scenario.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasProps && (
              <div>
                <label htmlFor="select-prop" className="md3-label-small text-[var(--on-surface-variant)] mb-2 block uppercase tracking-wider">
                  Adereços de Composição
                </label>
                <select
                  id="select-prop"
                  value={selections.prop || 'none'}
                  onChange={(e) => onSelect('prop', e.target.value)}
                  className="w-full h-11 px-3 rounded-[var(--shape-extra-small)] md3-body-medium border border-[var(--outline)]/40 bg-transparent text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-colors duration-[var(--duration-short4)] outline-none"
                >
                  {config.propOptions?.map((prop) => (
                    <option key={prop.id} value={prop.id}>{prop.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );

      /* ── STEP 2: Tipo de Exibição ── */
      case 2:
        return (
          <div className="space-y-4">
            <SegmentedButton
              options={[
                { id: 'expositor', label: 'Expositor' },
                { id: 'human',     label: 'Modelo'    },
              ]}
              value={displayTab}
              onChange={(v) => onSelect('displayTab', v)}
            />

            {displayTab === 'expositor' ? (
              <div className="grid grid-cols-2 gap-2">
                {config.displayOptions.map((opt: any) => {
                  const isActive = selections.display === opt.label;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelect('display', opt.label)}
                      aria-pressed={isActive}
                      className={`group/disp relative flex flex-col items-center justify-center p-3 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)]
                        ${isActive
                          ? 'border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]'
                          : 'border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8 hover:text-[var(--primary)]'}`}
                    >
                      {isActive && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-[var(--primary)]" aria-hidden="true" />}
                      <span className="mb-1.5">{getDisplayIcon(opt.id)}</span>
                      <span className={`md3-label-small leading-tight text-center ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)] group-hover/disp:text-[var(--primary)]'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {config.humanDisplayOptions.map((opt: any) => {
                  const isActive = selections.display === opt.name;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelect('display', opt.name)}
                      aria-pressed={isActive}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] text-center h-16 md:h-20
                        ${isActive
                          ? 'border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]'
                          : 'border-[var(--outline-variant)]/40 text-[var(--foreground)] hover:bg-[var(--on-surface-variant)]/8'}`}
                    >
                      {isActive && <Check className="absolute top-1 right-1 w-2.5 h-2.5 md:w-3 md:h-3 text-[var(--primary)]" aria-hidden="true" />}
                      <span className={`md3-label-small font-semibold leading-tight mb-0.5 ${isActive ? 'text-[var(--primary)]' : ''}`}>
                        {opt.name}
                      </span>
                      {opt.type && (
                        <span className="text-[8px] md:text-[9px] text-[var(--outline)] leading-tight line-clamp-2">
                          {opt.type}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );

      /* ── STEP 3: Assinatura Visual ── */
      case 3:
        return (
          <div className="space-y-3">
            <p className="md3-body-small text-[var(--on-surface-variant)]">
              Opcional — deixe em branco para pular.
            </p>

            <Input
              placeholder="Ex: Coleção Verão"
              aria-label="Texto da assinatura visual"
              value={selections.text || ''}
              onChange={(e) => onSelect('text', e.target.value)}
              className="bg-transparent text-[var(--foreground)] h-11 border border-[var(--outline)]/40 rounded-[var(--shape-extra-small)] md3-body-medium focus:ring-2 focus:ring-[var(--primary)]/30 transition-colors"
            />

            <select
              aria-label="Escolher fonte tipográfica"
              value={selections.typography || ''}
              onChange={(e) => onSelect('typography', e.target.value)}
              className="w-full h-11 px-3 rounded-[var(--shape-extra-small)] md3-body-medium border border-[var(--outline)]/40 bg-transparent text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/30 transition-colors duration-[var(--duration-short4)] outline-none"
            >
              <option value="" disabled>Escolha a Fonte</option>
              {config.typographyOptions.map((font) => (
                <option key={font.label} value={font.label}>{font.label}</option>
              ))}
            </select>

            {selections.text && (
              <div className="pt-2 flex flex-col gap-3">
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1">
                    <p className="md3-label-small text-[var(--on-surface-variant)] mb-1.5">Tamanho</p>
                    <div className="flex w-full border border-[var(--outline)]/40 rounded-[var(--shape-full)] overflow-hidden h-8">
                      {config.textSizeOptions?.map((size) => {
                        const isActive = selections.textSize === size.id || (!selections.textSize && size.id === 'medium');
                        return (
                          <button
                            key={size.id}
                            onClick={() => onSelect('textSize', size.id)}
                            aria-pressed={isActive}
                            className={`flex-1 flex items-center justify-center md3-label-small transition-all duration-[var(--duration-short4)]
                              ${isActive ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'hover:bg-[var(--on-surface-variant)]/8 text-[var(--foreground)]'}`}
                          >
                            {size.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <p className="md3-label-small text-[var(--on-surface-variant)] mb-1.5">Cor da Letra</p>
                    <div className="flex items-center gap-1.5 h-8">
                      {config.textColorOptions?.map((color) => {
                        const isActive = selections.textColor === color.id || (!selections.textColor && color.id === 'white');
                        return (
                          <button
                            key={color.id}
                            aria-label={color.label}
                            aria-pressed={isActive}
                            onClick={() => onSelect('textColor', color.id)}
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-[var(--shape-full)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)]
                              ${isActive ? 'ring-2 ring-offset-1 ring-[var(--primary)] ring-offset-[var(--surface-container-low)] scale-110' : 'border-[var(--outline-variant)]/30 hover:scale-110'}`}
                            style={{ backgroundColor: color.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="md3-label-small text-[var(--on-surface-variant)] mb-1.5 flex items-center gap-1">
                    <AlignVerticalSpaceAround className="w-3.5 h-3.5" /> Posição na Imagem
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {config.textPositionOptions?.map((pos: any) => (
                      <button
                        key={pos.id}
                        onClick={() => onSelect('textPosition', pos.id)}
                        aria-pressed={selections.textPosition === pos.id}
                        className={`flex flex-col items-center p-2 rounded-[var(--shape-small)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)]
                          ${selections.textPosition === pos.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-[var(--outline-variant)]/30 hover:bg-[var(--on-surface-variant)]/8'}`}
                      >
                        <div className={`w-full aspect-square mb-1 border border-dashed rounded-[var(--shape-extra-small)] flex p-1 ${pos.gridClass}
                          ${selections.textPosition === pos.id ? 'border-[var(--primary)]/50 bg-[var(--primary)]/10' : 'border-[var(--outline-variant)]/30'}`}
                        >
                          <div className={`h-1 w-5 rounded-sm ${selections.textPosition === pos.id ? 'bg-[var(--primary)]' : 'bg-[var(--foreground)]/30'}`} />
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-medium leading-none ${selections.textPosition === pos.id ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`}>
                          {pos.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      /* ── STEP 4: Formato de Saída ── */
      case 4: {
        const formatMeta: Record<string, { icon: ReactNode; platforms: { name: string; color: string }[]; use: string }> = {
          'square': {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
            platforms: [
              { name: 'Instagram', color: '#E1306C' },
              { name: 'Facebook', color: '#1877F2' },
            ],
            use: 'Post no Feed',
          },
          'portrait': {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="5" y="2" width="14" height="20" rx="2" /></svg>,
            platforms: [
              { name: 'Instagram', color: '#E1306C' },
            ],
            use: 'Post no Feed (destaque)',
          },
          'story': {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="7" y="1" width="10" height="22" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="3" strokeLinecap="round" /></svg>,
            platforms: [
              { name: 'Stories', color: '#E1306C' },
              { name: 'Reels', color: '#FF0050' },
              { name: 'TikTok', color: '#000000' },
            ],
            use: 'Vídeo vertical / Stories',
          },
          'landscape': {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="1" y="5" width="22" height="14" rx="2" /></svg>,
            platforms: [
              { name: 'LinkedIn', color: '#0A66C2' },
              { name: 'Site', color: '#4CAF50' },
              { name: 'Facebook', color: '#1877F2' },
            ],
            use: 'Banner / Capa',
          },
        };

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2.5">
              {config.formats.map((fmt) => {
                const isActive = selections.format === fmt.ratio;
                const meta = formatMeta[fmt.id];
                return (
                  <button
                    key={fmt.id}
                    onClick={() => onSelect('format', fmt.ratio)}
                    aria-pressed={isActive}
                    className={`flex items-center gap-3 p-3 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] text-left
                      ${isActive
                        ? 'border-[var(--primary)] bg-[var(--primary)]/8'
                        : 'border-[var(--outline-variant)]/40 hover:bg-[var(--on-surface-variant)]/8'}`}
                  >
                    {/* Aspect ratio visual */}
                    <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${isActive ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`}>
                      {meta?.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`md3-label-large font-semibold ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{fmt.ratio}</span>
                        <span className={`md3-label-small ${isActive ? 'text-[var(--primary)]/70' : 'text-[var(--on-surface-variant)]'}`}>{fmt.pixels}</span>
                      </div>
                      <div className={`md3-label-medium mb-1 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                        {meta?.use || fmt.label}
                      </div>
                      {/* Platform badges */}
                      <div className="flex flex-wrap gap-1">
                        {meta?.platforms.map((p) => (
                          <span
                            key={p.name}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                            style={{
                              backgroundColor: `${p.color}18`,
                              color: isActive ? 'var(--primary)' : p.color,
                              border: `1px solid ${p.color}30`,
                            }}
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Check */}
                    {isActive && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[var(--on-primary)]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Hint text shown when step is not yet complete
  const getStepHint = (step: number): string => {
    switch (step) {
      case 0:
        if (!selections.category) return 'Selecione uma categoria acima';
        if (!localHasUpload) return 'Faça upload de pelo menos uma foto do produto';
        return '';
      case 1: return 'Escolha uma cor ou cenário de fundo';
      case 2: return 'Escolha um tipo de expositor ou modelo';
      default: return '';
    }
  };

  const isLastStep = currentStep === 4;

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-[var(--surface-container-low)]">

      {/* Desktop Header */}
      <div className="hidden md:flex px-5 py-4 border-b border-[var(--outline-variant)]/20 shrink-0 items-center gap-3">
        <Gem className="w-5 h-5 text-[var(--primary)]" />
        <h2 className="md3-title-small text-[var(--foreground)]">Configurações</h2>
      </div>

      {/* Step Progress Bar */}
      <StepProgress current={currentStep} />

      {/* Step Title */}
      <div className="flex-shrink-0 px-4 md:px-5 pb-3">
        <h3 className="md3-title-medium text-[var(--foreground)] font-semibold">
          {STEP_TITLES[currentStep]}
        </h3>
      </div>

      {/* Animated Step Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth w-full no-scrollbar">
        <div
          key={`${currentStep}-${animDir}`}
          className={`px-4 md:px-5 pb-8 ${animDir === 'fwd' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
        >
          {renderStep()}
        </div>
      </div>

      {/* Footer Navigation — always visible */}
      <div className="flex-shrink-0 w-full z-10 px-4 py-3 border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container-low)]">
        <div className="flex items-center gap-2">

          {/* Back button — only from step 1+ */}
          {currentStep > 0 && (
            <button
              onClick={goBack}
              className="flex items-center justify-center h-12 w-12 rounded-[var(--shape-full)] border border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] transition-colors duration-[var(--duration-short4)] hover:bg-[var(--on-surface-variant)]/8 flex-shrink-0 active:scale-95"
              aria-label="Passo anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Action button — always rendered, disabled when not ready */}
          <div className="flex-1 min-w-0">
            {isLastStep ? (
              <button
                onClick={onGenerate}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-2.5 h-12 rounded-[var(--shape-full)] md3-label-large transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] bg-[var(--primary)] text-[var(--on-primary)] hover:elevation-1 active:scale-[0.98] state-layer disabled:opacity-40 disabled:pointer-events-none"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Gerando...</span></>
                ) : (
                  <><Sparkles className="w-5 h-5" /><span>Gerar Imagem</span></>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-[var(--shape-full)] md3-label-large transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)] hover:elevation-1 active:scale-[0.98] state-layer"
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
