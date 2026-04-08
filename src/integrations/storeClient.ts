"use server";

import { getServerVariables } from "@/server_variables/sync";
import axios from "axios";

/* eslint-disable @typescript-eslint/no-explicit-any */

const apiKey = getServerVariables("PET_ECOMMERCE_API_KEY");
const apiSecret = getServerVariables("PET_ECOMMERCE_API_SECRET");

const headers: Record<string, string> = {
  "Content-Type": "application/json",
};

// Chỉ thêm headers nếu có API key/secret
if (apiKey) headers["x-client-key"] = apiKey;
if (apiSecret) headers["x-client-secret"] = apiSecret;

export const storeClient = axios.create({
  baseURL: getServerVariables("PET_ECOMMERCE_API") || "http://localhost:3000/api",
  headers,
});

export const get = async (
  url: string,
  params?: any,
  defaultReturn?: any,
  onError?: (error: any) => any
) => {
  try {
    const res = await storeClient.request({
      method: "GET",
      url,
      params,
    });
    if (res.status === 200) {
      return res.data;
    } else {
      console.log("Failed to fetch data from store", res.data);
      if (onError) {
        return onError(res.data);
      } else if (defaultReturn) {
        return defaultReturn;
      } else {
        return res.data;
      }
    }
  } catch (error) {
    if (onError) {
      return onError(error);
    } else if (defaultReturn) {
      return defaultReturn;
    } else {
      return null;
    }
  }
};

export const post = async (
  url: string,
  data?: any,
  defaultReturn?: any,
  onError?: (error: any) => any
) => {
  try {
    console.log(`POST: ${url}`, data);
    const res = await storeClient.request({
      method: "POST",
      url,
      data,
    });
    if (res.status === 200) {
      return res.data;
    } else {
      if (onError) {
        return onError(res.data);
      } else if (defaultReturn) {
        return defaultReturn;
      } else {
        console.log(res.data);
        return res.data;
      }
    }
  } catch (error) {
    console.error(error);
    if (onError) {
      return onError(error);
    } else if (defaultReturn) {
      return defaultReturn;
    } else {
      return null;
    }
  }
};

export const put = async (
  url: string,
  data?: any,
  defaultReturn?: any,
  onError?: (error: any) => any
) => {
  try {
    const res = await storeClient.request({
      method: "PUT",
      url,
      data,
    });
    if (res.status === 200) {
      return res.data;
    } else {
      if (onError) {
        return onError(res.data);
      } else if (defaultReturn) {
        return defaultReturn;
      } else {
        return res.data;
      }
    }
  } catch (error) {
    if (onError) {
      return onError(error);
    } else if (defaultReturn) {
      return defaultReturn;
    } else {
      return null;
    }
  }
};

export const del = async (
  url: string,
  data?: any,
  defaultReturn?: any,
  onError?: (error: any) => any
) => {
  try {
    const res = await storeClient.request({
      method: "DELETE",
      url,
      data,
    });
    if (res.status === 200) {
      return res.data;
    } else {
      if (onError) {
        return onError(res.data);
      } else if (defaultReturn) {
        return defaultReturn;
      } else {
        return res.data;
      }
    }
  } catch (error) {
    if (onError) {
      return onError(error);
    } else if (defaultReturn) {
      return defaultReturn;
    } else {
      return null;
    }
  }
};

export const patch = async (
  url: string,
  data?: any,
  defaultReturn?: any,
  onError?: (error: any) => any
) => {
  try {
    const res = await storeClient.request({
      method: "PATCH",
      url,
      data,
    });
    if (res.status === 200) {
      return res.data;
    } else {
      if (onError) {
        return onError(res.data);
      } else if (defaultReturn) {
        return defaultReturn;
      } else {
        return res.data;
      }
    }
  } catch (error) {
    if (onError) {
      return onError(error);
    } else if (defaultReturn) {
      return defaultReturn;
    } else {
      return null;
    }
  }
};
