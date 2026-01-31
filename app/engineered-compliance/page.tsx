"use client";

import { useState } from "react";
import Footer from "../../components/Footer";
import LetsTalkModal from "../../components/LetsTalkModal";
import { useUser } from "../../contexts/UserContext";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";


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
  const { user } = useUser();
  const [isBookDemoModalOpen, setIsBookDemoModalOpen] = useState(false);

  const handleBookDemoClick = () => {
    const userEmail = user?.email || "";
    const userName = user?.user_metadata?.full_name || "";

    // Track the event
    try {
      trackEvent(MixpanelEvent.CLICKED_TARIFF_TEAM_LETS_TALK, {
        userEmail,
        userName,
        isLoggedIn: !!user,
      });
    } catch (e) {
      console.error("Error tracking book demo click:", e);
    }

    // Open the modal
    setIsBookDemoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="relative">
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center text-lg md:text-xl">

          <div className="flex flex-col gap-4 mb-10 mt-16">
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
                  Trade Compliance is a
                </h3>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-10">
                  Systems Problem
                </h3>
              </div>
              <div className="space-y-6 leading-relaxed text-center">
                <p>Not a people problem.</p>
                <p>Not a budget problem.</p>
                <p>Not a paperwork problem.</p>
                {/* <p className="font-bold text-primary pt-4">A systems problem.</p> */}
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== THE CURRENT STATE ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center mt-6">
                <p className="text-2xl md:text-3xl font-bold">Yet...</p>
                <p><span className="font-semibold text-primary">Most</span> trade compliance programs still run on:</p>
                <ul className="space-y-5 text-lg my-6 max-w-md mx-auto">
                  <li>🧠 Knowledge locked in people&apos;s heads</li>
                  <li>🔎 Manual Analysis & Reviews</li>
                  <li>⛓️‍💥 Disconnected Systems</li>
                  <li>✉️ Email threads</li>
                  <li>📋 Spreadsheets</li>
                  <li>📃 Manual SOPs</li>
                </ul>
                <br />
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== THE CURRENT STATE ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                {/* <p>This isn&apos;t due to a lack of expertise or effort.</p> */}
                <p className="text-2xl md:text-3xl font-bold">But it isn&apos;t their fault.</p>
                <p>Trade complinace was traditionally seen as a <br /> <span className="text-primary font-semibold">costly requirement</span> instead of a <span className="text-primary font-semibold">strategic advantage</span>.</p>
                <br />
                <p>Which led to:</p>
                <p>Limited executive buy-in,</p>
                <p>Limited incentive for solution providers, and</p>
                <p>Trade compliance evolving <span className="font-semibold text-primary">faster</span> than <br /> the <span className="font-semibold text-primary">systems</span> designed to support it.</p>
                {/* <p className="font-bold">But it&apos;s risky business for a critical function.</p> */}
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== WHAT THAT CREATES ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-2xl md:text-3xl font-bold">The problem this created</p>
                <p>When compliance isn&apos;t systemized, the results are predictable:</p>

                <ul className="space-y-3 text-lg my-6">
                  {/* <li>🔄 Inconsistency</li> */}
                  <li>🧠 Risk concentrated in a few key people</li>
                  <li>📊 No way to measure "good" compliance</li>
                  <li>⚠️ Blind spots you don&apos;t see until CBP does</li>
                  <li>✍️ Poor Documentation that&apos;s hard to defend</li>
                  <li>🔄 Unnoticed changes in products, rules, or tariffs</li>
                </ul>

                <br />

                <p>Adding more people, reviews, or experience doesn&apos;t solve this.</p>
                <p>Because the problem isn&apos;t effort.</p>
                <br />
                <p className="font-bold text-primary text-2xl">It&apos;s systems</p>
                <br />
                <p>Cars can&apos;t perform on bumpy roads.</p>
                <p>Compliance can&apos;t perform with manual processes.</p>
                <p><strong>Fix the system, fix the performance.</strong></p>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== WHAT IS ENGINEERED COMPLIANCE ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-2xl md:text-3xl font-bold">What is Engineered Compliance?</p>
                {/* <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  What Is Engineered Compliance?
                </p> */}
                <p><span className="font-bold text-primary">Engineered compliance</span> is the application of <br /> engineering principles to trade compliance:</p>

                <div className="grid md:grid-cols-2 gap-4 text-left mt-6">
                  {[
                    { old: "Individual knowledge & Manual SOP's", new: "Systems" },
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

                <p>It identifies every factor that influences compliance, and builds <span className="font-semibold text-primary">signals & systems</span> to achieve the best <span className="font-semibold text-primary">performance</span>.</p>

                <br />

                <p>The result is compliance that becomes:</p>

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
                <p className="text-2xl md:text-3xl font-bold">The Train Analogy</p>
                {/* <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Train Analogy
                </p> */}
                <p>Modern trains operate safely and efficiently <br /> by providing <span className="font-semibold text-primary">signals and systems</span>:</p>

                <div className="max-w-sm mx-auto p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 my-6">
                  <div className="space-y-2">
                    {[
                      { icon: "✋", text: "Brakes" },
                      { icon: "⚙️", text: "Engines" },
                      { icon: "⚡", text: "Speed Controls" },
                      { icon: "📉", text: "Pressure Sensors" },
                      { icon: "🌤️", text: "Weather Forecasts" },
                      { icon: "🛑", text: "Braking Distance Indicators" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg bg-base-100/50 border border-primary/10">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium text-base-content">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <br />
                <p>To <span className="font-semibold text-primary">operators</span> who can see and control them.</p>
                <p>In a <span className="font-semibold text-primary">single place</span>.</p>
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== ENGINEERED COMPLIANCE WORKS THE SAME WAY ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">⚙️</p>
                <p className="text-2xl md:text-3xl font-bold">Engineered Compliance <br />Works The Same Way</p>
                <br />
                {/* <p className="text-center text-base-content/50 text-base uppercase tracking-widest py-6">
                  Engineered Compliance Works the Same Way
                </p> */}

                <p>It provides <span className="font-semibold text-primary">signals and systems</span> to <span className="font-semibold text-primary">operators</span> who can see and control them in a <span className="font-semibold text-primary">single place</span>.</p>

                <br />

                <div className="grid md:grid-cols-2 gap-6 w-full">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                    <p className="text-sm font-bold uppercase tracking-wider text-primary mb-4 text-center">Signals</p>
                    <div className="space-y-2">
                      {[
                        { icon: "📈", text: "Tariff Changes" },
                        { icon: "📊", text: "Compliance Scores" },
                        { icon: "🎯", text: "Classification Errors" },
                        { icon: "❌", text: "Missing Documentation" },
                        { icon: "💰", text: "Unclaimed Trade Programs" },
                        { icon: "⚠️", text: "Unclaimed Tariff Exclusions" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg bg-base-100/50 border border-primary/10">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm font-medium text-base-content">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                    <p className="text-sm font-bold uppercase tracking-wider text-primary mb-4 text-center">Systems</p>
                    <div className="space-y-2">
                      {[
                        { icon: "🧮", text: "Tariff Calculators" },
                        { icon: "🔎", text: "Classification Analysis" },
                        { icon: "🧠", text: "Classification Assistance" },
                        { icon: "✏️", text: "Documentation Generators" },
                        { icon: "✅", text: "Automatic Task Assigners" },
                        { icon: "🛡️", text: "Defense Reports Generators" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg bg-base-100/50 border border-primary/10">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm font-medium text-base-content">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <br />

                <div className="space-y-4">
                  <p className="text-xl md:text-2xl">You see your compliance <span className="font-semibold text-primary">status</span>, </p>
                  <p className="text-xl md:text-2xl"><span className="font-semibold text-primary">trigger</span> actions to improve it,</p>
                  <p className="text-xl md:text-2xl">and see the status <span className="font-semibold text-primary">improve</span>.</p>
                </div>
                <br />
                <br />
              </div>
            </div>
          </section>

          <StoryConnector />

          {/* ===== THE RESULT ===== */}
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">✨</p>
                <p className="text-2xl md:text-3xl font-bold">The Result</p>
                {/* <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Result
                </p> */}

                <p className="pt-3">Compliance goes from being <i>reactive</i>,<br /> full of <i>unknowns</i>, and unlinked to business <i>outcomes</i>...</p>

                <br />

                <p>To <i>proactive, defensible, and strategic</i>.</p>
                <br />
                <p><span className="underline font-semibold">Without</span> more staff, a fancy degree, or expensive consultants.</p>
                <br />

                {/* <p>You move from:</p> */}

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
              </div>
            </div>
          </section>

          {/* <StoryConnector /> */}

          {/* ===== WHY THIS MATTERS ===== */}
          {/* <section className="py-4 pb-6">
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
          </section> */}

          <StoryConnector />

          {/* Book Demo CTA */}
          <div className="py-8 pb-16 flex justify-center">
            <button
              onClick={handleBookDemoClick}
              className="btn btn-primary btn-lg font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              See how we can help you engineer compliance
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <LetsTalkModal
        isOpen={isBookDemoModalOpen}
        onClose={() => setIsBookDemoModalOpen(false)}
      />
    </div>
  );
}
