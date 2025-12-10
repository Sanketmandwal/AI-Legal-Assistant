import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate()
  return (
    <div className="bg-primary min-h-screen w-full">
      {/* Hero Section */}
      <section className="bg-primary w-full">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-12 lg:py-20 grid gap-10 lg:grid-cols-2 items-center">
          {/* Left: Content */}
          <div className="w-full space-y-6 animate-in">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-neutral-text">
              File FIRs <span className="text-brand">confidently</span> with
              AI-guided legal assistance.
            </h1>
            <p className="text-muted text-sm sm:text-base max-w-xl">
              Our platform simplifies FIR drafting, connects you with the right
              lawyers, and keeps citizens, police stations, and lawyers aligned
              through one secure, AI-powered workspace.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="btn-primary" onClick={() => navigate('/register')}>
                Get Started — It’s Free
              </button>
              <button className="btn-secondary">
                💬 Chat with Lecxi
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-4 w-full">
              <div className="card w-full">
                <p className="text-xs text-muted mb-1">For Citizens</p>
                <p className="text-sm font-semibold">Guided FIR drafting</p>
              </div>
              <div className="card w-full">
                <p className="text-xs text-muted mb-1">For Police Stations</p>
                <p className="text-sm font-semibold">Clean, structured reports</p>
              </div>
              <div className="card w-full">
                <p className="text-xs text-muted mb-1">For Lawyers</p>
                <p className="text-sm font-semibold">Case-ready case summaries</p>
              </div>
            </div>
          </div>

          {/* Right: Visual / Mock UI */}
          <div className="relative h-[320px] sm:h-[360px] lg:h-[420px] animate-in delay-200 w-full">
            {/* Background blob */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[var(--color-brand-100)] via-white to-[var(--color-accent)] opacity-70 blur-3xl" />

            <div className="relative h-full w-full flex items-center justify-center">
              {/* Main card */}
              <div className="card w-full max-w-md zoom-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-brand uppercase tracking-[0.08em]">
                    AI FIR Preview
                  </p>
                  <span className="badge badge-accent text-[11px]">
                    AI Generated
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2">
                  FIR Draft — Theft Incident in Pune
                </h3>
                <p className="text-xs text-muted mb-3 line-clamp-3">
                  “On 10 Jan 2026, around 8:30 PM, while returning from work,
                  my phone and wallet were stolen near Hinjewadi Phase 2 bus
                  stop…”
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Suggested Sections</span>
                    <span className="font-semibold text-brand">
                      IPC 379, 356
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Jurisdiction</span>
                    <span className="font-semibold">Hinjewadi PS, Pune</span>
                  </div>
                </div>

                <button className="btn-primary w-full text-sm">
                  Review & Submit FIR
                </button>
              </div>

              {/* Floating lawyer image */}
              <div className="hidden sm:block absolute -left-6 -bottom-4 w-40 md:w-48 card-hover animate-float delay-200">
                <img
                  src="https://images.pexels.com/photos/4427610/pexels-photo-4427610.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Lawyers discussing a case"
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <p className="text-[11px] font-semibold mb-1">
                  Verified Legal Experts
                </p>
                <p className="text-[11px] text-muted">
                  Get matched with lawyers based on your case type.
                </p>
              </div>

              {/* Floating AI chat */}
              <div className="hidden sm:block absolute -right-4 -top-4 w-44 md:w-52 card-hover animate-float delay-300">
                <p className="text-[11px] text-muted mb-1">Lecxi • AI Legal Assistant</p>
                <div className="bg-[var(--color-brand-100)] rounded-md p-2 mb-2 text-[11px]">
                  “I’ve structured your incident into a formal FIR. Want me to
                  explain the legal sections used here?”
                </div>
                <button className="btn-outline w-full text-[11px]">
                  Ask Lecxi a legal doubt
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface border-t border-[var(--color-neutral-border)] w-full">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-12 lg:py-16">
          <div className="text-center mb-8 w-full">
            <h2 className="text-2xl mb-2">Why choose our platform?</h2>
            <p className="text-muted text-sm sm:text-base max-w-2xl mx-auto">
              Built for citizens, police stations, and lawyers to collaborate
              smoothly — with AI doing the heavy lifting in the background.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 w-full">
            <div className="card-hover w-full">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-brand-100)] mb-3">
                <span>🧠</span>
              </div>
              <h3 className="mb-2">AI-guided FIR drafting</h3>
              <p className="text-sm text-muted">
                Lecxi converts your plain-language incident into a structured FIR
                with suggested IPC sections, ready for review.
              </p>
            </div>

            <div className="card-hover w-full">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-brand-100)] mb-3">
                <span>📂</span>
              </div>
              <h3 className="mb-2">Evidence, neatly organized</h3>
              <p className="text-sm text-muted">
                Upload photos, videos, audio, and documents. Everything stays
                linked to the right FIR, securely stored.
              </p>
            </div>

            <div className="card-hover w-full">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-brand-100)] mb-3">
                <span>⚖️</span>
              </div>
              <h3 className="mb-2">Lawyer & police friendly</h3>
              <p className="text-sm text-muted">
                Structured data helps lawyers and police review cases faster,
                with less back-and-forth and clearer expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-primary w-full">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-12 lg:py-16">
          <div className="grid gap-10 md:grid-cols-2 items-center w-full">
            <div className="w-full">
              <h2 className="mb-3">How it works</h2>
              <p className="text-muted text-sm sm:text-base mb-6">
                From first thought to final FIR — we keep every step guided,
                transparent, and easy to understand.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-brand-700)] text-white flex items-center justify-center text-xs font-semibold mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Share what happened in your own words
                    </h3>
                    <p className="text-sm text-muted">
                      Start a new FIR, describe the incident naturally —
                      no legal jargon needed. Lecxi will handle the structure.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-brand-700)] text-white flex items-center justify-center text-xs font-semibold mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Let Lecxi structure & explain the FIR
                    </h3>
                    <p className="text-sm text-muted">
                      Our AI maps your story to legal language, suggests
                      sections, and explains them in simple terms.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-brand-700)] text-white flex items-center justify-center text-xs font-semibold mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      Connect with police & lawyers
                    </h3>
                    <p className="text-sm text-muted">
                      Once finalized, your FIR and evidence can be shared with
                      the relevant police station and recommended lawyers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-based cards */}
            <div className="grid gap-4 w-full">
              <div className="card w-full">
                <p className="text-xs text-muted mb-1">For Citizens</p>
                <h3 className="text-sm font-semibold mb-1">
                  No more fear of “wrong format”
                </h3>
                <p className="text-sm text-muted">
                  Lecxi helps you avoid missing details and reduces confusion
                  around what to write and how to write it.
                </p>
              </div>
              <div className="card w-full">
                <p className="text-xs text-muted mb-1">For Police Stations</p>
                <h3 className="text-sm font-semibold mb-1">
                  Cleaner, consistent FIR intake
                </h3>
                <p className="text-sm text-muted">
                  Receive structured FIRs with clear timelines, locations, and
                  evidence attached — no messy screenshots or random PDFs.
                </p>
              </div>
              <div className="card w-full">
                <p className="text-xs text-muted mb-1">For Lawyers</p>
                <h3 className="text-sm font-semibold mb-1">
                  Case-ready summaries from day one
                </h3>
                <p className="text-sm text-muted">
                  Get a legal summary, key facts, and evidence list upfront,
                  so you can decide quickly whether to take the case.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
        <section className="bg-surface border-t border-[var(--color-neutral-border)]">
        <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="card bg-gradient-to-r from-[var(--color-brand-700)] via-[var(--color-brand-500)] to-[var(--color-accent)] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full max-w-none">
            <div>
              <h2 className="text-2xl mb-2 text-white">
                Ready to give citizens a smarter way to seek justice?
              </h2>
              <p className="text-sm text-[rgba(255,255,255,0.85)] max-w-xl">
                Start with a single login — whether you’re a citizen, a police
                station, or a lawyer. Lecxi will guide the rest.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary bg-surface text-brand hover:bg-primary" onClick={() =>  navigate('/register')}>
                Create your account
              </button>
              <button className="btn-outline border-white text-white hover:bg-[rgba(255,255,255,0.1)]">
                See how Lecxi works
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;