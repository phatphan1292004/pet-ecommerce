'use client';

import CommentItem from './comment-item';

interface Reply {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface Comment {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  replies: Reply[];
}

interface CommentListProps {
  comments: Comment[];
  replyingTo: string | null;
  onReplyToggle: (commentId: string) => void;
  onReplySubmit: (commentId: string, content: string) => void;
}

export default function CommentList({
  comments,
  replyingTo,
  onReplyToggle,
  onReplySubmit,
}: CommentListProps) {
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
          author={comment.author}
          rating={comment.rating}
          content={comment.content}
          date={comment.date}
          replies={comment.replies}
          isReplyingTo={replyingTo === comment.id}
          onReplyToggle={() => onReplyToggle(comment.id)}
          onReplySubmit={(content) => onReplySubmit(comment.id, content)}
        />
      ))}
    </div>
  );
}
