"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiMessageCircle, FiMinimize2, FiX } from "react-icons/fi";
import { BsFillSendFill } from "react-icons/bs";
import Image from "next/image";

type ChatbotProduct = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  review?: number;
  image: string;
};

type ChatbotMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  products?: ChatbotProduct[];
};

type ChatbotPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  limit?: number;
  productLimit?: number;
  includeProducts?: boolean;
  containerClassName?: string;
  contentClassName?: string;
};

const API_BASE = process.env.PET_ECOMMERCE_API || "http://localhost:9000";

const formatPrice = (value?: number) => {
  if (typeof value !== "number") return "";
  return `${value.toLocaleString("vi-VN")}₫`;
};

export default function ChatbotPanel({
  isOpen,
  onClose,
  limit = 6,
  productLimit = 6,
  includeProducts = true,
  containerClassName,
  contentClassName,
}: ChatbotPanelProps) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const footerHint = useMemo(
    () =>
      includeProducts
        ? "Hỏi về sản phẩm, chatbot sẽ gợi ý nhanh cho bạn."
        : "Hỏi về chính sách, chatbot sẽ giải đáp nhanh.",
    [includeProducts],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    const question = text.trim();
    if (!question || isLoading) return;

    const userMessage: ChatbotMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/chat/rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          limit,
          productLimit,
          includeProducts,
        }),
      });

      const json = await res.json();

      if (!json?.success) {
        throw new Error(json?.message || "Khong the lay phan hoi chatbot");
      }

      const data = json?.data || {};
      const products: ChatbotProduct[] = Array.isArray(data.products)
        ? data.products.map((item: ChatbotProduct) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            price: item.price,
            originalPrice: item.originalPrice,
            discount: item.discount,
            review: item.review,
            image: item.image,
          }))
        : [];

      const botMessage: ChatbotMessage = {
        id: `bot_${Date.now()}`,
        role: "bot",
        text: data.answer || "Chatbot da tim thay mot vai goi y cho ban.",
        products: products.length ? products : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Khong the ket noi chatbot";
      setErrorMessage(messageText);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: "bot",
          text: "Xin loi, hien tai chatbot chua the tra loi. Vui long thu lai.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`mb-2 w-120 overflow-hidden rounded-lg border border-neutral-20 bg-white shadow-xl ${
        containerClassName ? containerClassName : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-neutral-20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-1">
          <FiMessageCircle size={16} />
          Chatbot
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
            aria-label="Thu nho chatbot"
          >
            <FiMinimize2 size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-4 transition hover:bg-neutral-10"
            aria-label="Dong chatbot"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
      <div
        className={`flex h-100 flex-col bg-neutral-10 ${
          contentClassName ? contentClassName : ""
        }`}
      >
        <div className="border-b border-neutral-20 px-4 py-2 text-xs text-neutral-4">
          {footerHint}
        </div>
        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
        >
          {messages.length === 0 ? (
            <div className="text-sm text-neutral-4">
              Hãy hỏi về sản phẩm, giao hàng hoặc chính sách để được trợ giúp
              nhanh chóng!
            </div>
          ) : null}

          {messages.map((item) => {
            const isUser = item.role === "user";
            return (
              <div
                key={item.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow ${
                    isUser
                      ? "bg-primary-1 text-white"
                      : "bg-white text-neutral-1"
                  }`}
                >
                  <p>{item.text}</p>

                  {!isUser && item.products && item.products.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-neutral-5">
                        Sản phẩm gợi ý
                      </p>
                      <div className="grid gap-2">
                        {item.products.map((product) => {
                          const productLink = product.slug
                            ? `/products/${product.slug}`
                            : "#";
                          return (
                            <Link
                              key={product.id}
                              href={productLink}
                              className="flex gap-3 rounded-lg border border-neutral-20 bg-neutral-10 p-2 transition hover:border-primary-4"
                            >
                              <div className="h-14 w-14 overflow-hidden rounded-md bg-white">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="line-clamp-2 text-xs font-medium text-neutral-1">
                                  {product.name}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                  <span className="font-semibold text-primary-1">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.originalPrice ? (
                                    <span className="text-neutral-4 line-through">
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  ) : null}
                                  {product.discount ? (
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                                      -{product.discount}%
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-3 py-2 text-sm text-neutral-4 shadow">
                Đang tìm thông tin...
              </div>
            </div>
          ) : null}
        </div>
        <div className="border-t border-neutral-20 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Nhập câu hỏi..."
              className="flex-1 rounded-full border border-neutral-20 bg-white px-3 py-2 text-sm text-neutral-1 outline-none transition focus:border-primary-3"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || isLoading}
              className="rounded-full bg-primary-1 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-2 disabled:cursor-not-allowed disabled:bg-neutral-30"
            >
              <BsFillSendFill size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
