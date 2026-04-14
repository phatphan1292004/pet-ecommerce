const getPublicEnv = (value: string | undefined) => value?.trim() || "";

export interface VietQRConfig {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  template: string;
  transferPrefix: string;
  isConfigured: boolean;
}

export interface BuildVietQRUrlInput {
  bankId: string;
  accountNo: string;
  accountName?: string;
  template?: string;
  amount?: number;
  addInfo?: string;
}

export const getVietQRConfig = (): VietQRConfig => {
  // Use static NEXT_PUBLIC_* accesses so Next.js can inline them in client bundles.
  const bankId = getPublicEnv(process.env.NEXT_PUBLIC_VIETQR_BANK_ID);
  const bankName = getPublicEnv(process.env.NEXT_PUBLIC_VIETQR_BANK_NAME) || bankId;
  const accountNo = getPublicEnv(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO);
  const accountName = getPublicEnv(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME);
  const template = getPublicEnv(process.env.NEXT_PUBLIC_VIETQR_TEMPLATE) || "compact2";
  const transferPrefix = getPublicEnv(process.env.NEXT_PUBLIC_VIETQR_TRANSFER_PREFIX) || "PETSPOT";

  return {
    bankId,
    bankName,
    accountNo,
    accountName,
    template,
    transferPrefix,
    isConfigured: Boolean(bankId && accountNo),
  };
};

export const buildVietQRImageUrl = ({
  bankId,
  accountNo,
  accountName,
  template = "compact2",
  amount,
  addInfo,
}: BuildVietQRUrlInput): string => {
  if (!bankId || !accountNo) {
    return "";
  }

  const url = new URL(`https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`);

  if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
    url.searchParams.set("amount", String(Math.round(amount)));
  }

  if (addInfo && addInfo.trim().length > 0) {
    url.searchParams.set("addInfo", addInfo.trim());
  }

  if (accountName && accountName.trim().length > 0) {
    url.searchParams.set("accountName", accountName.trim());
  }

  return url.toString();
};
