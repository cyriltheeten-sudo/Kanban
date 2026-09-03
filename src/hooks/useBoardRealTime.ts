import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { setConnectionId } from "../api/realtime";
import type { Board } from "../types";

export function useBoardRealTime(board: Board | null, loadBoard: () => void) {
    useEffect(() => {
        if (!board) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL}/hubs/kanban`)
            .withAutomaticReconnect()
            .build();

        connection.on("BoardChanged", () => {
            loadBoard();
        });

        connection.onreconnected((id) => setConnectionId(id ?? null));

        connection
            .start()
            .then(() => {
                console.log("SignalR connecté ✅");
                setConnectionId(connection.connectionId);
                return connection.invoke("JoinBoard", board.id);
            })
            .catch((err) => console.error("SignalR erreur :", err));

        return () => {
            setConnectionId(null);
            connection.stop();
        };
    }, [board?.id]);
}