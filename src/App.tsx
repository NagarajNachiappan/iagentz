import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import heroOrb from "@/assets/hero-orb.jpg";
import agentKairos from "@/assets/agent-kairos.jpg";
import agentEcho from "@/assets/agent-echo.jpg";
import agentVortex from "@/assets/agent-vortex.jpg";
import pillarDiscover from "@/assets/pillar-discover.jpg";
import pillarBuild from "@/assets/pillar-build.jpg";
import pillarGovern from "@/assets/pillar-govern.jpg";
import skillShadowImg from "@/assets/skill-shadow.jpg";
// These three were Lovable-hosted remote assets in the source export; mapped to the
// equivalent bundled images so the site is fully self-contained.
import humanOsBg from "@/assets/human-os.jpg";
import humanRobotPulse from "@/assets/skill-to-agent.jpg";
import improveBg from "@/assets/pillar-optimize.jpg";

export default function App() {
  return <Landing />;
}

const AGENTS = [
  {
    id: "KAIROS",
    name: "Supply Logistics",
    desc: "Predicts stock depletion and executes vendor orders autonomously based on market fluctuations.",
    tags: ["ERP INTEGRATION", "MARKET ANALYSIS"],
    stat: "STABILITY 99.4%",
    img: agentKairos,
  },
  {
    id: "ECHO",
    name: "Customer Synthesis",
    desc: "Resolves high-complexity support tickets via voice and text using 4th-gen reasoning kernels.",
    tags: ["VOICE SYNTH", "MULTI-LINGUAL"],
    stat: "LATENCY 12ms",
    img: agentEcho,
  },
  {
    id: "VORTEX",
    name: "Security Sentinel",
    desc: "Monitors cloud infrastructure for zero-day exploits and patches vulnerabilities in real-time.",
    tags: ["INFRA-GOVERNANCE", "PEN-TESTING"],
    stat: "ACCURACY 99.9%",
    img: agentVortex,
  },
];

const CAPABILITIES = [
  { n: "01", t: "Persistent Memory", d: "Agents retain a permanent state across months of operation — learning your systems, your data, your edge cases." },
  { n: "02", t: "Self-Healing Logic", d: "Errors in the execution path branch new reasoning trees automatically. No human in the loop required." },
  { n: "03", t: "Zero-Trust Sandboxing", d: "Every action runs in a volatile virtual environment. Your proprietary data never leaks into training weights." },
  { n: "04", t: "Sub-15ms Inference", d: "Custom silicon and edge deployment keep latency below the threshold of perception." },
];

const ROTATING_WORDS = ["Logistics", "Support", "Security", "Research", "Sales", "Ops"];

// ---------- Hooks ----------

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setVisible(true), obs.disconnect()),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useMouseGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const onMove = (e: MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return { ref, onMouseMove: onMove };
}

function useCountUp(target: number, duration = 1800, start: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return v;
}

// ---------- Components ----------

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-foreground overflow-x-hidden">
      <AmbientBg />
      <Nav />
      <Hero />
      <Marquee />
      <Pillars />
      <SkillShadow />
      <AgentShowcase />
      <Capabilities />
      <SkillToAgent />
      {/* Testimonials removed per request */}
      <HowItWorks />
      <HumanOS />
      <Journey />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function AmbientBg() {
  // Subtle blob parallax that follows cursor
  const [pos, setPos] = useState({ x: 0.5, y: 0.3 });
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="absolute w-[60%] h-[60%] bg-primary/15 rounded-full blur-[140px] transition-transform duration-700 ease-out"
        style={{ top: "-15%", left: "-10%", transform: `translate(${pos.x * 40}px, ${pos.y * 40}px)` }}
      />
      <div
        className="absolute w-[55%] h-[55%] bg-accent/10 rounded-full blur-[160px] transition-transform duration-700 ease-out"
        style={{ bottom: "-15%", right: "-10%", transform: `translate(${-pos.x * 40}px, ${-pos.y * 40}px)` }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? "border-border bg-background/80 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative size-7 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center glow-primary group-hover:scale-110 transition-transform">
            <div className="size-2 bg-background rounded-full" />
          </div>
          <span className="font-mono font-semibold tracking-tighter text-sm">
            iagentz<span className="text-primary">.ai</span>
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {[["Agents", "#agents"], ["Architecture", "#capabilities"], ["Deployment", "#how"], ["Enterprise", "#cta"]].map(([l, h]) => (
            <a key={l} href={h} className="relative hover:text-foreground transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full">
              {l}
            </a>
          ))}
        </div>
        <button className="px-4 py-1.5 bg-foreground text-background rounded-full text-xs font-bold hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 transition-all">
          Access Beta
        </button>
      </div>
    </nav>
  );
}

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-block relative align-bottom overflow-hidden h-[1em] min-w-[5ch]">
      {ROTATING_WORDS.map((w, idx) => (
        <span
          key={w}
          className="absolute inset-0 text-primary transition-all duration-500"
          style={{
            transform: `translateY(${(idx - i) * 100}%)`,
            opacity: idx === i ? 1 : 0,
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

function Hero() {
  const orbRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setTilt({ x: (e.clientX / w - 0.5) * 30, y: (e.clientY / h - 0.5) * 30 });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <header className="relative pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-[10px] font-mono text-primary mb-10">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            SYSTEM STATUS / AUTONOMOUS — v4.2 LIVE
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="text-5xl sm:text-7xl md:text-[8.5rem] font-extrabold tracking-tighter chrome-text leading-[0.85] mb-8">
            DELEGATE
            <br />
            <RotatingWord />
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground mb-10 text-pretty">
            Deploy custom-trained autonomous agents that live in your stack. Not chatbots —
            workforce units with memory, logic, and action layers.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
            <button className="group w-full sm:w-auto px-8 py-3.5 bg-foreground text-background rounded-full font-bold text-sm ring-4 ring-foreground/10 hover:ring-primary/40 hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 transition-all">
              Deploy First Agent
              <span className="inline-block ml-1 transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 glass-panel rounded-full font-bold text-sm hover:border-foreground/30 hover:scale-105 active:scale-95 transition-all">
              Watch Synthesis
            </button>
          </div>
        </Reveal>

        {/* Interactive orb */}
        <div
          ref={orbRef}
          className="relative mx-auto w-full max-w-2xl aspect-square"
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative size-full transition-transform duration-300 ease-out"
            style={{ transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)` }}
          >
            <div className="absolute inset-0 rounded-full bg-primary/25 blur-3xl animate-float-y" />
            <img
              src={heroOrb}
              alt="iagentz neural core — liquid mercury visualization"
              width={1024}
              height={1024}
              className="relative size-full object-contain animate-float-y"
            />
            <div className="absolute inset-[8%] rounded-full border border-primary/15 animate-orb-spin">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-primary glow-primary" />
            </div>
            <div
              className="absolute inset-[18%] rounded-full border border-accent/15 animate-orb-spin"
              style={{ animationDuration: "60s", animationDirection: "reverse" }}
            >
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 size-1.5 rounded-full bg-accent" />
            </div>
            <div
              className="absolute inset-[28%] rounded-full border border-primary/10 animate-orb-spin"
              style={{ animationDuration: "30s" }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary/70" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Marquee() {
  const items = ["NVIDIA", "OPENAI", "ANTHROPIC", "STRIPE", "VERCEL", "SUPABASE", "AWS", "DATABRICKS"];
  // duplicate for seamless loop
  const loop = [...items, ...items];
  return (
    <section className="border-y border-border py-6 overflow-hidden">
      <div className="flex gap-3 items-center">
        <span className="shrink-0 pl-6 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60">
          Integrated with —
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-16 w-max animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
            {loop.map((i, idx) => (
              <span key={`${i}-${idx}`} className="font-mono text-sm font-medium tracking-wider text-muted-foreground/70 hover:text-primary transition-colors">
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

function AgentCard({ a, idx }: { a: (typeof AGENTS)[number]; idx: number }) {
  const { ref, onMouseMove } = useMouseGlow<HTMLElement>();
  return (
    <Reveal delay={idx * 100}>
      <article
        ref={ref}
        onMouseMove={onMouseMove}
        className="group relative glass-panel rounded-3xl p-6 overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
        style={{
          backgroundImage:
            "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), oklch(0.85 0.18 195 / 0.12), transparent 40%)",
        }}
      >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative w-full aspect-square rounded-2xl mb-6 overflow-hidden bg-card">
          <img
            src={a.img}
            alt={`Agent ${a.id} — ${a.name}`}
            loading="lazy"
            width={1024}
            height={1024}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px]">
            <span className="text-primary">AGENT / {a.id}</span>
            <span className="text-muted-foreground">{a.stat}</span>
          </div>
        </div>

        <h4 className="text-xl font-bold mb-2">{a.name}</h4>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{a.desc}</p>

        <div className="flex flex-wrap gap-1.5">
          {a.tags.map((t) => (
            <span key={t} className="px-2 py-1 rounded-md bg-secondary text-[9px] font-bold font-mono text-muted-foreground border border-border">
              {t}
            </span>
          ))}
        </div>
      </article>
    </Reveal>
  );
}

function AgentShowcase() {
  return (
    <section id="agents" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
                // Marketplace / Units
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Select your model.</h3>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm">
              Pre-trained for specific industrial verticals, ready for API integration in under 60 seconds.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {AGENTS.map((a, i) => (
            <AgentCard key={a.id} a={a} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityCell({ c, i }: { c: (typeof CAPABILITIES)[number]; i: number }) {
  const { ref, onMouseMove } = useMouseGlow<HTMLDivElement>();
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative bg-background p-10 md:p-14 transition-colors group cursor-pointer overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(500px circle at var(--mx, -100%) var(--my, -100%), oklch(0.85 0.18 195 / 0.08), transparent 40%)",
      }}
    >
      <Reveal delay={i * 80}>
        <div className="flex items-start gap-6">
          <span className="font-mono text-xs text-primary">{c.n}</span>
          <div>
            <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{c.t}</h4>
            <p className="text-muted-foreground leading-relaxed">{c.d}</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" className="py-32 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="max-w-3xl mb-20">
            <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
              // Architecture
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance">
              Built for the autonomous era — not retrofitted from chat.
            </h3>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-3xl overflow-hidden">
          {CAPABILITIES.map((c, i) => (
            <CapabilityCell key={c.n} c={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Connect", d: "Wire up your data sources, APIs, and tools through our unified protocol layer." },
    { n: "02", t: "Train", d: "Agents ingest your processes and develop domain expertise in hours, not weeks." },
    { n: "03", t: "Deploy", d: "Push agents to production with versioned rollouts and instant rollback." },
    { n: "04", t: "Observe", d: "Real-time trace of every reasoning step, action, and decision." },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % steps.length), 2400);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <section id="how" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
              // Deployment Protocol
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">From zero to autonomous in four steps.</h3>
          </div>
        </Reveal>

        <div className="relative">
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-border overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-700 ease-out"
              style={{ width: `${((active + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => {
              const isActive = i === active;
              return (
                <Reveal key={s.n} delay={i * 100}>
                  <button
                    onClick={() => setActive(i)}
                    className="relative text-center w-full group"
                  >
                    <div
                      className={`relative mx-auto mb-6 size-16 grid place-items-center rounded-full border transition-all duration-500 ${
                        isActive
                          ? "bg-primary border-primary scale-110 glow-primary"
                          : "bg-background border-primary/30 group-hover:border-primary/60"
                      }`}
                    >
                      <span
                        className={`font-mono text-sm font-bold transition-colors ${
                          isActive ? "text-primary-foreground" : "text-primary"
                        }`}
                      >
                        {s.n}
                      </span>
                      {isActive && (
                        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50" />
                      )}
                    </div>
                    <h4 className="text-lg font-bold mb-2">{s.t}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, suffix = "", decimals = 0 }: { label: string; value: number; suffix?: string; decimals?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const v = useCountUp(value, 2000, visible);
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground font-mono tracking-widest">{label}</span>
      <span className="text-2xl font-bold chrome-text tabular-nums">
        {v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {suffix}
      </span>
    </div>
  );
}

function CTA() {
  return (
    <section id="cta" className="py-32 px-6">
      <Reveal>
        <div className="max-w-5xl mx-auto glass-panel aurora-bg rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

          <h2 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-6 chrome-text">
            THE FUTURE DOESN'T
            <br />
            WAIT FOR INPUT.
          </h2>
          <p className="text-muted-foreground mb-10 text-lg max-w-xl mx-auto">
            Join the closed beta. Automate the complexity out of your enterprise.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-16"
          >
            <input
              type="email"
              required
              placeholder="you@company.com"
              className="flex-1 px-5 py-3.5 rounded-full bg-background/60 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium placeholder:text-muted-foreground transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:scale-[1.03] active:scale-95 transition-transform"
            >
              Request access
            </button>
          </form>

          <div className="pt-12 border-t border-border flex flex-wrap justify-center gap-12">
            <Stat label="ACTIVE NODES" value={42019} />
            <Stat label="THROUGHPUT PB/s" value={8.2} decimals={1} />
            <Stat label="UPTIME %" value={99.999} decimals={3} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ---------- New sections ----------

function ImproveSignalFlow({ src }: { src: string }) {
  const css = `
  .is-frame{position:relative;width:100%;height:100%;border-radius:12px;overflow:hidden;background:#05060f;}
  .is-frame>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}
  .is-p{position:absolute;height:6px;transform:translateY(-50%);pointer-events:none;}
  .is-p>i{position:absolute;top:50%;width:9px;height:9px;margin-top:-4.5px;border-radius:50%;animation:isRun 1.4s linear infinite;animation-delay:inherit;}
  .is-p.c>i{background:radial-gradient(circle,#fff,#3df0ff 55%,transparent 72%);box-shadow:0 0 10px #28e0ff,0 0 22px rgba(40,224,255,.85);}
  .is-p.m>i{background:radial-gradient(circle,#fff,#ff4da6 55%,transparent 72%);box-shadow:0 0 10px #ff2d95,0 0 22px rgba(255,45,149,.85);}
  .is-p>i::before{content:"";position:absolute;top:50%;right:5px;width:34px;height:2px;transform:translateY(-50%);border-radius:2px;}
  .is-p.c>i::before{background:linear-gradient(to left,rgba(40,224,255,.9),transparent);}
  .is-p.m>i::before{background:linear-gradient(to left,rgba(255,45,149,.9),transparent);}
  @keyframes isRun{0%{left:-8%;opacity:0}12%{opacity:1}88%{opacity:1}100%{left:108%;opacity:0}}
  .is-flare{position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;opacity:0;animation:isFlare 1.4s ease-out infinite;}
  .is-flare.c{background:radial-gradient(circle,rgba(40,224,255,.95),transparent 60%);box-shadow:0 0 16px #28e0ff;}
  .is-flare.m{background:radial-gradient(circle,rgba(255,45,149,.95),transparent 60%);box-shadow:0 0 16px #ff2d95;}
  @keyframes isFlare{0%,60%{transform:scale(.4);opacity:0}74%{transform:scale(1.3);opacity:1}100%{transform:scale(.5);opacity:0}}
  @media (prefers-reduced-motion: reduce){.is-frame *{animation:none!important}}
  `;
  const pulses = [
    { cls: "m", left: "23.2%", top: "43.8%", width: "4.6%", delay: "0.0s" },
    { cls: "m", left: "23.2%", top: "43.8%", width: "4.6%", delay: "0.7s" },
    { cls: "m", left: "23.2%", top: "49.5%", width: "4.6%", delay: "0.0s" },
    { cls: "m", left: "23.2%", top: "49.5%", width: "4.6%", delay: "0.7s" },
    { cls: "c", left: "47.1%", top: "43.8%", width: "4.6%", delay: "0.42s" },
    { cls: "c", left: "47.1%", top: "43.8%", width: "4.6%", delay: "1.12s" },
    { cls: "c", left: "47.1%", top: "49.5%", width: "4.6%", delay: "0.42s" },
    { cls: "c", left: "47.1%", top: "49.5%", width: "4.6%", delay: "1.12s" },
    { cls: "m", left: "71.0%", top: "43.8%", width: "4.6%", delay: "0.84s" },
    { cls: "m", left: "71.0%", top: "43.8%", width: "4.6%", delay: "1.54s" },
    { cls: "m", left: "71.0%", top: "49.5%", width: "4.6%", delay: "0.84s" },
    { cls: "m", left: "71.0%", top: "49.5%", width: "4.6%", delay: "1.54s" },
  ];
  const flares = [
    { cls: "m", left: "27.8%", top: "43.8%", delay: "1.09s" },
    { cls: "m", left: "27.8%", top: "49.5%", delay: "1.09s" },
    { cls: "c", left: "51.7%", top: "43.8%", delay: "1.51s" },
    { cls: "c", left: "51.7%", top: "49.5%", delay: "1.51s" },
    { cls: "m", left: "75.6%", top: "43.8%", delay: "1.93s" },
    { cls: "m", left: "75.6%", top: "49.5%", delay: "1.93s" },
  ];
  return (
    <div className="is-frame relative">
      <style>{css}</style>
      <img src={src} alt="Improve Signal Flow" loading="lazy" />
      {pulses.map((p, i) => (
        <div key={`p${i}`} className={`is-p ${p.cls}`} style={{ left: p.left, top: p.top, width: p.width, animationDelay: p.delay }}>
          <i />
        </div>
      ))}
      {flares.map((f, i) => (
        <div key={`f${i}`} className={`is-flare ${f.cls}`} style={{ left: f.left, top: f.top, animationDelay: f.delay }} />
      ))}
    </div>
  );
}

const PILLARS = [
  {
    tag: "01 / Discover",
    title: "Know what to automate before you build.",
    desc: "iagentz Discovery matches patterns from billions of agent runs against your tickets, chats, apps, and workflows. Get a list of opportunities ranked by effort, value, and readiness.",
    bullets: [
      "Use-case generator powered by billions of agent runs",
      "Interactive suggestions refine recommended automations",
      "Shareable presentations to accelerate team alignment",
      "One-click context to jumpstart the build phase",
    ],
    img: pillarDiscover,
    overlay: "bars" as const,
  },
  {
    tag: "02 / Build",
    title: "Multi-agent workflows, your way.",
    desc: "From a visual canvas to a code-first SDK, iagentz flexes to meet you where you are. Compose role-based agents into deterministic, observable workflows.",
    bullets: [
      "No-code visual editor, exportable to Python & TypeScript",
      "Code-first SDK built for total control",
      "Role-based agents separate concerns cleanly",
      "Deterministic workflows with branching & retries",
    ],
    img: pillarBuild,
    overlay: "flow" as const,
  },
  {
    tag: "03 / Govern",
    title: "Production agents, under control.",
    desc: "The Control Plane sits in the execution path of every workflow — every interaction is observable, compliant, and reversible.",
    bullets: [
      "Real-time tracing of every LLM, tool, and memory call",
      "RBAC, immutable audit trails, and enterprise IAM",
      "Human-in-the-loop approval gates",
      "Runtime hooks for PII redaction and policy checks",
    ],
    img: pillarGovern,
    overlay: "control" as const,
  },
  {
    tag: "04 / Optimize",
    title: "Agents that get better with every run.",
    desc: "Every production run becomes training data — sharpening accuracy, lowering cost, and surfacing the next workflow to automate.",
    bullets: [
      "Collect — gather production runs, user feedback, and edge cases as live training signal",
      "Evaluate — run automated benchmarks and human review to catch drift and regressions",
      "Retrain — fine-tune prompts, swap models, and rebuild on the strongest new data",
      "Deploy — ship versioned releases with cost tracking, rollback, and confidence scoring",
    ],
    overlay: "orbit" as const,
    component: <ImproveSignalFlow src={improveBg} />,
  },
];

function Pillars() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
              // The Platform
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance">
              Discover, build, govern, and optimize agents — in one place.
            </h3>
          </div>
        </Reveal>

        <div className="space-y-24">
          {PILLARS.map((p, i) => (
            <PillarRow key={p.tag} p={p} flip={i % 2 === 1} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarRow({ p, flip, idx }: { p: (typeof PILLARS)[number]; flip: boolean; idx: number }) {
  const hasComponent = "component" in p && p.component;
  const { ref, onMouseMove } = useMouseGlow<HTMLDivElement>();
  return (
    <Reveal delay={idx * 60}>
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div
          ref={ref}
          onMouseMove={onMouseMove}
          className="relative glass-panel rounded-3xl overflow-hidden aspect-[4/3] group"
          style={{
            backgroundImage:
              "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), oklch(0.85 0.18 195 / 0.18), transparent 45%)",
          }}
        >
          {hasComponent ? (
            <div className="relative size-full">{p.component}</div>
          ) : (
            <img
              src={p.img}
              alt={p.tag}
              loading="lazy"
              width={1280}
              height={896}
              className="relative size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          
          <div className="absolute inset-0 ring-1 ring-inset ring-border rounded-3xl pointer-events-none" />
        </div>

        <div>
          <span className="font-mono text-xs text-primary uppercase tracking-[0.25em]">{p.tag}</span>
          <h4 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-balance">{p.title}</h4>
          <p className="mt-5 text-muted-foreground leading-relaxed">{p.desc}</p>
          <ul className="mt-8 space-y-3">
            {p.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0 glow-primary" />
                <span className="text-foreground/90">{b}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-primary group">
            Learn more
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </Reveal>
  );
}

const TESTIMONIALS = [
  {
    logo: "GELATO",
    quote:
      "Lead quality and prioritization jumped overnight. The agents enrich every record with company size, infrastructure, and revenue estimates before our team ever sees it.",
    author: "Styrbjorn Holmberg",
    role: "VP Product Management",
    metric: "3,000+",
    metricLabel: "leads enriched / month",
  },
  {
    logo: "DOCUNET",
    quote:
      "We cut time-to-first-contact by 75%. Agents extract, consolidate, and qualify leads across every internal system without a human touching them.",
    author: "Maya Patel",
    role: "Head of Revenue Ops",
    metric: "75%",
    metricLabel: "faster first contact",
  },
  {
    logo: "PIRACANJUBA",
    quote:
      "Replaced our legacy RPA stack with a single crew of agents. Response time dropped, accuracy went up, and our team gets to focus on the hard tickets.",
    author: "Lucas Almeida",
    role: "Director of Support",
    metric: "95%",
    metricLabel: "response accuracy",
  },
  {
    logo: "KONECTA",
    quote:
      "Voice-agent QA used to take 74 hours per release. With iagentz it runs in three. The team ships twice as often with fewer regressions.",
    author: "Camila Vargas",
    role: "Head of QA",
    metric: "96%",
    metricLabel: "reduction in QA time",
  },
];

function Testimonials() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
                // Customer Wins
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Trusted by teams shipping in production.</h3>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm">
              From series-A startups to Fortune 500 operations — measurable outcomes, not pilots.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.logo} t={t} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t, idx }: { t: (typeof TESTIMONIALS)[number]; idx: number }) {
  const { ref, onMouseMove } = useMouseGlow<HTMLDivElement>();
  return (
    <Reveal delay={idx * 80}>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        className="group relative glass-panel rounded-3xl p-8 md:p-10 hover:border-primary/30 transition-colors h-full flex flex-col"
        style={{
          backgroundImage:
            "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), oklch(0.78 0.16 320 / 0.08), transparent 45%)",
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
            {t.logo}
          </span>
          <span className="font-mono text-[10px] text-primary">VERIFIED ↗</span>
        </div>

        <blockquote className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-8 flex-1">
          <span className="text-primary text-2xl leading-none">"</span>
          {t.quote}
          <span className="text-primary text-2xl leading-none">"</span>
        </blockquote>

        <div className="flex items-end justify-between pt-6 border-t border-border">
          <div>
            <div className="font-bold text-sm">{t.author}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold chrome-text tabular-nums">{t.metric}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {t.metricLabel}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

const JOURNEY = [
  {
    stage: "STARTING OUT",
    title: "You're ready for agents.",
    desc: "You need a solid foundation to start building. Spin up your first agent in minutes with our open SDK.",
    cta: "Start free",
    badge: "Free tier",
    featured: false,
  },
  {
    stage: "SCALING UP",
    title: "You've launched pilots.",
    desc: "Now you need agents in production with observability, evals, and human-in-the-loop guardrails baked in.",
    cta: "Meet with us",
    badge: "Team",
    featured: true,
  },
  {
    stage: "AT SCALE",
    title: "Agents are running.",
    desc: "You need to manage sprawl. Centralized governance, RBAC, and FinOps controls across every team and workflow.",
    cta: "Talk to enterprise",
    badge: "Enterprise",
    featured: false,
  },
];

function Journey() {
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
              // Get Started
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
              Whatever stage you're at — we meet you there.
            </h3>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.stage} delay={i * 100}>
              <div
                className={`relative glass-panel rounded-3xl p-8 h-full flex flex-col transition-all hover:-translate-y-1 ${
                  j.featured ? "border-primary/40 glow-primary" : ""
                }`}
              >
                {j.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold font-mono tracking-widest">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-primary">{j.stage}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground">
                    {j.badge}
                  </span>
                </div>
                <h4 className="text-2xl font-bold mb-3">{j.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">{j.desc}</p>
                <button
                  className={`w-full py-3 rounded-full text-sm font-bold transition-all active:scale-95 ${
                    j.featured
                      ? "bg-primary text-primary-foreground hover:scale-[1.02]"
                      : "glass-panel hover:border-primary/40"
                  }`}
                >
                  {j.cta} →
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "How does iagentz integrate with our EHR — Epic, Cerner, or VistA?",
    a: "We connect through FHIR R4, HL7v2, SMART-on-FHIR, and native APIs for Epic (App Orchard), Oracle Health/Cerner, and VistA (RPC Broker + VPR). Agents read and write encounters, orders, scheduling, and notes inside your existing access model — no shadow database.",
  },
  {
    q: "Is the platform HIPAA-compliant and how is PHI protected?",
    a: "Yes. HIPAA, HITRUST CSF, and SOC 2 Type II. PHI is encrypted in transit and at rest with customer-managed keys, runtime de-identification before any LLM call, full BAA coverage, and optional in-VPC or on-prem deployment. PHI is never used to train foundation models.",
  },
  {
    q: "Can agents safely take clinical actions, or are they advisory only?",
    a: "Both modes ship out of the box. Advisory agents surface recommendations to the care team. Action-class agents operate under zero-trust sandboxing with policy guards, role-based approvals, and an immutable audit trail for every order, message, or chart update.",
  },
  {
    q: "How long until our first agent is live in the clinic?",
    a: "Most health systems are in production within 2–3 weeks: week 1 shadowing experts and mapping workflows, week 2 building and validating against historical cases, week 3 supervised go-live in a single service line before scaling.",
  },
  {
    q: "What happens to expertise when senior staff retire or transfer?",
    a: "Skill Shadowing captures their reasoning, workflows, and edge-case judgment into a versioned skill model that lives in your Organizational Memory Graph. New hires install the role; institutional knowledge stops walking out the door.",
  },
  {
    q: "How do you prevent hallucinations on clinical content?",
    a: "Every clinical claim is grounded in your source-of-truth systems (EHR, formulary, policy library) with retrieval citations attached. Outputs are validated against guideline libraries (USPSTF, specialty society) and rejected when confidence or provenance falls below threshold.",
  },
  {
    q: "Who owns the skill models and the data the agents learn from?",
    a: "You do. Skill packages, training corpora, and derived models are your IP under contract. You can export them, version them, revoke them, or take them with you if you ever leave the platform.",
  },
  {
    q: "What does pricing look like for a hospital or multi-site clinic?",
    a: "Per-role subscriptions with volume tiers by encounter count, plus an enterprise contract for SSO, audit, dedicated support, and committed-use discounts. Pilots are scoped to a single service line so ROI is provable before system-wide rollout.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-32 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
              // FAQ
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Questions, answered.</h3>
          </div>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 40}>
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-card/50 transition-colors"
                  >
                    <span className="font-bold text-base md:text-lg">{f.q}</span>
                    <span
                      className={`shrink-0 size-8 grid place-items-center rounded-full border border-border transition-all ${
                        isOpen ? "bg-primary text-primary-foreground rotate-45" : "text-primary"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-gradient-to-br from-primary to-accent" />
          <span className="text-xs font-mono text-muted-foreground">
            © 2026 IAGENTZ.AI — NEURAL SYSTEMS
          </span>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground font-medium">
          {["Protocol", "Privacy", "Terminal", "Status"].map((l) => (
            <a key={l} href="#" className="hover:text-primary transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ====== SKILL SHADOW (Process Mining) ======
function SkillShadow() {
  const { ref, onMouseMove } = useMouseGlow<HTMLDivElement>();
  const signals = [
    { k: "Keystrokes", v: "1.2M / day" },
    { k: "Click streams", v: "318k / day" },
    { k: "Voice rationale", v: "94h / wk" },
    { k: "Tool invocations", v: "47k / day" },
    { k: "Decision branches", v: "12.4k mapped" },
    { k: "Reasoning traces", v: "2.8k captured" },
  ];
  return (
    <section id="skill-shadow" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
              // Skill Shadowing · Process Mining
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tight chrome-text">
              We watch your best operators. Then we become them.
            </h3>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              iagentz silently shadows expert workflows — keystrokes, screen flow, voice rationale, APIs touched —
              and distills them into executable skill models. No manuals. No SOPs. Just observed mastery, replayable on demand.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <Reveal delay={80} className="lg:col-span-3">
            <div
              ref={ref}
              onMouseMove={onMouseMove}
              className="relative glass-panel rounded-3xl overflow-hidden aspect-[5/4] group"
              style={{
                backgroundImage:
                  "radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), oklch(0.78 0.16 320 / 0.22), transparent 45%)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-primary/15" />
              <img
                src={skillShadowImg}
                alt="AI shadowing expert workflows captured as a neural skill graph"
                loading="lazy"
                width={1280}
                height={896}
                className="relative size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-border rounded-3xl pointer-events-none" />
              <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[10px] text-primary glass-panel px-3 py-1.5 rounded-full">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                CAPTURE · LIVE
              </div>
            </div>
          </Reveal>

          <Reveal delay={160} className="lg:col-span-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {signals.map((s) => (
                  <div key={s.k} className="glass-panel rounded-2xl p-4">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{s.k}</div>
                    <div className="mt-1 font-mono text-lg text-primary">{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="glass-panel rounded-2xl p-5">
                <div className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">
                  // Skill Distillation Pipeline
                </div>
                <ol className="space-y-2 text-sm">
                  {[
                    "Observe expert sessions across tools & browsers",
                    "Extract intent, sequence, and decision rationale",
                    "Cluster patterns across N operators → super-skill",
                    "Compile to a versioned, executable Skill Package",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="font-mono text-xs text-primary shrink-0">0{i + 1}</span>
                      <span className="text-foreground/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ====== SKILL → AGENT ======
function SkillToAgent() {
  const { ref, onMouseMove } = useMouseGlow<HTMLDivElement>();
  const stages = [
    { t: "Observe", d: "Shadow the expert in their native environment." },
    { t: "Model", d: "Build a structured graph of intent, steps, and tradeoffs." },
    { t: "Automate", d: "Hand off routine branches to deterministic skill code." },
    { t: "Deploy", d: "Ship a versioned agent that runs the skill end-to-end." },
  ];
  return (
    <section id="skill-to-agent" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div>
              <h2 className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">
                // Skill → Agent · Autonomous Apprenticeship
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                Every captured skill becomes a deployable agent.
              </h3>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                The boundary between expertise and software dissolves. A skill observed today is an autonomous unit
                in production tomorrow — fully traceable, versioned, and revocable. Master once. Deploy a thousand times.
              </p>
              <div className="mt-8 space-y-4">
                {stages.map((s, i) => (
                  <div key={s.t} className="flex gap-5 items-start">
                    <div className="font-mono text-xs text-primary border border-primary/40 rounded-full size-9 grid place-items-center shrink-0 glow-primary">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="font-bold">{s.t}</div>
                      <div className="text-sm text-muted-foreground">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Proposal Review Agent", "Scheduling Coordinator", "Claims Analyst", "Salesforce Migrator", "FHIR Architect"].map((t) => (
                  <span key={t} className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/30 text-primary glass-panel">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div
              ref={ref}
              onMouseMove={onMouseMove}
              className="relative glass-panel rounded-3xl overflow-hidden group flex items-center justify-center p-2"
              style={{
                backgroundImage:
                  "radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), oklch(0.85 0.18 195 / 0.20), transparent 45%)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
              <HumanRobotPulse src={humanRobotPulse} />
              <div className="absolute inset-0 ring-1 ring-inset ring-border rounded-3xl pointer-events-none" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HumanRobotPulse({ src }: { src: string }) {
  const css = `
  .hrp-frame{position:relative;width:100%;aspect-ratio:1774/887;border-radius:12px;overflow:hidden;background:#04040c;}
  .hrp-frame>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}
  .hrp-lane{position:absolute;left:20%;width:61.5%;height:18px;transform:translateY(-50%);pointer-events:none;}
  .hrp-pulse{position:absolute;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;}
  .hrp-pulse::before{content:"";position:absolute;top:50%;width:120px;height:3px;transform:translateY(-50%);border-radius:3px;}
  .hrp-fwd{background:radial-gradient(circle,#fff,#3df0ff 55%,transparent 72%);box-shadow:0 0 14px #28e0ff,0 0 32px rgba(40,224,255,.8);animation:hrpFlowR 3s linear infinite;}
  .hrp-fwd::before{right:7px;background:linear-gradient(to left,rgba(40,224,255,.95),transparent);}
  .hrp-rev{background:radial-gradient(circle,#fff,#ff4da6 55%,transparent 72%);box-shadow:0 0 14px #ff2d95,0 0 32px rgba(255,45,149,.8);animation:hrpFlowL 3s linear infinite;}
  .hrp-rev::before{left:7px;background:linear-gradient(to right,rgba(255,45,149,.95),transparent);}
  @keyframes hrpFlowR{from{left:-4%}to{left:104%}}
  @keyframes hrpFlowL{from{left:104%}to{left:-4%}}
  .hrp-ping{position:absolute;top:50%;width:20px;height:20px;margin-top:-10px;border-radius:50%;}
  .hrp-ping-r{right:-2%;background:radial-gradient(circle,#28e0ff,transparent 62%);box-shadow:0 0 18px #28e0ff;animation:hrpPing 3s ease-out infinite;}
  .hrp-ping-l{left:-2%;background:radial-gradient(circle,#ff2d95,transparent 62%);box-shadow:0 0 18px #ff2d95;animation:hrpPing 3s ease-out infinite;}
  @keyframes hrpPing{0%,72%{transform:scale(.5);opacity:.35}84%{transform:scale(1.8);opacity:1}100%{transform:scale(.5);opacity:.35}}
  @media (prefers-reduced-motion: reduce){.hrp-frame *{animation:none!important}}
  `;
  const lanes: Array<{ top: string; dir: "fwd" | "rev"; delays: number[] }> = [
    { top: "21.4%", dir: "fwd", delays: [0, 1.4, 2.8] },
    { top: "27.1%", dir: "rev", delays: [0.7, 2.1] },
    { top: "43.5%", dir: "fwd", delays: [0.4, 1.8, 3.2] },
    { top: "50.1%", dir: "rev", delays: [1.1, 2.5] },
    { top: "67.3%", dir: "fwd", delays: [0.9, 2.3] },
    { top: "73.6%", dir: "rev", delays: [0.2, 1.6, 3.0] },
  ];
  return (
    <div className="hrp-frame relative">
      <style>{css}</style>
      <img src={src} alt="Human ↔ Robot · Pulse Transfer" loading="lazy" />
      {lanes.map((lane, i) => (
        <div key={i} className={`hrp-lane hrp-${lane.dir}`} style={{ top: lane.top }}>
          <div className={`hrp-ping hrp-ping-${lane.dir === "fwd" ? "r" : "l"}`} />
          {lane.delays.map((d, j) => (
            <div key={j} className={`hrp-pulse hrp-${lane.dir}`} style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}


// ====== HUMAN OPERATING SYSTEM ======
function HumanOS() {
  const { ref, onMouseMove } = useMouseGlow<HTMLDivElement>();
  const installs = [
    { name: "Patient Intake & Triage Nurse", ver: "v3.2", size: "247 skills", tag: "FRONT DESK" },
    { name: "Scheduling & Referral Coordinator", ver: "v2.4", size: "189 skills", tag: "ACCESS" },
    { name: "Clinical Documentation Specialist", ver: "v4.1", size: "318 skills", tag: "EHR" },
    { name: "Revenue Cycle & Claims Analyst", ver: "v2.8", size: "236 skills", tag: "BILLING" },
  ];
  return (
    <section id="human-os" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-40 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <Reveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-xs font-mono text-accent uppercase tracking-[0.25em] mb-4">
              // Human Operating System
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tight chrome-text">
              Install expertise the way you install software.
            </h3>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Every action your experts perform contributes to a global skill network. New hires don't read manuals —
              they install roles. Years of mastery, compressed into weeks of AI-guided acceleration.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal delay={80}>
            <div
              ref={ref}
              onMouseMove={onMouseMove}
              className="relative glass-panel rounded-3xl overflow-hidden aspect-square group flex items-center justify-center p-2"
              style={{
                backgroundImage:
                  "radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), oklch(0.78 0.16 320 / 0.22), transparent 45%)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-primary/15" />
              <HumanOsBroadcast src={humanOsBg} />
              <div className="absolute inset-0 ring-1 ring-inset ring-border rounded-3xl pointer-events-none" />
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="space-y-4">
              <div className="font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
                $ iagentz install --role
              </div>
              {installs.map((p, i) => (
                <div key={p.name} className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-primary/40 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-bold truncate">{p.name}</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/40 text-accent shrink-0">
                        {p.tag}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">
                      {p.ver} · {p.size} · connects to EHR · FHIR R4
                    </div>
                  </div>
                  <button className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-full bg-primary text-primary-foreground glow-primary shrink-0">
                    Install
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { k: "Skills", v: "8,420" },
                  { k: "Experts", v: "1,204" },
                  { k: "Org Memory", v: "∞" },
                ].map((x) => (
                  <div key={x.k} className="glass-panel rounded-xl p-3 text-center">
                    <div className="font-mono text-lg text-primary">{x.v}</div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{x.k}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Animated signal overlay for the Human OS graphic — pulses traveling along the skill graph edges.
function HumanOsBroadcast({ src }: { src: string }) {
  const css = `
  .hos-frame{position:relative;width:100%;height:100%;border-radius:12px;overflow:hidden;background:#000;}
  .hos-frame>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}
  .hos-core{position:absolute;left:49%;top:43%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;
    background:radial-gradient(circle,#fff,#5af3ff 60%,transparent 72%);
    box-shadow:0 0 18px #28e0ff,0 0 40px rgba(40,224,255,.7);
    animation:hosCore 2.3s ease-in-out infinite;}
  @keyframes hosCore{0%,100%{transform:scale(.8);opacity:.85}50%{transform:scale(1.25);opacity:1}}
  .hos-beam{position:absolute;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;
    background:radial-gradient(circle,#fff,#3df0ff 55%,transparent 72%);
    box-shadow:0 0 12px #28e0ff,0 0 26px rgba(40,224,255,.8);
    animation:hosEmit 2.3s linear infinite;opacity:0;}
  @keyframes hosEmit{
    0%{left:49%;top:43%;opacity:0;transform:scale(.35)}
    12%{opacity:1;transform:scale(1)}
    82%{opacity:1;transform:scale(1)}
    100%{left:var(--nx);top:var(--ny);opacity:0;transform:scale(.7)}
  }
  .hos-node{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;
    animation:hosFlare 2.3s ease-out infinite;opacity:0;}
  .hos-node.m{background:radial-gradient(circle,rgba(255,45,149,.9),transparent 60%);box-shadow:0 0 22px #ff2d95;}
  .hos-node.c{background:radial-gradient(circle,rgba(40,224,255,.9),transparent 60%);box-shadow:0 0 22px #28e0ff;}
  @keyframes hosFlare{0%,55%{transform:scale(.4);opacity:0}70%{transform:scale(1.25);opacity:.95}100%{transform:scale(.55);opacity:0}}
  @media (prefers-reduced-motion: reduce){.hos-frame *{animation:none!important}.hos-core{opacity:.9}}
  `;
  const nodes: Array<{ x: string; y: string; kind: "m" | "c"; beams: number[]; node: number }> = [
    { x: "25%", y: "52%", kind: "m", beams: [0.8, 1.95], node: 2.64 },
    { x: "37%", y: "64%", kind: "m", beams: [0.96, 2.11], node: 2.8 },
    { x: "66%", y: "33%", kind: "m", beams: [1.12, 2.27], node: 2.96 },
    { x: "78%", y: "38%", kind: "m", beams: [1.28, 2.43], node: 3.12 },
    { x: "67%", y: "48%", kind: "m", beams: [1.44, 2.59], node: 3.28 },
    { x: "80%", y: "51%", kind: "m", beams: [1.6, 2.75], node: 3.44 },
    { x: "70%", y: "64%", kind: "c", beams: [1.76, 2.91], node: 3.6 },
  ];
  return (
    <div className="hos-frame">
      <style>{css}</style>
      <img src={src} alt="Human Operating System · Skill Broadcast" loading="lazy" />
      <div className="hos-core" />
      {nodes.map((n, i) => (
        <div key={i} style={{ display: "contents" }}>
          {n.beams.map((d, j) => (
            <div
              key={j}
              className="hos-beam"
              style={{ ["--nx" as any]: n.x, ["--ny" as any]: n.y, animationDelay: `${d}s` }}
            />
          ))}
          <div
            className={`hos-node ${n.kind}`}
            style={{ left: n.x, top: n.y, animationDelay: `${n.node}s` }}
          />
        </div>
      ))}
    </div>
  );
}

// ====== PILLAR ANIMATED OVERLAYS ======
function PillarOverlay({ kind }: { kind: "bars" | "flow" | "control" | "orbit" }) {
  const common = "absolute inset-0 size-full pointer-events-none";
  if (kind === "bars") return <BarsOverlay className={common} />;
  if (kind === "flow") return <FlowOverlay className={common} />;
  if (kind === "control") return <ControlOverlay className={common} />;
  return <OrbitOverlay className={common} />;
}

// Discover — automation opportunities as live, ranked bars
function BarsOverlay({ className }: { className: string }) {
  const bars = [
    { label: "Triage routing",        v: 92, d: 0.0, eff: "Low",    val: "High" },
    { label: "Visit scheduling",      v: 84, d: 0.25, eff: "Low",   val: "High" },
    { label: "Prior authorization",   v: 76, d: 0.5, eff: "Med",    val: "High" },
    { label: "Intake & registration", v: 68, d: 0.75, eff: "Low",   val: "Med"  },
    { label: "Claims adjudication",   v: 61, d: 1.0, eff: "Med",    val: "High" },
    { label: "Clinical coding",       v: 52, d: 1.25, eff: "High",  val: "Med"  },
    { label: "Discharge summaries",   v: 44, d: 1.5, eff: "Med",    val: "Med"  },
  ];
  return (
    <div className={`${className}`}>
      <div className="absolute inset-0 rounded-3xl p-5 md:p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" /> AUTOMATION OPPORTUNITIES
          </div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
            ranked · live
          </div>
        </div>

        <div className="font-mono text-[9px] grid grid-cols-[1fr_auto_auto_auto] gap-x-3 text-muted-foreground/80 uppercase tracking-widest">
          <span>Workflow</span><span>Effort</span><span>Value</span><span className="text-right">Score</span>
        </div>

        <div className="flex flex-col gap-2.5 flex-1 justify-around">
          {bars.map((b) => (
            <div key={b.label} className="text-[11px]">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 font-mono items-baseline">
                <span className="text-foreground/90 truncate">{b.label}</span>
                <span className="text-muted-foreground text-[9px]">{b.eff}</span>
                <span className="text-muted-foreground text-[9px]">{b.val}</span>
                <span className="text-primary text-right tabular-nums">{b.v}</span>
              </div>
              <div className="h-1.5 mt-1 rounded-full bg-foreground/10 overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]"
                  style={{
                    width: `${b.v}%`,
                    animation: `barShimmer 2.6s linear ${b.d}s infinite, barPulse 2.8s ease-in-out ${b.d}s infinite`,
                  }}
                />
                <span
                  className="absolute top-0 h-full w-6 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{ animation: `barSweep 3.2s linear ${b.d}s infinite` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes barShimmer { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        @keyframes barPulse { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.45)} }
        @keyframes barSweep { 0%{left:-10%;opacity:0} 20%{opacity:.9} 100%{left:110%;opacity:0} }
      `}</style>
    </div>
  );
}

// Build — multi-agent workflow boxes connected by glowing flowing lines
function FlowOverlay({ className }: { className: string }) {
  const boxes = [
    { x: 12, y: 50, label: "INPUT" },
    { x: 36, y: 28, label: "PLAN" },
    { x: 36, y: 72, label: "ROUTE" },
    { x: 62, y: 28, label: "TOOL" },
    { x: 62, y: 72, label: "REVIEW" },
    { x: 86, y: 50, label: "ACT" },
  ];
  const edges: Array<[number, number, number]> = [
    [0, 1, 0], [0, 2, 0.3],
    [1, 3, 0.6], [2, 4, 0.9],
    [3, 5, 1.2], [4, 5, 1.5],
    [3, 4, 1.8],
  ];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`${className} mix-blend-screen`} aria-hidden="true">
      <defs>
        <radialGradient id="flowDot" r="50%">
          <stop offset="0%" stopColor="oklch(0.95 0.18 195)" stopOpacity="1" />
          <stop offset="100%" stopColor="oklch(0.85 0.18 195)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {edges.map(([a, b, delay], i) => {
        const A = boxes[a], B = boxes[b];
        const id = `flow-${i}`;
        const d = `M ${A.x} ${A.y} C ${(A.x + B.x) / 2} ${A.y}, ${(A.x + B.x) / 2} ${B.y}, ${B.x} ${B.y}`;
        return (
          <g key={i}>
            <path id={id} d={d} fill="none" stroke="oklch(0.85 0.18 195 / 0.5)" strokeWidth="0.3">
              <animate attributeName="stroke-opacity" values="0.2;0.9;0.2" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" />
            </path>
            <circle r="0.9" fill="url(#flowDot)">
              <animateMotion dur="2.4s" begin={`${delay}s`} repeatCount="indefinite"><mpath href={`#${id}`} /></animateMotion>
            </circle>
          </g>
        );
      })}
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x - 5} y={b.y - 3} width="10" height="6" rx="1.2"
            fill="oklch(0.18 0.02 240 / 0.65)" stroke="oklch(0.85 0.18 195 / 0.7)" strokeWidth="0.25">
            <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </rect>
          <text x={b.x} y={b.y + 0.8} textAnchor="middle" fontSize="2" fill="oklch(0.95 0.18 195)" fontFamily="monospace">{b.label}</text>
        </g>
      ))}
    </svg>
  );
}

// Govern — Control Plane: scanning line + checkpoint badges blinking compliant
function ControlOverlay({ className }: { className: string }) {
  const checks = [
    { x: 18, y: 24, t: "RBAC" },
    { x: 80, y: 22, t: "AUDIT" },
    { x: 22, y: 78, t: "PII" },
    { x: 78, y: 78, t: "POLICY" },
    { x: 50, y: 50, t: "HIL" },
  ];
  return (
    <div className={`${className} mix-blend-screen`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id="scanBeam" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.95 0.18 195)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(0.95 0.18 195)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="oklch(0.95 0.18 195)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" x2="100" y1={i * 10} y2={i * 10} stroke="oklch(0.85 0.18 195 / 0.08)" strokeWidth="0.15" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} y1="0" y2="100" x1={i * 10} x2={i * 10} stroke="oklch(0.85 0.18 195 / 0.08)" strokeWidth="0.15" />
        ))}
        {/* scanning beam */}
        <rect x="0" width="100" height="14" fill="url(#scanBeam)">
          <animate attributeName="y" values="-14;100" dur="3.2s" repeatCount="indefinite" />
        </rect>
        {checks.map((c, i) => (
          <g key={c.t}>
            <circle cx={c.x} cy={c.y} r="3.2" fill="oklch(0.18 0.02 240 / 0.7)" stroke="oklch(0.85 0.18 195 / 0.8)" strokeWidth="0.3" />
            <circle cx={c.x} cy={c.y} r="3.2" fill="none" stroke="oklch(0.95 0.18 195)" strokeWidth="0.4">
              <animate attributeName="r" values="3.2;6;3.2" dur="2.6s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.9;0;0.9" dur="2.6s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <text x={c.x} y={c.y + 0.8} textAnchor="middle" fontSize="1.8" fill="oklch(0.95 0.18 195)" fontFamily="monospace">{c.t}</text>
          </g>
        ))}
      </svg>
      <div className="absolute top-3 left-3 glass-panel rounded-full px-3 py-1.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-primary">
        <span className="size-1.5 rounded-full bg-primary animate-pulse" /> CONTROL PLANE · LIVE
      </div>
    </div>
  );
}

// Optimize — circular signal traveling around an orbit with eval ticks
function OrbitOverlay({ className }: { className: string }) {
  const cx = 50, cy = 50, r = 32;
  const ticks = Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, i };
  });
  return (
    <div className={className}>
      <div className="absolute inset-0 rounded-3xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" /> CONTINUOUS EVAL LOOP · OPTIMIZE
          </div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
            v1.8 · orbit
          </div>
        </div>
        <div className="relative flex-1">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
            <defs>
              <radialGradient id="orbitDot" r="50%">
                <stop offset="0%" stopColor="oklch(0.92 0.16 320)" stopOpacity="1" />
                <stop offset="100%" stopColor="oklch(0.78 0.16 320)" stopOpacity="0" />
              </radialGradient>
              <path id="orbitPath" d={`M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`} />
            </defs>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.78 0.16 320 / 0.35)" strokeWidth="0.3" strokeDasharray="0.6 1.4" />
            <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke="oklch(0.85 0.18 195 / 0.25)" strokeWidth="0.2" />

            {ticks.map((t) => (
              <circle key={t.i} cx={t.x} cy={t.y} r="0.5" fill="oklch(0.78 0.16 320)">
                <animate attributeName="r" values="0.4;1.1;0.4" dur="2.4s" begin={`${t.i * 0.15}s`} repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.4;1;0.4" dur="2.4s" begin={`${t.i * 0.15}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* main signal */}
            <circle r="1.6" fill="url(#orbitDot)">
              <animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto">
                <mpath href="#orbitPath" />
              </animateMotion>
            </circle>
            {/* trailing signal */}
            <circle r="1.1" fill="url(#orbitDot)" opacity="0.7">
              <animateMotion dur="3.6s" begin="-0.4s" repeatCount="indefinite">
                <mpath href="#orbitPath" />
              </animateMotion>
            </circle>
            <circle r="0.7" fill="url(#orbitDot)" opacity="0.4">
              <animateMotion dur="3.6s" begin="-0.8s" repeatCount="indefinite">
                <mpath href="#orbitPath" />
              </animateMotion>
            </circle>

            {/* center hub */}
            <circle cx={cx} cy={cy} r="2.4" fill="oklch(0.18 0.02 240 / 0.7)" stroke="oklch(0.92 0.16 320 / 0.8)" strokeWidth="0.3" />
            <text x={cx} y={cy + 0.8} textAnchor="middle" fontSize="2" fill="oklch(0.95 0.18 195)" fontFamily="monospace">EVAL</text>
          </svg>
        </div>
        <div className="flex items-center justify-between px-5 py-2 border-t border-border/60 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          <span>ticks · 12</span>
          <span>period · 3.6s</span>
          <span className="text-primary">auto-optimizing</span>
        </div>
      </div>
    </div>
  );
}

