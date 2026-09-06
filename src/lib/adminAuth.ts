const ADMIN_SESSION_KEY = "admin-authenticated";
const DEFAULT_PASSWORD = "Admin321";

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export function isAdminAuthenticated(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean): void {
  if (value) localStorage.setItem(ADMIN_SESSION_KEY, "true");
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function verifyAdminPassword(
  password: string,
  storedHash: string | null
): Promise<boolean> {
  return (await hashPassword(password)) === (storedHash ?? await hashPassword(DEFAULT_PASSWORD));
}

export async function getAdminPasswordHash(): Promise<string | null> {
  const { FIREBASE_DATABASE_URL } = await import("@/lib/constants");
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/adminAuth/passwordHash.json`,
    { cache: "no-store", signal: AbortSignal.timeout(10_000) }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal memuat sandi admin`);
  return (await response.json()) as string | null;
}

export async function saveAdminPassword(password: string): Promise<void> {
  const { FIREBASE_DATABASE_URL } = await import("@/lib/constants");
  if (!FIREBASE_DATABASE_URL) throw new Error("Firebase belum dikonfigurasi.");
  const response = await fetch(
    `${FIREBASE_DATABASE_URL.replace(/\/+$/, "")}/adminAuth/passwordHash.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await hashPassword(password)),
      signal: AbortSignal.timeout(20_000),
    }
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}: Gagal menyimpan sandi admin`);
}
