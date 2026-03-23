import crypto from "crypto";

export type VnpParamValue = string | number;

export function sortObject(input: Record<string, VnpParamValue | null | undefined>) {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(input)
    .filter((key) => input[key] !== undefined && input[key] !== null)
    .sort();

  for (const key of keys) {
    const value = input[key];
    if (value === undefined || value === null) {
      continue;
    }

    sorted[encodeURIComponent(key)] = encodeURIComponent(String(value)).replace(
      /%20/g,
      "+"
    );
  }

  return sorted;
}

export function buildVnpayQuery(params: Record<string, string>) {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function generateVnpaySignature(signData: string, secret: string) {
  return crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

export function formatVnpayDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
