import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

type ExpandedText = { title: string; body: string } | null;

const expandedTexts: ExpandedText[] = [
  {
    title: "Conscious presence grounded within a defined space",
    body: "Conscious refers to an aware, reflective mind capable of perceiving itself and its surroundings. Presence signifies an active state of existing attentively within the current moment. Grounded implies stability, connection to physical reality, and a sense of balance. Within indicates being contained inside a boundary or defined context. A denotes a single instance among many possible forms or conditions. Defined suggests something clearly structured, bounded, and distinguishable. Space refers to an environment that holds form, structure, and experiential context.",
  },
  {
    title: "Aware being stable inside structured environment",
    body: "Aware describes a cognitive state of noticing, interpreting, and understanding stimuli. Being reflects existence as an entity experiencing reality over time. Stable implies consistency, balance, and resistance to disruption or change. Inside suggests a position enclosed or situated within a boundary. Structured refers to organized systems with defined relationships and order. Environment encompasses the surrounding conditions influencing experience and behavior.",
  },
  {
    title: "Perceiving entity balanced within ordered surroundings",
    body: "Perceiving involves actively sensing, processing, and interpreting external and internal signals. Entity denotes a distinct unit of existence with identifiable boundaries. Balanced suggests equilibrium between forces, states, or influences. Within again indicates containment inside a contextual boundary. Ordered refers to systematic arrangement governed by rules or logic. Surroundings describe the immediate context shaping perception and action.",
  },
  {
    title: "Sensing self maintains equilibrium in system",
    body: "Sensing is the process of detecting and interpreting stimuli from multiple sources. Self refers to the internal identity experiencing and interpreting reality. Maintains implies active effort to preserve a particular state or condition. Equilibrium describes a balanced state where opposing forces are equal. In indicates placement inside a defined context or system. System refers to interconnected elements forming a coherent whole.",
  },
  {
    title: "Self perceives and sustains balance in systems",
    body: "Self is the reflective core of identity that interprets and experiences existence. Perceives denotes the act of interpreting sensory and cognitive inputs. And connects multiple processes into a unified sequence of action. Sustains implies ongoing effort to uphold or preserve a condition. Balance represents stability achieved through equalizing forces or influences. In situates action within a defined context. Systems are networks of interacting components forming organized wholes.",
  },
  {
    title: "Identity interprets and preserves stability across structures",
    body: "Identity is the constructed sense of self shaped by perception and continuity. Interprets involves assigning meaning to inputs and experiences. And links multiple functions into coordinated activity. Preserves suggests intentional continuation or protection of a state. Stability refers to resilience and resistance to disruptive change. Across indicates extension through multiple contexts or domains. Structures are organized frameworks that define relationships and boundaries.",
  },
  null,
];

const iterations = [
  { label: "Source",       text: "I am sitting in a room",                                  level: 0 },
  { label: "Iteration 01", text: "Aware being stable inside structured environment",         level: 1 },
  { label: "Iteration 02", text: "Perceiving entity balanced within ordered surroundings",   level: 2 },
  { label: "Iteration 03", text: "Sensing self maintains equilibrium in system",             level: 3 },
  { label: "Iteration 04", text: "Self perceives and sustains balance in systems",           level: 4 },
  { label: "Iteration 05", text: "Identity interprets and preserves stability across structures", level: 5 },
  { label: "Iteration 06", text: "Self constructs meaning to sustain systemic stability",    level: 6 },
];

const PROMPT_CODE = `# Expand → contract iterations
# Use with ChatGPT, Claude, or any large language model

Take the sentence below and perform 6 rounds of the following:

  Round process:
    1. Expand — rewrite as a single phrase of 7–9 words using
       more abstract, conceptual vocabulary. Preserve the core meaning.
    2. Contract — compress back to a single short phrase of 4–6 words.

Each round uses the contracted output as the input for the next round.
Return only the contracted output of each round, numbered.

Starting sentence: "I am sitting in a room"`;

// ─── Visual config ─────────────────────────────────────────────────────────────

const levelConfig = [
  { blur: 0,    grainOpacity: 0,    grainFreq: 0.9,  bgOffset: 0  },
  { blur: 0.1,  grainOpacity: 0.04, grainFreq: 0.88, bgOffset: -1 },
  { blur: 0.18, grainOpacity: 0.07, grainFreq: 0.84, bgOffset: -2 },
  { blur: 0.28, grainOpacity: 0.10, grainFreq: 0.80, bgOffset: -3 },
  { blur: 0.35, grainOpacity: 0.13, grainFreq: 0.76, bgOffset: -5 },
  { blur: 0.42, grainOpacity: 0.16, grainFreq: 0.72, bgOffset: -7 },
  { blur: 0.50, grainOpacity: 0.20, grainFreq: 0.68, bgOffset: -9 },
];

function sectionBgRaw(level: number) {
  const o = levelConfig[level].bgOffset;
  return { r: 243 + o, g: 240 + o, b: 234 + o };
}

function sectionBg(level: number) {
  const { r, g, b } = sectionBgRaw(level);
  return `rgb(${r},${g},${b})`;
}

function sectionHeaderBg(level: number) {
  const { r, g, b } = sectionBgRaw(level);
  return `rgb(${Math.round(r * 0.90)},${Math.round(g * 0.90)},${Math.round(b * 0.90)})`;
}

function grainDataUrl(freq: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// ─── SVG distortion filters ────────────────────────────────────────────────────

function SvgFilters() {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <filter id="sitr-distort-1" x="-5%"  y="-5%"  width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.014" numOctaves="2" seed="7"  result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"  xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sitr-distort-2" x="-8%"  y="-8%"  width="116%" height="116%">
          <feTurbulence type="turbulence" baseFrequency="0.017" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4"  xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sitr-distort-3" x="-8%"  y="-8%"  width="116%" height="116%">
          <feTurbulence type="turbulence" baseFrequency="0.019" numOctaves="2" seed="3"  result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"  xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sitr-distort-4" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="turbulence" baseFrequency="0.021" numOctaves="2" seed="17" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7"  xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sitr-distort-5" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="turbulence" baseFrequency="0.024" numOctaves="2" seed="23" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9"  xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sitr-distort-6" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="turbulence" baseFrequency="0.026" numOctaves="2" seed="31" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── Iteration section ─────────────────────────────────────────────────────────

interface SectionProps {
  label: string;
  text: string;
  level: number;
  expanded: ExpandedText;
}

function IterationSection({ label, text, level, expanded }: SectionProps) {
  const cfg = levelConfig[level];
  const isSource = level === 0;

  const textFilter =
    level === 0 ? undefined : `url(#sitr-distort-${level}) blur(${cfg.blur}px)`;

  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: sectionBg(level),
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {/* Grain overlay */}
      {!isSource && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 6,
            backgroundImage: grainDataUrl(cfg.grainFreq),
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
            opacity: cfg.grainOpacity,
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Sticky section header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "1.2rem",
          padding: "1.4rem 2.5rem",
          backgroundColor: sectionHeaderBg(level),
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "0.95rem",
            fontWeight: 500,
            letterSpacing: "0.01em",
            color: "#0A0A0A",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(0,0,0,0.12)" }} />
        {!isSource && (
          <span
            style={{
              fontFamily: "var(--font-grotesque)",
              fontSize: "0.8rem",
              fontWeight: 300,
              letterSpacing: "0.06em",
              color: "rgba(0,0,0,0.35)",
            }}
          >
            Δ {level}
          </span>
        )}
      </div>

      {/* Main text */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "5vw 2.5rem",
          position: "relative",
          zIndex: 2,
          overflow: "visible",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "clamp(3.8rem, 9.5vw, 10.5rem)",
            fontWeight: 500,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: "#0A0A0A",
            margin: 0,
            maxWidth: "14ch",
            filter: textFilter,
          }}
        >
          {text}
        </p>
      </div>

      {/* Footer definitions */}
      {expanded && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "2.5rem 2.5rem 4.5rem",
            borderTop: "1px solid rgba(0,0,0,0.09)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-grotesque)",
              fontSize: "1rem",
              fontWeight: 500,
              letterSpacing: "0.01em",
              color: "#0A0A0A",
              margin: "0 0 1.2rem 0",
            }}
          >
            {expanded.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-grotesque)",
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.85,
              color: "rgba(10,10,10,0.58)",
              margin: 0,
              maxWidth: "780px",
            }}
          >
            {expanded.body}
          </p>
        </div>
      )}
    </section>
  );
}

// ─── About section ─────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section
      style={{
        backgroundColor: "#0A0A0A",
        padding: "8rem 2.5rem",
        color: "#F3F0EA",
      }}
    >
      <div style={{ maxWidth: "800px" }}>
        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "0.95rem",
            fontWeight: 500,
            letterSpacing: "0.01em",
            color: "rgba(243,240,234,0.5)",
            marginBottom: "2.5rem",
          }}
        >
          About the work
        </p>

        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "1.25rem",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(243,240,234,0.82)",
            marginBottom: "1.4rem",
          }}
        >
          This work is a contemporary reinterpretation of Alvin Lucier's seminal
          1969 piece{" "}
          <em style={{ fontStyle: "italic", color: "#F3F0EA" }}>
            I Am Sitting in a Room
          </em>
          . Where Lucier recorded his voice repeatedly within a physical space —
          allowing the room's acoustic resonances to gradually dissolve speech
          into pure tone — this version performs an analogous operation through
          language.
        </p>

        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "1.25rem",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(243,240,234,0.82)",
            marginBottom: "1.4rem",
          }}
        >
          An AI language model is asked to expand and then contract a single
          sentence, iteratively. Each pass drifts slightly from the last. What
          accumulates is not the resonance of a room, but the resonance of a
          model — the latent biases of machine cognition made legible through
          incremental semantic drift.
        </p>

        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "1.25rem",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(243,240,234,0.82)",
          }}
        >
          The algorithm reveals itself not through explanation, but through
          repetition. The room is the model. The resonance is meaning.
        </p>

        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(243,240,234,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          {["After Alvin Lucier, 1969", "7 iterations · expand → contract"].map((line) => (
            <span
              key={line}
              style={{
                fontFamily: "var(--font-grotesque)",
                fontSize: "0.9rem",
                fontWeight: 300,
                letterSpacing: "0.02em",
                color: "rgba(243,240,234,0.28)",
              }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Try it yourself section ───────────────────────────────────────────────────

function TryItSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_CODE);
    } catch {
      const el = document.createElement("textarea");
      el.value = PROMPT_CODE;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section style={{ backgroundColor: "#FFFFFF", padding: "8rem 2.5rem" }}>
      <div style={{ maxWidth: "800px" }}>
        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "0.95rem",
            fontWeight: 500,
            letterSpacing: "0.01em",
            color: "rgba(10,10,10,0.4)",
            marginBottom: "2rem",
          }}
        >
          Try it yourself
        </p>

        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "1.25rem",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "#0A0A0A",
            marginBottom: "1.2rem",
          }}
        >
          Paste the prompt below into any large language model — Claude, ChatGPT,
          Gemini — and run the same process with your own starting sentence.
        </p>

        <p
          style={{
            fontFamily: "var(--font-grotesque)",
            fontSize: "1.25rem",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(10,10,10,0.55)",
            marginBottom: "3.5rem",
          }}
        >
          Watch how the model's internal grammar pulls your words toward its own
          patterns of meaning. Each sentence that returns is both yours and not yours.
        </p>

        {/* Code block */}
        <div
          style={{
            position: "relative",
            borderRadius: "2px",
            border: "1px solid rgba(0,0,0,0.1)",
            backgroundColor: "#F5F4F0",
            overflow: "hidden",
          }}
        >
          {/* Header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.9rem 1.4rem",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              backgroundColor: "#EDECEA",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-grotesque)",
                fontSize: "0.78rem",
                fontWeight: 400,
                color: "rgba(10,10,10,0.4)",
                letterSpacing: "0.04em",
              }}
            >
              Prompt
            </span>

            <button
              onClick={handleCopy}
              style={{
                fontFamily: "var(--font-grotesque)",
                fontSize: "0.78rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: copied ? "#0A0A0A" : "rgba(10,10,10,0.5)",
                backgroundColor: "transparent",
                border: "1px solid rgba(0,0,0,0.18)",
                borderRadius: "2px",
                padding: "0.35rem 0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 6L4.5 9L10.5 3" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <rect x="4" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M1 4v7a1 1 0 001 1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Code */}
          <pre
            style={{
              margin: 0,
              padding: "1.8rem",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.82rem",
              lineHeight: 1.85,
              color: "#1A1A1A",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <code>{PROMPT_CODE}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────

export default function IAmSittingInARoom() {
  return (
    <div style={{ fontFamily: "var(--font-grotesque)" }}>
      <SvgFilters />

      {iterations.map((item, i) => (
        <IterationSection
          key={item.level}
          label={item.label}
          text={item.text}
          level={item.level}
          expanded={expandedTexts[i]}
        />
      ))}

      <AboutSection />
      <TryItSection />
    </div>
  );
}
