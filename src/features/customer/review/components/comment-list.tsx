'use client';

import CommentItem from './comment-item';

interface Reply {
  id: string;
  author: string;
  photoURL?: string;
  content: string;
  date: string;
}

interface Comment {
  id: string;
  customerId?: string;
  author: string;
  photoURL?: string;
  rating: number;
  content: string;
  date: string;
  replies: Reply[];
}

interface CommentListProps {
  comments: Comment[];
  replyingTo: string | null;
  replySubmittingId?: string | null;
  editingId?: string | null;
  editSubmittingId?: string | null;
  replyEditingId?: string | null;
  replyEditSubmittingId?: string | null;
  isLoggedIn: boolean;
  currentUserId?: string;
  onReplyToggle: (commentId: string) => void;
  onReplySubmit: (commentId: string, content: string) => void;
  onEditToggle: (commentId: string) => void;
  onEditSubmit: (commentId: string, rating: number, content: string) => void;
  onDelete: (commentId: string) => void;
  onReplyEditToggle: (replyId: string) => void;
  onReplyEditSubmit: (replyId: string, content: string) => void;
  onReplyDelete: (replyId: string) => void;
}

export default function CommentList({
  comments,
  replyingTo,
  replySubmittingId,
  editingId,
  editSubmittingId,
  replyEditingId,
  replyEditSubmittingId,
  isLoggedIn,
  currentUserId,
  onReplyToggle,
  onReplySubmit,
  onEditToggle,
  onEditSubmit,
  onDelete,
  onReplyEditToggle,
  onReplyEditSubmit,
  onReplyDelete,
}: CommentListProps) {
  console.log('Rendering CommentList with comments:', comments);
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-4">Chưa có bình luận nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          id={comment.id}
          author={comment.author}
          photoURL={comment.photoURL}
          rating={comment.rating}
          content={comment.content}
          date={comment.date}
          replies={comment.replies}
          isReplyingTo={replyingTo === comment.id}
          isReplySubmitting={replySubmittingId === comment.id}
          isLoggedIn={isLoggedIn}
          isEditable={!!currentUserId && currentUserId === comment.customerId}
          isEditing={editingId === comment.id}
          isEditSubmitting={editSubmittingId === comment.id}
          currentUserId={currentUserId}
          replyEditingId={replyEditingId}
          replyEditSubmittingId={replyEditSubmittingId}
          onReplyToggle={() => onReplyToggle(comment.id)}
          onReplySubmit={(content) => onReplySubmit(comment.id, content)}
          onEditToggle={() => onEditToggle(comment.id)}
          onEditSubmit={(rating, content) => onEditSubmit(comment.id, rating, content)}
          onDelete={() => onDelete(comment.id)}
          onReplyEditToggle={onReplyEditToggle}
          onReplyEditSubmit={onReplyEditSubmit}
          onReplyDelete={onReplyDelete}
        />
      ))}
    </div>
  );
}
