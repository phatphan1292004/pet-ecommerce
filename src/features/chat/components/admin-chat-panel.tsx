"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getNameInitials } from "@/features/admin/order/utils/order-display";
import ChatModal from "./chat-modal";

type ConversationSummary = {
  conversationId: string;
  lastMessage: string | null;
  lastMessageType: "text" | "image" | null;
  lastImageUrl: string | null;
  lastMessageAt: string | null;
  lastSenderId: string | null;
  lastSenderName: string | null;
  customerName?: string | null;
  unreadCount: number | null;
};

type ChatMessage = {
  senderId: string | null;
  senderName: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_PET_ECOMMERCE_API;

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
  const [conversationTitles, setConversationTitles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socket: Socket = useMemo(
    () =>
      io(API_BASE || "", {
        transports: ["websocket"],
        autoConnect: false,
      }),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchConversations = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch(`${API_BASE}/chat/conversations?limit=50&readerId=${currentUserId || ""}`);
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

  const markAsRead = async (conversationId: string) => {
    if (!currentUserId || !conversationId) return;
    try {
      await fetch(`${API_BASE}/chat/conversations/${conversationId}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ readerId: currentUserId }),
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  useEffect(() => {
    if (activeConversationId) {
      void markAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    socket.connect();
    socket.emit("join_conversation", { conversationId: "admin" });

    const onNewMessageAdmin = (msg: any) => {
      const isMessageFromCustomer = msg.senderId !== currentUserId;
      const isCurrentlyActive = msg.conversationId === activeConversationId;

      if (isCurrentlyActive && isMessageFromCustomer) {
        void markAsRead(msg.conversationId);
      }

      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c.conversationId === msg.conversationId
        );

        if (existingIndex > -1) {
          const existingConv = prev[existingIndex];
          const updatedConv: ConversationSummary = {
            ...existingConv,
            lastMessage: msg.message,
            lastMessageType: msg.messageType,
            lastImageUrl: msg.imageUrl,
            lastMessageAt: msg.createdAt,
            lastSenderId: msg.senderId,
            lastSenderName: msg.senderName,
            unreadCount: (isMessageFromCustomer && !isCurrentlyActive)
              ? (existingConv.unreadCount || 0) + 1
              : existingConv.unreadCount,
          };

          const nextConvs = [...prev];
          nextConvs.splice(existingIndex, 1);
          return [updatedConv, ...nextConvs];
        } else {
          const newConv: ConversationSummary = {
            conversationId: msg.conversationId,
            lastMessage: msg.message,
            lastMessageType: msg.messageType,
            lastImageUrl: msg.imageUrl,
            lastMessageAt: msg.createdAt,
            lastSenderId: msg.senderId,
            lastSenderName: msg.senderName,
            unreadCount: (isMessageFromCustomer && !isCurrentlyActive) ? 1 : 0,
          };
          return [newConv, ...prev];
        }
      });
    };

    socket.on("new_message_admin", onNewMessageAdmin);

    return () => {
      socket.off("new_message_admin", onNewMessageAdmin);
      socket.disconnect();
    };
  }, [socket, currentUserId, activeConversationId]);

  useEffect(() => {
    if (activeConversationId || conversations.length === 0) return;

    const latestConversation = conversations.reduce<ConversationSummary | null>(
      (latest, current) => {
        if (!latest) return current;

        const latestTime = latest.lastMessageAt
          ? new Date(latest.lastMessageAt).getTime()
          : 0;
        const currentTime = current.lastMessageAt
          ? new Date(current.lastMessageAt).getTime()
          : 0;

        return currentTime >= latestTime ? current : latest;
      },
      null,
    );

    if (latestConversation?.conversationId) {
      setActiveConversationId(latestConversation.conversationId);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!currentUserId || conversations.length === 0) return;

    const shouldResolveCustomerName = (conversation: ConversationSummary) => {
      const lastSenderName = conversation.lastSenderName?.trim() || "";
      const isStaffLabel = /nhan vien|nhân viên|staff/i.test(lastSenderName);
      const isSameAsCurrentUser = conversation.lastSenderId === currentUserId;
      return (isStaffLabel || isSameAsCurrentUser) && !conversationTitles[conversation.conversationId];
    };

    const fetchCustomerName = async (conversationId: string) => {
      try {
        const res = await fetch(
          `${API_BASE}/chat/conversations/${conversationId}/messages?limit=50`,
        );
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data)) return;

        const customerMessage = json.data.find(
          (item: ChatMessage) => item.senderId && item.senderId !== currentUserId,
        );
        const customerName = customerMessage?.senderName?.trim();
        if (!customerName) return;

        setConversationTitles((prev) => ({
          ...prev,
          [conversationId]: customerName,
        }));
      } catch {
        // ignore - best effort label
      }
    };

    conversations.filter(shouldResolveCustomerName).forEach((conversation) => {
      void fetchCustomerName(conversation.conversationId);
    });
  }, [conversations, currentUserId, conversationTitles]);

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
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    void markAsRead(conversationId);
  };

  const getConversationTitle = (conversation: ConversationSummary) => {
    const cachedTitle = conversationTitles[conversation.conversationId];
    if (cachedTitle) return cachedTitle;

    if (conversation.customerName && conversation.customerName.trim()) {
      return conversation.customerName.trim();
    }

    const lastSenderName = conversation.lastSenderName?.trim() || "";
    const isSameAsCurrentUser =
      Boolean(currentUserId) && conversation.lastSenderId === currentUserId;
    const isStaffLabel = /nhan vien|nhân viên|staff/i.test(lastSenderName);

    if (isSameAsCurrentUser || isStaffLabel) {
      return "Khách hàng";
    }

    return lastSenderName || "Khách hàng";
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="rounded-xl border border-neutral-20 bg-white shadow-sm flex flex-col h-[76vh]">
        <div className="border-b border-neutral-20 px-4 py-3 shrink-0">
          <h2 className="text-base font-semibold text-neutral-2">Chat với khách hàng</h2>
          <p className="mt-1 text-sm text-neutral-4">
            Chọn cuộc hội thoại để hỗ trợ khách hàng.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center gap-2 px-1 text-sm text-neutral-4">
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-neutral-30 border-t-primary-1" />
              Đang tải danh sách chat...
            </div>
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
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-10">
                  {(() => {
                    const avatarUrl =
                      (conversation as any).customerPhotoURL ||
                      (conversation as any).photoURL ||
                      (conversation as any).avatarUrl ||
                      (conversation as any).avatar || "";
                    const title = getConversationTitle(conversation) || conversation.conversationId;

                    if (avatarUrl && String(avatarUrl).trim()) {
                      return (
                        // backend may return external URLs, use plain img
                        <img
                          src={String(avatarUrl)}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      );
                    }

                    const initials = getNameInitials(title);
                    return (
                      <div className="flex h-full w-full items-center justify-center bg-primary-5 text-xs font-semibold text-primary-1">
                        {initials}
                      </div>
                    );
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-neutral-2">
                      {getConversationTitle(conversation)}
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

      <div className="rounded-xl border border-neutral-20 bg-white shadow-sm overflow-hidden flex flex-col h-[76vh]">
        {activeConversationId ? (
          <ChatModal
            isOpen={true}
            onClose={() => setActiveConversationId(null)}
            currentUserId={currentUserId}
            currentUserName={currentUserName || "Khách hàng"}
            conversationIdOverride={activeConversationId}
            title="Chat với khách hàng"
            containerClassName="w-full max-w-none border-0 shadow-none h-full flex-1"
            contentClassName="flex-1 h-full min-h-0 bg-neutral-10"
            isEmbedded={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 h-full text-sm text-neutral-4 bg-neutral-10">
            Chọn một cuộc hội thoại để bắt đầu chat.
          </div>
        )}
      </div>
    </div>
  );
}
