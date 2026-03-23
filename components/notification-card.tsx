import { AlertCircle, Calendar, X, Bell } from "lucide-react";

export interface Notification {
  id: string;
  type: "invoice_due" | "contract_expiring" | "invoice_overdue";
  title: string;
  message: string;
  dueDate?: string;
  expiryDate?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationCardProps {
  notification: Notification;
  onDismiss?: (id: string) => void;
}

export function NotificationCard({
  notification,
  onDismiss,
}: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "invoice_due":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "contract_expiring":
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case "invoice_overdue":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "invoice_due":
        return "bg-blue-50 border-blue-200";
      case "contract_expiring":
        return "bg-amber-50 border-amber-200";
      case "invoice_overdue":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case "invoice_due":
        return "text-blue-900";
      case "contract_expiring":
        return "text-amber-900";
      case "invoice_overdue":
        return "text-red-900";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border ${getBgColor()} flex items-start gap-4 ${
        !notification.read ? "ring-2 ring-yellow-300" : ""
      }`}
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-sm ${getTitleColor()}`}>
          {notification.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        {(notification.dueDate || notification.expiryDate) && (
          <p className="text-xs text-gray-500 mt-2">
            {notification.dueDate &&
              `Hạn: ${new Date(notification.dueDate).toLocaleDateString("vi-VN")}`}
            {notification.expiryDate &&
              `Hết hạn: ${new Date(notification.expiryDate).toLocaleDateString("vi-VN")}`}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(notification.id)}
          className="shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface NotificationsListProps {
  notifications: Notification[];
  loading?: boolean;
  onDismiss?: (id: string) => void;
}

export function NotificationsList({
  notifications,
  loading = false,
  onDismiss,
}: NotificationsListProps) {
  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải thông báo...</p>;
  }

  if (notifications.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        Không có thông báo nào
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
