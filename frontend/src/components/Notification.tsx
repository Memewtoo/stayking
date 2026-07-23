import { useEffect } from "react";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { ExternalLinkIcon, XIcon } from "@heroicons/react/solid";
import useNotificationStore from "../stores/useNotificationStore";
import { useNetworkConfiguration } from "../contexts/NetworkConfigurationProvider";

const NotificationList = () => {
  const { notifications, set } = useNotificationStore((state) => state);
  const reversed = [...notifications].reverse();

  const removeNotification = (visibleIndex: number) => {
    set((state: any) => {
      const originalIndex = reversed.length - 1 - visibleIndex;
      state.notifications = [
        ...notifications.slice(0, originalIndex),
        ...notifications.slice(originalIndex + 1),
      ];
    });
  };

  if (!notifications.length) return null;

  return (
    <div className="notification-stack" aria-label="Notifications">
      {reversed.map((notification, index) => (
        <Notification
          key={`${notification.message}-${index}`}
          {...notification}
          onHide={() => removeNotification(index)}
        />
      ))}
    </div>
  );
};

const Notification = ({
  type,
  message,
  description,
  txid,
  onHide,
}: any) => {
  const { networkConfiguration } = useNetworkConfiguration();

  useEffect(() => {
    const id = window.setTimeout(onHide, 8000);
    return () => window.clearTimeout(id);
  }, [onHide]);

  const Icon =
    type === "success"
      ? CheckCircleIcon
      : type === "error"
      ? XCircleIcon
      : InformationCircleIcon;

  return (
    <article
      className={`notification-card ${
        type === "success"
          ? "notification-success"
          : type === "error"
          ? "notification-error"
          : ""
      }`}
      role={type === "error" ? "alert" : "status"}
    >
      <Icon
        className={`h-6 w-6 shrink-0 ${
          type === "success"
            ? "text-sk-green"
            : type === "error"
            ? "text-sk-error"
            : "text-sk-violet"
        }`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-sk-text">{message}</h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-sk-secondary">
            {description}
          </p>
        )}
        {txid && (
          <a
            href={`https://explorer.solana.com/tx/${txid}?cluster=${networkConfiguration}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sk-green"
          >
            View transaction
            <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>

      <button
        type="button"
        onClick={onHide}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sk-muted transition-colors hover:bg-sk-card-high hover:text-sk-text"
      >
        <span className="sr-only">Close notification</span>
        <XIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
};

export default NotificationList;
