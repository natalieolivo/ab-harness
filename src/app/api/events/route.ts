import { NextRequest, NextResponse } from "next/server";
import { writeEvent } from "@/app/lib/store";
import { forwardToSegment } from "@/app/lib/segment";

export async function POST(request: NextRequest) {
    const body = await request.json();

    if(body.type !== "exposure" && body.type !== "conversion") {
        return NextResponse.json({ error: "invalid event type"}, { status: 400 })
    }

    const event = {
        type: body.type,
        experimentId: body.experimentId,
        variantId: body.variantId,
        userId: body.userId,
        ts: Date.now(),
    };

    await writeEvent(event);

    try {
        await forwardToSegment(event);
    } catch (err) {
        console.error("Segment forwarding failed:", err);
    }

    return NextResponse.json({ok: true}, {status: 201})
}