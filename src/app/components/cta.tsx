"use client";

import { useState } from "react";
import styles from "@/styles/page.module.css";

export default function SubscribeBtn({ eid, vid, uuid } : { 
    eid: string | null;
    vid: string | null;
    uuid: string | null;
}) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const TRACKING_URL = "/api/events";

    function handleClick() {
        if (isSubscribed || !eid || !vid || !uuid) return;
        setIsSubscribed(true);

        fetch(TRACKING_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "conversion",
                experimentId: eid,  
                variantId: vid,
                userId: uuid
            })
        }) 
    }
    if (isSubscribed) {
        return <p>Thanks for signing up!</p>;
    }
    return (
        <div className={styles.ctas}>
            <button className={styles.primary} onClick={handleClick}>subscribe</button>
        </div>
    );
};

