import type { EventData } from "@/app/lib/store";

const SEGMENT_TRACK_URL = "https://api.segment.io/v1/track";

const EVENT_NAMES: Record<EventData["type"], string> = {
    exposure: "Experiment Viewed",
    conversion: "Experiment Converted",
};

export async function forwardToSegment(event: EventData): Promise<void> {
    const writeKey = process.env.SEGMENT_WRITE_KEY;
    if (!writeKey) return;

    const response = await fetch(SEGMENT_TRACK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${writeKey}:`).toString("base64")}`,
        },
        body: JSON.stringify({
            userId: event.userId,
            event: EVENT_NAMES[event.type],
            properties: {
                experiment_id: event.experimentId,
                variation_name: event.variantId,
            },
            timestamp: new Date(event.ts).toISOString(),
        }),
    });

    if (!response.ok) {
        console.error(`Segment forwarding rejected: ${response.status} ${await response.text()}`);
    }
}
