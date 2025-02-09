import { useEffect, useState, useRef } from "react";
import { ChatInput } from "./components/ChatInput";

import { LoginModal } from "./components/LoginModal";
import { useSocket } from "./hooks/useSocket";
import { Message } from "./types/socket";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersSidebar } from "./components/UsersSidebar";
import { ConnectionStatus } from "./components/ConnectionStatus";
import dayjs from "dayjs";
import { ThemeToggle } from "@/components/ThemeToggle";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string>("");
  const { socket, sendMessage, login, isConnected } = useSocket();
  const [pendingHistory, setPendingHistory] = useState<Array<{
    _id: string;
    text: string;
    author: string;
    authorId: string;
    authorColor: string;
    timestamp: number;
  }> | null>(null);
  const [users, setUsers] = useState<
    Array<{ username: string; id: string; color: string }>
  >([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const lastLoadTimeRef = useRef<number>(0);
  const LOAD_COOLDOWN = 200;
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: {
      _id: string;
      text: string;
      author: string;
      authorId: string;
      authorColor: string;
      timestamp: number;
    }) => {
      console.log("Message reçu:", data);
      setMessages((prev) => {
        const existingMessage = prev.find((msg) => msg._id === data._id);

        if (existingMessage) {
          console.log("Message existant trouvé:", existingMessage);
          return prev;
        } else {
          const newMessage = {
            ...data,
            isSent: data.authorId === currentUserId,
          };
          console.log("Ajout du nouveau message:", newMessage);

          // Scroll smooth vers le bas pour les nouveaux messages
          requestAnimationFrame(() => scrollToBottom(true));

          return [...prev, newMessage];
        }
      });
    };

    const handleMessageHistory = (
      history: Array<{
        _id: string;
        text: string;
        author: string;
        authorId: string;
        authorColor: string;
        timestamp: number;
      }>
    ) => {
      console.log("Historique reçu:", history);
      if (!username) {
        setPendingHistory(history);
      } else {
        const historyMessages = history.map((msg) => ({
          ...msg,
          isSent: msg.authorId === currentUserId,
        }));
        setMessages(historyMessages);

        // Scroll instantané vers le bas pour l'historique initial
        requestAnimationFrame(() => {
          scrollToBottom(false);
          setIsInitialLoad(false);
        });
      }
    };

    const handleUsersUpdate = (
      users: Array<{ username: string; id: string; color: string }>
    ) => {
      setUsers(users);
    };

    const handleLoginError = (error: string) => {
      setLoginError(error);
    };

    const handleLoginSuccess = (userId: string) => {
      setCurrentUserId(userId);
    };

    const handleMoreMessages = (oldMessages: Message[]) => {
      if (oldMessages.length === 0) {
        setHasReachedEnd(true);
        setIsLoadingMore(false);
        return;
      }

      const scrollElement = messagesContainerRef.current;
      const beforeScrollHeight = scrollElement?.scrollHeight || 0;
      const beforeScrollTop = scrollElement?.scrollTop || 0;

      setMessages((prev) => [...oldMessages, ...prev]);
      setIsLoadingMore(false);

      // Maintenir la position de scroll
      requestAnimationFrame(() => {
        if (scrollElement) {
          const newScrollHeight = scrollElement.scrollHeight;
          const heightDifference = newScrollHeight - beforeScrollHeight;
          scrollElement.scrollTop = beforeScrollTop + heightDifference;
        }
      });
    };

    socket.on("message", handleMessage);
    socket.on("message-history", handleMessageHistory);
    socket.on("users-update", handleUsersUpdate);
    socket.on("login-error", handleLoginError);
    socket.on("login-success", handleLoginSuccess);
    socket.on("more-messages", handleMoreMessages);

    return () => {
      socket.off("message", handleMessage);
      socket.off("message-history", handleMessageHistory);
      socket.off("users-update", handleUsersUpdate);
      socket.off("login-error", handleLoginError);
      socket.off("login-success", handleLoginSuccess);
      socket.off("more-messages", handleMoreMessages);
    };
  }, [socket, username, currentUserId]);

  useEffect(() => {
    if (username && pendingHistory) {
      const historyMessages = pendingHistory.map((msg) => ({
        ...msg,
        authorId: msg.authorId,
        authorColor: msg.authorColor,
        isSent: msg.authorId === currentUserId,
      }));
      setMessages(historyMessages);
      setPendingHistory(null);
    }
  }, [username, pendingHistory, currentUserId]);

  const handleSendMessage = (message: string) => {
    sendMessage({ text: message, author: username });
  };

  const handleLogin = (name: string) => {
    setLoginError(null);
    setUsername(name);
    login(name);
  };

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (
      target.scrollTop < 100 && // Quand on est proche du haut
      !isLoadingMore &&
      !hasReachedEnd &&
      messages.length > 0
    ) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = () => {
    if (!socket) return;

    // Vérifier si on n'a pas chargé récemment
    const now = Date.now();
    if (now - lastLoadTimeRef.current < LOAD_COOLDOWN) {
      return;
    }

    setIsLoadingMore(true);
    const oldestMessage = messages[0];
    socket.emit("load-more-messages", oldestMessage.timestamp);
    lastLoadTimeRef.current = now;
  };

  if (!username) {
    return <LoginModal onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="fixed inset-0 bg-background">
      <Card className="h-full flex rounded-none border-0">
        <div className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Chat en temps réel - {username}</CardTitle>
              </div>
              <div className="flex items-center justify-between gap-5">
                <ThemeToggle />
                <ConnectionStatus isConnected={isConnected} />
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 flex flex-col min-h-0">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto"
              onScroll={handleScroll}
            >
              <div className="flex flex-col gap-4 p-4">
                {isLoadingMore && (
                  <div className="text-center text-sm text-muted-foreground">
                    Chargement...
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message p-4 rounded-lg ${
                      message.isSent
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    style={{
                      maxWidth: "65%",
                      marginLeft: message.isSent ? "auto" : "0",
                      borderLeft: message.isSent
                        ? "none"
                        : `4px solid ${message.authorColor}`,
                      borderRight: message.isSent
                        ? `4px solid ${message.authorColor}`
                        : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-medium"
                        style={{ color: message.authorColor }}
                      >
                        {message.isSent ? "Vous" : message.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {dayjs(message.timestamp).format("HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
        <UsersSidebar users={users} currentUsername={username} />
      </Card>
    </div>
  );
}

export default App;
