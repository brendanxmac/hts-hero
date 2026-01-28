"use client";

import Link from "next/link";
import Footer from "../../components/Footer";

const openProperties = [
  {
    letter: "O",
    title: "Observable",
    description: "Based on verifiable product characteristics",
  },
  {
    letter: "P",
    title: "Precise",
    description: "Pinpointing the most specific HTS code",
  },
  {
    letter: "E",
    title: "Evidenced",
    description: "Backed by documentation that withstands scrutiny",
  },
  {
    letter: "N",
    title: "Neutral",
    description: "Duty-agnostic; the correct code is the correct code",
  },
];

const doorProcess = [
  {
    letter: "D",
    title: "Document",
    description: "Capture complete product information first",
  },
  {
    letter: "O",
    title: "Organize",
    description: "Structure candidates and analyze GRI applicability",
  },
  {
    letter: "O",
    title: "Optimize",
    description: "Refine with proper reasonable care documentation",
  },
  {
    letter: "R",
    title: "Review",
    description: "Validate through peer review and audit trails",
  },
];

const mindsetShifts = [
  {
    icon: "🔍",
    title: "Deeper Understanding",
    description: "See your company's complete compliance risk landscape",
  },
  {
    icon: "⚡",
    title: "Rapid Risk Elimination",
    description: "Know exactly which levers to pull to eliminate exposure",
  },
  {
    icon: "💰",
    title: "Profit Protection",
    description: "Guard margins and generate savings through strategic compliance",
  },
  {
    icon: "🏆",
    title: "Organizational Respect",
    description: "Be seen as a strategic asset, not a cost center",
  },
];

// Reusable card style
const cardStyle = "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

export default function EngineeredCompliancePage() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* Main Content - Single Flowing Story */}
      <main className="relative">
        {/* Unified Background */}
        {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-[30%] -right-32 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-[60%] -left-32 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] right-0 w-[500px] h-[500px] bg-secondary/8 rounded-full blur-3xl" />
        </div> */}

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">

          {/* ===== CHAPTER 1: THE PARABLE ===== */}
          <div className="flex flex-col gap-4 text-center mb-8 mt-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary pb-1">
              Engineered Compliance
            </h1>
            <p className="font-bold text-xl text-base-content">A New Way Forward for Global Trade</p>
          </div>
          <section className="py-4">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">🏔️</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Waterfall Parable
                </p>
                <p>
                  Imagine a beautiful waterfall flowing from a mountain lake.
                </p>
                <p>
                  A <span className="font-extrabold text-primary">hiker</span> looks at the waterfall and sees the perfect place to take a picture, relax, and cool off.
                </p>

                <p>
                  An <span className="font-extrabold text-primary">engineer</span> looks at the waterfall
                  and sees a way to generate electricity to improve the lives of people in the town below.
                </p>

                {/* <p>
                  Without engineers, and therefore electricity, the town is stuck in the past with manual labor.
                </p> */}

                <p className="text-center text-base-content font-bold py-4">
                  2 Different Perspectives,<br /> 2 Different Results.
                </p>
              </div>
            </div>
          </section>

          {/* Story connector */}
          <div className="flex justify-center py-4">
            <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <section className="py-4">

            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">😵‍💫</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Trade Compliance Paradox
                </p>
                {/* <p>
                  In the same way that a hiker and an engineer see a waterfall differently...
                </p> */}
                <p>
                  Similarly...
                </p>
                <p>
                  Most <span className="font-extrabold text-primary">Executives</span> look at trade compliance as boxes to check, an anchor that slows down business, and a "cost of doing business".
                </p>
                <p>
                  A <span className="font-extrabold text-primary">Compliance Engineer</span> looks at trade compliance and sees a way to defend and unlock greater profits for the business.
                </p>

                {/* <p>
                  Without compliance engineers, businesses are stuck with the results of seeing compliance as a burden.
                </p> */}

                <p className="text-center text-base-content font-bold py-4">
                  2 Different Perspectives,<br /> 2 Different Results.
                </p>
              </div>
            </div>
          </section>

          {/* Story connector */}
          <div className="flex justify-center py-4">
            <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <section className="py-4 text-center">
            <div className={cardStyle}>
              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-center">
                <p className="text-6xl rounded-full p-0">💭</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Reality
                </p>
                <p>
                  <span className="font-semibold">Our beliefs often prevent us from achieving better results</span>.
                </p>
                <div className="py-6 space-y-3">
                  <p>
                    In the 1950's, Roger Bannister ran a mile in under 4 minutes;
                  </p>
                  <p className="font-bold">
                    Which was previously thought to be impossible.
                  </p>
                  <p>
                    In the weeks that followed, several others did the same.
                  </p>
                  <p>
                    No new equipment, techniques, or nutrition.
                  </p>
                  <p className="italic pt-2">
                    Just a new belief.
                  </p>
                </div>


                {/* <p className="text-2xl">
                  👇
                </p> */}

                <p className="text-center font-bold text-xl text-base-content pt-2 pb-10">
                  How you <span className="font-bold text-primary">think</span><br /> dictates how you <span className="font-bold text-primary">act</span><br /> dicates the <span className="font-bold text-primary">results</span> you get in life.
                </p>
              </div>
            </div>
          </section>


          {/* Story connector */}
          <div className="flex justify-center py-4">
            <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>


          {/* ===== CHAPTER 2: THE MISSION ===== */}
          <section className="pb-6">
            <div className={cardStyle}>
              <div className="text-lg md:text-xl leading-relaxed space-y-6 text-center">
                <p className="text-6xl rounded-full p-0">🚀</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  A New Belief
                </p>
                {/* <p>
                  HTS Hero helps US Importers <span className="font-bold text-primary">upgrade</span> their beliefs on compliance to achieve better compliance outcomes.
                </p> */}

                <p>
                  Trade companies don't have a <span className="font-bold text-primary">compliance department</span>, they have:
                </p>

                {/* Identity Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <span className="text-2xl">🛡️</span>
                      <span className="text-xl md:text-2xl font-bold text-primary">Margin Guardians</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <span className="text-2xl">💸</span>
                      <span className="text-xl md:text-2xl font-bold text-primary">Profit Unlockers</span>
                    </div>
                  </div>
                </div>

                <p>
                  Without compliance teams, profits are at substantially higher risk.
                </p>

                {/* <p>
                  Even if Q1's results look good, a Q4 audit might lead to a surprise bill that destroys all of that progress.
                </p> */}

                <p className="font-bold">
                  A single audit can destroy years of progress & profit.
                </p>

                <p>
                  Not only that, but when done properly (engineered), compliance unlock opportunities for <span className="font-bold text-primary">savings & growth</span>.
                </p>
              </div>
            </div>
          </section>

          {/* Story connector */}
          <div className="flex justify-center py-4">
            <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* ===== CHAPTER 3: THE METAPHOR ===== */}
          <section className="pb-6 text-center">
            <div className={cardStyle}>
              <div className="text-lg md:text-xl leading-relaxed space-y-6">
                <p className="text-6xl rounded-full p-0">🚂</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  The Train Metaphor
                </p>
                {/* <p>
                  Businesses are like <span className="font-semibold text-base-content">trains</span> that
                  deliver goods at a certain speed.
                </p>

                <p>
                  Compliance workers are the <span className="font-semibold text-primary">engineers in the engine room</span>,
                  helping everything run smoothly.
                </p> */}

                <div className="space-y-3">

                  <p>Your buisiness is like a <span className="font-bold text-primary">train</span>.</p>

                  <p>Trains have passengers, a schedule, and resources to succeed.</p>

                  <p>You have customers, a roadmap, and resources to succeed.</p>
                  <br />

                  {/* Side-by-side comparison */}
                  <div className="grid md:grid-cols-2 gap-4 text-left mt-4">
                    {/* Train Engineers Column */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-center">
                      <p className="font-bold text-primary text-center mb-4 text-base">Train Engineers <br /><span className="text-base-content">help trains:</span></p>
                      {/* <p className="text-sm text-center mb-4">help trains safely:</p> */}
                      <div className="space-y-2">
                        {[
                          { icon: "🚃", text: "Add New Carts" },
                          { icon: "👥", text: "Move Passengers & Cargo" },
                          { icon: "↩️", text: "Change Direction" },
                          { icon: "⛰️", text: "Ascend & Descend" },
                          { icon: "🛤️", text: "Stay on the Rails" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-base-100/50 border border-primary/10">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm font-medium text-base-content">{item.text}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-bold text-base text-primary pt-5">Safely & Reliably</p>
                    </div>

                    {/* Compliance Engineers Column */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-center">
                      <p className="font-bold text-primary text-center mb-4 text-base">Compliance Engineers <br /><span className="text-base-content">help companies:</span></p>
                      <div className="space-y-2">
                        {[
                          { icon: "📦", text: "Add New Products" },
                          { icon: "🌍", text: "Serve New Customers & Markets" },
                          { icon: "📋", text: "Handle Regulation Changes" },
                          { icon: "🔗", text: "Handle Supply Chain Disruptions" },
                          { icon: "🛡️", text: "Avoid and Survive Audits" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-base-100/50 border border-primary/10">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm font-medium text-base-content">{item.text}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-bold text-base text-primary pt-5">Safely & Reliably</p>
                    </div>
                  </div>

                  <p>Compliance is what allows your company to add new carts (products) and handle elevation changes (new regulations) without slowing down (delaying imports) or running off the rails (running into huge fines from audits or mistakes).</p>

                  <p>In trade compliance, the train is always moving… literally and metaphorically.</p>

                  <p>The as regulations change, new products are added, etc.. the train needs to be updated & maintained.</p>

                  <p>New tariffs? Carts A,B,C just got weight added to them, can we cut some of the weight (Free trade agreements, tariff exceptions, etc…).</p>

                  <p>New Regulation? Brakes are stuck on at 5%, how can we fix this?</p>

                  <p>HTS Hero give you the control panel and management dashboard for this entire operation.</p>

                  <p>It lets you know when problems arise, helps to do certain tasks flawlessly, and shows you a clear indication of system health and profits protected at all time.</p>
                </div>

                {/* <p className="text-xl md:text-2xl font-medium text-base-content">
                  They don&apos;t slow down company progress — they{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">strategically propel</span>{" "}
                  companies towards their goals by defending and unlocking profits.
                </p>

                <p className="text-center pt-4">
                  <span className="text-base-content/60">And they do this through</span>
                </p>

                <p className="text-center text-3xl md:text-4xl font-bold pb-2">
                  <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    Compliance Engineering
                  </span>
                </p> */}
              </div>
            </div>
          </section>

          {/* Story connector */}
          <div className="flex justify-center py-4">
            <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <section className="pb-6">
            <div className={cardStyle}>
              <div className="text-lg md:text-xl leading-relaxed space-y-6 text-center">
                <p className="text-6xl rounded-full p-0">✨</p>
                <p className="text-center text-base-content/50 text-base uppercase tracking-widest mb-6">
                  A New Identity
                </p>

                <p>
                  People working in compliance aren't <strong>Officers or Managers</strong>, they're:
                </p>


                {/* Identity Cards */}

                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3 justify-center">
                    <span className="text-2xl">⚙️</span>
                    <span className="text-xl md:text-2xl font-bold text-primary">Engineers</span>
                  </div>
                </div>

                <p>
                  We help people working in trade compliance realize that they are not merely
                  Compliance Officers, Managers, or Leads...
                </p>
              </div>
            </div>
          </section>

          {/* Story connector */}
          <div className="flex justify-center py-4">
            <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <div className="text-2xl md:text-5xl font-bold leading-relaxed space-y-6 text-center py-10">
            <p className="text-center">
              <span className="font-bold text-primary">HTS Hero</span> Helps
              You <br /> Engineer Compliance
            </p>
          </div>

          {/* Story connector */}
          <div className="flex justify-center py-4">
            <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* ===== CHAPTER 4: THE GOOD NEWS ===== */}
          <section className="pb-6">
            <div className={cardStyle}>
              <div className="text-lg md:text-xl text-base-content/80 leading-relaxed space-y-6">
                <p>
                  Which, fortunately, <span className="font-semibold text-base-content">does not require another degree</span>.
                </p>

                <p>
                  Just the ability to see your company&apos;s overall compliance health and know what levers to pull
                  to improve it — just like a train engineer.
                </p>

                <p className="text-primary font-semibold text-xl pt-2">
                  You&apos;re one mindset shift away from:
                </p>
              </div>

              {/* Mindset Shifts */}
              <div className="grid sm:grid-cols-2 gap-3 mt-6">
                {mindsetShifts.map((shift, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-base-200/60 border border-base-content/5"
                  >
                    <span className="text-xl">{shift.icon}</span>
                    <div>
                      <p className="font-semibold text-base-content text-sm">{shift.title}</p>
                      <p className="text-base-content/50 text-xs">{shift.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Story connector - bigger transition to frameworks */}
          <div className="flex flex-col items-center py-6">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/30 to-primary/30" />
            <p className="text-base-content/40 text-sm py-3">Here&apos;s how</p>
            <div className="w-px h-8 bg-gradient-to-b from-primary/30 via-primary/30 to-transparent" />
          </div>

        </div>

        {/* ===== CHAPTER 5: THE FRAMEWORKS ===== */}
        {/* Slightly wider container for frameworks */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
          <div className={`${cardStyle} !p-8 md:!p-10`}>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-3">The Frameworks</h2>
              <p className="text-base-content/60 max-w-xl mx-auto">
                The exact frameworks that big importers are using for their classifications and imports.
              </p>
            </div>

            {/* OPEN Framework */}
            <div className="mb-12">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-medium text-secondary">
                  Framework #1
                </span>
                <h3 className="text-xl md:text-2xl font-bold">
                  The <span className="text-secondary">OPEN</span> Properties
                </h3>
              </div>

              <p className="text-center text-base-content/60 text-sm mb-6">
                Generate defensible HTS classifications
              </p>

              {/* OPEN Horizontal Display */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {openProperties.map((prop, index) => (
                  <div
                    key={index}
                    className="flex-1 min-w-[140px] max-w-[180px] p-4 rounded-xl bg-base-200/50 border border-secondary/20 hover:border-secondary/40 transition-colors text-center"
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-secondary/15 flex items-center justify-center">
                      <span className="text-lg font-bold text-secondary">{prop.letter}</span>
                    </div>
                    <p className="font-semibold text-base-content text-sm mb-1">{prop.title}</p>
                    <p className="text-base-content/50 text-xs leading-snug">{prop.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex justify-center py-6">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
            </div>

            {/* DOOR Framework */}
            <div className="mb-12">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                  Framework #2
                </span>
                <h3 className="text-xl md:text-2xl font-bold">
                  The <span className="text-primary">DOOR</span> Process
                </h3>
              </div>

              <p className="text-center text-base-content/60 text-sm mb-6">
                Reliably generate audit-ready classifications
              </p>

              {/* DOOR Horizontal Display with Connectors */}
              <div className="flex flex-wrap justify-center items-start gap-2 md:gap-0">
                {doorProcess.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1 min-w-[130px] max-w-[170px] p-4 rounded-xl bg-base-200/50 border border-primary/20 hover:border-primary/40 transition-colors text-center">
                      <div className="relative w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/15 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{step.letter}</span>
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <p className="font-semibold text-base-content text-sm mb-1">{step.title}</p>
                      <p className="text-base-content/50 text-xs leading-snug">{step.description}</p>
                    </div>
                    {index < doorProcess.length - 1 && (
                      <div className="hidden md:block w-6 h-px bg-primary/30 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex justify-center py-6">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
            </div>

            {/* OPEN + DOOR = OPEN DOOR */}
            <div className="p-6 md:p-8 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border border-primary/20 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl">🚪</span>
                <h3 className="text-xl md:text-2xl font-bold">
                  Together: Your{" "}
                  <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">OPEN</span>{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DOOR</span>
                </h3>
              </div>
              <p className="text-base-content/70 mb-6 max-w-xl mx-auto">
                Combine both frameworks to create an <span className="font-semibold text-base-content">OPEN DOOR</span> that
                lets your company see your value — and shows customs your commitment to reasonable care.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <span className="w-6 h-6 rounded-full bg-base-100 flex items-center justify-center text-xs">👁️</span>
                  Shows Your Value
                </div>
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <span className="w-6 h-6 rounded-full bg-base-100 flex items-center justify-center text-xs">✅</span>
                  Demonstrates Reasonable Care
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story connector */}
        <div className="flex justify-center py-4">
          <svg className="w-6 h-6 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* ===== CHAPTER 6: THE CALL TO ACTION ===== */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">
          <div className={`${cardStyle} text-center`}>
            <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-3">
              Start Engineering Your Compliance
            </h2>
            <p className="text-base-content/60 mb-8 max-w-lg mx-auto">
              Apply these frameworks to your classifications and imports today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/classifications"
                className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-semibold bg-secondary text-white hover:bg-secondary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg w-full sm:w-auto justify-center"
              >
                <span>🎯</span>
                <span>Classifications</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="/duty-calculator"
                className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg w-full sm:w-auto justify-center"
              >
                <span>💰</span>
                <span>Duty Calculator</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
