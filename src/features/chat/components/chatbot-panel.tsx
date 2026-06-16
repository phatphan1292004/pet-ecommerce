"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiMessageCircle, FiMinimize2, FiX } from "react-icons/fi";
import { BsFillSendFill } from "react-icons/bs";
import Image from "next/image";
import { RiRobot2Fill } from "react-icons/ri";

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

const API_BASE = process.env.NEXT_PUBLIC_PET_ECOMMERCE_API;

const formatPrice = (value?: number) => {
  if (typeof value !== "number") return "";
  return `${value.toLocaleString("vi-VN")}₫`;
};

function MarkdownText({ text, isUser }: { text: string; isUser?: boolean }) {
  if (!text) return null;
  const lines = text.split("\n");
  
  return (
    <div className="space-y-1.5 whitespace-pre-wrap break-words">
      {lines.map((line, lineIndex) => {
        let trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIndex} className="h-2" />;
        }
        
        let isBullet = false;
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          isBullet = true;
          trimmed = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("*") && !trimmed.startsWith("**")) {
          isBullet = true;
          trimmed = trimmed.substring(1).trim();
        } else if (trimmed.startsWith("-") && !trimmed.startsWith("--")) {
          isBullet = true;
          trimmed = trimmed.substring(1).trim();
        }

        // Parse bold tags (**text**)
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        const renderedLine = parts.map((part, partIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIndex} className={`font-bold ${isUser ? "text-white" : "text-neutral-1"}`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lineIndex} className="flex items-start gap-1.5 pl-2 my-0.5">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${isUser ? "bg-white/80" : "bg-neutral-4"}`} />
              <span className="flex-1 text-sm leading-relaxed">{renderedLine}</span>
            </div>
          );
        }

        return (
          <p key={lineIndex} className="text-sm leading-relaxed">
            {renderedLine}
          </p>
        );
      })}
    </div>
  );
}

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  const handleSend = async (questionArg?: string) => {
    const question = (questionArg ?? text).trim();
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

  // fetch suggestion questions from knowledge base for chatbot
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`${API_BASE}/knowledge/suggestions?limit=6`);
        const json = await res.json();
        if (!cancelled) {
          if (json && Array.isArray(json.data)) {
            setSuggestions(json.data.map((x: any) => String(x)));
          } else if (json && Array.isArray(json)) {
            setSuggestions(json.map((x: any) => String(x)));
          } else {
            setSuggestions([
              "Giao hàng mất bao lâu?",
              "Phí vận chuyển là bao nhiêu?",
              "Chính sách đổi trả như thế nào?",
              "Có mã giảm giá không?",
            ]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setSuggestions([
            "Giao hàng mất bao lâu?",
            "Phí vận chuyển là bao nhiêu?",
            "Chính sách đổi trả như thế nào?",
            "Có mã giảm giá không?",
          ]);
        }
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSuggestionClick = (sugg: string) => {
    // send immediately using handleSend
    handleSend(sugg);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`mb-2 w-full overflow-hidden rounded-lg border border-neutral-20 bg-white shadow-xl sm:w-120 ${containerClassName ? containerClassName : ""
        }`}
    >
      <div className="flex items-center justify-between border-b border-neutral-20 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-1">
          <RiRobot2Fill size={16} />
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
        className={`flex h-[min(22rem,calc(100dvh-8rem))] flex-col bg-neutral-10 sm:h-100 ${contentClassName ? contentClassName : ""
          }`}
      >
        <div className="border-b border-neutral-20 px-4 py-2 text-xs text-neutral-4">
          {footerHint}
        </div>
        <div className="px-4 py-3">
          {loadingSuggestions ? (
            <div className="flex items-center gap-2 text-sm text-neutral-4">
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-neutral-30 border-t-primary-1" />
              Gợi ý câu hỏi...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sugg, i) => (
                <button
                  key={`chat-sugg-${i}`}
                  type="button"
                  onClick={() => handleSuggestionClick(sugg)}
                  className="rounded-full border border-neutral-20 bg-white px-3 py-1 text-sm text-neutral-4 shadow-sm hover:bg-primary-1 hover:text-white"
                >
                  {sugg}
                </button>
              ))}
            </div>
          ) : null}
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
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow ${isUser
                    ? "bg-primary-1 text-white"
                    : "bg-white text-neutral-1"
                    }`}
                >
                  <MarkdownText text={item.text} isUser={isUser} />

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
              className="flex-1 rounded-lg border border-neutral-20 bg-white px-3 py-2 text-sm text-neutral-1 outline-none transition focus:border-primary-3"
            />
            <button
              type="button"
              onClick={() => {
                void handleSend();
              }}
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
