'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { FaShoppingCart, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ProductDetail } from '../servers';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import { useCartStore } from '@/store';
import { useToast } from '@/hooks';
import { syncOpenCartItem } from '@/features/customer/cart/servers';
import { addFavoriteProduct } from '@/features/customer/userinfo/servers';
import {
  CommentForm,
  CommentList,
  createReply,
  createReview,
  deleteReview,
  updateReview,
  type UiReview,
} from '@/features/customer/review';


type Comment = UiReview;
type Reply = UiReview['replies'][number];

interface ProductDetailProps {
  product: ProductDetail;
  initialComments: Comment[];
  isLoggedIn: boolean;
  currentUserId?: string;
}

export default function ProductDetailPage({
  product,
  initialComments,
  isLoggedIn,
  currentUserId,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSubmittingId, setEditSubmittingId] = useState<string | null>(null);
  const [replyEditingId, setReplyEditingId] = useState<string | null>(null);
  const [replyEditSubmittingId, setReplyEditSubmittingId] = useState<string | null>(null);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [isFavorited, setIsFavorited] = useState(
    Boolean(product.isFavorite ?? product.is_favorite)
  );
  const addItem = useCartStore((state) => state.addItem);
  const { showSuccess, showWarning } = useToast();

  // Get all images (combine main image with additional images)
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const specificationLabels: { [key: string]: string } = {
    productName: 'Tên sản phẩm',
    brand: 'Thương hiệu',
    weight: 'Khối lượng',
    type: 'Loại',
    purpose: 'Dành cho',
    origin: 'Xuất xứ',
  };

  const benefitLabels: { [key: string]: string } = {
    healthSupport: 'Hỗ trợ sức khỏe',
    nutritionNeeds: 'Nhu cầu dinh dưỡng',
    fatSupport: 'Hỗ trợ lông và da',
    packaging: 'Đóng gói',
  };

  const formattedPrice = product.price.toLocaleString('vi-VN') + '₫';
  const formattedOriginalPrice = product.originalPrice?.toLocaleString('vi-VN') + '₫';
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const formattedSavings = savings > 0 ? savings.toLocaleString('vi-VN') : '';

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= (product.stock || 999)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock || 999)) {
      setQuantity(quantity + 1);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleSelectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleAddComment = async (rating: number, content: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!content.trim()) {
      showWarning('Vui lòng nhập nội dung bình luận');
      return;
    }

    setIsSubmittingReview(true);

    const result = await createReview({
      productId: product._id,
      rating,
      comment: content.trim(),
    });

    if (result.success) {
      const newComment: Comment =
        result.data || {
          id: Date.now().toString(),
          customerId: currentUserId,
          author: 'Bạn',
          rating,
          content: content.trim(),
          date: new Date().toLocaleDateString('vi-VN'),
          replies: [],
        };

      setComments((prev) => [newComment, ...prev]);
      showSuccess('Bình luận đã được gửi');
    } else {
      showWarning(result.message || 'Không gửi được bình luận');
    }

    setIsSubmittingReview(false);
  };

  const handleReplyToggle = (commentId: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để trả lời');
      return;
    }

    setReplyingTo(replyingTo === commentId ? null : commentId);
    setEditingId(null);
    setReplyEditingId(null);
  };

  const handleAddReply = async (commentId: string, content: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để trả lời');
      return;
    }

    if (!content.trim()) {
      showWarning('Vui lòng nhập nội dung trả lời');
      return;
    }

    setReplySubmittingId(commentId);

    const result = await createReply(commentId, {
      comment: content.trim(),
      productId: product._id,
      parentId: commentId,
      level: 1,
      rating: 0,
    });

    if (result.success) {
      const newReply: Reply =
        result.data || {
          id: Date.now().toString(),
          author: 'Bạn',
          content: content.trim(),
          date: new Date().toLocaleDateString('vi-VN'),
        };

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...comment.replies, newReply],
              }
            : comment
        )
      );

      setReplyingTo(null);
      showSuccess('Trả lời đã được gửi');
    } else {
      showWarning(result.message || 'Không gửi được trả lời');
    }

    setReplySubmittingId(null);
  };

  const handleReplyEditToggle = (replyId: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để chỉnh sửa trả lời');
      return;
    }

    setReplyEditingId(replyEditingId === replyId ? null : replyId);
    setReplyingTo(null);
    setEditingId(null);
  };

  const handleReplyEditSubmit = async (replyId: string, content: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để chỉnh sửa trả lời');
      return;
    }

    if (!content.trim()) {
      showWarning('Vui lòng nhập nội dung trả lời');
      return;
    }

    setReplyEditSubmittingId(replyId);

    const result = await updateReview(replyId, {
      comment: content.trim(),
    });

    if (result.success) {
      const updated = result.data;
      setComments((prev) =>
        prev.map((comment) => ({
          ...comment,
          replies: comment.replies.map((reply) =>
            reply.id === replyId
              ? {
                  ...reply,
                  content: updated?.content ?? content.trim(),
                  date: updated?.date ?? reply.date,
                }
              : reply
          ),
        }))
      );
      setReplyEditingId(null);
      showSuccess('Trả lời đã được cập nhật');
    } else {
      showWarning(result.message || 'Không cập nhật được trả lời');
    }

    setReplyEditSubmittingId(null);
  };

  const handleReplyDelete = async (replyId: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để xóa trả lời');
      return;
    }

    const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa trả lời này?');
    if (!shouldDelete) {
      return;
    }

    const result = await deleteReview(replyId, currentUserId);

    if (result.success) {
      setComments((prev) =>
        prev.map((comment) => ({
          ...comment,
          replies: comment.replies.filter((reply) => reply.id !== replyId),
        }))
      );
      setReplyEditingId(null);
      showSuccess('Đã xóa trả lời');
    } else {
      showWarning(result.message || 'Không xóa được trả lời');
    }
  };

  const handleEditToggle = (commentId: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để chỉnh sửa bình luận');
      return;
    }

    setEditingId(editingId === commentId ? null : commentId);
    setReplyingTo(null);
  };

  const handleEditSubmit = async (commentId: string, rating: number, content: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để chỉnh sửa bình luận');
      return;
    }

    if (!content.trim()) {
      showWarning('Vui lòng nhập nội dung bình luận');
      return;
    }

    setEditSubmittingId(commentId);

    const result = await updateReview(commentId, {
      rating,
      comment: content.trim(),
    });

    if (result.success) {
      const updated = result.data;
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                rating: updated?.rating ?? rating,
                content: updated?.content ?? content.trim(),
                date: updated?.date ?? comment.date,
              }
            : comment
        )
      );
      setEditingId(null);
      showSuccess('Bình luận đã được cập nhật');
    } else {
      showWarning(result.message || 'Không cập nhật được bình luận');
    }

    setEditSubmittingId(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để xóa bình luận');
      return;
    }

    const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa bình luận này?');
    if (!shouldDelete) {
      return;
    }

    const result = await deleteReview(commentId, currentUserId);

    if (result.success) {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setEditingId(null);
      showSuccess('Đã xóa bình luận');
    } else {
      showWarning(result.message || 'Không xóa được bình luận');
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if ((product.stock ?? 1) <= 0) {
      showWarning('Sản phẩm hiện đang hết hàng');
      return;
    }

    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      quantity,
    });

    showSuccess(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);

    const result = await syncOpenCartItem({
      productId: product._id,
      quantity,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    });

    if (!result.success) {
      showWarning('Chưa đồng bộ được giỏ hàng lên hệ thống');
    }
  };

  const handleAddToFavorite = async () => {
    if (!isLoggedIn) {
      showWarning('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    if (isAddingFavorite) {
      return;
    }

    setIsAddingFavorite(true);

    const result = await addFavoriteProduct(product._id);

    if (result.success) {
      setIsFavorited(true);
      showSuccess(result.message || 'Đã thêm sản phẩm vào danh sách yêu thích');
    } else {
      showWarning(result.message || 'Không thể thêm vào danh sách yêu thích');
    }

    setIsAddingFavorite(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white" >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-4 sm:text-sm">
            <Link href="/" className="hover:text-primary-1">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary-1">
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-neutral-1">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            {/* Main Image with Slide Controls */}
            <div className="group relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-10">
              <Image
                src={allImages[currentImageIndex]}
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
              />
              {product.discount && product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-yellow-300 text-neutral-1 font-bold text-sm px-3 py-1 rounded">
                  -{product.discount}%
                </div>
              )}
              
              {/* Slide Navigation Buttons */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-100 shadow-md transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <FaChevronLeft size={20} className="text-neutral-1" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 opacity-100 shadow-md transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <FaChevronRight size={20} className="text-neutral-1" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectImage(idx)}
                    className={`h-18 w-18 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-neutral-10 transition-all sm:h-20 sm:w-20 ${
                      currentImageIndex === idx
                        ? 'border-2 border-primary-1'
                        : 'border-2 border-neutral-7 hover:border-primary-1'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx}`}
                      width={80}
                      height={80}
                      className="object-contain p-2 w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Title and Rating */}
            <div>
              <h1 className="mb-3 text-xl font-bold text-neutral-1 sm:text-2xl">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={16} className={i < (product.review || 0) ? 'text-yellow-400' : 'text-neutral-7'} />
                  ))}
                </div>
                <span className="text-neutral-4 text-sm">{product.review} đánh giá</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-neutral-7 py-4">
              <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-2xl font-bold text-primary-1 sm:text-3xl">{formattedPrice}</span>
                {formattedOriginalPrice && (
                  <span className="text-neutral-5 text-sm line-through">{formattedOriginalPrice}</span>
                )}
              </div>
              {formattedSavings && <p className="text-primary-1 text-sm font-medium">Tiết kiệm {formattedSavings}₫</p>}
            </div>

            {/* Product Info */}
            <div className="space-y-1.5">
              {product.brand && (
                <div className="flex items-start justify-between gap-3 py-1.5">
                  <span className="w-2/5 text-neutral-4">Thương hiệu</span>
                  <span className="w-3/5 break-all text-right font-medium text-neutral-1">{product.specifications?.brand}</span>
                </div>
              )}
              {product.specifications?.origin && (
                <div className="flex items-start justify-between gap-3 py-1.5">
                  <span className="w-2/5 text-neutral-4">Nguồn gốc</span>
                  <span className="w-3/5 text-right font-medium text-neutral-1">{product.specifications.origin}</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="flex items-start justify-between gap-3 py-1.5">
                  <span className="w-2/5 text-neutral-4">Kho hàng</span>
                  <span className={`w-3/5 text-right font-medium ${product.stock > 0 ? 'text-primary-1' : 'text-red-500'}`}>
                    {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>
              )}
              {product.shipping && (
                <div className="flex items-start justify-between gap-3 py-1.5">
                  <span className="w-2/5 text-neutral-4">Vận chuyển</span>
                  <span className="w-3/5 text-right font-medium text-neutral-1">{product.shipping}</span>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-neutral-4">Số lượng</span>
                <div className="flex items-center border border-neutral-7 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="px-3 py-2 text-neutral-4 hover:text-primary-1 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock || 999}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center border-0 outline-none"
                  />
                  <button
                    onClick={incrementQuantity}
                    className="px-3 py-2 text-neutral-4 hover:text-primary-1 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={(product.stock ?? 1) <= 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-1 py-3 font-semibold text-white transition-colors hover:bg-primary-2 disabled:cursor-not-allowed disabled:bg-neutral-6"
                >
                  <FaShoppingCart size={18} />
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleAddToFavorite}
                  disabled={isAddingFavorite}
                  aria-label="Thêm vào yêu thích"
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                    product.isFavorited
                      ? 'border-primary-1 bg-primary-6 text-primary-1'
                      : 'border-neutral-7 text-neutral-4 hover:border-primary-1 hover:text-primary-1'
                  }`}
                >
                  {product.isFavorited ? <IoMdHeart size={18} /> : <IoMdHeartEmpty size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-t border-neutral-7">
          <TabGroup>
            <TabList className="flex min-w-max gap-4 overflow-x-auto border-b border-neutral-7 sm:gap-8">
              <Tab
                className={({ selected }) =>
                  `py-4 px-2 font-medium text-sm transition-colors outline-none ${
                    selected
                      ? 'text-primary-1 border-b-2 border-primary-1 -mb-px'
                      : 'text-neutral-4 hover:text-neutral-1'
                  }`
                }
              >
                Thông tin sản phẩm
              </Tab>
              <Tab
                className={({ selected }) =>
                  `py-4 px-2 font-medium text-sm transition-colors outline-none ${
                    selected
                      ? 'text-primary-1 border-b-2 border-primary-1 -mb-px'
                      : 'text-neutral-4 hover:text-neutral-1'
                  }`
                }
              >
                Đánh giá sản phẩm
              </Tab>
            </TabList>

            <TabPanels className="py-8">
              <TabPanel className="space-y-6">
                {product.longDescription && (
                  <div>
                    <h3 className="text-lg font-bold text-neutral-1 mb-3">Mô tả sản phẩm</h3>
                    <p className="text-neutral-3 leading-relaxed">{product.longDescription}</p>
                  </div>
                )}

                {product.specifications && (
                  <div>
                    <h3 className="text-lg font-bold text-neutral-1 mb-3">Thông tin sản phẩm</h3>
                    <div className="space-y-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1 py-1 sm:flex-row sm:gap-8">
                          <span className="w-32 shrink-0 text-neutral-4">{specificationLabels[key] || key}</span>
                          <span className="text-neutral-1">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.benefits && (
                  <div>
                    <h3 className="text-lg font-bold text-neutral-1 mb-3">Lợi ích</h3>
                    <div className="space-y-2">
                      {Object.entries(product.benefits).map(([key, value]) => (
                        <div key={key} className="py-2">
                          <p className="text-neutral-4 text-sm font-medium">{benefitLabels[key] || key}</p>
                          <p className="text-neutral-2">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabPanel>

              <TabPanel>
                <div className="space-y-8">
                  {/* Comment Form */}
                  <CommentForm
                    onSubmit={handleAddComment}
                    isLoading={isSubmittingReview}
                    isLoggedIn={isLoggedIn}
                  />

                  {/* Comments List */}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-1 mb-4">
                      Bình luận ({comments.length})
                    </h3>
                    <CommentList
                      comments={comments}
                      replyingTo={replyingTo}
                      replySubmittingId={replySubmittingId}
                      editingId={editingId}
                      editSubmittingId={editSubmittingId}
                      replyEditingId={replyEditingId}
                      replyEditSubmittingId={replyEditSubmittingId}
                      isLoggedIn={isLoggedIn}
                      currentUserId={currentUserId}
                      onReplyToggle={handleReplyToggle}
                      onReplySubmit={handleAddReply}
                      onEditToggle={handleEditToggle}
                      onEditSubmit={handleEditSubmit}
                      onDelete={handleDeleteComment}
                      onReplyEditToggle={handleReplyEditToggle}
                      onReplyEditSubmit={handleReplyEditSubmit}
                      onReplyDelete={handleReplyDelete}
                    />
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}
