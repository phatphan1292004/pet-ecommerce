"use client";

import {
  Button,
  Checkbox,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
  Select,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Controller, useForm } from "react-hook-form";
import { useToast } from "@/hooks";
import { createAddress } from "../servers/address";
import { UserAddress } from "@/types/address";
import {
  getProvinces,
  getWardsByProvinceId,
  LocationOption,
} from "../servers/location";

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (address: UserAddress) => void;
}

const ADDRESS_TYPES = ["Nhà riêng", "Văn phòng", "Khác"];
const INITIAL_FORM: AddressForm = {
  fullName: "",
  phone: "",
  email: "",
  provinceId: "",
  wardId: "",
  address: "",
  type: "",
  isDefault: false,
};

type AddressForm = {
  fullName: string;
  phone: string;
  email: string;
  provinceId: string;
  wardId: string;
  address: string;
  type: string;
  isDefault: boolean;
};

export default function AddAddressModal({
  open,
  onClose,
  onCreated,
}: AddAddressModalProps) {
  const { showSuccess, showError } = useToast();
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressForm>({
    defaultValues: INITIAL_FORM,
  });

  const selectedProvinceId = watch("provinceId");

  useEffect(() => {
    let isMounted = true;

    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await getProvinces();
        if (isMounted) {
          setProvinces(data);
        }
      } catch {
        if (isMounted) {
          setProvinces([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProvinces(false);
        }
      }
    };

    void fetchProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!selectedProvinceId) {
      setWards([]);
      setValue("wardId", "");
      return () => {
        isMounted = false;
      };
    }

    const fetchWards = async () => {
      setIsLoadingWards(true);
      try {
        const data = await getWardsByProvinceId(selectedProvinceId);
        if (isMounted) {
          setWards(data);
        }
      } catch {
        if (isMounted) {
          setWards([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingWards(false);
        }
      }
    };

    void fetchWards();

    return () => {
      isMounted = false;
    };
  }, [selectedProvinceId, setValue]);

  const onSubmit = async (form: AddressForm) => {
    const selectedProvince = provinces.find((province) => province.id === form.provinceId);
    const selectedWard = wards.find((ward) => ward.id === form.wardId);

    if (!selectedProvince || !selectedWard) {
      showError("Thông tin tỉnh/thành phố hoặc phường/xã không hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAddress({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        province: selectedProvince.name,
        ward: selectedWard.name,
        address: form.address.trim(),
        type: form.type,
        isDefault: form.isDefault,
      });

      if (!result.success) {
        showError(result.message || "Không thể thêm địa chỉ");
        return;
      }

      showSuccess(result.message || "Thêm địa chỉ thành công");
      if (result.data) {
        onCreated?.(result.data);
      }
      reset(INITIAL_FORM);
      setWards([]);
      onClose();
    } catch {
      showError("Không thể thêm địa chỉ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center px-4">
        <DialogPanel className="bg-white rounded-2xl w-200 max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="relative flex items-center justify-center py-5 px-6 border-b border-neutral-20">
            <DialogTitle className="text-2xl font-bold text-neutral-1">
              Thêm địa chỉ
            </DialogTitle>
            <Button
              onClick={onClose}
              className="absolute right-5 text-neutral-4 hover:text-neutral-1 transition-colors"
            >
              <FaTimes size={18} />
            </Button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-8 py-6 flex flex-col gap-5"
          >
            <Description className="text-sm text-neutral-4">
              Vui lòng lựa chọn địa chỉ giao hàng. Thông tin giao hàng có thể
              thay đổi tại phần Cài đặt.
            </Description>

            <p className="text-base font-semibold text-primary-1">
              Thông tin cá nhân
            </p>

            {/* Họ tên */}
            <Field>
              <Input
                type="text"
                placeholder="Họ tên"
                {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
              />
              {errors.fullName ? (
                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
              ) : null}
            </Field>

            {/* Phone + Email */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Input
                  type="tel"
                  placeholder="Số điện thoại"
                  {...register("phone", { required: "Vui lòng nhập số điện thoại" })}
                  className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
                />
                {errors.phone ? (
                  <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                ) : null}
              </Field>
              <Field>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
                />
              </Field>
            </div>

            {/* Province + Ward */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Controller
                  name="provinceId"
                  control={control}
                  rules={{ required: "Vui lòng chọn tỉnh/thành phố" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setValue("wardId", "", { shouldValidate: true });
                      }}
                      className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
                    >
                      <option value="" disabled>
                        {isLoadingProvinces
                          ? "Đang tải tỉnh/thành phố..."
                          : "Tỉnh, thành phố"}
                      </option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {errors.provinceId ? (
                  <p className="mt-1 text-sm text-red-500">{errors.provinceId.message}</p>
                ) : null}
              </Field>
              <Field>
                <Controller
                  name="wardId"
                  control={control}
                  rules={{ required: "Vui lòng chọn phường/xã" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={
                        !selectedProvinceId || isLoadingProvinces || isLoadingWards
                      }
                      className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
                    >
                      <option value="" disabled>
                        {isLoadingProvinces || isLoadingWards
                          ? "Đang tải phường/xã..."
                          : "Phường, xã"}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {ward.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {errors.wardId ? (
                  <p className="mt-1 text-sm text-red-500">{errors.wardId.message}</p>
                ) : null}
              </Field>
            </div>

            {/* Address */}
            <Field>
              <Input
                type="text"
                placeholder="Địa chỉ"
                {...register("address", { required: "Vui lòng nhập địa chỉ" })}
                className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-1 placeholder:text-neutral-5 outline-none focus:border-primary-3 transition-colors"
              />
              {errors.address ? (
                <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
              ) : null}
            </Field>

            {/* Type */}
            <Field>
              <Select
                {...register("type", { required: "Vui lòng chọn loại địa chỉ" })}
                className="w-full border border-neutral-20 rounded-lg px-4 py-3 text-base text-neutral-5 outline-none focus:border-primary-3 transition-colors appearance-none bg-white"
              >
                <option value="" disabled>
                  Loại địa chỉ
                </option>
                {ADDRESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              {errors.type ? (
                <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
              ) : null}
            </Field>

            {/* Default checkbox */}
            <Field className="flex items-center gap-3 cursor-pointer select-none">
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={field.onChange}
                    className="group flex size-5 items-center justify-center rounded border border-neutral-20 bg-white data-checked:bg-primary-1 data-checked:border-primary-1"
                  >
                    <span className="text-sm font-bold text-white opacity-0 transition-opacity group-data-checked:opacity-100">
                      ✓
                    </span>
                  </Checkbox>
                )}
              />
              <Label className="text-base text-neutral-3">
                Đặt làm địa chỉ mặc định
              </Label>
            </Field>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-10 py-2.5 rounded-lg border border-neutral-20 text-base font-semibold text-neutral-3 hover:bg-neutral-10 transition-colors"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-2.5 rounded-lg bg-primary-1 hover:bg-primary-2 disabled:bg-neutral-5 text-white text-base font-semibold transition-colors disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
