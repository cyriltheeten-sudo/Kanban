import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLogin } from "./useLogin";
import { login, type LoginResponse } from "../api/auth";

const navigateMock = vi.fn();

vi.mock("react-router", () => ({
    useNavigate: () => navigateMock,
}));

vi.mock("../api/auth", () => ({
    login: vi.fn(),
}));

const loginMock = vi.mocked(login);

function makeResponse(): LoginResponse {
    return { token: "jwt-token", user: { id: 1, email: "demo@kanban.fr", name: "Demo" } };
}

beforeEach(() => {
    loginMock.mockReset();
    navigateMock.mockReset();
    localStorage.clear();
});

describe("useLogin", () => {
    it("n'est ni en chargement ni en erreur au départ", () => {
        const { result } = renderHook(() => useLogin());

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("stocke le token et redirige vers l'accueil en cas de succès", async () => {
        loginMock.mockResolvedValue(makeResponse());
        const { result } = renderHook(() => useLogin());

        await act(() => result.current.signIn("demo@kanban.fr", "demo"));

        expect(loginMock).toHaveBeenCalledWith("demo@kanban.fr", "demo");
        expect(localStorage.getItem("token")).toBe("jwt-token");
        expect(navigateMock).toHaveBeenCalledWith("/");
        expect(result.current.error).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("expose le message d'erreur et ne redirige pas en cas d'échec", async () => {
        loginMock.mockRejectedValue(new Error("Email ou mot de passe incorrect."));
        const { result } = renderHook(() => useLogin());

        await act(() => result.current.signIn("demo@kanban.fr", "mauvais"));

        expect(result.current.error).toBe("Email ou mot de passe incorrect.");
        expect(localStorage.getItem("token")).toBeNull();
        expect(navigateMock).not.toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);
    });

    it("utilise un message générique si l'erreur n'est pas une Error", async () => {
        loginMock.mockRejectedValue("boom");
        const { result } = renderHook(() => useLogin());

        await act(() => result.current.signIn("demo@kanban.fr", "demo"));

        expect(result.current.error).toBe("Une erreur est survenue");
    });

    it("passe en chargement pendant la requête", async () => {
        let resolveLogin!: (value: LoginResponse) => void;
        loginMock.mockReturnValue(new Promise((resolve) => { resolveLogin = resolve; }));
        const { result } = renderHook(() => useLogin());

        let pending!: Promise<void>;
        act(() => { pending = result.current.signIn("demo@kanban.fr", "demo"); });
        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            resolveLogin(makeResponse());
            await pending;
        });
        expect(result.current.isLoading).toBe(false);
    });

    it("efface l'erreur précédente lors d'une nouvelle tentative", async () => {
        loginMock.mockRejectedValueOnce(new Error("Email ou mot de passe incorrect."));
        loginMock.mockResolvedValueOnce(makeResponse());
        const { result } = renderHook(() => useLogin());

        await act(() => result.current.signIn("demo@kanban.fr", "mauvais"));
        expect(result.current.error).not.toBeNull();

        await act(() => result.current.signIn("demo@kanban.fr", "demo"));
        expect(result.current.error).toBeNull();
    });
});
