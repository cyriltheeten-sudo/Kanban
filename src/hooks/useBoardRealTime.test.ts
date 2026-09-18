import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBoardRealTime } from "./useBoardRealTime";
import { setConnectionId } from "../api/realtime";

vi.mock("../api/config", () => ({
    API_BASE_URL: "https://api.test",
}));

vi.mock("../api/realtime", () => ({
    setConnectionId: vi.fn(),
}));

const startMock = vi.fn();
const stopMock = vi.fn();
const invokeMock = vi.fn();

type ReconnectedHandler = (id?: string) => void;
let boardChangedHandler: (() => void) | undefined;
let reconnectedHandler: ReconnectedHandler | undefined;

vi.mock("@microsoft/signalr", () => {
    class FakeHubConnectionBuilder {
        withUrl() {
            return this;
        }
        withAutomaticReconnect() {
            return this;
        }
        build() {
            return {
                connectionId: "conn-1",
                on: (event: string, cb: () => void) => {
                    if (event === "BoardChanged") boardChangedHandler = cb;
                },
                onreconnected: (cb: ReconnectedHandler) => {
                    reconnectedHandler = cb;
                },
                invoke: invokeMock,
                start: startMock,
                stop: stopMock,
            };
        }
    }
    return { HubConnectionBuilder: FakeHubConnectionBuilder };
});

const setConnectionIdMock = vi.mocked(setConnectionId);

beforeEach(() => {
    boardChangedHandler = undefined;
    reconnectedHandler = undefined;
    startMock.mockReset().mockResolvedValue(undefined);
    stopMock.mockReset();
    invokeMock.mockReset().mockResolvedValue(undefined);
    setConnectionIdMock.mockReset();
});

describe("useBoardRealTime", () => {
    it("n'ouvre pas de connexion quand boardId est NaN", () => {
        renderHook(() => useBoardRealTime(NaN, vi.fn()));

        expect(startMock).not.toHaveBeenCalled();
    });

    it("démarre la connexion et rejoint le board au montage", async () => {
        renderHook(() => useBoardRealTime(5, vi.fn()));

        expect(startMock).toHaveBeenCalledOnce();
        await waitFor(() => expect(setConnectionIdMock).toHaveBeenCalledWith("conn-1"));
        expect(invokeMock).toHaveBeenCalledExactlyOnceWith("JoinBoard", 5);
    });

    it("appelle loadBoard quand le serveur signale un changement du board", async () => {
        const loadBoard = vi.fn();
        renderHook(() => useBoardRealTime(5, loadBoard));

        await waitFor(() => expect(boardChangedHandler).toBeDefined());
        boardChangedHandler?.();

        expect(loadBoard).toHaveBeenCalledOnce();
    });

    it("rejoint à nouveau le board et recharge les données après une reconnexion", async () => {
        const loadBoard = vi.fn();
        renderHook(() => useBoardRealTime(5, loadBoard));

        await waitFor(() => expect(reconnectedHandler).toBeDefined());
        setConnectionIdMock.mockClear();
        invokeMock.mockClear();

        reconnectedHandler?.("conn-2");

        expect(setConnectionIdMock).toHaveBeenCalledExactlyOnceWith("conn-2");
        expect(invokeMock).toHaveBeenCalledExactlyOnceWith("JoinBoard", 5);
        expect(loadBoard).toHaveBeenCalledOnce();
    });

    it("arrête la connexion et efface l'identifiant au démontage", async () => {
        const { unmount } = renderHook(() => useBoardRealTime(5, vi.fn()));
        await waitFor(() => expect(startMock).toHaveBeenCalledOnce());
        setConnectionIdMock.mockClear();

        unmount();

        expect(setConnectionIdMock).toHaveBeenCalledExactlyOnceWith(null);
        expect(stopMock).toHaveBeenCalledOnce();
    });
});
