'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FaStar, FaReply, FaUserCircle, FaTrash, FaEdit } from 'react-icons/fa';
import ReplyForm from './reply-form';
import ReplyList from './reply-list';

interface Reply {
  id: string;
  customerId?: string;
  author: string;
  photoURL?: string;
  content: string;
  date: string;
}

interface CommentItemProps {
  id: string;
  author: string;
  photoURL?: string;
  rating: number;
  content: string;
  date: string;
  replies: Reply[];
  isReplyingTo: boolean;
  isReplySubmitting: boolean;
  isLoggedIn: boolean;
  isEditable: boolean;
  isEditing: boolean;
  isEditSubmitting: boolean;
  currentUserId?: string;
  replyEditingId?: string | null;
  replyEditSubmittingId?: string | null;
  onReplyToggle: () => void;
  onReplySubmit: (content: string) => void;
  onEditToggle: () => void;
  onEditSubmit: (rating: number, content: string) => void;
  onDelete: () => void;
  onReplyEditToggle: (replyId: string) => void;
  onReplyEditSubmit: (replyId: string, content: string) => void;
  onReplyDelete: (replyId: string) => void;
}

function EditReviewForm({
  initialRating,
  initialContent,
  isSubmitting,
  onSave,
  onCancel,
}: {
  initialRating: number;
  initialContent: string;
  isSubmitting: boolean;
  onSave: (rating: number, content: string) => void;
  onCancel: () => void;
}) {
  const [editRating, setEditRating] = useState(initialRating);
  const [editContent, setEditContent] = useState(initialContent);

  const handleSave = () => {
    onSave(editRating, editContent);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setEditRating(star)}
            className="transition-transform hover:scale-110"
          >
            <FaStar
              size={18}
              className={star <= editRating ? 'text-yellow-400' : 'text-neutral-6'}
            />
          </button>
        ))}
      </div>
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full px-3 py-2 border border-neutral-5 rounded-lg focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1/15 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] resize-none text-sm"
        rows={3}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSubmitting || !editContent.trim()}
          className="bg-primary-1 hover:bg-primary-2 disabled:bg-neutral-6 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          onClick={onCancel}
          className="text-neutral-4 hover:text-neutral-1 text-sm font-medium"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

export default function CommentItem({
  id,
  author,
  photoURL,
  rating,
  content,
  date,
  replies,
  isReplyingTo,
  isReplySubmitting,
  isLoggedIn,
  isEditable,
  isEditing,
  isEditSubmitting,
  currentUserId,
  replyEditingId,
  replyEditSubmittingId,
  onReplyToggle,
  onReplySubmit,
  onEditToggle,
  onEditSubmit,
  onDelete,
  onReplyEditToggle,
  onReplyEditSubmit,
  onReplyDelete,
}: CommentItemProps) {
  return (
    <div className="border border-neutral-5 rounded-lg p-4">
      {/* Main Comment */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-neutral-8">
              {photoURL ? (
                <Image
                  src={photoURL}
                  alt={author}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-4">
                  <FaUserCircle size={28} />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-neutral-1">{author}</p>
              <p className="text-sm text-neutral-4">{date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={14}
                  className={i < rating ? 'text-yellow-400' : 'text-neutral-6'}
                />
              ))}
            </div>
            {isEditable && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEditToggle}
                  className="text-neutral-4 hover:text-primary-1"
                  aria-label={`Edit review ${id}`}
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={onDelete}
                  className="text-neutral-4 hover:text-red-500"
                  aria-label={`Delete review ${id}`}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
        {isEditing ? (
          <EditReviewForm
            key={`${id}-${rating}-${content}`}
            initialRating={rating}
            initialContent={content}
            isSubmitting={isEditSubmitting}
            onSave={onEditSubmit}
            onCancel={onEditToggle}
          />
        ) : (
          <p className="text-neutral-2">{content}</p>
        )}
      </div>

      {/* Reply Button */}
      {!isEditing && (
        <button
          onClick={onReplyToggle}
          className="flex items-center gap-2 text-primary-1 hover:text-primary-2 text-sm font-medium"
        >
          <FaReply size={14} />
          Trả lời
        </button>
      )}

      {/* Reply Form */}
      {isReplyingTo && (
        <ReplyForm
          commentAuthor={author}
          onSubmit={onReplySubmit}
          onCancel={onReplyToggle}
          isLoading={isReplySubmitting}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* Replies List */}
      <ReplyList
        replies={replies}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        editingId={replyEditingId}
        editSubmittingId={replyEditSubmittingId}
        onEditToggle={onReplyEditToggle}
        onEditSubmit={onReplyEditSubmit}
        onDelete={onReplyDelete}
      />
    </div>
  );
}
