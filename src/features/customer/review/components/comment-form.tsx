'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

interface CommentFormProps {
  onSubmit: (rating: number, content: string) => void;
  isLoading?: boolean;
  isLoggedIn?: boolean;
}

export default function CommentForm({
  onSubmit,
  isLoading,
  isLoggedIn = false,
}: CommentFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, content);
    setContent('');
    setRating(5);
  };

  return (
    <div className="bg-neutral-9 rounded-lg">
      <h3 className="text-lg font-bold text-neutral-1 mb-4">Viết bình luận</h3>

      {!isLoggedIn && (
        <p className="mb-4 text-sm text-neutral-4">
          Vui lòng
          <Link href="/login" className="mx-1 text-primary-1 hover:text-primary-2">
            đăng nhập
          </Link>
          để bình luận.
        </p>
      )}

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-neutral-4 mb-2">Đánh giá</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <FaStar
                size={20}
                className={star <= rating ? 'text-yellow-400' : 'text-neutral-6'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment Input */}
      <div className="mb-4">
        <label className="block text-neutral-4 mb-2">Nội dung bình luận</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
          className="w-full px-4 py-3 border border-neutral-5 rounded-lg focus:outline-none focus:border-primary-1 focus:ring-1 focus:ring-primary-1/15 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)] resize-none"
          disabled={!isLoggedIn}
          rows={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !isLoggedIn}
        className="bg-primary-1 hover:bg-primary-2 disabled:bg-neutral-6 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
      >
        {isLoading ? 'Đang gửi...' : 'Gửi bình luận'}
      </button>
    </div>
  );
}
