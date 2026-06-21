"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MerchantSignupPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, email, password, storeUrl: storeUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setPending(false);
        return;
      }
      // Store in sessionStorage so the dashboard can show it once
      sessionStorage.setItem("merchant_signup_api_key", data.apiKey);
      sessionStorage.setItem("merchant_name", data.merchantName);
      router.push("/merchant/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <span className="section-eyebrow">🏪 Merchant</span>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Become a partner</h1>
        <p className="mt-1 text-sm text-slate-600">
          Get an API key to integrate Underseat compatibility checks into your store. Starter plan is free during beta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="soft-panel space-y-5 p-6">
        {error && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <div>
          <label className="soft-label">Business name *</label>
          <input
            type="text"
            required
            className="soft-input"
            placeholder="Happy Paws Pet Store"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div>
          <label className="soft-label">Email *</label>
          <input
            type="email"
            required
            className="soft-input"
            placeholder="you@yourstore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="soft-label">Password *</label>
          <input
            type="password"
            required
            minLength={8}
            className="soft-input"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">Must be at least 8 characters.</p>
        </div>

        <div>
          <label className="soft-label">Store URL <span className="font-normal text-slate-400">optional</span></label>
          <input
            type="url"
            className="soft-input"
            placeholder="https://mystore.com"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="primary-cta w-full min-h-10 text-sm disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Register"}
        </button>

        <p className="text-xs text-slate-400">
          By registering you agree to our terms. Your API key will be shown once on the next page.
        </p>
      </form>
    </div>
  );
}