'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { FaShoppingCart, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ProductDetail } from '../servers';
import { IoMdHeartEmpty } from 'react-icons/io';
import { useCartStore } from '@/store';
import { useToast } from '@/hooks';
import { syncOpenCartItem } from '@/features/customer/cart/servers';
import {
  CommentForm,
  CommentList,
  createReview,
  getReviews,
  type UiReview,
} from '@/features/customer/review';


type Comment = UiReview;
type Reply = UiReview['replies'][number];

interface ProductDetailProps {
  product: ProductDetail;
}

export default function ProductDetailPage({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      const result = await getReviews({ productId: product._id });
      if (!isMounted) return;

      if (result.success && result.data) {
        setComments(result.data);
      } else {
        showWarning('Không tải được bình luận');
      }
    };

    void loadReviews();

    return () => {
      isMounted = false;
    };
  }, [product._id, showWarning]);

  const handleAddComment = async (rating: number, content: string) => {
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
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleAddReply = (commentId: string, content: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: Date.now().toString(),
                  author: 'Bạn',
                  content,
                  date: new Date().toLocaleDateString('vi-VN'),
                },
              ],
            }
          : comment
      )
    );

    setReplyingTo(null);
    showSuccess('Trả lời đã được gửi');
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

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white" >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-neutral-4 text-sm">
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            {/* Main Image with Slide Controls */}
            <div className="relative w-full max-w-150 aspect-square bg-neutral-10 rounded-lg overflow-hidden group">
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FaChevronLeft size={20} className="text-neutral-1" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FaChevronRight size={20} className="text-neutral-1" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden bg-neutral-10 cursor-pointer transition-all ${
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
          <div className="flex flex-col gap-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-1 mb-3">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={16} className={i < (product.review || 0) ? 'text-yellow-400' : 'text-neutral-7'} />
                  ))}
                </div>
                <span className="text-neutral-4 text-sm">(0 đánh giá)</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-neutral-7 py-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-primary-1">{formattedPrice}</span>
                {formattedOriginalPrice && (
                  <span className="text-neutral-5 text-sm line-through">{formattedOriginalPrice}</span>
                )}
              </div>
              {formattedSavings && <p className="text-primary-1 text-sm font-medium">Tiết kiệm {formattedSavings}₫</p>}
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              {product.brand && (
                <div className="flex justify-between py-2">
                  <span className="text-neutral-4">Thương hiệu</span>
                  <span className="text-neutral-1 font-medium">{product.brand}</span>
                </div>
              )}
              {product.specifications?.origin && (
                <div className="flex justify-between py-2">
                  <span className="text-neutral-4">Nguồn gốc</span>
                  <span className="text-neutral-1 font-medium">{product.specifications.origin}</span>
                </div>
              )}
              {product.stock !== undefined && (
                <div className="flex justify-between py-2">
                  <span className="text-neutral-4">Kho hàng</span>
                  <span className={`font-medium ${product.stock > 0 ? 'text-primary-1' : 'text-red-500'}`}>
                    {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>
              )}
              {product.shipping && (
                <div className="flex justify-between py-2">
                  <span className="text-neutral-4">Vận chuyển</span>
                  <span className="text-neutral-1 font-medium">{product.shipping}</span>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
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

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={(product.stock ?? 1) <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-1 hover:bg-primary-2 disabled:bg-neutral-6 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  <FaShoppingCart size={18} />
                  Thêm vào giỏ
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 border border-neutral-7 text-neutral-4 hover:text-primary-1 hover:border-primary-1 rounded-lg transition-colors">
                  <IoMdHeartEmpty size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-t border-neutral-7">
          <TabGroup>
            <TabList className="flex gap-8 border-b border-neutral-7">
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
                        <div key={key} className="flex gap-8 py-1">
                          <span className="text-neutral-4 w-32 shrink-0">{specificationLabels[key] || key}</span>
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
                  />

                  {/* Comments List */}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-1 mb-4">
                      Bình luận ({comments.length})
                    </h3>
                    <CommentList
                      comments={comments}
                      replyingTo={replyingTo}
                      onReplyToggle={handleReplyToggle}
                      onReplySubmit={handleAddReply}
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
