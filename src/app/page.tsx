import Navbar from "@/components/Navbar";
import DemoForm from "@/components/DemoForm";
import PricingSection from "@/components/PricingSection";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 text-[var(--accent-light)] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse" />
            Now tracking ChatGPT, Perplexity & Gemini
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            Is Your Brand Visible in{" "}
            <span className="gradient-text">AI Search?</span>
          </h1>

          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8 leading-relaxed">
            67% of product discovery is shifting to LLMs. Google Rank #1 ≠ AI Citation #1.{" "}
            <strong className="text-[var(--foreground)]">AI Radar</strong> tracks whether ChatGPT,
            Perplexity, and Gemini recommend your brand — so you can fix it if they don&apos;t.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a href="#demo" className="btn-primary text-base px-8 py-3">
              Try Free Demo ↓
            </a>
            <a href="#pricing" className="btn-secondary text-base px-8 py-3">
              View Pricing
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">10x</span>
              cheaper than competitors
            </div>
            <div className="w-px h-8 bg-[var(--card-border)]" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">3</span>
              AI platforms monitored
            </div>
            <div className="w-px h-8 bg-[var(--card-border)]" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">$19</span>
              /mo Pro plan
            </div>
          </div>
        </section>

        {/* Problem statement */}
        <section className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glow-card p-6 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold mb-2">The Blind Spot</h3>
              <p className="text-sm text-[var(--muted)]">
                You track Google rankings obsessively. But do you know what ChatGPT says when someone asks about your category?
              </p>
            </div>
            <div className="glow-card p-6 text-center">
              <div className="text-3xl mb-3">📉</div>
              <h3 className="font-bold mb-2">Hidden Revenue Loss</h3>
              <p className="text-sm text-[var(--muted)]">
                If AI doesn&apos;t recommend you, potential customers never even know you exist. That&apos;s invisible pipeline leakage.
              </p>
            </div>
            <div className="glow-card p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Fix What You Measure</h3>
              <p className="text-sm text-[var(--muted)]">
                Know exactly where you stand across each AI platform. Then optimize your content to improve your AI citation score.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <h2 className="text-2xl font-bold text-center mb-12">
            How <span className="gradient-text">AI Radar</span> Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Enter Your Brand", desc: "Add your brand name, 2-3 competitors, and your industry keywords." },
              { step: "2", title: "We Query AIs", desc: "We ask ChatGPT, Perplexity & Gemini category-relevant questions." },
              { step: "3", title: "Parse & Score", desc: "We analyze responses to see who gets mentioned and how often." },
              { step: "4", title: "Track & Improve", desc: "Get weekly reports and track your citation share over time." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Demo section */}
        <section className="py-16">
          <DemoForm />
        </section>

        {/* Competitor comparison */}
        <section className="py-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why <span className="gradient-text">AI Radar</span>?
          </h2>
          <div className="glow-card overflow-hidden max-w-3xl mx-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left p-4 text-[var(--muted)]">Feature</th>
                  <th className="text-center p-4 text-[var(--accent-light)] font-bold">AI Radar</th>
                  <th className="text-center p-4 text-[var(--muted)]">Others</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Starting Price", "$0/mo", "$49-219/mo"],
                  ["Pro Plan", "$19/mo", "$99-219/mo"],
                  ["AI Platforms", "3 (GPT, Perplexity, Gemini)", "1-3"],
                  ["Weekly Reports", "✓ (Pro)", "✓ ($99+)"],
                  ["Setup Time", "< 1 minute", "30+ minutes"],
                  ["Free Tier", "✓", "✗"],
                ].map(([feature, us, them]) => (
                  <tr key={feature as string} className="border-b border-[var(--card-border)]/50">
                    <td className="p-4 font-medium">{feature}</td>
                    <td className="p-4 text-center text-[var(--success)]">{us}</td>
                    <td className="p-4 text-center text-[var(--muted)]">{them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing */}
        <PricingSection />

        {/* FAQ */}
        <section className="py-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "How does AI Radar work?",
                a: "We send category-relevant prompts to ChatGPT, Perplexity, and Gemini, then analyze the responses to detect brand mentions. We track this over time to show your citation share trend.",
              },
              {
                q: "Is the demo data real?",
                a: "The landing page demo uses simulated data to show you what the tool does. Once you sign up, all scans use real, live API queries to actual AI platforms.",
              },
              {
                q: "How is this different from SEO tools?",
                a: "SEO tools track Google search rankings. AI Radar tracks something entirely different: whether AI assistants recommend your brand. These are increasingly separate channels.",
              },
              {
                q: "Can I improve my AI citation score?",
                a: "Yes! AI models learn from web content. By creating high-quality, authoritative content that positions your brand well, you can influence how AIs perceive and recommend your product.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="glow-card p-5">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-[var(--muted)]">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)]">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-[var(--accent)] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="font-semibold text-[var(--foreground)]">AI Radar</span>
          </div>
          <p>© 2025 AI Radar. Built by makers, for makers.</p>
          <p className="mt-1">
            A{" "}
            <a href="https://godigitalapps.com" className="text-[var(--accent-light)] hover:underline">
              Go Digital Apps
            </a>{" "}
            product.
          </p>
        </footer>
      </main>
    </>
  );
}
