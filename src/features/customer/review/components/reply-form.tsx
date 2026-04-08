'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ReplyFormProps {
  commentAuthor: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isLoggedIn?: boolean;
}

export default function ReplyForm({
  commentAuthor,
  onSubmit,
  onCancel,
  isLoading,
  isLoggedIn = false,
}: ReplyFormProps) {
  const [replyText, setReplyText] = useState('');

  const handleSubmit = () => {
    onSubmit(replyText);
    setReplyText('');
  };

  return (
    <div className="mt-4 p-4 bg-neutral-9 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-neutral-4">
          Trả lời bình luận từ {commentAuthor}
        </p>
        <button
          onClick={onCancel}
          className="text-neutral-4 hover:text-neutral-1"
        >
          <FaTimes size={16} />
        </button>
      </div>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Nhập trả lời của bạn..."
        className="w-full px-3 py-2 border border-neutral-5 rounded-lg focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1/15 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] resize-none text-sm mb-2"
        disabled={!isLoggedIn}
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading || !replyText.trim() || !isLoggedIn}
        className="bg-primary-1 hover:bg-primary-2 disabled:bg-neutral-6 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
      >
        {isLoading ? 'Đang gửi...' : 'Gửi trả lời'}
      </button>
    </div>
  );
}
