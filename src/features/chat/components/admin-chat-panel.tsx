"use client";

import { useState } from "react";
import ChatModal from "./chat-modal";

type AdminChatPanelProps = {
  currentUserId?: string | null;
  currentUserName?: string | null;
};

export default function AdminChatPanel({
  currentUserId,
  currentUserName,
}: AdminChatPanelProps) {
  const [inputConversationId, setInputConversationId] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleJoinConversation = () => {
    const value = inputConversationId.trim();
    if (!value) {
      setErrorMessage("Vui lòng nhập conversationId");
      return;
    }

    setErrorMessage(null);
    setActiveConversationId(value);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-20 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-2">Chat với khách hàng</h2>
        <p className="mt-1 text-sm text-neutral-4">
          Nhập conversationId để tham gia phòng chat của khách hàng.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={inputConversationId}
            onChange={(event) => setInputConversationId(event.target.value)}
            placeholder="Ví dụ: conv_123"
            className="w-full flex-1 rounded-lg border border-neutral-20 px-3 py-2 text-sm text-neutral-2 outline-none transition focus:border-primary-3"
          />
          <button
            type="button"
            onClick={handleJoinConversation}
            className="inline-flex items-center justify-center rounded-lg bg-primary-1 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-2"
          >
            Mở chat
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
        ) : null}
      </div>

      <ChatModal
        isOpen={!!activeConversationId}
        onClose={() => setActiveConversationId(null)}
        currentUserId={currentUserId}
        currentUserName={currentUserName || "Nhân viên"}
        conversationIdOverride={activeConversationId}
        title="Chat với khách hàng"
        containerClassName="w-full max-w-none"
        contentClassName="h-[60vh]"
      />
    </div>
  );
}
