import hotToast from "react-hot-toast";
import * as React from "react";

type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  action?: any;
};

export function toast({ title, description, variant }: ToastOptions) {
  const messageChildren: React.ReactNode[] = [];
  if (title) {
    messageChildren.push(React.createElement("span", { key: "title", className: "font-bold tracking-tight text-white" }, title));
  }
  if (description) {
    messageChildren.push(React.createElement("span", { key: "desc", className: "text-sm text-gray-400 leading-snug" }, description));
  }

  const message = React.createElement("div", { className: "flex flex-col gap-1" }, ...messageChildren);

  const baseStyle = {
    background: 'rgba(20, 20, 20, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    borderRadius: '16px',
    padding: '16px 20px',
  };

  const destructiveStyle = {
    ...baseStyle,
    background: 'rgba(50, 10, 10, 0.7)',
    border: '1px solid rgba(255, 50, 50, 0.3)',
  };

  if (variant === "destructive") {
    hotToast.error(message, {
      style: destructiveStyle,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    });
  } else {
    hotToast.success(message, {
      style: baseStyle,
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    });
  }

  return {
    id: "toast-id",
    dismiss: () => hotToast.dismiss(),
    update: () => { }
  };
}

export function useToast() {
  return {
    toast,
    dismiss: hotToast.dismiss
  };
}
