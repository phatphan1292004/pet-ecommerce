'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FaUserCircle, FaEdit, FaTrash } from 'react-icons/fa';

interface Reply {
  id: string;
  customerId?: string;
  author: string;
  photoURL?: string;
  content: string;
  date: string;
}

interface ReplyListProps {
  replies: Reply[];
  isLoggedIn: boolean;
  currentUserId?: string;
  editingId?: string | null;
  editSubmittingId?: string | null;
  onEditToggle: (replyId: string) => void;
  onEditSubmit: (replyId: string, content: string) => void;
  onDelete: (replyId: string) => void;
}

function EditReplyForm({
  initialContent,
  isSubmitting,
  onSave,
  onCancel,
}: {
  initialContent: string;
  isSubmitting: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-3 py-2 border border-neutral-5 rounded-lg focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1/15 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] resize-none text-sm"
        rows={3}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSubmitting || !content.trim()}
          className="bg-primary-1 hover:bg-primary-2 disabled:bg-neutral-6 text-white font-medium px-3 py-2 rounded-lg text-xs transition-colors disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          onClick={onCancel}
          className="text-neutral-4 hover:text-neutral-1 text-xs font-medium"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

export default function ReplyList({
  replies,
  isLoggedIn,
  currentUserId,
  editingId,
  editSubmittingId,
  onEditToggle,
  onEditSubmit,
  onDelete,
}: ReplyListProps) {
  if (replies.length === 0) return null;

  return (
    <div className="mt-4 pl-4 border-l-2 border-neutral-6 space-y-3">
      {replies.map((reply) => (
        <div key={reply.id} className="bg-neutral-9 p-3 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-neutral-8">
                {reply.photoURL ? (
                  <Image
                    src={reply.photoURL}
                    alt={reply.author}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-4">
                    <FaUserCircle size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-neutral-1">{reply.author}</p>
                <p className="text-xs text-neutral-4">{reply.date}</p>
              </div>
            </div>
            {isLoggedIn && currentUserId && currentUserId === reply.customerId && (
              <div className="flex items-center gap-2">
                {editingId !== reply.id && (
                  <>
                    <button
                      onClick={() => onEditToggle(reply.id)}
                      className="text-neutral-4 hover:text-primary-1"
                      aria-label={`Edit reply ${reply.id}`}
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(reply.id)}
                      className="text-neutral-4 hover:text-red-500"
                      aria-label={`Delete reply ${reply.id}`}
                    >
                      <FaTrash size={12} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {editingId === reply.id ? (
            <EditReplyForm
              key={`${reply.id}-${reply.content}`}
              initialContent={reply.content}
              isSubmitting={editSubmittingId === reply.id}
              onSave={(content) => onEditSubmit(reply.id, content)}
              onCancel={() => onEditToggle(reply.id)}
            />
          ) : (
            <p className="text-sm text-neutral-2">{reply.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
