import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Alert, AlertProps } from "./Alert";

interface Notification {
  id: number;
  message: string;
  variant: AlertProps["variant"];
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  notify: (
    message: string,
    options?: {
      variant?: AlertProps["variant"];
      title?: string;
      duration?: number;
    }
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

let idCounter = 0;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback(
    (
      message: string,
      options?: {
        variant?: AlertProps["variant"];
        title?: string;
        duration?: number;
      }
    ) => {
      const id = ++idCounter;
      setNotifications((prev) => [
        ...prev,
        {
          id,
          message,
          variant: options?.variant || "success",
          title: options?.title,
          duration: options?.duration || 3000,
        },
      ]);
    },
    []
  );

  const remove = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <NotificationDisplay notifications={notifications} onRemove={remove} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  return ctx;
};

export const NotificationDisplay: React.FC<{
  notifications: Notification[];
  onRemove: (id: number) => void;
}> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 items-end">
      {notifications.map((n) => (
        <Alert
          key={n.id}
          variant={n.variant}
          title={n.title}
          message={n.message}
          duration={n.duration}
          onClose={() => onRemove(n.id)}
          className="shadow-lg w-80"
        />
      ))}
    </div>
  );
};
