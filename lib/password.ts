import bcrypt from "bcrypt";

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isBcryptHash(value: string): boolean {
  return BCRYPT_HASH_REGEX.test(value);
}

export async function hashPassword(rawPassword: string): Promise<string> {
  return bcrypt.hash(rawPassword, 10);
}

export async function verifyPassword(
  rawPassword: string,
  storedPassword: string,
): Promise<boolean> {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(rawPassword, storedPassword);
  }

  return rawPassword === storedPassword;
}