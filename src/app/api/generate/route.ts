import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
            { error: "Headline generation is unavailable: ANTHROPIC_API_KEY is not configured on this deployment." },
            { status: 503 }
        );
    }

    const { product, count } = await request.json();
    const variantCount = count ?? 4;

    const client = new Anthropic();

    const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 1024,
        output_config: {
            format: {
                type: "json_schema",
                schema: {
                    type: "object",
                    properties: {
                        variants: {
                            type: "array",
                            items: { type: "string" },
                        },
                    },
                    required: ["variants"],
                    additionalProperties: false,
                },
            },
        },
        messages: [
            {
                role: "user",
                content: `Write ${variantCount} distinct landing page headlines for "${product}". Each headline must take a different angle (benefit, curiosity, social proof, urgency) and be no more than 9 words.`,
            },
        ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        return NextResponse.json({ error: "No output generated" }, { status: 502 });
    }

    const { variants } = JSON.parse(textBlock.text) as { variants: string[] };
    return NextResponse.json({ variants });
}
