"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { Notification } from "@/types";
import Link from "next/link";

const typeIcons: Record<Notification["type"], string> = {
  profile_view: "👁",
  ai_chat: "💬",
  job_match: "🎯",
  assessment: "📊",
  collaboration: "🤝",
};

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase || !userId) return;

    const fetchNotifications = async () => {
      const { data } = await supabase!
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount((data as Notification[]).filter((n) => !n.read).length);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase!
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [userId]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const markAllRead = async () => {
    if (!supabase) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAllRead();
        }}
        className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-600 text-xs mt-1">
                  You&apos;ll see alerts when someone views your profile or chats with your AI
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id}>
                  {notif.link ? (
                    <Link
                      href={notif.link}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                        !notif.read ? "bg-brand-500/5" : ""
                      }`}
                    >
                      <NotifContent notif={notif} timeAgo={timeAgo} />
                    </Link>
                  ) : (
                    <div
                      className={`px-4 py-3 border-b border-white/5 ${
                        !notif.read ? "bg-brand-500/5" : ""
                      }`}
                    >
                      <NotifContent notif={notif} timeAgo={timeAgo} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifContent({
  notif,
  timeAgo,
}: {
  notif: Notification;
  timeAgo: (d: string) => string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base mt-0.5">{typeIcons[notif.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{notif.title}</p>
        <p className="text-xs text-gray-400 truncate">{notif.message}</p>
        <p className="text-xs text-gray-600 mt-1">{timeAgo(notif.created_at)}</p>
      </div>
      {!notif.read && (
        <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
      )}
    </div>
  );
}
