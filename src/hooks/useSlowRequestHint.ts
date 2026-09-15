import { useEffect, useState } from "react";

export function useSlowRequestHint(active: boolean, delayMs = 4000) {
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        if (!active) return;
        const t = setTimeout(() => setShowHint(true), delayMs);
        return () => {
            clearTimeout(t);
            setShowHint(false);
        };
    }, [active, delayMs]);

    return showHint;
}
