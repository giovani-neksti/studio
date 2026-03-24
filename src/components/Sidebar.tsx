'use client';

import { useState, useRef, useEffect } from 'react';
import { NicheConfig } from '@/lib/niche-config';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Maximize2,
  CheckCircle2,
  BoxSelect,
  AlignVerticalSpaceAround,
  UploadCloud,
  Type as TypeIcon,
  Camera // IMPORT NOVO
} from 'lucide-react';

interface SidebarProps {
  config: NicheConfig;
  niche: string;
  selections: Record<string, any>;
  onSelect: (key: string, value: any) => void;
}

const getCategoryIcon = (cat: string) => {
  if (cat.includes('Colar')) return '📿';
  if (cat.includes('Brinco')) return '✨';
  if (cat.includes('Anel')) return '💍';
  if (cat.includes('Pulseira')) return '⛓️';
  if (cat.includes('Relógio')) return '⌚';
  if (cat.includes('Broche')) return '🏵️';
  if (cat.includes('Pingente')) return '🧿';
  if (cat.includes('Pandora')) return '🔮';

  if (cat.includes('Camisa') || cat.includes('Blusa')) return '👚';
  if (cat.includes('Calça') || cat.includes('Saia')) return '👖';
  if (cat.includes('Vestido')) return '👗';
  if (cat.includes('Casaco')) return '🧥';
  if (cat.includes('Acessórios')) return '👜';

  if (cat.includes('Tênis Urbano') || cat.includes('Esportivo')) return '👟';
  if (cat.includes('Salto Alto')) return '👠';
  if (cat.includes('Bota')) return '🥾';
  if (cat.includes('Sapato')) return '👞';

  return '🏷️';
};

const getDisplayIcon = (id: string) => {
  switch (id) {
    case 'bust': return '👤';
    case 'box': return '🎁';
    case 'pedestal': return '🏛️';
    case 'cone': return '🔺';
    case 'velvet_hand': return '🖐️';
    case 'cushion': return '🛋️';
    case 'surface': return '🪞';
    case 'floating': return '✨';
    case 'ghost_mannequin': return '👻';
    case 'hanger_wood': return '🪵';
    case 'hanger_metal': return '🪝';
    case 'flat_lay_folded': return '👕';
    case 'flat_lay_open': return '👚';
    case 'clothesline': return '〰️';
    case 'acrylic_box': return '🧊';
    case 'dynamic_angle': return '📐';
    case 'shoebox_top': return '📦';
    default: return '🪄';
  }
};

function SectionWrapper({ title, icon, defaultOpen = true, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1 md:mb-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-3 py-3.5 md:px-4 md:py-4 text-left hover:bg-[var(--accent)] rounded-xl transition-colors active:scale-[0.98]">
        <div className="flex items-center gap-2.5 md:gap-3">
          <span className="text-[var(--primary)] w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">{icon}</span>
          <span className="text-[13px] md:text-sm font-bold text-[var(--foreground)] tracking-wide">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 md:w-4 md:h-4 text-[var(--muted-foreground)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-3 pb-4 pt-1 md:px-4 md:pb-5">{children}</div>}
    </div>
  );
}

export function Sidebar({ config, niche, selections, onSelect }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null); // REF DA CÂMERA

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
      onSelect(activeUploadKey, e.target.files[0]);
    }
  };

  const hasScenarios = config.scenarios && config.scenarios.length > 0;
  const hasMaterials = config.materialOptions && config.materialOptions.length > 0;
  const hasProps = config.propOptions && config.propOptions.length > 0;

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-[var(--card)]">
      <div className="hidden md:flex px-5 py-4 border-b border-[var(--border)] shrink-0 items-center gap-3">
        <span className="text-xl">{config.icon}</span>
        <h2 className="text-[var(--foreground)] font-bold text-sm leading-tight">Configurações</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden touch-pan-y scroll-smooth overscroll-contain">
        <div className="py-2 md:py-3 pb-32 md:pb-16">

          {/* PASSO 1: CATEGORIA */}
          <SectionWrapper title="1. Produtos & Categorias" icon={<Layers />}>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {config.categories.map((cat) => {
                const uploadKey = `upload_${cat}`;
                const hasUpload = !!selections[uploadKey];
                const isActive = selections.category === cat;
                const icon = getCategoryIcon(cat);

                return (
                  <button
                    key={cat}
                    onClick={() => onSelect('category', cat)}
                    className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all active:scale-95 min-h-[72px]
                      ${isActive
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30 shadow-sm'
                        : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent)]/50'}`}
                  >
                    {hasUpload && (
                      <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 bg-white rounded-full" />
                    )}
                    <span className="text-2xl md:text-3xl mb-1.5 transition-transform group-hover:scale-110">{icon}</span>
                    <span className={`text-[11px] md:text-xs font-bold leading-tight text-center ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEÇÃO DE UPLOAD MELHORADA: CÂMERA E GALERIA */}
            {activeCategory && (
              <div className="mt-2.5 md:mt-3">
                {selections[activeUploadKey!] ? (
                  <div className="p-3.5 md:p-4 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-xl flex items-center justify-between shadow-sm min-h-[56px]">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] md:text-sm font-semibold text-[var(--foreground)] truncate">
                        {selections[activeUploadKey!].name}
                      </span>
                    </div>
                    <button
                      onClick={() => onSelect(activeUploadKey!, null)}
                      className="text-[11px] md:text-xs text-red-500 hover:text-red-400 font-bold ml-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md shrink-0 transition-colors active:scale-95"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {/* Botão de Câmera Direta */}
                    <div
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-4 md:p-5 border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-xl text-center cursor-pointer hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/60 transition-all active:scale-95 flex flex-col items-center justify-center min-h-[80px]"
                    >
                      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
                      <Camera className="w-6 h-6 md:w-7 md:h-7 mb-2 text-[var(--primary)] opacity-90" />
                      <span className="text-[11px] md:text-xs font-bold text-[var(--primary)]">Tirar Foto</span>
                    </div>

                    {/* Botão de Arquivo/Galeria */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 md:p-5 border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-xl text-center cursor-pointer hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/60 transition-all active:scale-95 flex flex-col items-center justify-center min-h-[80px]"
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      <UploadCloud className="w-6 h-6 md:w-7 md:h-7 mb-2 text-[var(--primary)] opacity-90" />
                      <span className="text-[11px] md:text-xs font-bold text-[var(--primary)]">Galeria</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasMaterials && (
              <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[var(--border)]">
                <p className="text-[11px] md:text-xs text-[var(--muted-foreground)] mb-1.5 font-medium">Material Predominante</p>
                <select
                  value={selections.material || ''}
                  onChange={(e) => onSelect('material', e.target.value)}
                  className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl text-[13px] md:text-sm border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all outline-none"
                >
                  <option value="" disabled>Selecione o Material</option>
                  {config.materialOptions?.map((mat) => (
                    <option key={mat.id} value={mat.id}>{mat.label}</option>
                  ))}
                </select>
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-3 md:mx-4 my-1.5 md:my-2 opacity-50" />

          {/* PASSO 2: AMBIENTAÇÃO & ADEREÇOS */}
          <SectionWrapper title="2. Ambientação & Adereços" icon={<ImageIcon />}>
            {hasScenarios && (
              <div className="flex p-0.5 md:p-1 bg-[var(--accent)] rounded-lg mb-3">
                <button onClick={() => onSelect('bgTab', 'solid')} className={`flex-1 text-[10px] md:text-xs py-1.5 rounded-md ${bgTab === 'solid' ? 'bg-[var(--card)] shadow-sm font-medium' : ''}`}>Cor Sólida</button>
                <button onClick={() => onSelect('bgTab', 'scenario')} className={`flex-1 text-[10px] md:text-xs py-1.5 rounded-md ${bgTab === 'scenario' ? 'bg-[var(--card)] shadow-sm font-medium' : ''}`}>Cenário IA</button>
              </div>
            )}

            {(!hasScenarios || bgTab === 'solid') ? (
              <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                {config.solidColors.map((color) => (
                  <button
                    key={color.name}
                    title={color.name}
                    onClick={() => { onSelect('background', color.name); onSelect('backgroundHex', color.hex); }}
                    className={`aspect-square rounded-full border shadow-sm transition-transform hover:scale-110 ${selections.background === color.name ? 'ring-2 ring-offset-2 ring-[var(--primary)] scale-110' : 'border-white/10'}`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                {config.scenarios?.map((scenario) => (
                  <button key={scenario.title} onClick={() => onSelect('background', scenario.title)} className={`text-left p-2 rounded-md border text-[10px] md:text-xs ${selections.background === scenario.title ? 'border-[var(--primary)] bg-[var(--primary)]/5 font-medium' : 'border-[var(--border)]'}`}>{scenario.title}</button>
                ))}
              </div>
            )}

            {hasProps && (
              <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[var(--border)]">
                <p className="text-[11px] md:text-xs text-[var(--muted-foreground)] mb-1.5 font-medium">Adereços de Composição</p>
                <select
                  value={selections.prop || 'none'}
                  onChange={(e) => onSelect('prop', e.target.value)}
                  className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl text-[13px] md:text-sm border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all outline-none"
                >
                  {config.propOptions?.map((prop) => (
                    <option key={prop.id} value={prop.id}>{prop.label}</option>
                  ))}
                </select>
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-3 md:mx-4 my-1.5 md:my-2 opacity-50" />

          {/* PASSO 3: EXIBIÇÃO */}
          <SectionWrapper title="3. Tipo de Exibição" icon={<BoxSelect />}>
            <div className="flex p-0.5 md:p-1 bg-[var(--accent)] rounded-lg mb-3">
              <button onClick={() => onSelect('displayTab', 'expositor')} className={`flex-1 text-[10px] md:text-xs py-1.5 rounded-md ${displayTab === 'expositor' ? 'bg-[var(--card)] shadow-sm font-medium' : ''}`}>Expositor</button>
              <button onClick={() => onSelect('displayTab', 'human')} className={`flex-1 text-[10px] md:text-xs py-1.5 rounded-md ${displayTab === 'human' ? 'bg-[var(--card)] shadow-sm font-medium' : ''}`}>Modelo</button>
            </div>

            {displayTab === 'expositor' ? (
              <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                {config.displayOptions.map((opt: any) => {
                  const isActive = selections.display === opt.label;
                  const icon = getDisplayIcon(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelect('display', opt.label)}
                      className={`relative flex flex-col items-center justify-center p-2.5 md:p-3 rounded-lg md:rounded-xl border transition-all ${isActive ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/30' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}
                    >
                      {isActive && <CheckCircle2 className="absolute top-1.5 right-1.5 w-3 h-3 text-[var(--primary)]" />}
                      <span className="text-xl md:text-2xl mb-1">{icon}</span>
                      <span className={`text-[10px] md:text-[11px] font-medium leading-tight text-center ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                {config.humanDisplayOptions.map((opt: any) => {
                  const isActive = selections.display === opt.name;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelect('display', opt.name)}
                      className={`relative flex flex-col items-center justify-center p-2 md:p-2.5 rounded-lg border transition-all text-center h-16 md:h-20
                        ${isActive
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/30'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}
                    >
                      {isActive && <CheckCircle2 className="absolute top-1 right-1 w-2.5 h-2.5 md:w-3 md:h-3 text-[var(--primary)]" />}
                      <span className={`text-[10px] md:text-[11px] font-bold leading-tight mb-0.5 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                        {opt.name}
                      </span>
                      {opt.type && (
                        <span className="text-[8px] md:text-[9px] opacity-60 leading-tight line-clamp-2">
                          {opt.type}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-3 md:mx-4 my-1.5 md:my-2 opacity-50" />

          {/* PASSO 4: ASSINATURA VISUAL */}
          <SectionWrapper title="4. Assinatura Visual" icon={<TypeIcon />}>
            <div className="space-y-2.5 md:space-y-3">
              <Input placeholder="Ex: Coleção Verão" value={selections.text || ''} onChange={(e) => onSelect('text', e.target.value)} className="bg-[var(--accent)] text-[var(--foreground)] h-8 md:h-9 border-none text-xs md:text-sm" />

              <select value={selections.typography || ''} onChange={(e) => onSelect('typography', e.target.value)} className="w-full h-8 md:h-9 px-2 md:px-3 rounded-md text-xs md:text-sm border bg-[var(--background)] text-[var(--foreground)]">
                <option value="" disabled>Escolha a Fonte</option>
                {config.typographyOptions.map((font) => <option key={font.label} value={font.label}>{font.label}</option>)}
              </select>

              {selections.text && (
                <div className="pt-2 flex flex-col gap-3">
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-1">
                      <p className="text-[10px] md:text-[11px] text-[var(--muted-foreground)] mb-1.5 font-medium">Tamanho</p>
                      <div className="flex w-full bg-[var(--background)] border border-[var(--border)] rounded-md overflow-hidden h-7 md:h-8">
                        {config.textSizeOptions?.map(size => {
                          const isActive = selections.textSize === size.id || (!selections.textSize && size.id === 'medium');
                          return (
                            <button
                              key={size.id}
                              onClick={() => onSelect('textSize', size.id)}
                              className={`flex-1 flex items-center justify-center text-[10px] transition-colors ${isActive ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold' : 'hover:bg-[var(--accent)] text-[var(--foreground)]'}`}
                            >
                              {size.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <p className="text-[10px] md:text-[11px] text-[var(--muted-foreground)] mb-1.5 font-medium">Cor da Letra</p>
                      <div className="flex items-center gap-1.5 md:gap-2 h-7 md:h-8">
                        {config.textColorOptions?.map(color => {
                          const isActive = selections.textColor === color.id || (!selections.textColor && color.id === 'white');
                          return (
                            <button
                              key={color.id}
                              title={color.label}
                              onClick={() => onSelect('textColor', color.id)}
                              className={`w-5 h-5 md:w-6 md:h-6 rounded-full border shadow-sm transition-all ${isActive ? 'ring-2 ring-offset-1 ring-[var(--primary)] scale-110' : 'border-gray-500/30 hover:scale-110'}`}
                              style={{ backgroundColor: color.hex }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] md:text-[11px] text-[var(--muted-foreground)] mb-1.5 font-medium flex items-center gap-1">
                      <AlignVerticalSpaceAround className="w-3 h-3 md:w-3.5 md:h-3.5" /> Posição na Imagem
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                      {config.textPositionOptions?.map((pos: any) => (
                        <button key={pos.id} onClick={() => onSelect('textPosition', pos.id)} className={`flex flex-col items-center p-1.5 md:p-2 rounded-md border transition-all ${selections.textPosition === pos.id ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/30' : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}>
                          <div className={`w-full aspect-square mb-1 border border-dashed rounded flex p-1 ${pos.gridClass} ${selections.textPosition === pos.id ? 'border-[var(--primary)]/50 bg-[var(--primary)]/10' : 'border-[var(--border)]'}`}>
                            <div className={`h-1 w-4 md:h-1.5 md:w-5 rounded-sm ${selections.textPosition === pos.id ? 'bg-[var(--primary)]' : 'bg-[var(--foreground)]/30'}`} />
                          </div>
                          <span className={`text-[9px] md:text-[10px] font-medium leading-none ${selections.textPosition === pos.id ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>{pos.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionWrapper>

          <Separator className="mx-3 md:mx-4 my-1.5 md:my-2 opacity-50" />

          {/* PASSO 5: FORMATO DE SAÍDA */}
          <SectionWrapper title="5. Formato de Saída" icon={<Maximize2 />}>
            <div className="grid grid-cols-2 gap-1.5 md:gap-2">
              {config.formats.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => onSelect('format', fmt.ratio)}
                  className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl border transition-all text-center
                    ${selections.format === fmt.ratio
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50'}`}
                >
                  <span className="font-bold text-xs md:text-[13px] mb-0.5 text-[var(--foreground)]">{fmt.ratio}</span>
                  <span className="text-[10px] md:text-[11px] font-medium mb-1">{fmt.label}</span>
                  <span className="text-[8px] md:text-[9px] opacity-50 hidden md:block">{fmt.pixels}</span>
                </button>
              ))}
            </div>
          </SectionWrapper>

        </div>
      </div>
    </div>
  );
}