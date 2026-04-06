export const jewelryDictionary: Record<string, Record<string, string>> = {
    produto: {
        "Colar": "a luxurious and intricate necklace",
        "Brinco": "a pair of elegant premium earrings",
        "Anel": "a stunning high-end ring",
        "Pulseira": "a sophisticated luxury bracelet",
        "Tiara": "an exquisite jeweled tiara with sparkling crystals and precious stones",
        "Broche": "an exquisite designer brooch",
        "Pingente": "a beautiful delicate pendant",
        "Bracelete Pandora": "a premium charm bracelet loaded with intricate silver and glass charms, Pandora style"
    },
    props: {
        "water_drops": "with delicate cinematic water droplets scattered elegantly on the surface",
        "orchid_petal": "with a single pure white orchid petal resting softly in the background",
        "raw_quartz": "with a piece of raw white quartz crystal placed artistically nearby",
        "gold_bokeh": "surrounded by magical out-of-focus gold dust floating in the air (golden bokeh)"
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
        "Mão de Veludo (Anel)": "displayed elegantly on a premium black velvet jewelry mannequin hand",
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
        "Didot (Alta Costura)": "written elegantly in a high-fashion editorial Didot-style serif typography",
        "Cinzel (Clássica)": "written boldly in a classic, cinematic roman Cinzel-style serif typography",
        "Montserrat (Minimalista)": "written cleanly in a minimalist geometric Montserrat-style sans-serif typography",
        "Inter (Moderna)": "written cleanly in a modern sans-serif Inter-style typography",
        "Cormorant (Script)": "written beautifully in a cursive flowing script typography",
        "Impact (Display)": "written boldly in a thick, high-impact display typography"
    },
    corTexto: {
        "white": "colored in crisp pure white",
        "black": "colored in solid deep black",
        "gold": "colored in luxurious metallic gold",
        "silver": "colored in sleek metallic silver",
        "rose_gold": "colored in elegant metallic rose gold"
    },
    tamanhoTexto: {
        "small": "in a small, subtle, and understated size",
        "medium": "in a medium, balanced, and readable size",
        "large": "in a large, bold, and prominent size"
    },
    posicaoTexto: {
        "top": "positioned explicitly at the TOP part of the image, keeping the center and product clear",
        "center": "positioned prominently in the dead CENTER of the image",
        "bottom": "positioned explicitly at the BOTTOM part of the image, keeping the center and product clear"
    }
};

// Map format ratio strings to Gemini-compatible aspect ratio and orientation description
export function getAspectRatioInfo(formatRatio: string): { geminiRatio: string; orientation: string } {
    switch (formatRatio) {
        case '1:1': return { geminiRatio: '1:1', orientation: 'square' };
        case '4:5': return { geminiRatio: '3:4', orientation: 'vertical portrait' };
        case '9:16': return { geminiRatio: '9:16', orientation: 'tall vertical (portrait/story)' };
        case '1.91:1': return { geminiRatio: '16:9', orientation: 'wide horizontal landscape' };
        default: return { geminiRatio: '1:1', orientation: 'square' };
    }
}

// ── Human model names for quick checks ──
const HUMAN_MODELS = ['Helena', 'Zara', 'Lin', 'Maya', 'Valentina'];
const CLOSE_UP_DISPLAYS = ['Close Pescoço', 'Mão / Manicure', 'Pulso', 'Perfil / Orelha'];

// ── Earring-specific intelligence ──
function buildEarringInstruction(displaySelection: string, isHumanModel: boolean, isEarProfile: boolean): string {
    if (isHumanModel) {
        return `

EARRING PLACEMENT RULES (CRITICAL — follow exactly):
- Show the model's FULL FACE from a FRONT or SLIGHT 3/4 ANGLE so BOTH ears are visible.
- Place exactly ONE earring on the LEFT ear and ONE identical earring on the RIGHT ear.
- NEVER put two earrings on the same ear.
- Each earring must be the EXACT same design, size, and color as the uploaded reference image.
- PROPORTION: The earring must be realistically sized relative to the model's ear — a small stud should look like a small stud (roughly the size of the earlobe), a medium drop earring should hang about 2-3cm below the earlobe, and a large statement earring should hang proportionally but never larger than the ear-to-jaw distance. Match the proportions visible in the uploaded reference photo.
- The earring must sit naturally on the earlobe or ear hook position, with realistic weight and gravity.
- Frame the composition so the earrings are prominent but the model's face provides elegant context.`;
    }

    if (isEarProfile) {
        return `

EARRING PLACEMENT RULES (CRITICAL — follow exactly):
- This is a SIDE PROFILE close-up showing ONE ear only.
- Place exactly ONE single earring on the visible ear. The other ear is not visible.
- NEVER show two earrings on the same ear.
- The earring must be the EXACT same design, size, and color as the uploaded reference image.
- PROPORTION: The earring must be realistically sized relative to the ear. Use the uploaded image to judge whether it is a stud, drop, hoop, or statement piece, and size it accordingly on the ear. It should look like a real photograph, not oversized or miniaturized.
- The earring must sit naturally on the earlobe with realistic attachment point and natural gravity/drape.
- Hair should be pulled back or tucked behind the ear to fully showcase the earring.`;
    }

    return '';
}

// ── Category-aware display instructions for human models ──
function buildCategoryDisplaySynergy(category: string, displaySelection: string, isHumanModel: boolean): string {
    if (!isHumanModel && !CLOSE_UP_DISPLAYS.includes(displaySelection)) return '';

    const synergy: Record<string, string> = {
        'Colar': isHumanModel
            ? 'Frame from shoulders up, ensuring the necklace is fully visible resting naturally on the model\'s chest/collarbone. The necklace should drape with realistic gravity and chain physics.'
            : '',
        'Anel': isHumanModel
            ? 'Include the model\'s hand positioned elegantly near her face or resting naturally, with the ring clearly visible on her finger. The ring should fit naturally on the finger with correct proportions.'
            : '',
        'Pulseira': isHumanModel
            ? 'Ensure the model\'s wrist is visible in an elegant pose, with the bracelet sitting naturally at the wrist bone with realistic fit and weight.'
            : '',
        'Tiara': isHumanModel
            ? 'Show the tiara placed correctly on the crown of the model\'s head, sitting naturally in her styled hair. Frame from chest up to show the full tiara.'
            : '',
        'Pingente': isHumanModel
            ? 'Frame from shoulders up showing the pendant hanging naturally from its chain on the model\'s chest. The pendant should rest at a realistic position on the sternum area.'
            : '',
        'Broche': isHumanModel
            ? 'Show the brooch pinned naturally on the model\'s clothing at the upper chest or lapel area with realistic attachment.'
            : '',
    };

    const instruction = synergy[category];
    if (instruction) return `\nFRAMING: ${instruction}`;
    return '';
}

export function buildEnglishPrompt(niche: string, selections: any) {
    const dict = jewelryDictionary;

    // ── Product detection ──
    let productText = "a luxury jewelry piece";
    let isMultiple = false;
    const primaryCategory = selections.category || (selections.uploadedCategories?.[0]) || '';

    if (selections.uploadedCategories && selections.uploadedCategories.length > 1) {
        isMultiple = true;
        const items = selections.uploadedCategories.map((cat: string) => dict.produto[cat] || cat);
        if (items.length === 2) {
            productText = `a matching set featuring ${items[0]} AND ${items[1]}`;
        } else {
            const lastItem = items.pop();
            productText = `a matching jewelry set featuring ${items.join(', ')}, AND ${lastItem}`;
        }
    } else {
        productText = dict.produto[primaryCategory] || "a luxury jewelry piece";
    }

    // ── Display ──
    const displaySelection = selections.display || '';
    const displayText = dict.exibicao[displaySelection] || "elegantly displayed";
    const isHumanModel = HUMAN_MODELS.includes(displaySelection);
    const isCloseUp = CLOSE_UP_DISPLAYS.includes(displaySelection);
    const isEarProfile = displaySelection === 'Perfil / Orelha';

    // ── Background ──
    const bgSelection = selections.background || '';
    const backgroundText = dict.fundo[bgSelection] || "on a neutral studio background";

    // ── Lighting ──
    const lightingInstruction = 'Use professional soft studio rim lighting optimized for jewelry photography.';

    // ── Props ──
    const propSelection = selections.prop || 'none';
    const propText = propSelection !== 'none' && dict.props[propSelection] ? `, ${dict.props[propSelection]}` : "";

    // ── Earring intelligence ──
    const isEarring = primaryCategory === 'Brinco' || (selections.uploadedCategories?.includes('Brinco'));
    const earringInstruction = isEarring
        ? buildEarringInstruction(displaySelection, isHumanModel, isEarProfile)
        : '';

    // ── Category × display synergy ──
    const categoryDisplayInstruction = !isEarring
        ? buildCategoryDisplaySynergy(primaryCategory, displaySelection, isHumanModel)
        : '';

    // ── Text overlay ──
    let textPrompt = "";
    if (selections.text) {
        const typoSelection = selections.typography || '';
        const typoText = dict.tipografia[typoSelection] || "written in a clean font";
        const colorSelection = selections.textColor || 'white';
        const colorText = dict.corTexto[colorSelection] || dict.corTexto['white'];
        const sizeSelection = selections.textSize || 'medium';
        const sizeText = dict.tamanhoTexto[sizeSelection] || dict.tamanhoTexto['medium'];
        const posSelection = selections.textPosition || 'bottom';
        const positionText = dict.posicaoTexto[posSelection] || dict.posicaoTexto['bottom'];
        textPrompt = `TEXT OVERLAY: There is a prominent text graphic overlay on the image that exactly says "${selections.text}". The text is ${typoText}, ${colorText}, ${sizeText}, and is ${positionText}.`;
    }

    // ── Piece description (singular vs plural) ──
    const pieceDescription = isMultiple
        ? `ALL the exact uploaded jewelry pieces together in the same composition (${productText})`
        : `the exact uploaded jewelry piece (${productText})`;

    // ── Format / aspect ratio ──
    const formatRatio = selections.format || '1:1';
    const { orientation } = getAspectRatioInfo(formatRatio);
    const formatInstruction = `The image MUST be composed in a ${orientation} format (aspect ratio ${formatRatio}). Frame the composition accordingly.`;

    // ── Lens choice based on display type ──
    const lensInstruction = isCloseUp
        ? 'Shot with 100mm macro lens, f/2.8, extreme close-up, shallow depth of field, focus stacking on the jewelry piece'
        : isHumanModel
            ? 'Shot with 85mm portrait lens, f/1.8, natural shallow depth of field with the jewelry in sharp focus'
            : 'Shot with 100mm macro lens, f/2.8, focus stacking for maximum sharpness on the jewelry piece';

    // ══════════════════════════════════════════
    // FINAL PROMPT ASSEMBLY
    // ══════════════════════════════════════════
    const finalEnglishPrompt = [
        formatInstruction,
        `A hyper-realistic commercial photograph of ${pieceDescription}, ${displayText}, ${backgroundText}${propText}.`,

        // CORE RULE: Color & design fidelity
        `ABSOLUTE RULE — COLOR & DESIGN FIDELITY: Reproduce the uploaded jewelry piece with 100% fidelity to the original. The exact colors, materials, textures, gemstone hues, metal finish, shape, proportions, and every design detail must match the reference image EXACTLY. Do NOT recolor, tint, change material, add stones, remove details, or alter the piece in ANY way. If the original is silver, it stays silver. If it has blue stones, they stay blue. The piece in the output must be indistinguishable from the uploaded reference.`,

        // Smart lighting
        lightingInstruction,

        // Category-specific intelligence
        earringInstruction,
        categoryDisplayInstruction,

        // Text overlay
        textPrompt,

        // Technical quality
        `${lensInstruction}, 8k resolution, ray-traced reflections, caustics, hyper-photorealistic commercial jewelry photography.`
    ].filter(Boolean).join('\n\n');

    return finalEnglishPrompt;
}
