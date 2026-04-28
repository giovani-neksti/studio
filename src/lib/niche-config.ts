// Configuration for the Composition Paradigm (Fotografia de Produto assistida por IA)

export type NicheKey = 'jewelry';

export interface DisplayOption {
  id: string;
  label: string;
}

export interface HumanModelOption {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
}

export interface FormatOption {
  id: string;
  label: string;
  ratio: string;
  pixels: string;
  social: string;
}

export interface TextPositionOption {
  id: string;
  label: string;
  gridClass: string;
}

export interface TextColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface TextSizeOption {
  id: string;
  label: string;
}

export interface PropOption {
  id: string;
  label: string;
}

export interface NicheConfig {
  label: string;
  themeClass: string;
  icon: string;
  tagline: string;
  categories: string[];
  propOptions?: PropOption[];
  solidColors: { name: string; hex: string }[];
  scenarios: { title: string; desc: string }[];
  displayOptions: DisplayOption[];
  humanDisplayOptions: HumanModelOption[];
  typographyOptions: { label: string; class: string }[];
  textPositionOptions: TextPositionOption[];
  textColorOptions: TextColorOption[];
  textSizeOptions: TextSizeOption[];
  formats: FormatOption[];
}

const sharedFormats: FormatOption[] = [
  { id: 'square', label: 'Feed Quadrado', ratio: '1:1', pixels: '1080x1080', social: 'Instagram / Facebook' },
  { id: 'portrait', label: 'Post Retrato', ratio: '4:5', pixels: '1080x1350', social: 'Instagram Feed' },
  { id: 'story', label: 'Story / Reels', ratio: '9:16', pixels: '1080x1920', social: 'Stories / TikTok' },
  { id: 'landscape', label: 'Banner Horizontal', ratio: '1.91:1', pixels: '1200x628', social: 'LinkedIn / Site' }
];

const sharedTypography = [
  { label: 'Sem Texto', class: '' },
  { label: 'Playfair (Elegante)', class: 'font-serif' },
  { label: 'Didot (Alta Costura)', class: 'font-serif' },
  { label: 'Cinzel (Clássica)', class: 'font-serif' },
  { label: 'Montserrat (Minimalista)', class: 'font-sans' },
  { label: 'Inter (Moderna)', class: 'font-sans uppercase tracking-widest' },
  { label: 'Cormorant (Script)', class: 'font-serif italic' },
  { label: 'Impact (Display)', class: 'font-sans font-black' }
];

const sharedTextPosition: TextPositionOption[] = [
  { id: 'top', label: 'Superior', gridClass: 'items-start justify-center' },
  { id: 'center', label: 'Centro', gridClass: 'items-center justify-center' },
  { id: 'bottom', label: 'Inferior', gridClass: 'items-end justify-center' },
];

const sharedTextColors: TextColorOption[] = [
  { id: 'white', label: 'Branco', hex: '#FFFFFF' },
  { id: 'black', label: 'Preto', hex: '#000000' },
  { id: 'gold', label: 'Dourado', hex: '#D4AF37' },
  { id: 'silver', label: 'Prata', hex: '#C0C0C0' },
  { id: 'rose_gold', label: 'Ouro Rosa', hex: '#B76E79' }
];

const sharedTextSizes: TextSizeOption[] = [
  { id: 'small', label: 'Pequena' },
  { id: 'medium', label: 'Média' },
  { id: 'large', label: 'Grande' }
];

export const nicheConfigs: Record<NicheKey, NicheConfig> = {
  jewelry: {
    label: 'Joalheria',
    themeClass: 'theme-jewelry',
    icon: '💎',
    tagline: 'Componha cenários de luxo ao redor das suas joias',
    categories: ['Colar', 'Brinco', 'Anel', 'Pulseira', 'Tiara', 'Broche', 'Pingente', 'Bracelete Pandora'],

    propOptions: [
      { id: 'none', label: 'Sem Adereços (Apenas Fundo)' },
      { id: 'water_drops', label: 'Gotas de Água Fresca' },
      { id: 'orchid_petal', label: 'Pétala de Orquídea Branca' },
      { id: 'raw_quartz', label: 'Pedra de Quartzo Bruto' },
      { id: 'gold_bokeh', label: 'Pó de Ouro Desfocado' }
    ],

    solidColors: [
      { name: 'Preto Veludo', hex: '#111111' },
      { name: 'Branco Neve', hex: '#FFFFFF' },
      { name: 'Cinza Platina', hex: '#D2D2D2' },
      { name: 'Champagne', hex: '#EBE1D5' },
      { name: 'Caoba Profundo', hex: '#4A2A22' },
      { name: 'Verde Musgo', hex: '#2A3B2A' },
      { name: 'Vermelho Bordô', hex: '#4A0E17' },
      { name: 'Azul Petróleo', hex: '#1D3F49' },
      { name: 'Verde Esmeralda', hex: '#0B3B24' },
      { name: 'Azul Safira', hex: '#0A1C40' },
      { name: 'Rosa Pó', hex: '#F2D8D8' },
      { name: 'Terracota', hex: '#A44C3A' },
      { name: 'Roxo Berinjela', hex: '#3B1A3A' },
      { name: 'Cinza Chumbo', hex: '#2C3033' },
      { name: 'Nude Areia', hex: '#D4C4B7' },
      { name: 'Marrom Chocolate', hex: '#3D2314' },
      { name: 'Azul Gelo', hex: '#D4E4E6' },
      { name: 'Ouro Velho', hex: '#C8B582' },
      { name: 'Lavanda Escuro', hex: '#5C4D5C' },
      { name: 'Verde Oliva', hex: '#555D3B' },
    ],
    scenarios: [],

    // NOVO: Adicionado "Mão de Veludo" (Total 8 Itens para grelha 2x4)
    displayOptions: [
      { id: 'bust', label: 'Busto de Veludo (Colar)' },
      { id: 'box', label: 'Caixa de Joia Premium' },
      { id: 'pedestal', label: 'Pedestal em Mármore' },
      { id: 'cone', label: 'Expositor de Anel (Cone)' },
      { id: 'velvet_hand', label: 'Mão de Veludo (Anel)' },
      { id: 'cushion', label: 'Almofada de Cetim' },
      { id: 'surface', label: 'Sem Expositor (Surface)' },
      { id: 'floating', label: 'Levitação 3D' },
    ],
    humanDisplayOptions: [
      { id: 'model_helena', name: 'Helena', type: 'Padrão / Caucasiana', imageUrl: 'https://images.unsplash.com/photo-1542596594-649edbc13630?w=400&q=80' },
      { id: 'model_zara', name: 'Zara', type: 'Negra / Sofisticada', imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfd8c?w=400&q=80' },
      { id: 'model_lin', name: 'Lin', type: 'Oriental / Delicada', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80' },
      { id: 'model_maya', name: 'Maya', type: 'Indiana / Expressiva', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' },
      { id: 'model_valentina', name: 'Valentina', type: 'Ruiva / Editorial', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
      { id: 'model_close_neck', name: 'Close Pescoço', type: 'Foco no Colar', imageUrl: 'https://images.unsplash.com/photo-1599643478514-46bfa3321526?w=400&q=80' },
      { id: 'model_close_hand', name: 'Mão / Manicure', type: 'Foco no Anel', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=400&q=80' },
      { id: 'model_close_wrist', name: 'Pulso', type: 'Pulseira', imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
      { id: 'model_close_ear', name: 'Perfil / Orelha', type: 'Foco no Brinco', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' }
    ],
    typographyOptions: sharedTypography,
    textPositionOptions: sharedTextPosition,
    textColorOptions: sharedTextColors,
    textSizeOptions: sharedTextSizes,
    formats: sharedFormats,
  },
};

export function getNicheConfig(niche: string | null): NicheConfig {
  if (niche && niche in nicheConfigs) {
    return nicheConfigs[niche as NicheKey];
  }
  return nicheConfigs.jewelry; // default fallback
}