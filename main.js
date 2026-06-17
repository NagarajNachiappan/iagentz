/* ============================================================
   iagentz.ai — interactions + the live agent swarm
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 3D AGENT SWARM ---------------- */
  const canvas = document.getElementById("swarm-canvas");
  const feed = document.getElementById("swarm-feed");
  const stage3d = document.getElementById("swarm-3d");
  const scene = document.getElementById("swarm-scene");

  // fractional positions within the scene + depth + accent
  const AGENTS = [
    { id: "orchestrator", label: "Orchestrator", color: "#f5a524", core: true, fx: 0.5,  fy: 0.50, z: 50,  bob: 6 },
    { id: "planner",      label: "Planner",      color: "#8b5cf6", fx: 0.5,  fy: 0.17, z: 0,   bob: 5.2 },
    { id: "researcher",   label: "Researcher",   color: "#22d3ee", fx: 0.83, fy: 0.46, z: 24,  bob: 4.6 },
    { id: "builder",      label: "Builder",      color: "#34d399", fx: 0.70, fy: 0.82, z: 24,  bob: 5.6 },
    { id: "critic",       label: "Critic",       color: "#f0399a", fx: 0.30, fy: 0.82, z: 24,  bob: 4.9 },
  ];

  const podEls = {};
  document.querySelectorAll(".bot-pod").forEach((el) => { podEls[el.dataset.id] = el; });

  // Realistic-sounding messages agents exchange
  const MESSAGES = [
    ["planner", "orchestrator", "task graph ready — 4 subgoals"],
    ["orchestrator", "researcher", "fetch ground truth on §2"],
    ["researcher", "orchestrator", "3 sources, 1 contradiction flagged"],
    ["orchestrator", "builder", "implement candidate solution"],
    ["builder", "critic", "PR draft — please verify"],
    ["critic", "builder", "edge case missed: empty input"],
    ["builder", "orchestrator", "patched + tests green ✓"],
    ["critic", "orchestrator", "verdict: ship · confidence 0.97"],
    ["orchestrator", "planner", "replan: scope expanded"],
    ["researcher", "critic", "cross-check citation [4]"],
    ["planner", "builder", "decomposed into 6 atomic ops"],
    ["orchestrator", "researcher", "embedding recall on memory fabric"],
  ];

  let nodes = [];
  let packets = [];
  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let ctx, raf, msgIndex = 0, lastMsg = 0, tNow = 0;

  function resize() {
    if (!canvas || !stage3d) return;
    W = stage3d.clientWidth; H = stage3d.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
  }

  function layout() {
    nodes = AGENTS.map((a) => {
      const x = a.fx * W, y = a.fy * H;
      const el = podEls[a.id];
      if (el) {
        el.style.left = (a.fx * 100) + "%";
        el.style.top = (a.fy * 100) + "%";
        el.style.setProperty("--z", a.z + "px");
        el.style.setProperty("--bob", a.bob + "s");
        el.style.setProperty("--bd", (a.fx * -2) + "s");
      }
      return { ...a, x, y };
    });
  }

  function nodeById(id) { return nodes.find((n) => n.id === id); }
  function setTalking(id, on) {
    const el = podEls[id];
    if (el) el.classList.toggle("talking", on);
  }

  function spawnPacket() {
    const [from, to, text] = MESSAGES[msgIndex % MESSAGES.length];
    msgIndex++;
    const a = nodeById(from), b = nodeById(to);
    if (!a || !b) return;
    packets.push({ a, b, t: 0, speed: 0.011 + Math.random() * 0.005, color: a.color, to });
    setTalking(from, true);
    setTimeout(() => setTalking(from, false), 700);
    pushFeed(from, to, text);
  }

  function pushFeed(from, to, text) {
    if (!feed) return;
    const line = document.createElement("div");
    line.className = "feed-line";
    const fl = AGENTS.find((x) => x.id === from).label;
    const tl = AGENTS.find((x) => x.id === to).label;
    line.innerHTML = `<b>${fl}</b> → <span class="to">${tl}</span> &nbsp;${text}`;
    feed.appendChild(line);
    while (feed.children.length > 5) feed.removeChild(feed.firstChild);
    feed.scrollTop = feed.scrollHeight;
  }

  function draw(ts) {
    if (!ctx) return;
    tNow = ts || 0;
    ctx.clearRect(0, 0, W, H);

    const core = nodeById("orchestrator");

    // connection beams: orchestrator hub <-> each agent
    nodes.forEach((n) => {
      if (n.core) return;
      const grad = ctx.createLinearGradient(core.x, core.y, n.x, n.y);
      grad.addColorStop(0, hexA(core.color, 0.18));
      grad.addColorStop(1, hexA(n.color, 0.18));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(core.x, core.y); ctx.lineTo(n.x, n.y); ctx.stroke();

      // faint flowing dashes along the beam
      const dashPhase = (tNow / 28) % 16;
      ctx.save();
      ctx.setLineDash([2, 14]); ctx.lineDashOffset = -dashPhase;
      ctx.strokeStyle = hexA(n.color, 0.45); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(core.x, core.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      ctx.restore();
    });

    // light ring connecting the peripheral agents
    const periph = nodes.filter((n) => !n.core);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < periph.length; i++) {
      const a = periph[i], b = periph[(i + 1) % periph.length];
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // spawn messages on a cadence
    if (tNow - lastMsg > 1500) { spawnPacket(); lastMsg = tNow; }

    // data packets traveling between bots
    packets = packets.filter((p) => p.t < 1.02);
    packets.forEach((p) => {
      p.t += p.speed;
      const e = easeInOut(Math.min(p.t, 1));
      const x = p.a.x + (p.b.x - p.a.x) * e;
      const y = p.a.y + (p.b.y - p.a.y) * e;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 16);
      glow.addColorStop(0, p.color); glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      // light up the receiver as the packet lands
      if (p.t >= 1 && !p.delivered) {
        p.delivered = true;
        setTalking(p.to, true);
        setTimeout(() => setTalking(p.to, false), 650);
      }
    });

    raf = requestAnimationFrame(draw);
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  if (canvas) {
    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    // pause when off-screen
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !raf) raf = requestAnimationFrame(draw);
        else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
      });
    });
    io.observe(canvas);

    // 3D parallax tilt on mouse move
    if (stage3d && scene) {
      stage3d.addEventListener("mousemove", (e) => {
        const r = stage3d.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        scene.style.setProperty("--ry", (px * 14).toFixed(2) + "deg");
        scene.style.setProperty("--rx", (-py * 10).toFixed(2) + "deg");
      });
      stage3d.addEventListener("mouseleave", () => {
        scene.style.setProperty("--ry", "0deg");
        scene.style.setProperty("--rx", "0deg");
      });
    }
  }

  /* ---------------- COUNTERS ---------------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = 1600; const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.innerHTML = prefix + format(val, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.innerHTML = prefix + format(target, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  function format(v, d) {
    if (d > 0) return v.toFixed(d);
    if (v >= 1000) return Math.round(v).toLocaleString("en-US");
    return Math.round(v).toString();
  }

  /* ---------------- SCROLL REVEAL + COUNTERS ---------------- */
  const revealEls = document.querySelectorAll(
    ".section, .metric, .card, .role, .bento-cell"
  );
  revealEls.forEach((el) => el.classList.add("reveal"));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        const num = e.target.querySelector?.(".metric-num");
        if (e.target.classList.contains("metric") && num && !num.dataset.done) {
          num.dataset.done = "1";
          animateCount(num);
        }
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => obs.observe(el));

  /* ---------------- CARD TILT ---------------- */
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });

  /* ---------------- MOBILE NAV ---------------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  /* ---------------- CTA FORM ---------------- */
  const form = document.getElementById("cta-form");
  const note = document.getElementById("cta-note");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector("input").value;
      note.textContent = `✓ You're on the list, ${email}. The swarm will reach out.`;
      note.style.color = "var(--green)";
      form.reset();
    });
  }
})();
