import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// On pointe toujours vers le backend
const SOCKET_URL = "/";

interface MessageData {
  text: string;
  author: string;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initSocket = () => {
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connecté au serveur");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Déconnecté du serveur");
      setIsConnected(false);
    });

    socket.on("connect_error", () => {
      console.log("Erreur de connexion");
      setIsConnected(false);
    });

    return socket;
  };

  useEffect(() => {
    const socket = initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Réinitialiser la connexion quand le socket est déconnecté
  useEffect(() => {
    if (!isConnected && socketRef.current) {
      console.log("Tentative de reconnexion...");
      socketRef.current.connect();
    }
  }, [isConnected]);

  const login = (username: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("user-login", username);
      socketRef.current.emit("request-history");
    }
  };

  const sendMessage = (message: MessageData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message", message);
    }
  };

  const requestHistory = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request-history");
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    requestHistory,
    login,
  };
};
