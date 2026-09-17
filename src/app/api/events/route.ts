import { NextRequest, NextResponse } from "next/server";
import { writeEvent } from "@/app/lib/store";

export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log(body);
    if(body.type !== "exposure" && body.type !== "conversion") {
        return NextResponse.json({ error: "invalid event type"}, { status: 400 })
    }

    await writeEvent({
        type: body.type,
        experimentId: body.experimentId,
        variantId: body.variantId,
        userId: body.userId,
        ts: Date.now(),
    })

    return NextResponse.json({ok: true}, {status: 201})
}