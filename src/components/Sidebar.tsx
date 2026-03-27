'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { NicheConfig } from '@/lib/niche-config';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Maximize2,
  Check,
  BoxSelect,
  AlignVerticalSpaceAround,
  UploadCloud,
  Type as TypeIcon,
  Camera,
  // Jewelry icons
  Circle,
  Sparkle,
  Diamond,
  Link,
  Flower2,
  Droplet,
  Gem,
  // Clothing icons
  Shirt,
  RectangleVertical,
  Crown,
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
}

const ICON_CLASS = "w-6 h-6 transition-colors duration-[var(--duration-short4)]";

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

const DISPLAY_ICON_CLASS = "w-5 h-5 md:w-6 md:h-6 transition-colors duration-[var(--duration-short4)]";

const getDisplayIcon = (id: string): ReactNode => {
  switch (id) {
    case 'bust': return <User className={DISPLAY_ICON_CLASS} />;
    case 'box': return <Box className={DISPLAY_ICON_CLASS} />;
    case 'pedestal': return <Landmark className={DISPLAY_ICON_CLASS} />;
    case 'cone': return <Triangle className={DISPLAY_ICON_CLASS} />;
    case 'velvet_hand': return <Hand className={DISPLAY_ICON_CLASS} />;
    case 'cushion': return <Square className={DISPLAY_ICON_CLASS} />;
    case 'surface': return <Minus className={DISPLAY_ICON_CLASS} />;
    case 'floating': return <Wind className={DISPLAY_ICON_CLASS} />;
    case 'ghost_mannequin': return <PersonStanding className={DISPLAY_ICON_CLASS} />;
    case 'hanger_wood': return <Grip className={DISPLAY_ICON_CLASS} />;
    case 'hanger_metal': return <Grip className={DISPLAY_ICON_CLASS} />;
    case 'flat_lay_folded': return <Square className={DISPLAY_ICON_CLASS} />;
    case 'flat_lay_open': return <Shirt className={DISPLAY_ICON_CLASS} />;
    case 'clothesline': return <Minus className={DISPLAY_ICON_CLASS} />;
    case 'acrylic_box': return <Cuboid className={DISPLAY_ICON_CLASS} />;
    case 'dynamic_angle': return <RotateCcw className={DISPLAY_ICON_CLASS} />;
    case 'shoebox_top': return <Package className={DISPLAY_ICON_CLASS} />;
    default: return <Ruler className={DISPLAY_ICON_CLASS} />;
  }
};

/* M3 Collapsible Section */
function SectionWrapper({ title, icon, defaultOpen = true, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-0.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-3.5 text-left rounded-[var(--shape-large)] hover:bg-[var(--on-surface-variant)]/8 transition-colors duration-[var(--duration-short4)] state-layer"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--primary)] w-5 h-5 flex items-center justify-center">{icon}</span>
          <span className="md3-title-small font-serif font-semibold text-[var(--foreground)]">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--on-surface-variant)] transition-transform duration-[var(--duration-short4)] ease-[var(--easing-standard)] ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-[var(--duration-medium2)] ease-[var(--easing-emphasized)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1.5 md:px-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* M3 Segmented Button */
function SegmentedButton({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
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
            {isActive && <Check className="w-3.5 h-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Sidebar({ config, niche, selections, onSelect, onGenerate, canGenerate, isGenerating, hasUpload }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const bgTab = selections.bgTab || 'solid';
  const displayTab = selections.displayTab || 'expositor';
  const activeCategory = selections.category;
  const activeUploadKey = activeCategory ? `upload_${activeCategory}` : null;

  useEffect(() => {
    if (selections.text) {
      if (!selections.textPosition) onSelect('textPosition', 'bottom');
      if (!selections.textSize) onSelect('textSize', 'medium');
      if (!selections.textColor) onSelect('textColor', 'white');
    }
  }, [selections.text]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadKey) {
      const file = e.target.files[0];
      const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
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

  const hasScenarios = config.scenarios && config.scenarios.length > 0;
  const hasMaterials = config.materialOptions && config.materialOptions.length > 0;
  const hasProps = config.propOptions && config.propOptions.length > 0;

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-[var(--surface-container-low)]">
      {/* Desktop Header */}
      <div className="hidden md:flex px-5 py-4 border-b border-[var(--outline-variant)]/20 shrink-0 items-center gap-3">
        <Gem className="w-5 h-5 text-[var(--primary)]" />
        <h2 className="md3-title-small text-[var(--foreground)]">Configurações</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth w-full no-scrollbar">
        <div className="py-2 md:py-3 pb-32 md:pb-16">

          {/* STEP 1: CATEGORY */}
          <SectionWrapper title="1. Produtos & Categorias" icon={<Layers className="w-5 h-5" />}>
            <div className="grid grid-cols-2 gap-2">
              {config.categories.map((cat) => {
                const uploadKey = `upload_${cat}`;
                const hasUpload = !!selections[uploadKey];
                const isActive = selections.category === cat;
                const icon = getCategoryIcon(cat);

                return (
                  <button
                    key={cat}
                    onClick={() => onSelect('category', cat)}
                    className={`group/cat relative flex flex-col items-center justify-center p-3 md:p-3.5 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] min-h-[68px]
                      ${isActive
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--outline-variant)]/40 bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8 hover:text-[var(--primary)]'}`}
                  >
                    {hasUpload && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-[var(--shape-full)] bg-green-600 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className="mb-1.5">{icon}</span>
                    <span className={`md3-label-small leading-tight text-center ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)] group-hover/cat:text-[var(--primary)]'}`}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* UPLOAD AREA */}
            {activeCategory && (
              <div className="mt-3">
                {selections[activeUploadKey!] ? (
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
                    <div
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-[var(--outline-variant)]/50 rounded-[var(--shape-medium)] text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-[var(--duration-short4)] flex flex-col items-center justify-center min-h-[80px]"
                    >
                      <input type="file" ref={cameraInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" onChange={handleFileUpload} />
                      <Camera className="w-6 h-6 mb-2 text-[var(--primary)]" />
                      <span className="md3-label-small text-[var(--primary)]">Tirar Foto</span>
                    </div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-[var(--outline-variant)]/50 rounded-[var(--shape-medium)] text-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-[var(--duration-short4)] flex flex-col items-center justify-center min-h-[80px]"
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={handleFileUpload} />
                      <UploadCloud className="w-6 h-6 mb-2 text-[var(--primary)]" />
                      <span className="md3-label-small text-[var(--primary)]">Galeria</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasMaterials && (
              <div className="mt-4 pt-4 border-t border-[var(--outline-variant)]/20">
                <p className="md3-label-small text-[var(--on-surface-variant)] mb-2">Material Predominante</p>
                <select
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
          </SectionWrapper>

          <div className="mx-4 md:mx-5 my-1 m3-divider" />

          {/* STEP 2: AMBIENCE */}
          <SectionWrapper title="2. Ambientação & Adereços" icon={<ImageIcon className="w-5 h-5" />}>
            {hasScenarios && (
              <SegmentedButton
                options={[
                  { id: 'solid', label: 'Cor Sólida' },
                  { id: 'scenario', label: 'Cenário IA' },
                ]}
                value={bgTab}
                onChange={(v) => onSelect('bgTab', v)}
              />
            )}

            {(!hasScenarios || bgTab === 'solid') ? (
              <div className="grid grid-cols-5 gap-2">
                {config.solidColors.map((color) => (
                  <button
                    key={color.name}
                    title={color.name}
                    onClick={() => { onSelect('background', color.name); onSelect('backgroundHex', color.hex); }}
                    className={`aspect-square rounded-[var(--shape-full)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] hover:scale-110 ${selections.background === color.name ? 'ring-2 ring-offset-2 ring-[var(--primary)] ring-offset-[var(--surface-container-low)] scale-110' : 'border-[var(--outline-variant)]/30'}`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            ) : (
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
            )}

            {hasProps && (
              <div className="mt-4 pt-4 border-t border-[var(--outline-variant)]/20">
                <p className="md3-label-small text-[var(--on-surface-variant)] mb-2">Adereços de Composição</p>
                <select
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
          </SectionWrapper>

          <div className="mx-4 md:mx-5 my-1 m3-divider" />

          {/* STEP 3: DISPLAY TYPE */}
          <SectionWrapper title="3. Tipo de Exibição" icon={<BoxSelect className="w-5 h-5" />}>
            <SegmentedButton
              options={[
                { id: 'expositor', label: 'Expositor' },
                { id: 'human', label: 'Modelo' },
              ]}
              value={displayTab}
              onChange={(v) => onSelect('displayTab', v)}
            />

            {displayTab === 'expositor' ? (
              <div className="grid grid-cols-2 gap-2">
                {config.displayOptions.map((opt: any) => {
                  const isActive = selections.display === opt.label;
                  const icon = getDisplayIcon(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelect('display', opt.label)}
                      className={`group/disp relative flex flex-col items-center justify-center p-3 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)]
                        ${isActive
                          ? 'border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]'
                          : 'border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8 hover:text-[var(--primary)]'}`}
                    >
                      {isActive && <Check className="absolute top-1.5 right-1.5 w-3 h-3 text-[var(--primary)]" />}
                      <span className="mb-1.5">{icon}</span>
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
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] text-center h-16 md:h-20
                        ${isActive
                          ? 'border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]'
                          : 'border-[var(--outline-variant)]/40 text-[var(--foreground)] hover:bg-[var(--on-surface-variant)]/8'}`}
                    >
                      {isActive && <Check className="absolute top-1 right-1 w-2.5 h-2.5 md:w-3 md:h-3 text-[var(--primary)]" />}
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
          </SectionWrapper>

          <div className="mx-4 md:mx-5 my-1 m3-divider" />

          {/* STEP 4: VISUAL SIGNATURE */}
          <SectionWrapper title="4. Assinatura Visual" icon={<TypeIcon className="w-5 h-5" />}>
            <div className="space-y-3">
              <Input
                placeholder="Ex: Coleção Verão"
                value={selections.text || ''}
                onChange={(e) => onSelect('text', e.target.value)}
                className="bg-transparent text-[var(--foreground)] h-11 border border-[var(--outline)]/40 rounded-[var(--shape-extra-small)] md3-body-medium focus:ring-2 focus:ring-[var(--primary)]/30 transition-colors"
              />

              <select
                value={selections.typography || ''}
                onChange={(e) => onSelect('typography', e.target.value)}
                className="w-full h-11 px-3 rounded-[var(--shape-extra-small)] md3-body-medium border border-[var(--outline)]/40 bg-transparent text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/30 transition-colors duration-[var(--duration-short4)] outline-none"
              >
                <option value="" disabled>Escolha a Fonte</option>
                {config.typographyOptions.map((font) => <option key={font.label} value={font.label}>{font.label}</option>)}
              </select>

              {selections.text && (
                <div className="pt-2 flex flex-col gap-3">
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-1">
                      <p className="md3-label-small text-[var(--on-surface-variant)] mb-1.5">Tamanho</p>
                      <div className="flex w-full border border-[var(--outline)]/40 rounded-[var(--shape-full)] overflow-hidden h-8">
                        {config.textSizeOptions?.map(size => {
                          const isActive = selections.textSize === size.id || (!selections.textSize && size.id === 'medium');
                          return (
                            <button
                              key={size.id}
                              onClick={() => onSelect('textSize', size.id)}
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
                        {config.textColorOptions?.map(color => {
                          const isActive = selections.textColor === color.id || (!selections.textColor && color.id === 'white');
                          return (
                            <button
                              key={color.id}
                              title={color.label}
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
                          <span className={`text-[9px] md:text-[10px] font-medium leading-none ${selections.textPosition === pos.id ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`}>{pos.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionWrapper>

          <div className="mx-4 md:mx-5 my-1 m3-divider" />

          {/* STEP 5: OUTPUT FORMAT */}
          <SectionWrapper title="5. Formato de Saída" icon={<Maximize2 className="w-5 h-5" />}>
            <div className="grid grid-cols-2 gap-2">
              {config.formats.map((fmt) => {
                const isActive = selections.format === fmt.ratio;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => onSelect('format', fmt.ratio)}
                    className={`flex flex-col items-center justify-center p-3 rounded-[var(--shape-medium)] border transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] text-center
                      ${isActive
                        ? 'border-[var(--primary)] bg-[var(--primary)]/8 text-[var(--primary)]'
                        : 'border-[var(--outline-variant)]/40 text-[var(--foreground)] hover:bg-[var(--on-surface-variant)]/8'}`}
                  >
                    <span className="md3-label-large mb-0.5">{fmt.ratio}</span>
                    <span className="md3-label-small mb-1">{fmt.label}</span>
                    <span className="text-[8px] md:text-[9px] text-[var(--outline)] hidden md:block">{fmt.pixels}</span>
                  </button>
                );
              })}
            </div>
          </SectionWrapper>

        </div>
      </div>

      {/* Mobile Generate Button — sticky at bottom of sidebar */}
      {onGenerate && (
        <div className="md:hidden flex-shrink-0 px-4 py-3 border-t border-[var(--outline-variant)]/20 bg-[var(--surface-container-low)]">
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-2.5 h-14 rounded-[var(--shape-full)] md3-label-large transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] disabled:opacity-[0.38] disabled:cursor-not-allowed bg-[var(--primary)] text-[var(--on-primary)] hover:elevation-1 active:scale-[0.98] state-layer"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /><span>Gerando...</span></>
            ) : (
              <><Sparkles className="w-5 h-5" /><span>{hasUpload ? 'Gerar Imagem' : 'Envie uma foto primeiro'}</span></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
