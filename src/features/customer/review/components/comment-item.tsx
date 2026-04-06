'use client';

import { FaStar, FaReply } from 'react-icons/fa';
import ReplyForm from './reply-form';
import ReplyList from './reply-list';

interface Reply {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface CommentItemProps {
  author: string;
  rating: number;
  content: string;
  date: string;
  replies: Reply[];
  isReplyingTo: boolean;
  onReplyToggle: () => void;
  onReplySubmit: (content: string) => void;
}

export default function CommentItem({
  author,
  rating,
  content,
  date,
  replies,
  isReplyingTo,
  onReplyToggle,
  onReplySubmit,
}: CommentItemProps) {
  return (
    <div className="border border-neutral-6 rounded-lg p-4">
      {/* Main Comment */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium text-neutral-1">{author}</p>
            <p className="text-sm text-neutral-4">{date}</p>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={14}
                className={
                  i < rating ? 'text-yellow-400' : 'text-neutral-6'
                }
              />
            ))}
          </div>
        </div>
        <p className="text-neutral-2">{content}</p>
      </div>

      {/* Reply Button */}
      <button
        onClick={onReplyToggle}
        className="flex items-center gap-2 text-primary-1 hover:text-primary-2 text-sm font-medium"
      >
        <FaReply size={14} />
        Trả lời
      </button>

      {/* Reply Form */}
      {isReplyingTo && (
        <ReplyForm
          commentAuthor={author}
          onSubmit={onReplySubmit}
          onCancel={onReplyToggle}
        />
      )}

      {/* Replies List */}
      <ReplyList replies={replies} />
    </div>
  );
}
