"use client";

import { useState } from "react";
import { FiMessageCircle, FiUser } from "react-icons/fi";
import { ChatModal, ChatbotPanel } from "@/features/chat";
import { RiRobot2Fill } from "react-icons/ri";

export default function FloatingChatButtons({
  currentUserId,
  currentUserName,
}: {
  currentUserId?: string | null;
  currentUserName?: string | null;
}) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);

  const handleToggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
    setIsStaffOpen(false);
  };

  const handleToggleStaff = () => {
    setIsStaffOpen((prev) => !prev);
    setIsChatbotOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <div className="flex flex-col items-end gap-2">
        <ChatbotPanel
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
        />

        <ChatModal
          isOpen={isStaffOpen}
          onClose={() => setIsStaffOpen(false)}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleToggleChatbot}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-4 bg-primary-1 text-white shadow-lg transition hover:-translate-y-px hover:bg-primary-2"
            aria-label="Mở chatbot"
          >
            <RiRobot2Fill size={18} />
          </button>

          <button
            type="button"
            onClick={handleToggleStaff}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-900 shadow-lg transition hover:-translate-y-px hover:bg-amber-200"
            aria-label="Mở chat nhân viên"
          >
            <FiUser size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
