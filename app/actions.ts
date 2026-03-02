"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || "demo1234";
const COOKIE_NAME = "auth_session";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;

  if (password === ACCESS_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    redirect("/chat");
  } else {
    return { error: "パスワードが正しくありません" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/");
}

export async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.has(COOKIE_NAME);
}
