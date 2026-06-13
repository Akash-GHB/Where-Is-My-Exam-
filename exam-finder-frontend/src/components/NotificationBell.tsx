import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, Info, AlertCircle } from "lucide-react";
import { Client } from "@stomp/stompjs";
import { toast } from "react-hot-toast";
import {
    Notification as NotificationType,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/utils/auth";

export function NotificationBell() {
    const { user } = useAuth();
    const token = getToken();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Unread count
    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        if (!user || !token) return;

        // Load initial notifications
        getNotifications()
            .then(setNotifications)
            .catch((err) => console.error("Failed to load notifications", err));

        // WebSocket Configuration
        const brokerURL = import.meta.env.PROD
            ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`
            : "ws://localhost:8080/ws";

        const client = new Client({
            brokerURL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: function (str) {
                // console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // Subscribe to user-specific queue
            client.subscribe("/user/queue/notifications", (message) => {
                if (message.body) {
                    const notification: NotificationType = JSON.parse(message.body);

                    setNotifications((prev) => [notification, ...prev]);

                    // Show elegant toast
                    toast.custom((t) => (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl flex items-start gap-4 max-w-sm"
                        >
                            <div className="mt-0.5">
                                {notification.type === "SUCCESS" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                {notification.type === "INFO" && <Info className="w-5 h-5 text-blue-500" />}
                                {notification.type === "ALERT" && <AlertCircle className="w-5 h-5 text-red-500" />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-black dark:text-white">{notification.title}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                            </div>
                        </motion.div>
                    ));
                }
            });
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [user, token]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    function getRelativeTime(timestamp: string) {
        const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 60000);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    }

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <Bell className="w-5 h-5 text-black dark:text-white" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black"
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 glass-card bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold text-black dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                                    <Bell className="w-8 h-8 mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                            // dark mode hover handled via class
                                            onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                                            className={`p-4 flex gap-3 transition-colors cursor-pointer dark:hover:bg-white/[0.02] ${notif.read ? "opacity-70" : "bg-blue-50/50 dark:bg-blue-500/5"
                                                }`}
                                        >
                                            <div className="mt-1 shrink-0">
                                                {notif.type === "SUCCESS" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                {notif.type === "INFO" && <Info className="w-5 h-5 text-blue-500" />}
                                                {notif.type === "ALERT" && <AlertCircle className="w-5 h-5 text-red-500" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm truncate ${notif.read ? "font-medium text-gray-800 dark:text-gray-200" : "font-bold text-black dark:text-white"}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap pt-0.5">
                                                        {getRelativeTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className={`text-xs mt-1 line-clamp-2 ${notif.read ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 self-center" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
