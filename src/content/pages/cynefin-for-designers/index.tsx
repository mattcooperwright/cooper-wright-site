/**
 * Standalone article component — "Where Emergence Becomes Practice"
 *
 * Dependencies: React, Tailwind CSS v4
 *
 * Fonts: the serif and geometric roles, loaded by this page's manifest.
 */

import React from "react";

// ─── Tokens ──────────────────────────────────────────────────────────────────

const FONT_BODY = "var(--font-serif)";
const FONT_SIDEBAR = "var(--font-geometric)";
const COLOR = "#1a1a1a";

const s = {
  title: { fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 1.35 } as React.CSSProperties,
  subtitle: { fontSize: "clamp(1.8rem, 4vw, 3.2rem)", lineHeight: 1.4 } as React.CSSProperties,
  body: { fontSize: "clamp(1.5rem, 2.2vw, 1.9rem)", lineHeight: 1.65 } as React.CSSProperties,
  pullQuote: { fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 1.35, width: "100%" } as React.CSSProperties,
  calloutTitle: { fontSize: "clamp(0.8rem, 1.2vw, 0.9rem)", lineHeight: 1.6, letterSpacing: "0.08em", textTransform: "uppercase" as const } as React.CSSProperties,
  calloutBody: { fontSize: "clamp(0.85rem, 1.2vw, 0.95rem)", lineHeight: 1.7 } as React.CSSProperties,
  sidebar: { fontSize: "clamp(0.88rem, 1.2vw, 1rem)", lineHeight: 1.6 } as React.CSSProperties,
  base: { fontWeight: 400, fontStyle: "normal" as const, color: COLOR },
};

// ─── Primitives ──────────────────────────────────────────────────────────────

function Title({ children }: { children: React.ReactNode }) {
  return <h2 style={{ ...s.title, ...s.base }} className="mb-12">{children}</h2>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ ...s.subtitle, ...s.base }} className="mb-8 mt-14">{children}</h3>;
}

function Body({ children }: { children: React.ReactNode }) {
  return <p style={{ ...s.body, ...s.base }} className="mb-8">{children}</p>;
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center" style={{ minHeight: "100vh", padding: "0 15%" }}>
      <p style={{ ...s.pullQuote, ...s.base }}>{children}</p>
    </div>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-10 rounded-xl border p-6" style={{ borderColor: "#d4d4d4" }}>
      <div className="mb-3" style={{ ...s.calloutTitle, ...s.base }}>{title}</div>
      <p style={{ ...s.calloutBody, ...s.base }}>{children}</p>
    </div>
  );
}

function Sidebar({ children, side, topOffset = "0px" }: { children: React.ReactNode; side: "left" | "right"; topOffset?: string }) {
  return (
    <aside
      className="hidden xl:block"
      style={{
        position: "absolute",
        top: topOffset,
        width: "280px",
        padding: "16px 18px",
        border: "1px solid #d4d4d4",
        borderRadius: "12px",
        fontFamily: FONT_SIDEBAR,
        ...s.sidebar,
        ...s.base,
        ...(side === "left" ? { right: "calc(100% + 40px)" } : { left: "calc(100% + 40px)" }),
      }}
    >
      {children}
    </aside>
  );
}

function Img({ label, w = "120px", h = "90px" }: { label: string; w?: string; h?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-2 rounded-lg border border-dashed"
      style={{ width: w, height: h, borderColor: "#d4d4d4", backgroundColor: "#f5f5f5", fontSize: "11px", verticalAlign: "middle", ...s.base }}
    >
      [{label}]
    </span>
  );
}

function Divider() {
  return <div className="my-20"><div style={{ width: "100%", height: "1px", backgroundColor: "#e0e0e0" }} /></div>;
}

function Narrow({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[860px] mx-auto px-6 relative">{children}</div>;
}

function Wide({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[1200px] mx-auto px-6 relative">{children}</div>;
}

function List({ items }: { items: string[] }) {
  return (
    <div className="mb-8 pl-6" style={{ ...s.body, ...s.base }}>
      {items.map((item, i) => <p key={i} className="mb-2">— {item}</p>)}
    </div>
  );
}

// ─── Article ─────────────────────────────────────────────────────────────────

export default function Article() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fff", color: COLOR, fontFamily: FONT_BODY, fontWeight: 400, fontStyle: "normal" }}>

      {/* ── Header ── */}
      <Wide><div className="pt-20 pb-12"><Title>Where Emergence Becomes Practice: Using Cynefin to think more clearly about leadership 🚀, change, and the value of design.</Title></div></Wide>
      

      <Divider />

      {/* ── Opening ── */}

      <Narrow>
        <Sidebar side="right" topOffset="0px"><p>About the author — [placeholder]</p></Sidebar>
        <Body>It’s hard to achieve excellence when everything is constantly changing.</Body>
        <Body>But this isn’t because you’ve changed. <Img label="illustration-1" /> There is a different way to look at this challenge, a systems thinking view.</Body>
        <Body>You haven’t changed — and that is a bit of a problem. The context around us all is changing, and if you came up as a leader in the last 10 years there is a good chance that you learned leadership from the generation of Leaders before that.</Body>
        <Sidebar side="left" topOffset="20px"><p>Pattern observed — current-generation leaders are not equipped for the pace of today.</p></Sidebar>
        <Body>In discussion with People Leaders in global companies I’ve seen the same patterns, the current generation of leaders are not equipped for the pace of today. A visionary leader in a Pharma company came to IDEO for ways to unblock slow decision making, and to change the culture of perfectionism that made people spend too long on details that were moving fast.</Body>
        <Body>Perhaps as a Designer you see Strategies get agreed and then quietly set aside as priorities shift. You watch as teams reach alignment and then fragment when the context changes around them. Work that was excellent six months ago is hard to recreate, not because quality dropped, but because the ground moved. Everything feels harder, and the more you impose on the situation the tougher it gets.</Body>
        <Sidebar side="right" topOffset="0px"><p>Not a failure of execution — a mismatch between approach and conditions.</p></Sidebar>
        <Body>I want to offer a reframe. Because I think what many leaders are experiencing is not primarily a failure of execution. It is a mismatch between the leadership approach they have and the conditions they are actually operating in. Designers will love this.</Body>
      </Narrow>

      <Divider />

      {/* ── Section 2: Complexity ── */}
      <Wide><Title><Img label="cynefin-diagram" /> There is a framework I keep returning to when I’m trying to make sense of this. It was developed by Dave Snowden and is called Cynefin.</Title></Wide>

      <Narrow>
        <Sidebar side="left" topOffset="0px"><p>Read the original — HBR, 2007, "A Leader’s Framework for Decision Making"</p></Sidebar>
        <Body>I am not going to attempt a full explanation here, and I would encourage anyone who wants the depth to go directly to Snowden’s writing. But the core distinction that matters for this article is between two adjacent domains: complicated and complex.</Body>
        <Body>Complicated problems are hard. They require expertise, analysis, rigorous thinking. But crucially, the relationship between cause and effect is knowable. With the right people and enough careful work, you can understand what is going on and develop a reliable response. Engineering, surgery, financial modelling — these are complicated. They reward expertise and process.</Body>
        <Body>Complex problems are different in kind, not just in degree. In complex systems, cause and effect are only legible in retrospect. The system contains too many interacting variables, human behaviours, and feedback loops for anyone to predict reliably what will happen next. You cannot analyse your way to certainty upfront. You can only act, observe, and learn.</Body>
        <Callout title="What is Cynefin?">Cynefin (pronounced "kuh-NEV-in") is a Welsh word meaning "habitat" or "place of belonging." The framework, developed by Dave Snowden, maps five domains: Clear, Complicated, Complex, Chaotic, and Confused. Each domain calls for a different leadership response. The most consequential distinction for design leaders is between Complicated (cause and effect are knowable; expertise helps) and Complex (cause and effect only emerge through action; learning is the mechanism). Most organisations are built to handle complicated. Most of their real problems are complex.</Callout>
        <Body>Most organisations are built to manage the complicated. Their governance structures, their planning cycles, their performance frameworks — all of these assume that with enough expertise and rigour, you can predict and control outcomes. That assumption works in stable conditions. It starts to fail when the context becomes genuinely complex.</Body>
        <Sidebar side="right" topOffset="0px"><p>Fragmenting expectations. Restructuring technologies. Redefined landscapes.</p></Sidebar>
        <Body>And right now, for most organisations, a lot of the important problems are complex. Customer expectations are not just shifting; they are fragmenting. Technologies are not just advancing; they are restructuring whole categories of work. Competitive landscapes are not just changing; they are being redefined by players who did not previously exist. This is not noise. This is not poor execution. This is complexity.</Body>
      </Narrow>

      <Wide>
        <Body>The mistake is treating today like a complicated system — applying more analysis, more rigour, more planning — and then feeling confused when the outcomes remain unpredictable. <Img label="illustration-2" /> Complexity is not a failure of leadership. It is a condition that demands a different kind of leadership.</Body>
    </Wide>

      <Divider />

      {/* ── Section 3: Design Leadership ── */}
      <Narrow><Body>What Do Design Leaders Do When Certainty Disappears?</Body></Narrow>

      <Narrow>
        <Body>This is where I think design leadership has something genuinely important to contribute. Not design as execution support — the team that makes things look good and feel usable. Design as a leadership practice. A way of operating.</Body>
        <Body>Design leaders tend to have capabilities that become more valuable, not less, as certainty decreases. Three of them are worth naming directly.</Body>
        <SubTitle>First, create conditions for emergence. <Img label="illustration-3" /></SubTitle>
        <Body>In complex environments, not every important thing can be specified up front.</Body>
      </Narrow>

      <Narrow>
        <Sidebar side="left" topOffset="0px"><p>Making things legible enough to act on without making them rigid enough to break.</p></Sidebar>
        <Body>Design leaders are often unusually comfortable with this. They know how to frame a hypothesis without overclaiming it. They know how to create a probe — a small, contained experiment that generates learning rather than guaranteeing a result. They know how to hold space for discovery without letting ambiguity become paralysis.</Body>
        <Body>This is not a soft skill. It is a sophisticated leadership capability. The ability to make something legible enough to act on without making it rigid enough to break is genuinely difficult. Design training, at its best, develops exactly this.</Body>
        <SubTitle>Second, trade certainty for learning velocity.</SubTitle>
        <Body>The goal in complex conditions is not to appear certain. It is to reduce risk by learning faster than conditions change.</Body>
        <Sidebar side="right" topOffset="0px"><p>The pace of the learning loop matters more than the quality of the initial plan.</p></Sidebar>
        <Body>This sounds obvious but sits in direct tension with how most organisations reward leaders. Confidence is valued. Commitment signals credibility. Changing your mind can look like weakness. These norms make sense in complicated domains where expertise justifies certainty. In complex ones, they become liabilities.</Body>
        <Body>Design leaders can model a different relationship with uncertainty. Not performative vulnerability, but disciplined learning. Setting a clear intent, running a fast experiment, reading the signal honestly, and adjusting. Again and again. The pace of this loop matters more than the quality of the initial plan.</Body>
        <Callout title="The experiment mindset">There is a useful distinction between a plan and a probe. A plan assumes you know enough to specify the path. A probe assumes you don’t — and tries to find out quickly. In complicated conditions, plans are powerful. In complex ones, probes are safer. The challenge for most organisations is that their approval processes, budgeting cycles, and success metrics are built for plans. Helping senior stakeholders understand when a probe is the more rigorous choice — not the less rigorous one — is one of the most valuable things a design leader can do.</Callout>
        <SubTitle>Third, lead through sensemaking.</SubTitle> 
        <Body>In complex conditions, people do not just need direction. They need help making sense of what is happening.</Body>
      </Narrow>


      <Narrow>
        <Body>When signals are ambiguous and patterns are still forming, teams can become anxious or fragmented — not because they lack capability, but because they lack an interpretive framework. They do not know what to make of what they are observing.</Body>
        <Sidebar side="left" topOffset="0px"><p>Reducing confusion without manufacturing false confidence.</p></Sidebar>
        <Body>Design leaders can synthesise signals, surface patterns, and make complexity discussable. This is what good synthesis practice actually is — not just a research skill, but a leadership one. The ability to take a room full of confused, contradictory observations and help a team develop a shared understanding of what might be true, without overstating certainty.</Body>
        <Body>That combination — reducing confusion without manufacturing false confidence — is rare. It is also exactly what complex conditions demand.</Body>
      </Narrow>

      <Divider />

      {/* ── Section 4: Liminal Zone ── */}
      <Wide><Title>There is a specific space I want to name — one that I think is the most interesting and least discussed territory for design leadership. It sits at the boundary between complex and complicated. The Liminal Zone Where Emergence Becomes Practice</Title></Wide>

      <Narrow>
        <Sidebar side="right" topOffset="0px"><p>The threshold between complex and complicated where emergent practice becomes codified.</p></Sidebar>
        <Body>Here is how it works. In complex conditions, you probe and learn. Over time, if you are paying attention, patterns start to become legible. What was once uncertain starts to have a recognisable shape. Cause and effect, invisible at the start, begin to reveal themselves through accumulated experience.</Body>
        <Body>At that point, something important becomes possible. The learning can be translated. Emergent practice — the rough, contingent, intuitive ways of doing things that developed in the heat of complexity — can begin to become codified practice. Frameworks. Principles. Methods. Rituals. Systems. Things that can be taught, shared, and scaled.</Body>
        <Body>This is the liminal zone. <Img label="illustration-5" /> The threshold between complex and complicated. And strategic design is, I think, uniquely strong at helping organisations cross it.</Body>
      </Narrow>

      

      <Narrow>
        <Callout title="Emergent vs. Codified Practice">Emergent practice is what teams develop under pressure when rules don’t yet exist. It is often tacit — people know how to do it but cannot easily explain why. Codified practice is what happens when that tacit knowledge gets surfaced, examined, and translated into something teachable and repeatable. Most organisations struggle to make this translation. They either leave emergent practice invisible (so it disappears when people leave) or they codify too early, before patterns are stable enough to generalise. Design leaders, who are trained to make the implicit explicit and the invisible visible, are well-placed to manage this threshold.</Callout>
        <Body>The translation is not automatic. Emergent practices are often tacit — they live in people’s heads and habits, not in documents. They can be fragile, context-dependent, difficult to articulate. Turning them into durable organisational capability requires someone who can observe carefully, ask the right questions, hold the nuance, and craft something that is generalisable without losing what made the original practice work.</Body>
        <Sidebar side="left" topOffset="0px"><p>Turning emergent practice into durable organisational capability.</p></Sidebar>
        <Body>That is a design problem. And it is one of the most valuable things strategic design can do for an organisation navigating complexity.</Body>
        <Body>Strategic design helps organisations move knowledge from emergence into usable practice. Not just generating good ideas in workshops, but building the institutional capability to keep learning, keep translating, and keep operating well even as conditions continue to shift.</Body>
      </Narrow>

      <Divider />

      {/* ── Section 5: Experiments ── */}
      <Wide><Title>I will to end on something practical. These are not prescriptions, they are experiments. Ways of operating that are worth trying, especially if the conditions you are working in feel complex.</Title></Wide>

      <Narrow>
       

        <SubTitle>1. Rituals That Surface Learning</SubTitle>
        <Body>Most team rituals are designed to surface status. Stand-ups, sprint reviews, project check-ins — they answer the question where are we? That is useful. But in complex conditions, there is a more valuable question: what are we learning?</Body>
        <Sidebar side="right" topOffset="0px"><p>A recurring ritual structured around learning, not status.</p></Sidebar>
        <Body>Consider building a recurring ritual — fortnightly works well — structured around a different set of questions:</Body>
        <List items={[
          "What surprised us in the last two weeks?",
          "What pattern might be emerging that we have not discussed yet?",
          "What do we believe now that we did not believe two weeks ago?",
          "What are we learning that should change how we act?",
        ]} />
        <Body>These questions feel simple. In practice, they are quite hard to answer well. Which is exactly the point. The effort of answering them is where the learning happens — not just the recording of it.</Body>
        <Callout title="Why status rituals are not enough">Status rituals answer: where are we relative to the plan? Learning rituals answer: what is the plan not capturing? In complicated conditions, the former is sufficient. In complex ones, the latter is essential. Most organisations have many of the first and few of the second. If your team has no ritual dedicated to examining what it is noticing — not just what it is delivering — that is a gap worth closing.</Callout>

        <SubTitle>2. Start Small with New Systems</SubTitle>
        <Body>When leaders see a structural problem — a broken workflow, an ineffective governance model, a collaboration pattern that is not serving the work — the instinct is often to design a solution and roll it out. Analyse the problem, design the fix, implement at scale.</Body>
        <Sidebar side="left" topOffset="0px"><p>Introduce new systems in one team before scaling. This is rigour, not timidity.</p></Sidebar>
        <Body>In complex conditions, this is often the wrong sequence.</Body>
        <Body>The problem is that a new operating system — a new way of working, collaborating, deciding, or communicating — is itself a complex intervention. How people actually respond to it, what it enables and what it forecloses, cannot be fully anticipated in advance. The solution that looked right in the design phase will turn out to have unexpected consequences once it meets the actual texture of organisational life.</Body>
        <Body>A better approach: design a probe. Introduce the new system in one team, one workstream, one context. Run it with intentionality. Pay close attention to what happens. Then learn before you scale.</Body>
        <Body>In complex environments, systems should often be trialled before they are standardised. This is not timidity. It is rigour — applied to the right problem.</Body>

        <SubTitle>3. Empathy Needs to Travel Upwards</SubTitle>
        <Body>Design has a strong tradition of empathy. We are trained to understand the people we are designing for — their needs, their contexts, their mental models. That instinct is one of design’s genuine strengths.</Body>
        <Sidebar side="right" topOffset="0px"><p>Understanding what it is like to hold systemic responsibility at altitude.</p></Sidebar>
        <Body>But in most design practice, empathy travels in one direction: downward and outward. Toward users. Toward frontline workers. Toward the people closest to the problem. This is right and important.</Body>
        <Body>What gets less attention is the need for empathy to travel upwards too.</Body>
        <Body>Senior leaders often operate from altitude. They are managing multiple systems simultaneously. They are accountable for things they cannot fully observe. They are often making decisions at the edge of their information, under significant ambiguity. This is not a character flaw. It is the nature of the position.</Body>
        <Body>Design leaders who develop genuine empathy for this experience — who can understand what it is like to hold that level of systemic responsibility — become much more effective at connecting altitude to ground truth. Not by collapsing the two perspectives into one, but by helping senior leaders see what they cannot see from where they are standing, in ways that are legible and useful.</Body>
        <Body>The pursuit of excellence becomes brittle when leaders assume stability that does not exist. But it becomes powerful when leaders have the tools to work with complexity rather than against it.</Body>
        <Body>That is what strategic design, at its best, can offer.</Body>
      </Narrow>

      {/* ── Closing ── */}
      <Wide>
      <Title>What is the next organisational experiment you will design and run to probe the system and identify emerging best practice? <Img label="illustration-6" />
      </Title></Wide>

      <div className="py-20" />
    </div>
  );
}
