import { useEffect, useState } from 'react';

const BG     = '#FFFFFF';
const FG     = '#101720';
const ORANGE = '#FF5A1F'; // Signal Orange
const gasoek: React.CSSProperties = { fontFamily: 'var(--font-poster)' };

// Section headings: black outline, no fill, so the background shows through.
const outlined: React.CSSProperties = {
  ...gasoek,
  color: 'transparent',
  WebkitTextStroke: `0.025em ${FG}`,
};

// The page opens on orange and fades to white as the body starts.
const pageBackground = `linear-gradient(to bottom, ${ORANGE} 0, ${ORANGE} 100vh, ${BG} 170vh)`;

// ─── Decorative background glyph ──────────────────────────────────────────
// Rendered as a thick stroke outline — no fill — giving an abstract,
// typographic-mark quality at massive scale.
function Glyph({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        WebkitTextStroke: `0.06em ${FG}`,
        color: 'transparent',
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function MakingIsThinking() {
  const [noiseUrl, setNoiseUrl]       = useState('');
  const [noiseOpacity, setNoiseOpacity] = useState(0);

  // Generate a 256×256 random-noise texture once, stored as a data URL.
  // Tiled as a fixed overlay and faded in with scroll.
  useEffect(() => {
    const size   = 256;
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img  = ctx.createImageData(size, size);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data[i]     = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setNoiseUrl(canvas.toDataURL());
  }, []);

  // Scroll progress → noise opacity.
  // Power curve (<1) means it rises quickly at first then eases.
  // Max opacity ~0.22 — visible grain but not overwhelming.
  useEffect(() => {
    const onScroll = () => {
      const max      = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      setNoiseOpacity(Math.pow(progress, 0.55) * 0.22);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-clip"
      style={{ backgroundColor: BG, backgroundImage: pageBackground, color: FG, fontFamily: 'var(--font-rounded)', fontWeight: 300 }}
    >
      {/* ── Noise overlay ─────────────────────────────────────────────────
          Fixed, tiled, multiply-blended. Dark grains on light background.
          Opacity is driven by scroll position — increases toward the end. */}
      {noiseUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: `url(${noiseUrl})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            opacity: noiseOpacity,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            zIndex: 100,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center relative px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-7xl relative z-10">
          <h1
            className="text-[20vw] md:text-[18vw] lg:text-[15rem] leading-[0.8] tracking-tight"
            style={{ ...gasoek, color: FG }}
          >
            Making Is<br />Thinking
          </h1>
        </div>
        <Glyph className="top-[-10%] right-[-5%] text-[45vw] opacity-[0.10] font-serif">"</Glyph>
        <Glyph className="bottom-[5%] left-[-8%] text-[40vw] opacity-[0.09] rotate-[-15deg]">*</Glyph>
        <Glyph className="top-[40%] right-[15%] text-[30vw] opacity-[0.07]">—</Glyph>
      </section>

      {/* ─── Opening ──────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            Every project I’ve worked on at IDEO has a moment. Discussion is spiralling, we’re overloaded with inputs and we’re stressed about making sense of everything. The instinct is often to keep talking. But the next stage of thinking is only unlcoked by making.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            After picking up tools, and attempting to build (usually within an hour), the team has leapt forward. Not because people suddenly have new ideas, but because the act of making has forced their existing ideas into contact with reality. Constraints surface. Trade-offs become visible. Disagreements suddendly look like multiple perspectives on the same thing.
          </p>
        </div>
        <Glyph className="right-[-5%] top-[10%] text-[50vw] opacity-[0.09] rotate-[25deg]">&amp;</Glyph>
        <Glyph className="left-[60%] bottom-[-10%] text-[42vw] opacity-[0.08]">?</Glyph>
      </section>

      {/* ─── Pull quote 1 ─────────────────────────────────────────────────── */}
      <section className="py-32 md:py-48 px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: ORANGE }}>
        <div className="max-w-6xl relative z-10">
          <p className="text-[12vw] md:text-[10vw] lg:text-[8rem] leading-[0.95] tracking-tighter-old-old" style={{ ...gasoek, color: FG }}>
            Prototypes aren’t outputs. They’re thinking tools.
          </p>
        </div>
        <Glyph className="top-[-15%] right-[10%] text-[55vw] opacity-[0.07]">.</Glyph>
        <Glyph className="bottom-[-20%] left-[-10%] text-[60vw] opacity-[0.09] rotate-[90deg]">!</Glyph>
      </section>

      {/* ─── The Wrong Assumption ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          <h3 className="text-6xl md:text-8xl lg:text-[10rem] mb-12 leading-[0.9] tracking-tighter-old" style={outlined}>
            The wrong assumption
          </h3>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            There’s a deeply held belief — in organisations, in consulting, in traditional education — that creative work is a two-phase process. First you think. Then you make.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8 italic" style={{ color: FG }}>
            But all creatives know that your thinking continues as you make.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed" style={{ color: FG }}>
            This is hard earned knowledge, creatives everywhere know it. But as we start to use AI tools to do the making, we have a <b>real problem on our hands.</b> IN the past, when making took time and effort, the thinking happened inside it whether you intended it to or not. You couldn’t avoid learning as you built, because building was slow and resistant and full of friction.
          </p>
        </div>
        <Glyph className="left-[-12%] top-[25%] text-[52vw] opacity-[0.08] rotate-[45deg]">#</Glyph>
        <Glyph className="right-[-8%] bottom-[10%] text-[48vw] opacity-[0.10]">@</Glyph>
        <Glyph className="top-[-10%] right-[30%] text-[35vw] opacity-[0.07]">/</Glyph>
      </section>

      {/* ─── The Messy Middle ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] mb-12 leading-[0.9] tracking-tighter-old" style={outlined}>
            The messy middle
          </h1>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            AI tools — things I’m using constantly, things I’m building with, and prototyping with — have collapsed the distance between idea and output. You can move from a half-formed thought to a polished artefact in seconds. Tools like Claude don’t just generate outputs from prompts — they reason through the detail for you, filling in the gaps between your intention and the finished thing.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            This is genuinely useful. I’ve built research tools, analysis frameworks, working prototypes in hours that would have taken weeks. The <b>speed</b> is not the problem.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-12 italic" style={{ color: FG }}>
            The problem is what gets skipped.
          </p>
        </div>
        <Glyph className="right-[-10%] top-[-5%] text-[58vw] opacity-[0.09] rotate-[-20deg]">~</Glyph>
        <Glyph className="left-[50%] bottom-[-15%] text-[50vw] opacity-[0.07]">%</Glyph>
        <Glyph className="top-[50%] left-[-5%] text-[40vw] opacity-[0.10] rotate-[15deg]">+</Glyph>
      </section>

      {/* ─── Pull quote 2 ─────────────────────────────────────────────────── */}
      <section className="py-32 md:py-48 px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: ORANGE }}>
        <div className="max-w-6xl relative z-10">
          <p className="text-[10vw] md:text-[8vw] lg:text-[7rem] leading-[1.0] tracking-tighter-old" style={{ ...gasoek, color: FG }}>
            That middle bit. The messy, frustrating, iterative process of making. This is where most of the actual thinking happens. It’s not a cost to be optimised away. <b>It’s the whole point</b>.
          </p>
        </div>
        <Glyph className="top-[10%] right-[-8%] text-[65vw] opacity-[0.07]">(</Glyph>
        <Glyph className="bottom-[5%] left-[-12%] text-[62vw] opacity-[0.07]">)</Glyph>
        <Glyph className="top-[40%] right-[20%] text-[45vw] opacity-[0.06] rotate-[-25deg]">|</Glyph>
      </section>

      {/* ─── Tangible Thought ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] mb-12 leading-[0.9] tracking-tighter-old" style={outlined}>
            Tangible thought
          </h2>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            What do I actually mean by making?
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            I mean the act of a person using skills and craft and technique to build something. Something that externalises their thinking. At IDEO, we have teams of people with deep technical skills across a range of disciplines. When they’re faced with a problem, they don’t <b>talk</b> about the solution, they pick up the tools of their trade and begin <b>building</b> things. And in the act of making, they deepen their understanding of the problem in ways that conversation alone never achieves.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            Making is Thinking.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            In design, this happens from the very earliest stages, ot just when a direction has been chosen, but when the team is still trying to figure out what the problem actually is. Making is how you define the problem, not just how you solve it.
          </p>
        </div>
        <Glyph className="left-[-15%] top-[5%] text-[60vw] opacity-[0.08] rotate-[30deg]">?</Glyph>
        <Glyph className="right-[-5%] bottom-[-10%] text-[55vw] opacity-[0.09] rotate-[-40deg]">;</Glyph>
        <Glyph className="top-[60%] right-[25%] text-[42vw] opacity-[0.07]">:</Glyph>
      </section>

      {/* ─── Flora ────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          <h2 className="text-6xl md:text-8xl lg:text-[10rem] mb-12 leading-[0.9] tracking-tighter-old" style={outlined}>
            Embracing a new tool called Flora. Yes it AI, but the collaborative nature encouraged thinking and collaboration.
          </h2>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            A recent example. A team working on the future of commercial vehicles was thinking about new in-vehicle experiences: 3D concepts, spatial interfaces, physical-digital interactions. They used an AI tool called Flora.ai to rapidly generate and manipulate concepts together. They recreated images that looked like 3D renders, but were created through AI image generation. <a href="https://medium.com/front-line-interaction-design/intermediate-impossibles-d02f26bd9a74">Intermediate Impossibles</a> tooks is in unpredicatable but highly valuable directions.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            The thing that struck me: the value didn’t come from the outputs themselves. It came from the act of <b>making together</b>. As they built, shared, and shaped ideas in real time, the conversation flowed freely. Unexpected details surfaced. One person’s partial idea became another’s starting point. The work evolved through interaction with the tool, with each other, and with the emerging artefacts.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed" style={{ color: FG }}>
            But (and this is the crucial bit) multiple members of that team had deep experience in Industrial Design. They knew how to do it the hard way. They understood form, proportion, material. They were using an image generation tool with 3D renders as input, not a 3D tool directly, but their craft instincts shaped every prompt, every reaction, every decision about what to keep and what to push further.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed" style={{ color: FG }}>
            This was right for the strategic stage of the process, deep Industrial Design Skills would have slowed down the fast process of ideation, and certainly the deep skills will be needed in the next round. But even with tools to automate process, the act of making was where breakthrough ideas happened.
          </p>
        </div>
        <Glyph className="right-[-12%] top-[-10%] text-[62vw] opacity-[0.08] rotate-[22deg]">$</Glyph>
        <Glyph className="left-[-10%] bottom-[-8%] text-[58vw] opacity-[0.09] rotate-[-35deg]">=</Glyph>
        <Glyph className="top-[45%] right-[10%] text-[45vw] opacity-[0.07]">[</Glyph>
      </section>

      {/* ─── Pull quote 3 ─────────────────────────────────────────────────── */}
      <section className="py-32 md:py-48 px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: ORANGE }}>
        <div className="max-w-6xl relative z-10">
          <h2 className="text-[12vw] md:text-[10vw] lg:text-[8rem] leading-[0.95] tracking-tighter-old" style={{ ...gasoek, color: FG }}>
            Making forces choices.
          </h2>
        </div>
        <Glyph className="right-[-8%] bottom-[-15%] text-[68vw] opacity-[0.07] rotate-[-25deg]">!</Glyph>
        <Glyph className="left-[-5%] top-[10%] text-[55vw] opacity-[0.09]">]</Glyph>
        <Glyph className="top-[-10%] left-[35%] text-[50vw] opacity-[0.07] rotate-[40deg]">{'{'}</Glyph>
      </section>

      {/* ─── The Risk Underneath ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            I fear for the future of creativity.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            If making is how we think — and I believe it is — then anything that removes making from the process also removes a layer of thinking. It’s not obvious at first, but I think we’ll see the effects build over time.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            AI systems are built on past work created by skilled practitioners. People who spent years learning materials, tools, constraints, affordances. If new generations skip the making because AI handles it, that foundation weakens. Not the AI outputs — those might stay good for a while, drawing on the existing corpus. But the human capacity to judge, to iterate, to know <em>why</em> something works and how to push it further — that erodes.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed italic" style={{ color: FG }}>
            The risk isn’t just shallower outputs in the short term. It’s a gradual narrowing of how we think. As we outsource thinking to AI today, we become reliant on its presence tomorrow - and these tools are commercial products propped up by venture capital. Burning through credits on the promise of stability in the future. What if that doesn’t come? Or worse, it’s only available to those who can afford it? We will have outsourced our thinking to companies that crash.
          </p>
        </div>
        <Glyph className="left-[-8%] top-[30%] text-[60vw] opacity-[0.08] rotate-[15deg]">{'}'}</Glyph>
        <Glyph className="right-[-15%] bottom-[5%] text-[55vw] opacity-[0.09] rotate-[-50deg]">&lt;</Glyph>
        <Glyph className="top-[-8%] right-[25%] text-[48vw] opacity-[0.07]">&gt;</Glyph>
        <Glyph className="bottom-[40%] left-[60%] text-[40vw] opacity-[0.06] rotate-[28deg]">×</Glyph>
      </section>

      {/* ─── Pull quote 4 ─────────────────────────────────────────────────── */}
      <section className="py-32 md:py-48 px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: ORANGE }}>
        <div className="max-w-6xl relative z-10">
          <h2 className="text-[12vw] md:text-[10vw] lg:text-[8rem] leading-[0.95] tracking-tighter-old" style={{ ...gasoek, color: FG }}>
            Making is not an output.
          </h2>
          <h2 className="text-[12vw] md:text-[10vw] lg:text-[8rem] leading-[0.95] tracking-tighter-old mt-8" style={{ ...gasoek, color: FG }}>
            Making is an input to further thought.
          </h2>
        </div>
        <Glyph className="right-[-10%] top-[20%] text-[62vw] opacity-[0.09] rotate-[10deg]">→</Glyph>
        <Glyph className="left-[-12%] bottom-[-10%] text-[58vw] opacity-[0.07] rotate-[-20deg]">←</Glyph>
        <Glyph className="top-[-5%] left-[30%] text-[50vw] opacity-[0.07]">↑</Glyph>
      </section>

      {/* ─── Making as Input ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            One of the most important reframes is this: making is not an output. Making is an input to further thought.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            A rough prototype, a sketch, a model, a simple artefact — these aren’t deliverables. They’re thinking devices. They allow others to engage. They surface insight faster than conversation. They create shared understanding. They are <a href="https://medium.com/@mattcooperwright/b469b63d5115">Boundary Objects</a>.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            I don’t think the answer is to reject AI tools. I use them daily. They’re here to stay.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            But I think we need to be deliberate about when we use them and how. There’s a difference between (a) using AI to accelerate the making — to iterate faster, to explore more possibilities, to test more variations — and (b) using AI to replace the making entirely. How will you notice which mode you’re in?
          </p>
        </div>
        <Glyph className="right-[-8%] top-[10%] text-[60vw] opacity-[0.07] rotate-[35deg]">↓</Glyph>
        <Glyph className="left-[-10%] bottom-[15%] text-[55vw] opacity-[0.09] rotate-[-15deg]">÷</Glyph>
        <Glyph className="top-[50%] right-[20%] text-[45vw] opacity-[0.07]">±</Glyph>
      </section>



      {/* ─── Final pull quote ─────────────────────────────────────────────── */}
      <section className="py-32 md:py-48 px-6 md:px-12 lg:px-24 relative overflow-hidden" style={{ backgroundColor: ORANGE }}>
        <div className="max-w-6xl relative z-10">
          <p className="text-[12vw] md:text-[10vw] lg:text-[8rem] leading-[0.95] tracking-tighter-old mb-12" style={{ ...gasoek, color: FG }}>
            Accelerating Making might extend your thinking.
          </p>
          <p className="text-[12vw] md:text-[10vw] lg:text-[8rem] leading-[0.95] tracking-tighter-old" style={{ ...gasoek, color: FG }}>
            But outsourcing the making will be the end of thinking.
          </p>
        </div>
        <Glyph className="top-[5%] right-[-12%] text-[68vw] opacity-[0.07] rotate-[18deg]">≈</Glyph>
        <Glyph className="bottom-[-10%] left-[-8%] text-[60vw] opacity-[0.09] rotate-[-42deg]">§</Glyph>
        <Glyph className="top-[50%] left-[30%] text-[45vw] opacity-[0.06]">¶</Glyph>
      </section>

      {/* ─── Closing thoughts ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-3xl">
          <p className="text-sm md:text-base lg:text-lg leading-relaxed mb-8" style={{ color: FG }}>
            If we skip the messy middle — if we treat making as the thing that’s easy to automate, the bit between the idea and the answer — our ideas are going to develop more slowly and they’re not going to be as rich. And in the longer term, if we allow AI to do all these jobs without developing those slow-learned complex skills ourselves, the next generation of creatives will just have a smaller toolkit to work from.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed italic" style={{ color: FG }}>
            Our ideas will get narrower and narrower over time.
          </p>
        </div>
        <Glyph className="right-[-8%] bottom-[-8%] text-[60vw] opacity-[0.09] font-serif rotate-[12deg]">"</Glyph>
        <Glyph className="left-[-10%] top-[15%] text-[55vw] opacity-[0.07] rotate-[-25deg]">•</Glyph>
        <Glyph className="top-[-5%] left-[50%] text-[48vw] opacity-[0.07]">°</Glyph>
      </section>

      {/* ─── Final reflection — dark section ──────────────────────────────── */}
      {/* Background flips to FG (#101720) so the white closing line pops.    */}
      <section
        className="min-h-screen flex flex-col justify-end py-24 md:py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden"
        style={{ backgroundColor: FG }}
      >
        {/* Faint glyphs in inverted scheme */}
        <div
          className="absolute top-[-5%] right-[-15%] text-[65vw] pointer-events-none select-none rotate-[30deg]"
          style={{ WebkitTextStroke: `0.06em ${BG}`, color: 'transparent', fontWeight: 900, opacity: 0.07 }}
        >‡</div>
        <div
          className="absolute bottom-[40%] right-[15%] text-[52vw] pointer-events-none select-none rotate-[-15deg]"
          style={{ WebkitTextStroke: `0.06em ${BG}`, color: 'transparent', fontWeight: 900, opacity: 0.06 }}
        >†</div>
        <div
          className="absolute top-[35%] left-[-8%] text-[58vw] pointer-events-none select-none"
          style={{ WebkitTextStroke: `0.06em ${BG}`, color: 'transparent', fontWeight: 900, opacity: 0.07 }}
        >‰</div>

        <div className="max-w-5xl relative z-10">
          <p
            className="text-sm md:text-base lg:text-lg leading-relaxed mb-16"
            style={{ color: BG, opacity: 0.55 }}
          >
            I used AI tools to help me shape and delvier the content. I say this to empahsise that using AI is not the problem. The problem is when you skip making altogether and jump from prompt to article. As I began writing, and building the page, the argument wasn’t fully formed. I started with a feeling that something important was shifting, and the writing has been how I’ve figured out what I actually think about it. 
          </p>
          <p
            className="text-sm md:text-base lg:text-lg leading-relaxed mb-16"
            style={{ color: BG, opacity: 0.55 }}
          >
            Building this page was the next stage of thinking needed to shape the idea.
          </p>

          {/* THE closing line — massive, white */}
          <h1
            className="text-[13vw] md:text-[11vw] lg:text-[9rem] leading-[0.88] tracking-tighter-old"
            style={{ ...gasoek, color: '#ffffff' }}
          >
            Which is, I suppose, the point.
          </h1>
          <p>...</p>
          <p
            className="text-sm md:text-base lg:text-lg leading-relaxed mb-16"
            style={{ color: BG, opacity: 0.55 }}
          >
            Post Script: I’m also hoping that the debate that follows will move my thinking on even further.
          </p>
        </div>
      </section>
    </div>
  );
}
