"use client";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it out, see the value",
    features: [
      "3 scans per month",
      "1 brand to track",
      "Basic citation score",
      "Community support",
    ],
    cta: "Start Free",
    href: "/api/auth/login",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For growing brands & marketers",
    features: [
      "Unlimited scans",
      "3 competitors tracked",
      "Weekly email reports",
      "Trend analysis",
      "All 3 AI platforms",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    href: "/api/auth/login?plan=pro",
    popular: true,
  },
  {
    name: "Business",
    price: "$49",
    period: "/month",
    description: "For agencies & larger teams",
    features: [
      "Everything in Pro",
      "10 competitors tracked",
      "API access",
      "Custom prompts",
      "Daily scans",
      "Slack integration",
      "Dedicated support",
    ],
    cta: "Start Business Trial",
    href: "/api/auth/login?plan=business",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">
          Simple, <span className="gradient-text">Indie-Friendly</span> Pricing
        </h2>
        <p className="text-[var(--muted)] max-w-lg mx-auto">
          Competitors charge $99-219/mo. We believe LLM visibility should be accessible to everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glow-card p-6 flex flex-col ${
              plan.popular ? "ring-2 ring-[var(--accent)] relative" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
            <p className="text-xs text-[var(--muted)] mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-[var(--muted)] text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={plan.href}
              className={plan.popular ? "btn-primary text-center" : "btn-secondary text-center"}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
