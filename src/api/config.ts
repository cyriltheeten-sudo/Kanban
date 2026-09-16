const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
    throw new Error(
        "VITE_API_URL n'est pas défini. Ajoute-le dans .env.development ou .env.production à la racine du projet."
    );
}

export const API_BASE_URL: string = rawApiUrl;
export const API_URL = `${API_BASE_URL}/api`;
