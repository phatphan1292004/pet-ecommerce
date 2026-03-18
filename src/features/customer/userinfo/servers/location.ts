"use server";

import { get } from "@/integrations/storeClient";

type RawLocation = Record<string, unknown>;

export interface LocationOption {
  id: string;
  name: string;
}

const toStringField = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const normalizeLocation = (
  item: RawLocation,
  idFields: string[],
  nameFields: string[]
): LocationOption | null => {
  const id = idFields.map((field) => toStringField(item[field])).find(Boolean) ?? "";
  const name = nameFields.map((field) => toStringField(item[field])).find(Boolean) ?? "";

  if (!id || !name) {
    return null;
  }

  return { id, name };
};

export const getProvinces = async (): Promise<LocationOption[]> => {
  const res = await get("/provinces");
  const provinces = Array.isArray(res?.data) ? (res.data as RawLocation[]) : [];

  return provinces
    .map((item) => normalizeLocation(item, ["provinceId", "id", "_id", "code"], ["name", "provinceName"]))
    .filter((item): item is LocationOption => item !== null);
};

export const getWardsByProvinceId = async (provinceId: string): Promise<LocationOption[]> => {
  if (!provinceId) {
    return [];
  }

  const res = await get(`/provinces/${provinceId}/wards`);
  const wards = Array.isArray(res?.data) ? (res.data as RawLocation[]) : [];

  return wards
    .map((item) => normalizeLocation(item, ["wardId", "id", "_id", "code"], ["name", "wardName"]))
    .filter((item): item is LocationOption => item !== null);
};
