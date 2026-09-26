import { NextResponse } from "next/server";
import { readEvents } from "@/app/lib/store";
import { experiments } from "@/lib/experiments";

export type VariantResult = {
    variantId: string;
    headline: string;
    exposures: number;
    conversions: number;
    rate: number;
};

export type ExperimentResult = {
    experimentId: string;
    variants: VariantResult[];
};

export async function GET() {
    const events = await readEvents();

    const results: ExperimentResult[] = Object.values(experiments).map((experiment) => {
        const variants = experiment.variants.map((variant) => {
            const exposedVisitors = new Set(
                events
                    .filter((e) => e.type === "exposure" && e.experimentId === experiment.id && e.variantId === variant.id)
                    .map((e) => e.userId)
            );

            const convertedVisitors = new Set(
                events
                    .filter((e) => e.type === "conversion" && e.experimentId === experiment.id && e.variantId === variant.id)
                    .map((e) => e.userId)
                    .filter((userId) => exposedVisitors.has(userId))
            );

            const exposures = exposedVisitors.size;
            const conversions = convertedVisitors.size;
            const rate = exposures > 0 ? conversions / exposures : 0;

            return { variantId: variant.id, headline: variant.headline, exposures, conversions, rate };
        });

        return { experimentId: experiment.id, variants };
    });

    return NextResponse.json({ results });
}
