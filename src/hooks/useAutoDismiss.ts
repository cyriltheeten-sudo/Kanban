import { useEffect } from "react";

export function useAutoDismiss<T>(
    value: T | null,
    setValue: (value: T | null) => void,
    delayMs = 4000
) {
    useEffect(() => {
        if (!value) return;
        const t = setTimeout(() => setValue(null), delayMs);
        return () => clearTimeout(t);
    }, [value, setValue, delayMs]);
}
