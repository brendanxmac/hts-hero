"use client";

import Link from "next/link";
import Footer from "../../components/Footer";


// Reusable card style
const cardStyle = "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

// Story connector component
const StoryConnector = () => (
  <div className="flex justify-center py-4">
    <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
);

export default function EngineeredCompliancePage() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center text-lg md:text-xl">

          <div className="flex flex-col gap-4 my-10">
            <h1 className="text-4xl md:text-5xl font-bold pb-1 text-primary">
              Engineered Compliance
            </h1>
            <p className="font-bold text-xl">A New Way Forward for Global Trade</p>

          </div>



          <section className="py-4">
            <div className={cardStyle}>
              <div className="flex flex-col gap-3">
                <p className="text-6xl rounded-full p-0 mb-4">⚙️</p>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Trade Compliance Is a
                </h3>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-10">
                  Systems Problem
                </h3>
              </div>
              <div className="space-y-6 leading-relaxed text-center">
                <p>Not a people problem.</p>
                <p>Not a budget problem.</p>
                <p>Not a paperwork problem.</p>
                <p className="font-bold text-primary pt-4">A systems problem.</p>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== THE CURRENT STATE ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p>Yet most trade compliance programs still run on:</p>
                <ul className="space-y-3 text-lg my-6 max-w-md mx-auto">
                  <li>📋 Spreadsheets</li>
                  <li>✉️ Email threads</li>
                  <li>📃 Static SOPs</li>
                  <li>🧠 Knowledge locked in people&apos;s heads</li>
                </ul>
                <br />

                <p>This isn&apos;t a failure of expertise or effort.</p>
                <p className="font-bold">Trade compliance simply evolved faster than the systems designed to support it.</p>
                {/* <p>and leaders were never given opportunities to build the systems they needed.</p> */}
                {/* <p className="font-bold">But it&apos;s risky business for a critical function.</p> */}
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== WHAT THAT CREATES ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Problem This Creates
                </p>
                <p>When compliance isn&apos;t systemized, the results are predictable:</p>
                <br />

                <ul className="space-y-3 text-lg my-6">
                  {/* <li>🔄 Inconsistency</li> */}
                  <li>🧠 Risk concentrated in a few key people</li>
                  <li>📊 No way to measure "good" compliance</li>
                  <li>⚠️ Blind spots you don&apos;t see until CBP does</li>
                  <li>✍️ Poor Documentation that&apos;s hard to defend</li>
                  <li>🔄 Changes in products, rules, or tariffs go unnoticed</li>
                </ul>

                <br />

                <p>Adding more people, reviews, or experience doesn&apos;t solve this.</p>
                <p>Because the problem isn&apos;t effort.</p>
                <p className="font-bold text-primary text-2xl pt-4">It&apos;s architecture.</p>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== WHAT IS ENGINEERED COMPLIANCE ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  What Is Engineered Compliance?
                </p>
                <p><span className="font-bold text-primary">Engineered compliance</span> applies engineering principles to trade compliance:</p>

                <div className="grid md:grid-cols-2 gap-4 text-left mt-6">
                  {[
                    { old: "Tribal knowledge", new: "Systems" },
                    { old: "Gut feel", new: "Signals" },
                    { old: "Assumptions", new: "Metrics" },
                    { old: "Periodic review", new: "Continuous monitoring" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                      <p className="text-sm text-base-content/60 line-through">{item.old}</p>
                      <p className="font-bold text-primary">{item.new}</p>
                    </div>
                  ))}
                </div>

                <br />

                <p>The result is compliance that is:</p>

                <div className="flex flex-wrap justify-center gap-3 py-4">
                  {["Measurable", "Consistent", "Auditable", "Defensible"].map((item, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 font-semibold text-primary text-base">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== THE ANALOGY: TRAINS ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">🚂</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Train Analogy
                </p>

                <p>Modern trains don&apos;t rely on a driver "doing their best."</p>
                <p>They run on <span className="font-bold text-primary">engineered systems</span>:</p>

                <div className="max-w-sm mx-auto p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 my-6">
                  <div className="space-y-2">
                    {[
                      { icon: "⚡", text: "Speed Controls" },
                      { icon: "🛑", text: "Braking Assist" },
                      // { icon: "⛰️", text: "Incline Anticipation" },
                      { icon: "⚙️", text: "Engine Capacity" },
                      { icon: "🌤️", text: "Weather Forecasts" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg bg-base-100/50 border border-primary/10">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium text-base-content">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p>All visible from a <span className="font-bold text-primary">single command center</span>.</p>

                <br />

                <p>Those systems don&apos;t replace the driver,</p>
                <p className="font-bold">they make good decisions inevitable.</p>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== ENGINEERED COMPLIANCE WORKS THE SAME WAY ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">⚙️</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  Engineered Compliance Works the Same Way
                </p>

                <p>Instead of hoping everything is correct, <span className="font-bold text-primary">you see it</span>.</p>

                <br />

                <ul className="space-y-3 text-lg my-6 mx-auto font-medium">
                  <li>📄 Missing or outdated COO documentation</li>
                  <li>🎯 Classification accuracy across your catalog</li>
                  <li>📊 Tariff and rule changes that impact products</li>
                  <li>⚠️ Products that need review before they become risk</li>
                </ul>

                <br />

                <p>These signals work together to:</p>

                <div className="space-y-3 py-4">
                  {[
                    "Flag issues early",
                    "Trigger automated analysis",
                    "Create clear, defensible documentation",
                    "Continuously improve your compliance posture"
                  ].map((item, i) => (
                    <p key={i} className="font-semibold text-primary">{item}</p>
                  ))}
                </div>

                <br />

                <p className="font-bold">You see the whole system, not just isolated transactions.</p>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== THE RESULT ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">✨</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Result
                </p>

                <p>Compliance stops being reactive and time consuming.</p>

                <br />

                <p>You move from:</p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="p-5 rounded-xl bg-base-200/50 border border-base-content/10">
                    <p className="text-base-content/60 text-base mb-2">Before</p>
                    <p className="font-semibold">"Are we okay?"</p>
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                    <p className="text-primary/60 text-base mb-2">After</p>
                    <p className="font-bold text-primary">"Here&apos;s our compliance posture, and here&apos;s how we know."</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 py-4">
                  {["Calm", "Confident", "Defensible"].map((item, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 font-bold text-primary text-lg">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== WHY THIS MATTERS ===== */}
          <section className="py-4 pb-12">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  Why This Matters
                </p>

                <p>Until now, this kind of system simply didn&apos;t exist for trade compliance.</p>

                <br />

                <p className="text-2xl md:text-3xl font-bold">
                  <span className="text-primary">HTS Hero</span> is built to change that.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
