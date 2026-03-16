export const jewelryDictionary: Record<string, Record<string, string>> = {
    produto: {
        "Colar": "a luxurious and intricate necklace",
        "Brinco": "a pair of elegant premium earrings",
        "Anel": "a stunning high-end ring",
        "Pulseira": "a sophisticated luxury bracelet",
        "Relógio": "a premium luxury watch",
        "Broche": "an exquisite designer brooch",
        "Pingente": "a beautiful delicate pendant",
        "Bracelete Pandora": "a premium charm bracelet loaded with intricate silver and glass charms, Pandora style"
    },
    material: {
        "gold_yellow": "featuring rich warm golden reflections and highly polished yellow gold material properties",
        "gold_white": "featuring cool pristine silver highlights, bright white gold material, and sharp metallic reflections",
        "gold_rose": "featuring soft pinkish-gold reflections, elegant rose gold material, and warm metallic luster",
        "gemstone": "focusing on brilliant gemstone refractions, internal light scattering, and sharp diamond-like caustics"
    },
    fundo: {
        "Preto Veludo": "on a seamless pitch-black velvet backdrop, absorbing light for maximum dramatic contrast",
        "Branco Neve": "on a pure snow-white seamless studio background, bright clinical soft-box lighting",
        "Cinza Platina": "on a seamless platinum-grey studio backdrop, neutral and highly sophisticated",
        "Champagne": "on a seamless solid champagne-colored background, warm elegant aesthetic",
        "Caoba Profundo": "on a rich, deep mahogany wood surface, warm luxurious tones",
        "Verde Musgo": "on a seamless deep moss green suede backdrop, earthy and organic luxury",
        "Vermelho Bordô": "on a seamless rich burgundy red velvet background, opulent and royal aesthetic",
        "Azul Petróleo": "on a seamless dark petrol blue matte backdrop, moody and elegant sophisticated lighting",
        "Verde Esmeralda": "on a seamless emerald green satin background, rich jewel-toned aesthetic",
        "Azul Safira": "on a seamless deep sapphire blue velvet backdrop, regal and luxurious",
        "Rosa Pó": "on a seamless dusty rose pink matte background, soft feminine and delicate lighting",
        "Terracota": "on a seamless warm terracotta clay-colored backdrop, earthy and modern aesthetic",
        "Roxo Berinjela": "on a seamless deep eggplant purple velvet background, mysterious and premium",
        "Cinza Chumbo": "on a seamless dark charcoal grey matte backdrop, industrial yet elegant",
        "Nude Areia": "on a seamless warm sand nude backdrop, minimalist and clean aesthetic",
        "Marrom Chocolate": "on a seamless rich chocolate brown suede background, warm and inviting",
        "Azul Gelo": "on a seamless pale ice blue matte backdrop, crisp and frosty elegant lighting",
        "Ouro Velho": "on a seamless antique gold textured backdrop, vintage luxury and warmth",
        "Lavanda Escuro": "on a seamless muted dark lavender backdrop, soft and poetic luxury",
        "Verde Oliva": "on a seamless olive green matte background, sophisticated and muted organic tones"
    },
    exibicao: {
        "Busto de Veludo (Colar)": "displayed elegantly on a premium black velvet jewelry bust",
        "Caixa de Joia Premium": "placed inside an open, luxurious leather premium jewelry box",
        "Pedestal em Mármore": "resting on a sleek, polished white marble pedestal",
        "Expositor de Anel (Cone)": "mounted on a minimalist cone-shaped ring display",
        "Almofada de Cetim": "resting gently on a soft, luxurious silk satin cushion",
        "Sem Expositor (Surface)": "laying flat directly on the highly reflective surface",
        "Levitação 3D": "floating gracefully in mid-air with a zero-gravity dynamic effect",
        "Helena": "worn gracefully by a Caucasian high-fashion model named Helena with flawless glowing skin",
        "Zara": "worn elegantly by a Middle-Eastern high-fashion model named Zara with rich warm skin tone",
        "Lin": "worn beautifully by an Asian high-fashion model named Lin with delicate features and glass skin",
        "Maya": "worn stunningly by a Black high-fashion model named Maya with radiant deep skin tone",
        "Valentina": "worn passionately by a Latina high-fashion model named Valentina with sun-kissed skin",
        "Close Pescoço": "extreme macro close-up on the model's neck and collarbone wearing the jewelry, focusing entirely on the necklace or pendant",
        "Mão / Manicure": "extreme macro close-up on a high-fashion model's hand with an elegant nude manicure, focusing entirely on the ring on her finger",
        "Pulso": "extreme macro close-up on a high-fashion model's resting wrist and lower arm, focusing entirely on the bracelet or watch",
        "Perfil / Orelha": "extreme macro close-up side profile shot of a high-fashion model's ear with her hair elegantly pulled back, focusing entirely on the earring"
    },
    tipografia: {
        "Playfair (Elegante)": "written elegantly in a sophisticated serif Playfair-style typography",
        "Inter (Moderna)": "written cleanly in a modern sans-serif Inter-style typography",
        "Cormorant (Script)": "written beautifully in a cursive flowing script typography",
        "Impact (Display)": "written boldly in a thick, high-impact display typography"
    },
    posicaoTexto: {
        "top": "positioned explicitly at the TOP part of the image, keeping the center and product clear",
        "center": "positioned prominently in the dead CENTER of the image",
        "bottom": "positioned explicitly at the BOTTOM part of the image, keeping the center and product clear"
    }
};

export function buildEnglishPrompt(niche: string, selections: any) {
    const dict = jewelryDictionary;

    const productCat = selections.category || '';
    const productText = dict.produto[productCat] || "a luxury jewelry piece";

    const materialSelection = selections.material || '';
    const materialText = dict.material[materialSelection] ? `, ${dict.material[materialSelection]}` : "";

    const bgSelection = selections.background || '';
    const backgroundText = dict.fundo[bgSelection] || "on a neutral studio background";

    const displaySelection = selections.display || '';
    const displayText = dict.exibicao[displaySelection] || "elegantly displayed";

    let textPrompt = "";
    if (selections.text) {
        const typoSelection = selections.typography || '';
        const typoText = dict.tipografia[typoSelection] || "written in a clean font";

        const posSelection = selections.textPosition || 'bottom';
        const positionText = dict.posicaoTexto[posSelection] || dict.posicaoTexto['bottom'];

        textPrompt = `TEXT OVERLAY: There is a prominent text graphic overlay on the image that exactly says "${selections.text}". The text is ${typoText} and is ${positionText}.`;
    }

    // A MÁGICA ACONTECE AQUI NESTA STRING FINAL
    const finalEnglishPrompt = `A hyper-realistic commercial macro photograph of the exact uploaded jewelry piece, maintaining its original design, shape, and details perfectly${materialText}, ${displayText}, ${backgroundText}. ${textPrompt} Shot with 100mm macro lens, f/2.8, 8k resolution, ray-traced reflections, caustics, soft studio rim lighting, focus stacking, hyper-photorealistic.`;

    return finalEnglishPrompt;
}