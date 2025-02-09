import { ScrollArea } from "@/components/ui/scroll-area";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import React, { useRef } from "react";

interface UsersSidebarProps {
  users: Array<{
    id: string;
    username: string;
    color: string;
  }>;
  currentUsername: string;
}

export const UsersSidebar = ({ users, currentUsername }: UsersSidebarProps) => {
  // Créer une seule ref qui contient un objet pour tous les utilisateurs
  const nodeRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>(
    {}
  );

  // Initialiser les refs manquantes
  users.forEach((user) => {
    if (!nodeRefs.current[user.id]) {
      nodeRefs.current[user.id] = React.createRef();
    }
  });

  return (
    <div className="w-64 border-l bg-muted/50">
      <div className="p-4 border-b">
        <h2 className="font-semibold">
          Utilisateurs connectés ({users.length})
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 flex flex-col gap-2">
          <TransitionGroup>
            {users.map((user) => (
              <CSSTransition
                key={user.id}
                timeout={300}
                classNames="user-item"
                nodeRef={nodeRefs.current[user.id]}
              >
                <div
                  ref={nodeRefs.current[user.id]}
                  className="user-item mb-2"
                  style={{ borderLeft: `4px solid ${user.color}` }}
                >
                  <span
                    className={
                      user.username === currentUsername ? "font-semibold" : ""
                    }
                  >
                    {user.username}
                    {user.username === currentUsername && " (vous)"}
                  </span>
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
      </ScrollArea>
    </div>
  );
};
