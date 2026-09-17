"use client";

import { useEffect } from "react";

export default function ExperimentTracker({eid, vid, uuid} : {
    eid: string | null;
    vid: string | null;
    uuid: string | null;
}) {
    const TRACKING_URL = "/api/events"
    useEffect(() => {
        if (!eid || !vid || !uuid) return;

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

    return (<div>hey</div>)
}