import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../api/auth";

export function useLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function signIn(email: string, password: string) {
        setIsLoading(true);
        setError(null);
        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    }

    return { signIn, error, isLoading };
}
