// Configuration for the Composition Paradigm (Fotografia de Produto assistida por IA)

export type NicheKey = 'jewelry' | 'clothing' | 'shoes';

export interface DisplayOption {
  id: string;
  label: string;
}

export interface HumanModelOption {
  id: string;
  name: string;
  type: string;
  imageUrl: string; // Used for the visual grid
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
  gridClass: string; // Used to style the visual square indicator
}

export interface NicheConfig {
  label: string;
  themeClass: string;
  icon: string;
  tagline: string;
  categories: string[];
  solidColors: { name: string; hex: string }[];
  scenarios: { title: string; desc: string }[];
  displayOptions: DisplayOption[];
  humanDisplayOptions: HumanModelOption[];
  typographyOptions: { label: string; class: string }[];
  textPositionOptions: TextPositionOption[];
  formats: FormatOption[];
}

// Fixed shared options
const sharedFormats: FormatOption[] = [
  { id: 'square', label: 'Feed Quadrado', ratio: '1:1', pixels: '1080x1080', social: 'Instagram / Facebook' },
  { id: 'portrait', label: 'Post Retrato', ratio: '4:5', pixels: '1080x1350', social: 'Instagram Feed' },
  { id: 'story', label: 'Story / Reels', ratio: '9:16', pixels: '1080x1920', social: 'Stories / TikTok' },
  { id: 'landscape', label: 'Banner Horizontal', ratio: '1.91:1', pixels: '1200x628', social: 'LinkedIn / Site' }
];

const sharedTypography = [
  { label: 'Sem Texto', class: '' },
  { label: 'Playfair (Elegante)', class: 'font-serif' },
  { label: 'Inter (Moderna)', class: 'font-sans uppercase tracking-widest' },
  { label: 'Cormorant (Script)', class: 'font-serif italic' },
  { label: 'Impact (Display)', class: 'font-sans font-black' }
];

const sharedTextPosition: TextPositionOption[] = [
  { id: 'top', label: 'Superior', gridClass: 'items-start justify-center' },
  { id: 'center', label: 'Centro', gridClass: 'items-center justify-center' },
  { id: 'bottom', label: 'Inferior', gridClass: 'items-end justify-center' },
];

export const nicheConfigs: Record<NicheKey, NicheConfig> = {
  jewelry: {
    label: 'Joalheria',
    themeClass: 'theme-jewelry',
    icon: '💎',
    tagline: 'Componha cenários de luxo ao redor das suas joias',
    categories: ['Colar', 'Brinco', 'Anel', 'Pulseira', 'Relógio', 'Broche', 'Pingente'],

    // 20 CORES PREMIUM DE MOSTRUÁRIO
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
    scenarios: [], // Removido como pedido

    displayOptions: [
      { id: 'bust', label: 'Busto de Veludo (Colar)' },
      { id: 'box', label: 'Caixa de Joia Premium' },
      { id: 'pedestal', label: 'Pedestal em Mármore' },
      { id: 'cone', label: 'Expositor de Anel (Cone)' },
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
      { id: 'model_close_neck', name: 'Close', type: 'Foco no Pescoço', imageUrl: 'https://images.unsplash.com/photo-1599643478514-46bfa3321526?w=400&q=80' }
    ],
    typographyOptions: sharedTypography,
    textPositionOptions: sharedTextPosition,
    formats: sharedFormats,
  },

  clothing: {
    label: 'Moda & Roupas',
    themeClass: 'theme-clothing',
    icon: '👗',
    tagline: 'Imagens editoriais a partir de fotos da sua confecção',
    categories: ['Camisa / Blusa', 'Calça / Saia', 'Vestido', 'Casaco / Jaqueta', 'Conjunto', 'Acessórios'],
    solidColors: [
      { name: 'Branco Puro', hex: '#FFFFFF' },
      { name: 'Off-White', hex: '#F8F9FA' },
      { name: 'Cinza Fotográfico', hex: '#E9ECEF' },
      { name: 'Areia', hex: '#E5D9C5' },
      { name: 'Preto Infinito', hex: '#000000' },
    ],
    scenarios: [
      { title: 'Estúdio Branco', desc: 'Fundo infinito clássico (e-commerce)' },
      { title: 'Rua de Paris', desc: 'Background europeu desfocado' },
      { title: 'Praia ao Entardecer', desc: 'Golden hour em dunas' },
      { title: 'Loft Industrial', desc: 'Ambiente urbano com tijolos' },
    ],
    displayOptions: [
      { id: 'ghost_mannequin', label: 'Manequim Invisível' },
      { id: 'hanger_wood', label: 'Cabide de Madeira' },
      { id: 'hanger_metal', label: 'Cabide de Metal Clássico' },
      { id: 'flat_lay_folded', label: 'Flat Lay (Roupa Dobrada)' },
      { id: 'flat_lay_open', label: 'Flat Lay (Roupa Estendida)' },
      { id: 'clothesline', label: 'Varal Estético' },
    ],
    humanDisplayOptions: [
      { id: 'model_lara', name: 'Lara', type: 'Loira / Casual', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80' },
      { id: 'model_sofia', name: 'Sofia', type: 'Morena / Fashion', imageUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=400&q=80' },
      { id: 'model_yuri', name: 'Yuri', type: 'Oriental / Street', imageUrl: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400&q=80' }
    ],
    typographyOptions: sharedTypography,
    textPositionOptions: sharedTextPosition,
    formats: sharedFormats,
  },

  shoes: {
    label: 'Calçados',
    themeClass: 'theme-shoes',
    icon: '👟',
    tagline: 'Imagens de alto impacto para seus calçados urbanos e sociais',
    categories: ['Tênis Urbano', 'Tênis Esportivo', 'Salto Alto', 'Bota / Coturno', 'Sapato Social', 'Sandália'],
    solidColors: [
      { name: 'Cinza Concreto', hex: '#9E9E9E' },
      { name: 'Laranja Neon', hex: '#FF5722' },
      { name: 'Preto Asfalto', hex: '#212121' },
      { name: 'Branco Studio', hex: '#FFFFFF' },
      { name: 'Azul Elétrico', hex: '#2962FF' },
    ],
    scenarios: [
      { title: 'Rua Noturna Neon', desc: 'Asfalto molhado com reflexos' },
      { title: 'Quadra de Basquete', desc: 'Piso de madeira e luz natural' },
      { title: 'Concreto Minimalista', desc: 'Design industrial' },
    ],
    displayOptions: [
      { id: 'floating', label: 'Levitando' },
      { id: 'pedestal', label: 'Pedestal Retrô' },
      { id: 'acrylic_box', label: 'Caixa de Acrílico' },
      { id: 'dynamic_angle', label: 'Ângulo Dinâmico' },
      { id: 'shoebox_top', label: 'Sobre a Caixa' }
    ],
    humanDisplayOptions: [
      { id: 'model_street_m', name: 'Kai', type: 'Urbano / Sneakerhead', imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80' },
      { id: 'model_sport_f', name: 'Bia', type: 'Esportiva / Running', imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80' }
    ],
    typographyOptions: sharedTypography,
    textPositionOptions: sharedTextPosition,
    formats: sharedFormats,
  },
};

export function getNicheConfig(niche: string | null): NicheConfig {
  if (niche && niche in nicheConfigs) {
    return nicheConfigs[niche as NicheKey];
  }
  return nicheConfigs.jewelry; // default fallback
}