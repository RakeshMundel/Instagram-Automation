"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const payload = {
      name: formData.get("name")?.toString(),
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Authentication failed");
      return;
    }

    router.push(searchParams.get("next") ?? "/");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f5ff] px-4">
      <Card className="w-full max-w-md border-[#ccd5f2] bg-white p-7 shadow-none">
        <h1 className="text-2xl font-extrabold text-[#061155]">
          {mode === "signup" ? "Create Account" : "Log In"}
        </h1>
        <p className="mt-2 text-[#6872ad]">Connect Instagram and manage your comment automations.</p>
        <form action={onSubmit} className="mt-7 space-y-5">
          {mode === "signup" ? (
            <div>
              <Label>Name</Label>
              <Input className="mt-2" name="name" placeholder="Rakesh" required />
            </div>
          ) : null}
          <div>
            <Label>Email</Label>
            <Input className="mt-2" name="email" placeholder="you@example.com" required type="email" />
          </div>
          <div>
            <Label>Password</Label>
            <Input className="mt-2" minLength={10} name="password" required type="password" />
          </div>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Log In"}
          </Button>
        </form>
        <a
          className="mt-5 block text-center text-sm font-bold text-primary"
          href={mode === "signup" ? "/login" : "/signup"}
        >
          {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </a>
      </Card>
    </main>
  );
}
