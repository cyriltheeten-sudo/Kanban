import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { setConnectionId } from "../api/realtime";

export function useBoardRealTime(boardId: number, loadBoard: () => void) {
    useEffect(() => {
        if (Number.isNaN(boardId)) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL}/hubs/kanban`)
            .withAutomaticReconnect()
            .build();

        connection.on("BoardChanged", () => {
            loadBoard();
        });

        connection.onreconnected((id) => {
            setConnectionId(id ?? null);
            connection.invoke("JoinBoard", boardId).catch((err) => console.error("SignalR erreur :", err));
            loadBoard();
        });

        connection
            .start()
            .then(() => {
                console.log("SignalR connecté ✅");
                setConnectionId(connection.connectionId);
                return connection.invoke("JoinBoard", boardId);
            })
            .catch((err) => console.error("SignalR erreur :", err));

        return () => {
            setConnectionId(null);
            connection.stop();
        };
    }, [boardId, loadBoard]);
}