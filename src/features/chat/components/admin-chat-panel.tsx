"use client";

import { useEffect, useState } from "react";
import ChatModal from "./chat-modal";

type ConversationSummary = {
  conversationId: string;
  lastMessage: string | null;
  lastMessageType: "text" | "image" | null;
  lastImageUrl: string | null;
  lastMessageAt: string | null;
  lastSenderId: string | null;
  lastSenderName: string | null;
  unreadCount: number | null;
};

const API_BASE = process.env.PET_ECOMMERCE_API || "http://localhost:9000";

type AdminChatPanelProps = {
  currentUserId?: string | null;
  currentUserName?: string | null;
};

export default function AdminChatPanel({
  currentUserId,
  currentUserName,
}: AdminChatPanelProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConversations = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch(`${API_BASE}/chat/conversations?limit=50`);
        const json = await res.json();
        if (!isMounted) return;

        if (json?.success) {
          setConversations(Array.isArray(json.data) ? json.data : []);
        } else {
          setConversations([]);
          setErrorMessage(json?.message || "Khong the tai danh sach chat");
        }
      } catch {
        if (!isMounted) return;
        setConversations([]);
        setErrorMessage("Khong the tai danh sach chat");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatTimeLabel = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateLabel = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="rounded-xl border border-neutral-20 bg-white shadow-sm">
        <div className="border-b border-neutral-20 px-4 py-3">
          <h2 className="text-base font-semibold text-neutral-2">Chat với khách hàng</h2>
          <p className="mt-1 text-sm text-neutral-4">
            Chọn cuộc hội thoại để hỗ trợ khách hàng.
          </p>
        </div>

        <div className="max-h-[70vh] space-y-2 overflow-y-auto px-3 py-3">
          {isLoading ? (
            <p className="px-1 text-sm text-neutral-4">Dang tai danh sach chat...</p>
          ) : null}

          {!isLoading && conversations.length === 0 ? (
            <p className="px-1 text-sm text-neutral-4">Chua co cuoc hoi thoai nao.</p>
          ) : null}

          {conversations.map((conversation) => {
            const isActive = conversation.conversationId === activeConversationId;
            const lastLabel =
              conversation.lastMessageType === "image"
                ? "[Ảnh]"
                : conversation.lastMessage || "";
            const timeLabel = formatTimeLabel(conversation.lastMessageAt);
            const dateLabel = formatDateLabel(conversation.lastMessageAt);

            return (
              <button
                key={conversation.conversationId}
                type="button"
                onClick={() => handleSelectConversation(conversation.conversationId)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-1 text-left text-sm transition ${
                  isActive
                    ? "border-primary-3 bg-primary-4/10"
                    : "border-neutral-20 bg-white hover:border-primary-3"
                }`}
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-10" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-neutral-2">
                      {conversation.lastSenderName || conversation.conversationId}
                    </p>
                    <span className="shrink-0 text-xs text-neutral-4">
                      {dateLabel || timeLabel}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-neutral-4">
                      {lastLabel || "Chua co tin nhan"}
                    </p>
                    {conversation.unreadCount ? (
                      <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-primary-1 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}

          {errorMessage ? (
            <p className="px-1 text-sm text-red-500">{errorMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-20 bg-white shadow-sm">
        {activeConversationId ? (
          <ChatModal
            isOpen={true}
            onClose={() => setActiveConversationId(null)}
            currentUserId={currentUserId}
            currentUserName={currentUserName || "Nhân viên"}
            conversationIdOverride={activeConversationId}
            title="Chat với khách hàng"
            containerClassName="w-full max-w-none border-0 shadow-none"
            contentClassName="h-[70vh]"
          />
        ) : (
          <div className="flex h-[70vh] items-center justify-center text-sm text-neutral-4">
            Chon mot cuoc hoi thoai de bat dau chat.
          </div>
        )}
      </div>
    </div>
  );
}
