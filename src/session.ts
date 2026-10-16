export type StoredUser = {
  email: string;
  password: string;
};

const USERS_KEY = "kibit.users";
const SESSION_KEY = "kibit.session";

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "email" in item &&
        "password" in item &&
        typeof item.email === "string" &&
        typeof item.password === "string"
      ) {
        return [{ email: item.email, password: item.password }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function currentEmail(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function registerUser(email: string, password: string): "ok" | "exists" {
  const normalized = normalizeEmail(email);
  const users = readUsers();
  if (users.some((user) => user.email === normalized)) return "exists";

  users.push({ email: normalized, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, normalized);
  return "ok";
}

export function loginUser(email: string, password: string): "ok" | "invalid" {
  const normalized = normalizeEmail(email);
  const user = readUsers().find((item) => item.email === normalized);
  if (!user || user.password !== password) return "invalid";

  localStorage.setItem(SESSION_KEY, normalized);
  return "ok";
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}
