import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoDismiss } from "./useAutoDismiss";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("useAutoDismiss", () => {
    it("ne programme rien quand la valeur est null", () => {
        const setValue = vi.fn();

        renderHook(() => useAutoDismiss<string>(null, setValue));
        act(() => vi.advanceTimersByTime(10_000));

        expect(setValue).not.toHaveBeenCalled();
    });

    it("efface la valeur après le délai par défaut de 4000ms", () => {
        const setValue = vi.fn();

        renderHook(() => useAutoDismiss<string>("Erreur", setValue));

        act(() => vi.advanceTimersByTime(3_999));
        expect(setValue).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1));
        expect(setValue).toHaveBeenCalledExactlyOnceWith(null);
    });

    it("respecte un délai personnalisé", () => {
        const setValue = vi.fn();

        renderHook(() => useAutoDismiss<string>("Erreur", setValue, 1_000));
        act(() => vi.advanceTimersByTime(1_000));

        expect(setValue).toHaveBeenCalledExactlyOnceWith(null);
    });

    it("annule le minuteur précédent quand la valeur change avant l'échéance", () => {
        const setValue = vi.fn();

        const { rerender } = renderHook(
            ({ value }) => useAutoDismiss<string>(value, setValue),
            { initialProps: { value: "première erreur" } }
        );

        act(() => vi.advanceTimersByTime(3_000));
        rerender({ value: "deuxième erreur" });
        act(() => vi.advanceTimersByTime(3_000));

        // Le premier minuteur (qui aurait dû se déclencher à 4000ms) a été annulé.
        expect(setValue).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1_000));
        expect(setValue).toHaveBeenCalledExactlyOnceWith(null);
    });
});
