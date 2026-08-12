// Registre partagé : l'id de la connexion SignalR courante.
let connectionId: string | null = null;

export function setConnectionId(id: string | null) {
    connectionId = id;
}

export function getConnectionId() {
    return connectionId;
}