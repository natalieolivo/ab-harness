"use client";

import { useEffect, useRef } from "react";

export default function ExperimentTracker({eid, vid, uuid} : {
    eid: string | null;
    vid: string | null;
    uuid: string | null;
}) {
    const TRACKING_URL = "/api/events";
    const fired = useRef(false);

    useEffect(() => {
       if (!eid || !vid || !uuid || fired.current) return;
       fired.current = true;

        fetch(TRACKING_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                type: "exposure",
                experimentId: eid,  
                variantId: vid,
                userId: uuid
            })
        })
    }, []);

    return null;
}