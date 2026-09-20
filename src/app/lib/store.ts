import fs from "fs/promises";
import path from "path";

const EVENTS_FILE = path.join(process.cwd(), "data", "events.json");

export type EventData = {
    type: "exposure" | "conversion";
    experimentId: string;
    variantId: string;
    userId: string;
    ts: number;
}

export async function readEvents():Promise<EventData[]> {
    try {
        const fileContents = await fs.readFile(EVENTS_FILE, "utf-8");
        return JSON.parse(fileContents);
    } catch (err) {
        if((err as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw err;
    }
}

export async function writeEvent(event: EventData):Promise<void> {
    await fs.mkdir(path.dirname(EVENTS_FILE), { recursive: true });
    const events = await readEvents();
    events.push(event);
    await fs.writeFile(EVENTS_FILE,  JSON.stringify(events, null, 2))
}
