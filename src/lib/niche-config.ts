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
  textPositionOptions: TextPositionOption[]; // NOVO
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

// NOVA OPÇÃO COMPARTILHADA DE POSIÇÃO DO TEXTO
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
    solidColors: [
      { name: 'Preto Veludo', hex: '#111111' },
      { name: 'Champagne', hex: '#EBE1D5' },
      { name: 'Cinza Platina', hex: '#D2D2D2' },
      { name: 'Caoba Profundo', hex: '#4A2A22' },
      { name: 'Branco Neve', hex: '#FFFFFF' },
    ],
    // NOVOS 12 CENÁRIOS EDITORIAIS PARA MODELOS E JOIAS
    scenarios: [
      { title: 'Estúdio Minimalista', desc: 'Fundo off-white suave, iluminação difusa de estúdio focada na modelo' },
      { title: 'Fundo Infinito Escuro', desc: 'Estúdio com fundo preto profundo e holofote dramático (spotlight)' },
      { title: 'Seda ao Vento', desc: 'Drapeados de seda pérola voando suavemente atrás da modelo' },
      { title: 'Noite Urbana (Bokeh)', desc: 'Rua à noite com luzes de néon vibrantes e faróis desfocados' },
      { title: 'Varanda Parisiense', desc: 'Pôr do sol numa varanda com arquitetura europeia desfocada ao fundo' },
      { title: 'Loft Industrial', desc: 'Ambiente interno com cimento queimado e luz natural lateral' },
      { title: 'Praia ao Entardecer', desc: 'Fundo desfocado de mar com luz quente e dourada do golden hour' },
      { title: 'Jardim Botânico', desc: 'Folhagens ricas e luz do sol filtrada criando sombras orgânicas' },
      { title: 'Resort Mediterrânico', desc: 'Parede branca texturizada com sombras de palmeiras, vibe de verão' },
      { title: 'Salão de Baile Clássico', desc: 'Interior luxuoso desfocado, lustres de cristal e detalhes dourados' },
      { title: 'Galeria de Arte', desc: 'Fundo clean de museu com obras de arte abstratas distantes' },
      { title: 'Sunset no Iate', desc: 'Céu em tons pêssego sobre o oceano, com elementos em madeira de teca' },
    ],
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
      { title: 'Vibe Natureza', desc: 'Luz solar através de folhas' },
      { title: 'Concreto Minimalista', desc: 'Paredes de cimento queimado' },
      { title: 'Luzes Neon', desc: 'Estética cyberpunk suave' },
      { title: 'Passarela', desc: 'Luzes focais de desfile de moda' },
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
      { id: 'model_yuri', name: 'Yuri', type: 'Oriental / Street', imageUrl: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400&q=80' },
      { id: 'model_kofi', name: 'Kofi', type: 'Negro / Urbano', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' },
      { id: 'model_gabriel', name: 'Gabriel', type: 'Caucasiano / Terno', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
      { id: 'model_faceless', name: 'Sem Rosto', type: 'Apenas Tronco', imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80' }
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
      { title: 'Estúdio Dramático', desc: 'Fundo escuro com uma única luz forte' },
      { title: 'Concreto Minimalista', desc: 'Design industrial' },
      { title: 'Poça Urbana', desc: 'Asfalto molhado com reflexos urbanos' },
      { title: 'Chão de Academia', desc: 'Superfície emborrachada e iluminação forte' },
      { title: 'Blocos Suspensos', desc: 'Estética futurista 3D' },
      { title: 'Skate Park', desc: 'Concreto grafitado e textura áspera' },
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
      { id: 'model_sport_f', name: 'Bia', type: 'Esportiva / Running', imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80' },
      { id: 'model_skate_m', name: 'Leo', type: 'Skater / Grunge', imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80' },
      { id: 'model_casual_f', name: 'Ana', type: 'Casual / Dia a Dia', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
      { id: 'feet_only', name: 'Foco no Tênis', type: 'Sem Corpo', imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400&q=80' },
      { id: 'jumping', name: 'Salto', type: 'Ação Áerea', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' }
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