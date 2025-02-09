import React from "react";
import { Message } from "../types/socket";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("fr");

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`message ${
        message.isSent ? "message-sent" : "message-received"
      }`}
      style={{ "--author-color": message.authorColor } as React.CSSProperties}
    >
      <div
        className="text-xs font-medium mb-1"
        style={{ color: message.authorColor }}
      >
        {message.isSent ? "Vous" : message.author}
      </div>
      <p>{message.text}</p>
      <div className="timestamp">
        {dayjs(message.timestamp).format("HH:mm")}
      </div>
    </div>
  );
};
