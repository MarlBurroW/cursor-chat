import { Message } from "@/types/socket";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.locale("fr");

const formatMessageDate = (timestamp: number) => {
  const messageDate = dayjs(timestamp);
  const now = dayjs();

  // Si c'est aujourd'hui, afficher juste l'heure
  if (messageDate.isSame(now, "day")) {
    return messageDate.format("HH:mm");
  }

  // Si c'est hier, afficher "Hier à HH:mm"
  if (messageDate.isSame(now.subtract(1, "day"), "day")) {
    return `Hier à ${messageDate.format("HH:mm")}`;
  }

  // Si c'est cette année, afficher "DD MMM à HH:mm"
  if (messageDate.isSame(now, "year")) {
    return messageDate.format("D MMM [à] HH:mm");
  }

  // Si c'est une autre année, afficher la date complète
  return messageDate.format("D MMM YYYY [à] HH:mm");
};

interface MessageGroupProps {
  messages: Message[];
  isOwn: boolean;
}

export const MessageGroup = ({ messages, isOwn }: MessageGroupProps) => {
  return (
    <div className={`message ${isOwn ? "message-sent" : "message-received"}`}>
      <div className="flex justify-between items-center mb-2">
        <div
          className="text-xs font-medium"
          style={{ color: messages[0].authorColor }}
        >
          {isOwn ? "Vous" : messages[0].author}
        </div>
        <div className="timestamp">
          {formatMessageDate(messages[0].timestamp)}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {messages.map((msg) => (
          <div key={`${msg._id}-${msg.timestamp}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
