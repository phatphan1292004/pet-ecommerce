"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { FiImage, FiMinimize2, FiUser, FiX } from "react-icons/fi";
import { BsFillSendFill } from "react-icons/bs";
import { uploadChatImageToCloudinary } from "@/integrations/cloudinary";
import Image from "next/image";

type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  message: string;
  messageType: "text" | "image";
  imageUrl: string | null;
  isRead: boolean;
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
  isEmbedded?: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_PET_ECOMMERCE_API;

export default function ChatModal({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  conversationIdOverride,
  title,
  containerClassName,
  contentClassName,
  isEmbedded = false,
}: ChatModalProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string>("Khach");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const socket: Socket = useMemo(
    () =>
      io(API_BASE, {
        transports: ["websocket"],
        autoConnect: false,
      }),
    [],
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
          `${API_BASE}/chat/conversations/${conversationId}/messages?limit=50`,
        );
        const json = await res.json();
        if (json?.success) {
          setMessages(Array.isArray(json.data) ? json.data : []);

          if (senderId) {
            void fetch(`${API_BASE}/chat/conversations/${conversationId}/read`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ readerId: senderId }),
            });
          }
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
  }, [isOpen, conversationId, senderId]);


  useEffect(() => {
    if (!isOpen || !conversationId) return;

    socket.connect();
    socket.emit("join_conversation", { conversationId });

    const onNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((item) => item._id === msg._id)) return prev;
        return [...prev, msg];
      });

      if (senderId && msg.senderId !== senderId) {
        void fetch(`${API_BASE}/chat/conversations/${conversationId}/read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ readerId: senderId }),
        });
      }
    };

    const onMessagesRead = (data: { conversationId: string; readerId: string }) => {
      if (data.readerId !== senderId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === senderId ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    const onChatError = (err: ChatError) => {
      setErrorMessage(err?.message || "Co loi xay ra trong chat");
    };

    socket.on("new_message", onNewMessage);
    socket.on("messages_read", onMessagesRead);
    socket.on("chat_error", onChatError);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("messages_read", onMessagesRead);
      socket.off("chat_error", onChatError);
      socket.disconnect();
    };
  }, [isOpen, socket, conversationId, senderId]);

  useEffect(() => {
    if (!isOpen) return;
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  const formatDateLabel = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeLabel = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = async () => {
    const message = text.trim();
    if (!conversationId || !senderId) return;
    if (!message && !selectedImageFile) return;

    if (selectedImageFile) {
      setIsUploadingImage(true);
      setErrorMessage(null);

      try {
        const imageUrl = await uploadChatImageToCloudinary(selectedImageFile);
        socket.emit("send_message", {
          conversationId,
          senderId,
          senderName,
          message,
          messageType: "image",
          imageUrl,
          isRead: false,
        });
        setSelectedImageFile(null);
        if (selectedImagePreview) {
          URL.revokeObjectURL(selectedImagePreview);
          setSelectedImagePreview(null);
        }
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : "Khong the gui hinh anh";
        setErrorMessage(messageText);
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      socket.emit("send_message", {
        conversationId,
        senderId,
        senderName,
        message,
        messageType: "text",
        imageUrl: null,
        isRead: false,
      });
    }

    setText("");
  };

  const handleImageSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleRemoveSelectedImage = () => {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setSelectedImagePreview(null);
    setSelectedImageFile(null);
  };

  const lastMyMessageIndex = useMemo(() => {
    if (!senderId) return -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === senderId) {
        return i;
      }
    }
    return -1;
  }, [messages, senderId]);

  if (!isOpen) return null;

  // Image preview overlay
  const PreviewOverlay = () => {
    if (!previewImageUrl) return null;
    return (
      <div
        className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
        onClick={() => setPreviewImageUrl(null)}
      >
        <button
          type="button"
          onClick={() => setPreviewImageUrl(null)}
          className="absolute top-4 right-4 z-70 rounded-full bg-white p-1"
        >
          <FiX size={20} />
        </button>
        <img
          src={previewImageUrl}
          alt="preview"
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

  return (
    <div
      className={`w-full overflow-hidden flex flex-col ${
        isEmbedded
          ? "h-full border-0 shadow-none rounded-none bg-white"
          : "mb-2 max-w-none rounded-none sm:rounded-lg border border-neutral-20 bg-white shadow-xl sm:w-120"
      } ${containerClassName ? containerClassName : ""}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-20 px-4 py-3 shrink-0">
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
          {!isEmbedded && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
              aria-label="Thu nho chat nhan vien"
            >
              <FiMinimize2 size={14} />
            </button>
          )}
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
        className={`flex flex-col bg-neutral-10 ${
          isEmbedded
            ? "flex-1 h-full min-h-0"
            : "h-[min(22rem,calc(100dvh-8rem))] sm:h-100"
        } ${contentClassName ? contentClassName : ""}`}
      >
        <div className="border-b border-neutral-20 px-4 py-2 text-xs text-neutral-4">
          {senderId ? "Sẵn sàng hỗ trợ bạn" : "Đang khởi tạo phiên chat..."}
        </div>
        
        <div
          ref={listRef}
          className="flex-1 space-y-2 overflow-y-auto px-4 py-3"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-neutral-4">
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-neutral-30 border-t-primary-1" />
              Đang tải hội thoại...
            </div>
          ) : null}

          {!loading && messages.length === 0 ? (
            <p className="text-sm text-neutral-4">
              Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin
              nhắn cho chúng tôi!
            </p>
          ) : null}

          {messages.map((item, index) => {
            const isMine = item.senderId === senderId;
            const currentDateKey = formatDateLabel(
              item.createdAt || item.updatedAt,
            );
            const prevItem = index > 0 ? messages[index - 1] : null;
            const prevDateKey = prevItem
              ? formatDateLabel(prevItem.createdAt || prevItem.updatedAt)
              : "";
            const showDateSeparator =
              currentDateKey && currentDateKey !== prevDateKey;
            const timeLabel = formatTimeLabel(item.createdAt || item.updatedAt);

            return (
              <div key={item._id} className="space-y-2">
                {showDateSeparator ? (
                  <div className="flex items-center justify-center">
                    <span className="rounded-full bg-neutral-20 px-3 py-1 text-xs text-neutral-4">
                      {currentDateKey}
                    </span>
                  </div>
                ) : null}
                <div
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] text-sm ${
                      item.messageType === "image"
                        ? ""
                        : "rounded-2xl px-3 py-2 shadow"
                    } ${
                      item.messageType === "image"
                        ? "text-neutral-1"
                        : isMine
                          ? "text-white"
                          : "text-neutral-1"
                    } ${
                      item.messageType === "image"
                        ? ""
                        : isMine
                          ? "bg-primary-1"
                          : "bg-white"
                    }`}
                  >
                    <p className="text-xs opacity-70">
                      {isMine ? "Bạn" : (item.senderName || item.senderId)}
                    </p>
                    {item.messageType === "image" && item.imageUrl ? (
                      <div className="mt-2 space-y-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImageUrl(item.imageUrl)}
                          className="block"
                        >
                          <img
                            src={item.imageUrl}
                            alt="chat"
                            className="max-h-48 w-auto rounded-lg object-cover"
                          />
                        </button>
                        {item.message ? <p>{item.message}</p> : null}
                      </div>
                    ) : (
                      <p>{item.message}</p>
                    )}
                    <div
                      className={`mt-2 flex items-center gap-2 text-[11px] ${
                        isMine
                          ? "justify-end text-white/70"
                          : "justify-start text-neutral-500"
                      }`}
                    >
                      <span>{timeLabel}</span>
                      {isMine && index === lastMyMessageIndex && (
                        <>
                          <span>•</span>
                          <span>{item.isRead ? "Đã xem" : "Chưa xem"}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-neutral-20 px-4 py-3">
          {errorMessage ? (
            <p className="mb-2 text-xs text-red-500">{errorMessage}</p>
          ) : null}
          {selectedImagePreview ? (
            <div className="mb-3 flex items-start gap-3 rounded-xl border border-neutral-20 bg-white p-2">
              <div className="relative">
                <img
                  src={selectedImagePreview}
                  alt="preview"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveSelectedImage}
                  className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-5 shadow transition hover:text-red-500"
                  aria-label="Xoa anh"
                >
                  <FiX size={12} />
                </button>
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <label
              className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-20 bg-white text-neutral-4 transition hover:border-primary-3 hover:text-primary-2 ${
                isUploadingImage ? "cursor-not-allowed opacity-50" : ""
              }`}
              aria-label="Gui hinh anh"
            >
              <FiImage size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelected}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              onPaste={(event) => {
                const items = event.clipboardData?.items;
                if (!items) return;
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.indexOf("image") !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                      if (selectedImagePreview) {
                        URL.revokeObjectURL(selectedImagePreview);
                      }
                      setSelectedImageFile(file);
                      setSelectedImagePreview(URL.createObjectURL(file));
                      setErrorMessage(null);
                      event.preventDefault();
                      break;
                    }
                  }
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-lg border border-neutral-20 bg-white px-3 py-2 text-sm text-neutral-1 outline-none transition focus:border-primary-3"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={
                (!text.trim() && !selectedImageFile) || isUploadingImage
              }
              className="rounded-full bg-primary-1 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-2 disabled:cursor-not-allowed disabled:bg-neutral-30"
            >
              <BsFillSendFill size={15} />
            </button>
          </div>
          {isUploadingImage ? (
            <p className="mt-2 text-xs text-neutral-4">Dang tai hinh anh...</p>
          ) : null}
        </div>
      </div>
      <PreviewOverlay />
    </div>
  );
}
