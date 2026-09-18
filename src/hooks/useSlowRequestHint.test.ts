import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSlowRequestHint } from "./useSlowRequestHint";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("useSlowRequestHint", () => {
    it("reste à false quand active vaut false", () => {
        const { result } = renderHook(() => useSlowRequestHint(false));

        act(() => vi.advanceTimersByTime(10_000));

        expect(result.current).toBe(false);
    });

    it("passe à true après le délai par défaut de 4000ms quand active vaut true", () => {
        const { result } = renderHook(() => useSlowRequestHint(true));

        expect(result.current).toBe(false);
        act(() => vi.advanceTimersByTime(3_999));
        expect(result.current).toBe(false);

        act(() => vi.advanceTimersByTime(1));
        expect(result.current).toBe(true);
    });

    it("respecte un délai personnalisé", () => {
        const { result } = renderHook(() => useSlowRequestHint(true, 500));

        act(() => vi.advanceTimersByTime(500));

        expect(result.current).toBe(true);
    });

    it("repasse à false quand active redevient false avant l'échéance", () => {
        const { result, rerender } = renderHook(
            ({ active }) => useSlowRequestHint(active),
            { initialProps: { active: true } }
        );

        act(() => vi.advanceTimersByTime(2_000));
        rerender({ active: false });

        expect(result.current).toBe(false);
    });

    it("repasse à false quand active redevient false après avoir affiché l'indice", () => {
        const { result, rerender } = renderHook(
            ({ active }) => useSlowRequestHint(active),
            { initialProps: { active: true } }
        );

        act(() => vi.advanceTimersByTime(4_000));
        expect(result.current).toBe(true);

        rerender({ active: false });
        expect(result.current).toBe(false);
    });
});
