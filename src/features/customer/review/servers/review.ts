"use server";

import { cookies } from "next/headers";
import { del, get, patch, post } from "@/integrations/storeClient";

export interface ReviewListParams {
	productId?: string;
	customerId?: string;
	page?: number;
	limit?: number;
}

export interface CreateReviewPayload {
	productId: string;
	customerId?: string;
	rating: number;
	comment: string;
	images?: string[];
	level?: number;
}

export interface CreateReplyPayload {
	comment: string;
	customerId?: string;
	productId?: string;
	parentId?: string;
	level?: number;
	rating?: number;
}

export interface UpdateReviewPayload {
	rating?: number;
	comment?: string;
	images?: string[];
}

export interface UiReply {
	id: string;
	customerId?: string;
	author: string;
	photoURL?: string;
	content: string;
	date: string;
}

export interface UiReview {
	id: string;
	customerId?: string;
	author: string;
	photoURL?: string;
	rating: number;
	content: string;
	date: string;
	replies: UiReply[];
}

interface ActionResult<T> {
	success: boolean;
	message: string;
	data?: T;
}

const getCurrentUserId = async (): Promise<string> => {
	const cookieStore = await cookies();
	const userId = cookieStore.get("userId")?.value || "";
	if (userId.startsWith("guest-")) {
		return "";
	}
	return userId;
};

const toRecord = (value: unknown): Record<string, unknown> =>
	value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toStringValue = (value: unknown): string => {
	if (typeof value === "string" || typeof value === "number") {
		return String(value);
	}

	if (value && typeof value === "object") {
		const asAny = value as { toString?: () => string };
		if (typeof asAny.toString === "function") {
			const text = asAny.toString();
			if (text && text !== "[object Object]") {
				return text;
			}
		}
	}

	return "";
};

const toNumberValue = (value: unknown, fallback = 0): number => {
	const num = typeof value === "number" ? value : Number(value);
	return Number.isFinite(num) ? num : fallback;
};

const formatDate = (value: unknown): string => {
	const raw = toStringValue(value);
	if (!raw) {
		return new Date().toLocaleDateString("vi-VN");
	}

	const parsed = new Date(raw);
	if (Number.isNaN(parsed.getTime())) {
		return raw;
	}

	return parsed.toLocaleDateString("vi-VN");
};

const resolveAuthorName = (review: Record<string, unknown>): string => {
	const author = toRecord(review.author);
	const customer = toRecord(review.customer);
	const user = toRecord(review.user);

	return (
		toStringValue(author.name) ||
		toStringValue(author.displayName) ||
		toStringValue(customer.displayName) ||
		toStringValue(customer.name) ||
		toStringValue(user.displayName) ||
		toStringValue(user.name) ||
		toStringValue(review.authorName) ||
		toStringValue(review.customerName) ||
		"Khach hang"
	);
};

const resolveAuthorPhoto = (review: Record<string, unknown>): string => {
	const author = toRecord(review.author);
	const customer = toRecord(review.customer);
	const user = toRecord(review.user);

	return (
		toStringValue(author.photoURL) ||
		toStringValue(author.avatar) ||
		toStringValue(author.avatarUrl) ||
		toStringValue(author.profileImage) ||
		toStringValue(customer.photoURL) ||
		toStringValue(customer.avatar) ||
		toStringValue(customer.avatarUrl) ||
		toStringValue(customer.profileImage) ||
		toStringValue(user.photoURL) ||
		toStringValue(user.avatar) ||
		toStringValue(user.avatarUrl) ||
		toStringValue(user.profileImage) ||
		toStringValue(review.photoURL) ||
		toStringValue(review.avatar) ||
		toStringValue(review.avatarUrl) ||
		toStringValue(review.profileImage) ||
		""
	);
};

const resolveReviewId = (review: Record<string, unknown>): string =>
	(
		toStringValue(review._id) ||
		toStringValue(review.id) ||
		toStringValue(review.reviewId) ||
		String(Date.now())
	);

const resolveReviewRating = (review: Record<string, unknown>): number =>
	Math.max(1, Math.min(5, toNumberValue(review.rating ?? review.score ?? review.stars, 5)));

const resolveReviewContent = (review: Record<string, unknown>): string =>
	toStringValue(review.content || review.comment || review.text || review.review || "");

const resolveReviewLevel = (review: Record<string, unknown>): number | null => {
	const value = review.level ?? review.depth ?? review.replyLevel;
	if (value === undefined || value === null) {
		return null;
	}

	return toNumberValue(value, 0);
};

const resolveParentId = (review: Record<string, unknown>): string =>
	toStringValue(
		review.parentId ||
			review.replyTo ||
			review.replyToId ||
			review.parentReviewId ||
			review.rootId ||
			review.commentId
	);

const resolveReviewDate = (review: Record<string, unknown>): string =>
	formatDate(review.createdAt || review.created_at || review.date || review.updatedAt);

const resolveCustomerId = (review: Record<string, unknown>): string => {
	const customer = toRecord(review.customer);
	const user = toRecord(review.user);
	const author = toRecord(review.author);

	return (
		toStringValue(review.customerId) ||
		toStringValue(review.customer_id) ||
		toStringValue(customer._id) ||
		toStringValue(customer.id) ||
		toStringValue(user._id) ||
		toStringValue(user.id) ||
		toStringValue(author._id) ||
		toStringValue(author.id)
	);
};

const normalizeReplies = (raw: unknown): UiReply[] => {
	if (!Array.isArray(raw)) {
		return [];
	}

	return raw.map((reply) => {
		const record = toRecord(reply);
		const customer = toRecord(record.customer);
		const user = toRecord(record.user);
		return {
			id: toStringValue(record._id || record.id || record.replyId || Date.now()),
			customerId: resolveCustomerId(record) || undefined,
			author:
				toStringValue(record.authorName) ||
				toStringValue(record.author) ||
				toStringValue(customer.displayName) ||
				toStringValue(customer.name) ||
				toStringValue(user.displayName) ||
				toStringValue(user.name) ||
				toStringValue(record.customerName) ||
				"Khach hang",
			photoURL: resolveAuthorPhoto(record),
			content: toStringValue(record.content || record.comment || record.text || ""),
			date: formatDate(record.createdAt || record.created_at || record.date),
		};
	});
};

const normalizeReview = (raw: unknown): UiReview => {
	const review = toRecord(raw);
	return {
		id: resolveReviewId(review),
		customerId: resolveCustomerId(review) || undefined,
		author: resolveAuthorName(review),
		photoURL: resolveAuthorPhoto(review),
		rating: resolveReviewRating(review),
		content: resolveReviewContent(review),
		date: resolveReviewDate(review),
		replies: normalizeReplies(review.replies),
	};
};

const extractReviewItems = (payload: unknown): unknown[] => {
	if (Array.isArray(payload)) {
		return payload;
	}

	const record = toRecord(payload);
	const data = record.data ?? record.reviews ?? record.replies ?? record.items ?? record.rows;

	if (Array.isArray(data)) {
		return data;
	}

	const nested =
		toRecord(data).data ??
		toRecord(data).items ??
		toRecord(data).reviews ??
		toRecord(data).replies;
	if (Array.isArray(nested)) {
		return nested;
	}

	return [];
};

const normalizeReplyItems = (payload: unknown): UiReply[] => {
	const items = extractReviewItems(payload);
	if (items.length === 0) {
		return [];
	}

	return items.map((item) => {
		const record = toRecord(item);
		const customer = toRecord(record.customer);
		const user = toRecord(record.user);
		return {
			id: toStringValue(record._id || record.id || record.replyId || Date.now()),
			customerId: resolveCustomerId(record) || undefined,
			author:
				toStringValue(record.authorName) ||
				toStringValue(record.author) ||
				toStringValue(customer.displayName) ||
				toStringValue(customer.name) ||
				toStringValue(user.displayName) ||
				toStringValue(user.name) ||
				toStringValue(record.customerName) ||
				"Khach hang",
			photoURL: resolveAuthorPhoto(record),
			content: toStringValue(record.content || record.comment || record.text || ""),
			date: formatDate(record.createdAt || record.created_at || record.date),
		};
	});
};

const normalizeReviews = (payload: unknown): UiReview[] => {
	const items = extractReviewItems(payload);
	if (items.length === 0) {
		return [];
	}

	const mapped = items.map((item) => {
		const record = toRecord(item);
		return {
			ui: normalizeReview(record),
			level: resolveReviewLevel(record),
			parentId: resolveParentId(record),
		};
	});

	const roots = mapped.filter(({ level }) => level === null || level <= 0);
	const replies = mapped.filter(({ level }) => level !== null && level > 0);

	if (roots.length === 0 && replies.length === 0) {
		return mapped.map((item) => item.ui);
	}

	if (replies.length === 0) {
		return roots.map((item) => item.ui);
	}

	const replyMap = new Map<string, UiReply[]>();

	for (const reply of replies) {
		const parentId = reply.parentId;
		if (!parentId) {
			continue;
		}

		const list = replyMap.get(parentId) || [];
		list.push({
			id: reply.ui.id,
			customerId: reply.ui.customerId,
			author: reply.ui.author,
			photoURL: reply.ui.photoURL,
			content: reply.ui.content,
			date: reply.ui.date,
		});
		replyMap.set(parentId, list);
	}

	return roots.map((item) => ({
		...item.ui,
		replies: replyMap.get(item.ui.id) || item.ui.replies,
	}));
};

export const getReviews = async (
	params: ReviewListParams
): Promise<ActionResult<UiReview[]>> => {
	const response = await get(`/reviews`, params, { data: [] });
	const reviews = normalizeReviews(response);

	return {
		success: true,
		message: "Reviews fetched successfully",
		data: reviews,
	};
};

export const getReviewById = async (
	reviewId: string
): Promise<ActionResult<UiReview | null>> => {
	const response = await get(`/reviews/${reviewId}`);
	const reviews = normalizeReviews(response);

	return {
		success: true,
		message: "Review fetched successfully",
		data: reviews[0] ?? null,
	};
};

export const createReview = async (
	payload: CreateReviewPayload
): Promise<ActionResult<UiReview | null>> => {
	const customerId = payload.customerId || (await getCurrentUserId());

	if (!payload.productId) {
		return { success: false, message: "Product is required" };
	}

	const response = await post(`/reviews`, {
		productId: payload.productId,
		customerId,
		rating: payload.rating,
		comment: payload.comment,
		images: payload.images,
		level: payload.level ?? 0,
	});

	if (!response) {
		return { success: false, message: "Failed to create review" };
	}

	const reviews = normalizeReviews(response);

	return {
		success: true,
		message: "Review created successfully",
		data: reviews[0] ?? null,
	};
};

export const getReplies = async (
	reviewId: string,
	params?: { page?: number; limit?: number }
): Promise<ActionResult<UiReply[]>> => {
	const response = await get(`/reviews/${reviewId}/replies`, params, { data: [] });
	const replies = normalizeReplyItems(response);

	return {
		success: true,
		message: "Replies fetched successfully",
		data: replies,
	};
};

export const createReply = async (
	reviewId: string,
	payload: CreateReplyPayload
): Promise<ActionResult<UiReply | null>> => {
	const customerId = payload.customerId || (await getCurrentUserId());

	if (!payload.comment?.trim()) {
		return { success: false, message: "Comment is required" };
	}

	const response = await post(`/reviews/${reviewId}/replies`, {
		comment: payload.comment,
		customerId,
		productId: payload.productId,
		parentId: payload.parentId || reviewId,
		level: payload.level ?? 1,
		rating: payload.rating ?? 0,
	});

	if (!response) {
		return { success: false, message: "Failed to create reply" };
	}

	const replies = normalizeReplyItems(response);

	return {
		success: true,
		message: "Reply created successfully",
		data: replies[0] ?? null,
	};
};

export const updateReview = async (
	reviewId: string,
	payload: UpdateReviewPayload
): Promise<ActionResult<UiReview | null>> => {
	const customerId = await getCurrentUserId();
	const response = await patch(`/reviews/${reviewId}`, {
		...payload,
		customerId: customerId || undefined,
	});

	if (!response) {
		return { success: false, message: "Failed to update review" };
	}

	const reviews = normalizeReviews(response);

	return {
		success: true,
		message: "Review updated successfully",
		data: reviews[0] ?? null,
	};
};

export const deleteReview = async (
	reviewId: string,
	customerId?: string
): Promise<ActionResult<null>> => {
	const resolvedCustomerId = customerId || (await getCurrentUserId());
	const response = await del(
		`/reviews/${reviewId}`,
		resolvedCustomerId ? { customerId: resolvedCustomerId } : undefined
	);

	if (!response) {
		return { success: false, message: "Failed to delete review" };
	}

	return { success: true, message: "Review deleted successfully" };
};
