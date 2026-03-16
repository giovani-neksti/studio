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

function SectionWrapper({ title, icon, defaultOpen = true, children }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--accent)] rounded-lg transition-colors duration-150">
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
  const bgTab = selections.bgTab || 'solid';
  const displayTab = selections.displayTab || 'expositor';
  const activeCategory = selections.category;
  const activeUploadKey = activeCategory ? `upload_${activeCategory}` : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadKey) {
      onSelect(activeUploadKey, e.target.files[0]);
    }
  };

  return (
    <aside className="h-full flex flex-col bg-[var(--card)] border-r border-[var(--border)]">
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
          <SectionWrapper title="1. Produtos & Categorias" icon={<Layers className="w-4 h-4" />}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {config.categories.slice(0, 4).map((cat) => {
                  const uploadKey = `upload_${cat}`;
                  const hasUpload = !!selections[uploadKey];
                  const isActive = selections.category === cat;
                  return (
                    <div key={cat} className={`flex flex-col border rounded-xl overflow-hidden transition-all ${isActive ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/20' : 'border-[var(--border)]'}`}>
                      <button onClick={() => onSelect('category', cat)} className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors text-left ${isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)]'}`}>
                        <div className="flex items-center gap-2">
                          {hasUpload ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-dashed border-current opacity-40" />}
                          {cat}
                        </div>
                      </button>
                      {isActive && (
                        <div className="p-3 bg-[var(--background)]">
                          <div onClick={() => fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${hasUpload ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'}`}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            <span className="text-xs">{hasUpload ? selections[uploadKey]?.name : 'Fazer Upload'}</span>
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

          <SectionWrapper title="2. Ambientação" icon={<ImageIcon className="w-4 h-4" />}>
            <div className="flex p-1 bg-[var(--accent)] rounded-lg mb-4">
              <button onClick={() => onSelect('bgTab', 'solid')} className={`flex-1 text-xs py-1.5 rounded-md ${bgTab === 'solid' ? 'bg-[var(--card)]' : ''}`}>Cor Sólida</button>
              <button onClick={() => onSelect('bgTab', 'scenario')} className={`flex-1 text-xs py-1.5 rounded-md ${bgTab === 'scenario' ? 'bg-[var(--card)]' : ''}`}>Cenário IA</button>
            </div>
            {bgTab === 'solid' ? (
              <div className="grid grid-cols-5 gap-2">
                {config.solidColors.map((color) => (
                  <button key={color.name} onClick={() => { onSelect('background', color.name); onSelect('backgroundHex', color.hex); }} className="aspect-square rounded-full border border-white/10" style={{ backgroundColor: color.hex }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {config.scenarios.map((scenario) => (
                  <button key={scenario.title} onClick={() => onSelect('background', scenario.title)} className={`text-left p-2 rounded-lg border text-xs ${selections.background === scenario.title ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                    {scenario.title}
                  </button>
                ))}
              </div>
            )}
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          <SectionWrapper title="3. Tipo de Exibição" icon={<BoxSelect className="w-4 h-4" />}>
            <div className="flex p-1 bg-[var(--accent)] rounded-lg mb-4">
              <button onClick={() => onSelect('displayTab', 'expositor')} className={`flex-1 text-xs py-1.5 rounded-md ${displayTab === 'expositor' ? 'bg-[var(--card)]' : ''}`}>Expositor</button>
              <button onClick={() => onSelect('displayTab', 'human')} className={`flex-1 text-xs py-1.5 rounded-md ${displayTab === 'human' ? 'bg-[var(--card)]' : ''}`}>Modelo</button>
            </div>
            <div className="space-y-2">
              {(displayTab === 'expositor' ? config.displayOptions : config.humanDisplayOptions).map((opt: any) => (
                <button key={opt.id} onClick={() => onSelect('display', opt.label || opt.name)} className={`w-full text-left px-3 py-2 rounded-lg text-sm border ${selections.display === (opt.label || opt.name) ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'}`}>
                  <div className="flex justify-between items-center">
                    <span>{opt.label || opt.name}</span>
                    {selections.display === (opt.label || opt.name) && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                  </div>
                  <p className="text-[10px] opacity-50">{opt.type || ''}</p>
                </button>
              ))}
            </div>
          </SectionWrapper>

          <Separator className="mx-4 my-2 opacity-50" />

          <SectionWrapper title="4. Assinatura Visual" icon={<Type className="w-4 h-4" />}>
            <Input placeholder="Texto Principal" value={selections.text || ''} onChange={(e) => onSelect('text', e.target.value)} className="mb-2" />
            <select value={selections.typography || ''} onChange={(e) => onSelect('typography', e.target.value)} className="w-full h-9 px-3 rounded-md text-sm border bg-transparent">
              <option value="" disabled>Escolha a Fonte</option>
              {config.typographyOptions.map((font) => <option key={font.label} value={font.label}>{font.label}</option>)}
            </select>
          </SectionWrapper>
        </div>
      </ScrollArea>
    </aside>
  );
}