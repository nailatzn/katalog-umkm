'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const email = data?.get?.("email");
  const password = data?.get?.("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatClientSesi();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    let pesan = "Login gagal. Periksa kembali email dan password Anda.";
    if (error.message === "Invalid login credentials") {
      pesan = "Email atau password salah.";
    } else if (error.message) {
      pesan = error.message;
    }
    return { error: pesan };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatClientSesi();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

