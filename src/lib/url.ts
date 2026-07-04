// Safe URL helpers — accept only http(s) schemes to prevent javascript: XSS.
export function isSafeHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  return isSafeHttpUrl(value) ? (value as string) : null;
}
