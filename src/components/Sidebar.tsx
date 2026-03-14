'use client';

import { useState, useRef } from 'react';
import { NicheConfig } from '@/lib/niche-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Maximize2,
  Type,
  UploadCloud,
  CheckCircle2,
  BoxSelect,
  Shirt,
} from 'lucide-react';

interface SidebarProps {
  config: NicheConfig;
  niche: string;
  selections: Record<string, any>;
  onSelect: (key: string, value: any) => void;
}

// Collapsible Section Wrapper
function SectionWrapper({ title, icon, defaultOpen = true, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--accent)] rounded-lg transition-colors duration-150"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--primary)] opacity-70">{icon}</span>
          <span className="text-sm font-semibold text-[var(--foreground)] opacity-90 tracking-wide">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

export function Sidebar({ config, niche, selections, onSelect }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local UI states for Tabs
  const bgTab = selections.bgTab || 'solid'; // 'solid' | 'scenario'
  const displayTab = selections.displayTab || 'expositor'; // 'expositor' | 'human'
  
  // Gets the current category's upload state
  const activeCategory = selections.category;
  const activeUploadKey = activeCategory ? `upload_${activeCategory}` : null;
  const activeUpload = activeUploadKey ? selections[activeUploadKey] : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadKey) {
      onSelect(activeUploadKey, e.target.files[0]); // Store the actual File object
    }
  };

  return (
    <aside className="h-full flex flex-col bg-[var(--card)] border-r border-[var(--border)]">
      {/* Sidebar Header */}
      <div className="px-5 py-5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h2 className="text-[var(--foreground)] font-bold text-base leading-tight">Composição — {config.label}</h2>
            <p className="text-[var(--muted-foreground)] text-xs mt-0.5">Construa a cena passo a passo</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="py-3">

          {/* PASSO 1: UPLOAD E CATEGORIA (MULTI-UPLOAD LOGIC) */}
          <SectionWrapper title="1. Produtos & Categorias" icon={<Layers className="w-4 h-4" />}>
            <div className="space-y-3">
              <p className="text-xs text-[var(--muted-foreground)]">Selecione uma categoria para fazer o upload da peça correspondente.</p>
              
              <div className="grid grid-cols-1 gap-2">
                {config.categories.slice(0, 4).map((cat) => {
                  const uploadKey = `upload_${cat}`;
                  const hasUpload = !!selections[uploadKey];
                  const isActive = selections.category === cat;
                  
                  return (
                    <div key={cat} className={`flex flex-col border rounded-xl overflow-hidden transition-all ${isActive ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/20' : 'border-[var(--border)]'}`}>
                      {/* Accordion Header */}
                      <button
                        onClick={() => onSelect('category', cat)}
                        className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors text-left
                          ${isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)]'}`}
                      >
                        <div className="flex items-center gap-2">
                          {hasUpload ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-dashed border-current opacity-40" />}
                          {cat}
                        </div>
                        {hasUpload && <span className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">Salvo</span>}
                      </button>

                      {/* Accordion Content (Dropzone) */}
                      {isActive && (
                        <div className="p-3 bg-[var(--background)] animate-in slide-in-from-top-2 duration-200">
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                              ${hasUpload 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10' 
                                : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent)]'}
                            `}
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                            
                            {hasUpload ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <ImageIcon className="w-5 h-5 text-[var(--primary)]" />
                                <span className="text-sm font-semibold text-[var(--primary)] truncate w-full px-2">{selections[uploadKey]?.name || 'Imagem.png'}</span>
                                <span className="text-[11px] text-[var(--muted-foreground)]">Clique para alterar a imagem</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <UploadCloud className="w-5 h-5 text-[var(--muted-foreground)] mb-1" />
                                <span className="text-sm font-medium text-[var(--foreground)]">Upload ({cat})</span>
                                <span className="text-[10px] text-[var(--muted-foreground)] px-2 leading-tight">Para um resultado perfeito, envie imagens PNG com fundo transparente.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 2: FUNDO / CENÁRIO */}
          <SectionWrapper title="2. Ambientação" icon={<ImageIcon className="w-4 h-4" />}>
            <div className="flex p-1 bg-[var(--accent)] rounded-lg mb-4">
              <button 
                onClick={() => onSelect('bgTab', 'solid')}
                className={`flex-1 text-xs py-1.5 font-medium tracking-wide rounded-md transition-all
                  ${bgTab === 'solid' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
              >
                Cor Sólida
              </button>
              <button 
                onClick={() => onSelect('bgTab', 'scenario')}
                className={`flex-1 text-xs py-1.5 font-medium tracking-wide rounded-md transition-all
                  ${bgTab === 'scenario' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
              >
                Cenário IA
              </button>
            </div>

            {bgTab === 'solid' ? (
              <div className="grid grid-cols-5 gap-2">
                {config.solidColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => { onSelect('background', color.name); onSelect('backgroundHex', color.hex); }}
                    title={color.name}
                    className={`aspect-square rounded-full flex items-center justify-center transition-all
                      ${selections.background === color.name ? 'ring-2 ring-offset-2 ring-offset-[var(--card)] ring-[var(--primary)] scale-110' : 'hover:scale-105 border border-white/10'}
                    `}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selections.background === color.name && (
                      <CheckCircle2 className={`w-4 h-4 ${color.hex === '#FFFFFF' || color.hex === '#F8F9FA' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {config.scenarios.map((scenario) => (
                  <button
                    key={scenario.title}
                    onClick={() => onSelect('background', scenario.title)}
                    className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between h-full min-h-[80px]
                      ${selections.background === scenario.title 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/30' 
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50 bg-[var(--card)]'}
                    `}
                  >
                    <div className={`font-semibold text-xs leading-tight mb-1 ${selections.background === scenario.title ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                      {scenario.title}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)] leading-tight line-clamp-3">{scenario.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 3: EXIBIÇÃO / MODELO */}
          <SectionWrapper title="3. Tipo de Exibição" icon={<BoxSelect className="w-4 h-4" />}>
            <div className="flex p-1 bg-[var(--accent)] rounded-lg mb-4">
              <button 
                onClick={() => onSelect('displayTab', 'expositor')}
                className={`flex-1 text-xs py-1.5 font-medium tracking-wide rounded-md transition-all flex items-center justify-center gap-1.5
                  ${displayTab === 'expositor' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}
              >
                <BoxSelect className="w-3.5 h-3.5" /> Expositor
              </button>
              <button 
                onClick={() => onSelect('displayTab', 'human')}
                className={`flex-1 text-xs py-1.5 font-medium tracking-wide rounded-md transition-all flex items-center justify-center gap-1.5
                  ${displayTab === 'human' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}
              >
                <Shirt className="w-3.5 h-3.5" /> Modelo Humano
              </button>
            </div>

            {displayTab === 'expositor' ? (
              <div className="space-y-2">
                {config.displayOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSelect('display', opt.label)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border
                      ${selections.display === opt.label 
                        ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5 font-semibold' 
                        : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]/50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {config.humanDisplayOptions.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onSelect('display', model.name)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0 text-left
                      ${selections.display === model.name 
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-lg scale-[1.02]' 
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50 opacity-80 hover:opacity-100 hover:scale-[1.01]'}`}
                  >
                    <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                      <span className="text-white font-bold text-sm drop-shadow-md">{model.name}</span>
                      <span className="text-white/80 text-[10px] leading-tight drop-shadow-sm line-clamp-1">{model.type}</span>
                    </div>
                    {selections.display === model.name && (
                      <div className="absolute top-2 right-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full p-0.5 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 4: TEXTO E TIPOGRAFIA (LADO A LADO) */}
          <SectionWrapper title="4. Assinatura Visual (Opcional)" icon={<Type className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Texto Principal</label>
                <Input 
                  placeholder="Ex: Lançamento" 
                  value={selections.text || ''}
                  onChange={(e) => onSelect('text', e.target.value)}
                  className="h-9 text-sm text-[var(--foreground)] bg-[var(--background)] border-[var(--border)] focus-visible:ring-1"
                  style={{ '--ring': 'var(--primary)' } as any}
                />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider px-1">Tipografia</label>
                 <select 
                    value={selections.typography || ''}
                    onChange={(e) => onSelect('typography', e.target.value)}
                    disabled={!selections.text}
                    className="w-full h-9 px-3 rounded-md text-sm border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                 >
                    <option value="" disabled>Escolha a Fonte</option>
                    {config.typographyOptions.map((font) => (
                      <option key={font.label} value={font.label} className={font.class}>{font.label}</option>
                    ))}
                 </select>
              </div>
            </div>
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          {/* PASSO 5: FORMATO (DETALHADO) */}
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
                  <span className={`text-[11px] font-medium leading-tight mb-1 ${selections.format === fmt.ratio ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{fmt.label}</span>
                  <span className="text-[9px] text-[var(--foreground)] opacity-60 leading-tight">{fmt.pixels}</span>
                  <span className="text-[9px] text-[var(--foreground)] opacity-50 leading-tight">{fmt.social}</span>
                </button>
              ))}
            </div>
          </SectionWrapper>

          {/* Selected Summary */}
          {Object.keys(selections).some(k => k.startsWith('upload_')) && selections.background && selections.display && (
            <div className="mx-4 mt-6 p-4 rounded-xl bg-[var(--niche-glow,rgba(255,255,255,0.04))] border border-[var(--primary)]/30 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                <p className="text-xs text-[var(--foreground)] font-bold uppercase tracking-wider">Composição Pronta</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(selections).filter(k => k.startsWith('upload_')).map(k => {
                  const fileName = selections[k]?.name || '';
                  return (
                    <Badge key={k} variant="outline" className="text-[10px] border-[var(--primary)]/50 text-[var(--primary)] bg-[var(--primary)]/10">
                      {k.split('_')[1]}: {fileName.length > 15 ? fileName.substring(0, 15) + '...' : fileName}
                    </Badge>
                  );
                })}
                <Badge variant="outline" className="text-[10px] border-[var(--primary)]/30 text-[var(--foreground)] bg-[var(--background)]">Fundo: {selections.background.split(' ')[0]}</Badge>
                <Badge variant="outline" className="text-[10px] border-[var(--primary)]/30 text-[var(--foreground)] bg-[var(--background)]">Exibição: {selections.display.split(' ')[0]}</Badge>
              </div>
            </div>
          )}

          <div className="h-8" />
        </div>
      </ScrollArea>
    </aside>
  );
}
