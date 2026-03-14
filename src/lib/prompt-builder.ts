export const jewelryDictionary: Record<string, Record<string, string>> = {
    produto: {
        "Colar": "a luxurious and intricate necklace",
        "Brinco": "a pair of elegant premium earrings",
        "Anel": "a stunning high-end ring",
        "Pulseira": "a sophisticated luxury bracelet",
        "Relógio": "a premium luxury watch",
        "Broche": "an exquisite designer brooch",
        "Pingente": "a beautiful delicate pendant"
    },
    fundo: {
        "Preto Veludo": "on a seamless pitch-black velvet backdrop, absorbing light for maximum dramatic contrast",
        "Champagne": "on a seamless solid champagne-colored background, warm elegant aesthetic",
        "Cinza Platina": "on a seamless platinum-grey studio backdrop, neutral and highly sophisticated",
        "Caoba Profundo": "on a rich, deep mahogany wood surface, warm luxurious tones",
        "Branco Neve": "on a pure snow-white seamless background, bright clinical studio lighting",
        "Estúdio Dark": "in a dark luxury studio setting with dramatic moody spotlighting",
        "Cofre de Grife": "inside a high-end designer vault, metallic textures, luxury safe box aesthetic",
        "Bandeja de Veludo": "resting on a plush, premium jeweler's display tray",
        "Pedestal de Mármore": "elevated on a luxurious veined white marble pedestal",
        "Folhas de Ouro": "surrounded by scattered abstract gold leaf flakes, opulent and wealthy atmosphere",
        "Seda Fluida": "resting on flowing, undulating silk fabric with soft elegant folds",
        "Espelho d'Água": "placed on a shallow, still water mirror reflecting the jewelry perfectly, gentle ripples",
        "Geometria Flutuante": "surrounded by abstract floating geometric shapes in a modern minimalist space"
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
        "Close": "extreme macro close-up on the model's skin wearing the jewelry, focusing entirely on the product"
    },
    tipografia: {
        "Playfair (Elegante)": "written elegantly in a sophisticated serif Playfair-style typography",
        "Inter (Moderna)": "written cleanly in a modern sans-serif Inter-style typography",
        "Cormorant (Script)": "written beautifully in a cursive flowing script typography",
        "Impact (Display)": "written boldly in a thick, high-impact display typography"
    }
};

export function buildEnglishPrompt(niche: string, selections: any) {
    const dict = jewelryDictionary;

    const productCat = selections.category || '';
    const productText = dict.produto[productCat] || "a luxury jewelry piece";

    const bgSelection = selections.background || '';
    const backgroundText = dict.fundo[bgSelection] || "on a neutral studio background";

    const displaySelection = selections.display || '';
    const displayText = dict.exibicao[displaySelection] || "elegantly displayed";

    // MUDANÇA AQUI: Instrução fortíssima para forçar a IA a escrever o texto
    let textPrompt = "";
    if (selections.text) {
        const typoSelection = selections.typography || '';
        const typoText = dict.tipografia[typoSelection] || "written in a clean font";
        textPrompt = `TEXT OVERLAY: There is a prominent text graphic overlay on the image that exactly says "${selections.text}". The text is ${typoText}.`;
    }

    const finalEnglishPrompt = `A hyper-realistic commercial macro photograph of the exact uploaded jewelry piece, maintaining its original design, shape, and details perfectly, ${displayText}, ${backgroundText}. ${textPrompt} Shot with 100mm macro lens, 8k resolution, octane render, sharp focus.`;

    return finalEnglishPrompt;
}