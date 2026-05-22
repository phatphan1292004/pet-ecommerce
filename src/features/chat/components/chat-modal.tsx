"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { FiMinimize2, FiUser, FiX } from "react-icons/fi";
import { BsFillSendFill } from "react-icons/bs";

type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type ChatError = {
  message: string;
};

type ChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string | null;
  currentUserName?: string | null;
  conversationIdOverride?: string | null;
  title?: string;
  containerClassName?: string;
  contentClassName?: string;
};

const API_BASE = process.env.PET_ECOMMERCE_API || "http://localhost:9000";

export default function ChatModal({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  conversationIdOverride,
  title,
  containerClassName,
  contentClassName,
}: ChatModalProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string>("Khach");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const socket: Socket = useMemo(
    () =>
      io(API_BASE, {
        transports: ["websocket"],
        autoConnect: false,
      }),
    []
  );

  useEffect(() => {
    if (conversationIdOverride && conversationIdOverride.trim()) {
      setConversationId(conversationIdOverride.trim());
      if (currentUserId) {
        setSenderId(currentUserId);
        setSenderName(currentUserName?.trim() || "Khach");
      }
      return;
    }

    if (currentUserId) {
      setSenderId(currentUserId);
      setSenderName(currentUserName?.trim() || "Khach");
      setConversationId(`conv_${currentUserId}`);
      return;
    }

    if (typeof window === "undefined") return;

    const storageKey = "chat:guestConversationId";
    const storedGuestId = window.localStorage.getItem(storageKey);
    const guestId = storedGuestId || `guest_${crypto.randomUUID()}`;

    if (!storedGuestId) {
      window.localStorage.setItem(storageKey, guestId);
    }

    setSenderId(guestId);
    setSenderName("Khach");
    setConversationId(`conv_${guestId}`);
  }, [currentUserId, currentUserName, conversationIdOverride]);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!isOpen || !conversationId) return;

    setLoading(true);
    setErrorMessage(null);

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/chat/conversations/${conversationId}/messages?limit=50`
        );
        const json = await res.json();
        if (json?.success) {
          setMessages(Array.isArray(json.data) ? json.data : []);
        } else {
          setMessages([]);
          setErrorMessage(json?.message || "Khong the tai lich su chat");
        }
      } catch {
        setMessages([]);
        setErrorMessage("Khong the tai lich su chat");
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, conversationId]);

  useEffect(() => {
    if (!isOpen || !conversationId) return;

    socket.connect();
    socket.emit("join_conversation", { conversationId });

    const onNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((item) => item._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const onChatError = (err: ChatError) => {
      setErrorMessage(err?.message || "Co loi xay ra trong chat");
    };

    socket.on("new_message", onNewMessage);
    socket.on("chat_error", onChatError);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("chat_error", onChatError);
      socket.disconnect();
    };
  }, [isOpen, socket, conversationId]);

  useEffect(() => {
    if (!isOpen) return;
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    const message = text.trim();
    if (!message || !conversationId || !senderId) return;

    socket.emit("send_message", {
      conversationId,
      senderId,
      senderName,
      message,
    });

    setText("");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`mb-2 w-120 overflow-hidden rounded-lg border border-neutral-20 bg-white shadow-xl ${
        containerClassName ? containerClassName : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-neutral-20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-1">
          <FiUser size={16} />
          {title || "Nhân viên hỗ trợ"}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-neutral-30"
            }`}
            title={isConnected ? "Dang ket noi" : "Mat ket noi"}
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
            aria-label="Thu nho chat nhan vien"
          >
            <FiMinimize2 size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
            aria-label="Dong chat nhan vien"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
      <div
        className={`flex h-100 flex-col bg-neutral-10 ${
          contentClassName ? contentClassName : ""
        }`}
      >
        <div className="border-b border-neutral-20 px-4 py-2 text-xs text-neutral-4">
          {senderId ? "Sẵn sàng hỗ trợ bạn" : "Đang khởi tạo phiên chat..."}
        </div>
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {loading ? (
            <p className="text-sm text-neutral-4">Đang tải hội thoại...</p>
          ) : null}

          {!loading && messages.length === 0 ? (
            <p className="text-sm text-neutral-4">
              Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn cho chúng tôi!
            </p>
          ) : null}

          {messages.map((item) => {
            const isMine = item.senderId === senderId;
            return (
              <div
                key={item._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${
                    isMine
                      ? "bg-primary-1 text-white"
                      : "bg-white text-neutral-1"
                  }`}
                >
                  <p className="text-xs opacity-70">
                    {item.senderName || item.senderId}
                  </p>
                  <p>{item.message}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-neutral-20 px-4 py-3">
          {errorMessage ? (
            <p className="mb-2 text-xs text-red-500">{errorMessage}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-full border border-neutral-20 bg-white px-3 py-2 text-sm text-neutral-1 outline-none transition focus:border-primary-3"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!text.trim()}
              className="rounded-full bg-primary-1 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-2 disabled:cursor-not-allowed disabled:bg-neutral-30"
            >
              <BsFillSendFill size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
