import Link from "next/link";
import { QuickCheckHero } from "@/components/QuickCheckHero";
import { getRepository } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

const howItWorks = [
  {
    step: "01",
    title: "Choose your path",
    copy: "Check a carrier you already own, or start with a carrier recommendation for your pet.",
  },
  {
    step: "02",
    title: "Add the trip details",
    copy: "Airline, cabin, airports, and each flight leg — because one airline’s rule may not match the next.",
  },
  {
    step: "03",
    title: "Compare against rules",
    copy: "We check dimensions, soft-sided expectations, pet weight, and known cabin-specific limits.",
  },
  {
    step: "04",
    title: "Read the verdict",
    copy: "You get PASS, BORDERLINE, or NO with plain-language reasons and source context.",
  },
];

const trustBlocks = [
  {
    icon: "🧭",
    title: "Leg-by-leg checks",
    copy: "Multi-airline itineraries are evaluated one leg at a time, then combined into an overall result.",
  },
  {
    icon: "📝",
    title: "Transparent reasons",
    copy: "Results explain what passed, what is tight, and what is missing — not just a yes/no answer.",
  },
  {
    icon: "✈",
    title: "Cabin-aware results",
    copy: "Economy, Premium Economy, Business, and First Class are modeled where rules differ or fallback notes apply.",
  },
  {
    icon: "🧳",
    title: "Better-fit alternatives",
    copy: "If your carrier is too small or too large, we can point you toward more suitable catalog options.",
  },
  {
    icon: "🌤",
    title: "Honest confidence handling",
    copy: "When policies vary by aircraft or data is incomplete, we say so instead of pretending the answer is certain.",
  },
];

const faqs = [
  {
    q: "Does this guarantee my pet carrier will be accepted?",
    a: "No. flypewpet is a compatibility checker, not a guarantee. Airlines make the final decision at the gate, so always confirm current policy before you travel.",
  },
  {
    q: "Why do multi-leg trips matter?",
    a: "Each airline can use different under-seat dimensions, weight limits, and cabin rules. We check each leg separately so a carrier that fits one flight does not get assumed to fit the next.",
  },
  {
    q: "What does BORDERLINE mean?",
    a: "BORDERLINE means the carrier is close to a limit, uses incomplete data, or depends on factors like aircraft type. It is worth double-checking before you fly.",
  },
  {
    q: "Can I use this if I do not own a carrier yet?",
    a: "Yes. Start with Find a carrier to compare likely-fit options from our curated catalog, then run any promising bag through a trip check.",
  },
  {
    q: "Why are some cabin rules marked as fallbacks?",
    a: "Some airlines publish one in-cabin pet policy across cabins, while others do not publish separate cabin-specific details. We label those fallbacks clearly instead of overstating certainty.",
  },
];

export default async function HomePage() {
  const airlines = await getRepository().listAirlines();

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className="space-y-7">
          <div className="space-y-5">
            <span className="section-eyebrow">
              <span aria-hidden="true">🐾</span> Airline pet-carrier compatibility
            </span>
            <h1 className="max-w-3xl text-left text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Know before you pack: will your pet carrier fit this trip?
            </h1>
            <p className="max-w-2xl text-left text-base leading-8 text-slate-600 sm:text-lg">
              flypewpet checks your carrier against airline cabin rules for the exact itinerary you are
              planning — including multi-leg trips, cabin class, and transparent PASS / BORDERLINE / NO
              reasons.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/check" className="primary-cta px-6 py-3 text-base">
              Start a compatibility check
            </Link>
            <Link href="/find" className="secondary-cta px-6 py-3 text-base">
              I need a carrier
            </Link>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {[
              ["PASS", "Clear fit"],
              ["BORDERLINE", "Worth checking"],
              ["NO", "Likely too risky"],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-2xl border border-stone-200 bg-white/75 px-4 py-3">
                <div className="text-sm font-bold text-slate-900">{label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{copy}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-8 hidden h-28 w-28 rounded-[2rem] bg-blush-50/80 lg:block" aria-hidden="true" />
          <div className="absolute -right-4 bottom-10 hidden h-20 w-20 rounded-[2rem] bg-brand-100/80 lg:block" aria-hidden="true" />
          <div className="soft-panel-muted relative p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Trip-ready check</div>
                <div className="text-xs text-slate-500">Airline · cabin · carrier size</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {["PASS", "BORDERLINE", "NO"].map((item) => (
                  <span
                    key={item}
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      item === "PASS"
                        ? "bg-emerald-50 text-emerald-700"
                        : item === "BORDERLINE"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <QuickCheckHero airlines={airlines} />
            <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 px-3 py-2">
                <span className="block font-semibold text-slate-700">Multi-leg</span>
                Each leg checked separately
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-2">
                <span className="block font-semibold text-slate-700">Cabin-aware</span>
                Economy through First
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-2">
                <span className="block font-semibold text-slate-700">Clear reasons</span>
                No mystery verdicts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="grid gap-5 lg:grid-cols-2">
        <Link
          href="/check"
          className="group soft-panel p-6 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                I already have a carrier
              </span>
              <h2 className="mt-5 text-2xl font-bold text-slate-900">Check the bag you own</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Enter your airline, cabin, and carrier dimensions. We’ll check the trip leg by leg and
                show exactly why the carrier fits, is close, or misses a rule.
              </p>
            </div>
            <span className="paw-mark h-12 w-12 text-lg transition group-hover:scale-105" aria-hidden="true">
              🧳
              <span className="sr-only">Carrier icon</span>
            </span>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
            Check compatibility <span aria-hidden="true">→</span>
          </span>
        </Link>

        <Link
          href="/find"
          className="group soft-panel p-6 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-blush-50 px-3 py-1 text-xs font-bold text-rose-700">
                I need a carrier
              </span>
              <h2 className="mt-5 text-2xl font-bold text-slate-900">Find a better-fit bag</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Tell us your pet’s size and we’ll recommend carriers from our curated catalog. Then run
                your favorite option against the exact flights before you buy.
              </p>
            </div>
            <span className="paw-mark h-12 w-12 text-lg transition group-hover:scale-105" aria-hidden="true">
              🐾
              <span className="sr-only">Paw icon</span>
            </span>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
            Browse likely-fit carriers <span aria-hidden="true">→</span>
          </span>
        </Link>
      </section>

      {/* How it works */}
      <section className="soft-panel p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="section-eyebrow">
            <span aria-hidden="true">🧭</span> How it works
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">A calm, guided check from bag to verdict.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The flow is intentionally simple: give us the carrier, your pet, and the flights. We handle
            the rule comparison and explain the result in plain language.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {howItWorks.map((item) => (
            <div key={item.step} className="rounded-3xl border border-stone-200 bg-white/75 p-5">
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section>
        <div className="mb-6 max-w-2xl">
          <span className="section-eyebrow">
            <span aria-hidden="true">🌤</span> Why pet owners trust it
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Useful because it is specific, transparent, and honest.</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          {trustBlocks.map((block) => (
            <div key={block.title} className="soft-panel p-5">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-lg">
                {block.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{block.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{block.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reassurance */}
      <section className="soft-panel-muted p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="section-eyebrow">
              <span aria-hidden="true">🐶</span> A gentler check before travel day
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Less guessing, fewer surprises, better carrier choices.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Pet travel rules are inconsistent and airline pages change. We keep the experience grounded
              in the actual checks we can run, then flag the places where you should confirm details with
              the airline.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              "No fake guarantees — just clear compatibility checks and source context.",
              "Better alternatives when your current carrier is too small, too large, or risky.",
              "A compact result you can save, share, or use before buying a new carrier.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/70 bg-white/70 p-4 text-sm leading-6 text-slate-700">
                <span className="mr-2 text-brand-700">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="soft-panel p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="section-eyebrow">
            <span aria-hidden="true">❓</span> FAQ
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Questions before you check?</h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {faqs.map((item) => (
            <details key={item.q} className="group rounded-3xl border border-stone-200 bg-white/75 p-5">
              <summary className="cursor-pointer list-none text-sm font-bold text-slate-900">
                {item.q}
                <span className="ml-2 text-brand-700 transition group-open:rotate-90" aria-hidden="true">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Merchant CTA */}
      <section className="soft-panel-muted p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="section-eyebrow">
              <span aria-hidden="true">🛍</span> For merchants
            </span>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">Sell carriers? Put the check on the product page.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Give shoppers a quick compatibility check before they buy, then route likely-fit options
              cleanly toward your catalog or affiliate links.
            </p>
          </div>
          <Link href="/for-merchants" className="secondary-cta px-6 py-3">
            See merchant options
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-[2rem] bg-slate-900 p-6 text-slate-100 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Ready to check your next pet-friendly trip?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Run a compatibility check now, or start with a carrier recommendation if you are still shopping.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-none">
            <Link href="/check" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100">
              Check a carrier
            </Link>
            <Link href="/find" className="rounded-full border border-slate-600 px-6 py-3 text-sm font-bold text-slate-100 hover:border-slate-400">
              Find a carrier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
