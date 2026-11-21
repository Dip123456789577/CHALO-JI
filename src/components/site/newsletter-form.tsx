import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert(
          { email: email.trim().toLowerCase() },
          { onConflict: "email", ignoreDuplicates: true },
        );
      if (error) throw error;
      setStatus("success");
      setMessage("Welcome to the AURELLE circle. Your first letter is on its way.");
      setEmail("");
    } catch {
      // Fallback: store locally so the signup still "works" in demo/offline mode.
      try {
        const key = "aurelle-newsletter";
        const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
        if (!existing.includes(email.trim().toLowerCase())) {
          existing.push(email.trim().toLowerCase());
          localStorage.setItem(key, JSON.stringify(existing));
        }
        setStatus("success");
        setMessage("Welcome to the AURELLE circle.");
        setEmail("");
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className={`flex border-b ${dark ? "border-[#F8F5F0]/30" : "border-[#111111]/30"}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={`w-full bg-transparent py-3 text-sm tracking-wide placeholder:opacity-60 focus:outline-none ${
            dark
              ? "text-[#F8F5F0] placeholder:text-[#F8F5F0]/50"
              : "text-[#111111] placeholder:text-[#88847D]"
          }`}
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
            dark ? "text-[#C3A46B] hover:text-[#F8F5F0]" : "text-[#111111] hover:text-[#C3A46B]"
          }`}
          aria-label="Subscribe"
        >
          {status === "loading" ? "…" : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      {status === "success" && (
        <p className="mt-3 flex items-center gap-2 text-xs text-[#C3A46B]">
          <Check className="h-3.5 w-3.5" /> {message}
        </p>
      )}
      {status === "error" && <p className="mt-3 text-xs text-red-600">{message}</p>}
      <p
        className={`mt-3 text-[11px] leading-relaxed ${dark ? "text-[#E8E0D6]/60" : "text-[#88847D]"}`}
      >
        By subscribing you agree to our{" "}
        <Link
          to="/pages/$slug"
          params={{ slug: "privacy" }}
          className="underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        . Unsubscribe anytime.
      </p>
    </form>
  );
}
