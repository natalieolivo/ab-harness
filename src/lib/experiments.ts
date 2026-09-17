type Variant = {
    id: string;
    weight: number;
    headline: string;
}

type Experiment = {
    id: string;
    variants: Variant[];
}

export const experiments: Record<string, Experiment> = {
    'landing-headline': {
        id: 'landing-headline',
        variants: [
            { id: 'control', weight: .5, headline: 'Community thriving after tax surplus' },
            { id: 'variant-1', weight: .5, headline: 'Community struggling after tax hike' }
        ]
    }
}

export function fnv1a(input: string): number {
    let hash = 2166136261; // standard 32-bit FNV-1a offset basis
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function assignVariant(userId: string, experiment: Experiment): Variant {
    // 1. Salt with the experiment id so each experiment shuffles independently
    const hash = fnv1a(`${experiment.id}:${userId}`);

    // 2. Collapse the hash into one of 10,000 buckets, then scale to [0, 1)
    const bucket = (hash % 10000) / 10000;

    // 3. Walk the variants, stacking weights until we pass the bucket
    let cumulative = 0;
    for (const variant of experiment.variants) {
        cumulative += variant.weight;
        if (bucket < cumulative) {
            return variant;
        }
    }

    // 4. Float-rounding safety net (weights that sum to 0.99999...)
    return experiment.variants[experiment.variants.length - 1];
}