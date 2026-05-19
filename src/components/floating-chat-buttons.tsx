"use client";

import { useState } from "react";
import { FiMessageCircle, FiMinimize2, FiUser, FiX } from "react-icons/fi";

export default function FloatingChatButtons() {
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
        {isChatbotOpen ? (
          <div className="mb-2 w-96 overflow-hidden rounded-2xl border border-neutral-20 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-20 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-1">
                <FiMessageCircle size={16} />
                Chatbot
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChatbotOpen(false)}
                  className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
                  aria-label="Thu nhỏ chatbot"
                >
                  <FiMinimize2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatbotOpen(false)}
                  className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
                  aria-label="Đóng chatbot"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>
            <div className="flex h-80 items-center justify-center bg-neutral-10 text-sm text-neutral-4">
              UI chat chatbot
            </div>
          </div>
        ) : null}

        {isStaffOpen ? (
          <div className="mb-2 w-96 overflow-hidden rounded-2xl border border-neutral-20 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-20 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-1">
                <FiUser size={16} />
                Nhân viên hỗ trợ
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffOpen(false)}
                  className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
                  aria-label="Thu nhỏ chat nhân viên"
                >
                  <FiMinimize2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsStaffOpen(false)}
                  className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
                  aria-label="Đóng chat nhân viên"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>
            <div className="flex h-80 items-center justify-center bg-neutral-10 text-sm text-neutral-4">
              UI chat nhân viên
            </div>
          </div>
        ) : null}

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleToggleChatbot}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-4 bg-primary-1 text-white shadow-lg transition hover:translate-y-[-1px] hover:bg-primary-2"
            aria-label="Mở chatbot"
          >
            <FiMessageCircle size={18} />
          </button>

          <button
            type="button"
            onClick={handleToggleStaff}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-amber-900 shadow-lg transition hover:translate-y-[-1px] hover:bg-amber-200"
            aria-label="Mở chat nhân viên"
          >
            <FiUser size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
