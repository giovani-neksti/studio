'use client';

import { useState, useRef, useEffect } from 'react';
import { NicheConfig } from '@/lib/niche-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Maximize2,
  Type,
  CheckCircle2,
  BoxSelect,
  AlignVerticalSpaceAround
} from 'lucide-react';

interface SidebarProps {
  config: NicheConfig;
  niche: string;
  selections: Record<string, any>;
  onSelect: (key: string, value: any) => void;
}

function SectionWrapper({ title, icon, defaultOpen = true, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--accent)] rounded-lg transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--primary)] opacity-70">{icon}</span>
          <span className="text-sm font-semibold text-[var(--foreground)] opacity-90 tracking-wide">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

export function Sidebar({ config, niche, selections, onSelect }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgTab = selections.bgTab || 'solid';
  const displayTab = selections.displayTab || 'expositor';
  const activeCategory = selections.category;
  const activeUploadKey = activeCategory ? `upload_${activeCategory}` : null;

  useEffect(() => {
    if (selections.text && !selections.textPosition) {
      onSelect('textPosition', 'bottom');
    }
  }, [selections.text]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadKey) {
      onSelect(activeUploadKey, e.target.files[0]);
    }
  };

  const hasScenarios = config.scenarios && config.scenarios.length > 0;
  const hasMaterials = config.materialOptions && config.materialOptions.length > 0;

  return (
    <aside className="h-full flex flex-col bg-[var(--card)] border-r border-[var(--border)]">
      <div className="px-5 py-5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <h2 className="text-[var(--foreground)] font-bold text-base leading-tight">Composição — {config.label}</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="py-3">
          {/* PASSO 1: CATEGORIA E NOVO CAMPO MATERIAL */}
          <SectionWrapper title="1. Produtos & Categorias" icon={<Layers className="w-4 h-4" />}>
            <div className="grid grid-cols-1 gap-2">
              {config.categories.map((cat) => {
                const uploadKey = `upload_${cat}`;
                const hasUpload = !!selections[uploadKey];
                const isActive = selections.category === cat;
                return (
                  <div key={cat} className={`flex flex-col border rounded-xl overflow-hidden ${isActive ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                    <button onClick={() => onSelect('category', cat)} className={`px-3 py-2.5 text-sm flex items-center justify-between ${isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : ''}`}>
                      <div className="flex items-center gap-2">
                        {hasUpload ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-dashed opacity-40" />}
                        {cat}
                      </div>
                    </button>
                    {isActive && (
                      <div className="p-3 bg-[var(--background)]">
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer">
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                          <span className="text-xs truncate block">{hasUpload ? selections[uploadKey]?.name : 'Fazer Upload'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SELETOR DE MATERIAL */}
            {hasMaterials && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)] mb-2 font-medium">
                  Material Predominante
                </p>
                <select
                  value={selections.material || ''}
                  onChange={(e) => onSelect('material', e.target.value)}
                  className="w-full h-9 px-3 rounded-md text-sm border bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="" disabled>Selecione o Material</option>
                  {config.materialOptions?.map((mat) => (
                    <option key={mat.id} value={mat.id}>{mat.label}</option>
                  ))}
                </select>
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 2: AMBIENTAÇÃO */}
          <SectionWrapper title="2. Fundo (Cor Sólida)" icon={<ImageIcon className="w-4 h-4" />}>
            {hasScenarios && (
              <div className="flex p-1 bg-[var(--accent)] rounded-lg mb-4">
                <button onClick={() => onSelect('bgTab', 'solid')} className={`flex-1 text-xs py-1.5 rounded-md ${bgTab === 'solid' ? 'bg-[var(--card)] shadow-sm' : ''}`}>Cor Sólida</button>
                <button onClick={() => onSelect('bgTab', 'scenario')} className={`flex-1 text-xs py-1.5 rounded-md ${bgTab === 'scenario' ? 'bg-[var(--card)] shadow-sm' : ''}`}>Cenário IA</button>
              </div>
            )}

            {(!hasScenarios || bgTab === 'solid') ? (
              <div className="grid grid-cols-5 gap-2">
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
              <div className="grid grid-cols-2 gap-2">
                {config.scenarios?.map((scenario) => (
                  <button key={scenario.title} onClick={() => onSelect('background', scenario.title)} className={`text-left p-2 rounded-lg border text-xs ${selections.background === scenario.title ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'}`}>{scenario.title}</button>
                ))}
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 3: TIPO DE EXIBIÇÃO */}
          <SectionWrapper title="3. Tipo de Exibição" icon={<BoxSelect className="w-4 h-4" />}>
            <div className="flex p-1 bg-[var(--accent)] rounded-lg mb-4">
              <button onClick={() => onSelect('displayTab', 'expositor')} className={`flex-1 text-xs py-1.5 rounded-md ${displayTab === 'expositor' ? 'bg-[var(--card)] shadow-sm' : ''}`}>Expositor</button>
              <button onClick={() => onSelect('displayTab', 'human')} className={`flex-1 text-xs py-1.5 rounded-md ${displayTab === 'human' ? 'bg-[var(--card)] shadow-sm' : ''}`}>Modelo</button>
            </div>
            <div className="space-y-2">
              {(displayTab === 'expositor' ? config.displayOptions : config.humanDisplayOptions).map((opt: any) => (
                <button key={opt.id} onClick={() => onSelect('display', opt.label || opt.name)} className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${selections.display === (opt.label || opt.name) ? 'border-[var(--primary)] bg-[var(--primary)]/5 font-semibold' : 'border-[var(--border)]'}`}>
                  <div className="flex justify-between items-center">
                    <span>{opt.label || opt.name}</span>
                    {selections.display === (opt.label || opt.name) && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                  </div>
                  <p className="text-[10px] opacity-50 font-normal mt-0.5">{opt.type || ''}</p>
                </button>
              ))}
            </div>
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 4: ASSINATURA VISUAL */}
          <SectionWrapper title="4. Assinatura Visual" icon={<Type className="w-4 h-4" />}>
            <div className="space-y-3">
              <Input placeholder="Ex: Coleção Verão" value={selections.text || ''} onChange={(e) => onSelect('text', e.target.value)} className="bg-[#eef2ff] text-black h-9 border-none" />

              <select value={selections.typography || ''} onChange={(e) => onSelect('typography', e.target.value)} className="w-full h-9 px-3 rounded-md text-sm border bg-[var(--background)] text-[var(--foreground)]">
                <option value="" disabled>Escolha a Fonte</option>
                {config.typographyOptions.map((font) => <option key={font.label} value={font.label}>{font.label}</option>)}
              </select>

              {selections.text && (
                <div className="pt-2">
                  <p className="text-xs text-[var(--muted-foreground)] mb-2 font-medium flex items-center gap-1.5">
                    <AlignVerticalSpaceAround className="w-3.5 h-3.5" /> Posição do Texto
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {config.textPositionOptions?.map((pos: any) => (
                      <button
                        key={pos.id}
                        onClick={() => onSelect('textPosition', pos.id)}
                        className={`flex flex-col items-center p-2 rounded-lg border transition-all
                          ${selections.textPosition === pos.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/30'
                            : 'border-[var(--border)] hover:border-[var(--primary)]/50'}`}
                      >
                        <div className={`w-full aspect-square mb-1.5 border border-dashed rounded flex p-1 ${pos.gridClass} ${selections.textPosition === pos.id ? 'border-[var(--primary)]/50 bg-[var(--primary)]/10' : 'border-[var(--border)]'}`}>
                          <div className={`h-1.5 w-6 rounded-sm ${selections.textPosition === pos.id ? 'bg-[var(--primary)]' : 'bg-[var(--foreground)]/30'}`} />
                        </div>
                        <span className={`text-[10px] font-medium leading-none ${selections.textPosition === pos.id ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>{pos.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 5: FORMATO DE SAÍDA */}
          <SectionWrapper title="5. Formato de Saída" icon={<Maximize2 className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-2">
              {config.formats.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => onSelect('format', fmt.ratio)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center
                    ${selections.format === fmt.ratio
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50'}`}
                >
                  <span className="font-bold text-[13px] mb-[2px] text-[var(--foreground)]">{fmt.ratio}</span>
                  <span className="text-[11px] font-medium mb-1">{fmt.label}</span>
                  <span className="text-[9px] opacity-50">{fmt.pixels}</span>
                </button>
              ))}
            </div>
          </SectionWrapper>
          <div className="h-8" />
        </div>
      </ScrollArea>
    </aside>
  );
}