'use client';

interface Reply {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface ReplyListProps {
  replies: Reply[];
}

export default function ReplyList({ replies }: ReplyListProps) {
  if (replies.length === 0) return null;

  return (
    <div className="mt-4 pl-4 border-l-2 border-neutral-6 space-y-3">
      {replies.map((reply) => (
        <div key={reply.id} className="bg-neutral-9 p-3 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium text-sm text-neutral-1">{reply.author}</p>
              <p className="text-xs text-neutral-4">{reply.date}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-2">{reply.content}</p>
        </div>
      ))}
    </div>
  );
}
