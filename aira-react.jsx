import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const GOLD = "#7C6FFF";
const GOLD2 = "#9B91FF";
const BLACK = "#060608";
const DARK = "#0d0d10";

// ── PRODUCTS DATA ──
const PRODUCTS = [
  {
    id: "assistant",
    tag: "Executive",
    name: "Aira Assistant",
    sub: "AI Chief of Staff",
    desc: "Manages your calendar, handles calls, reads your inbox and delivers smart briefings twice a day.",
    features: ["Calendar & scheduling", "Email intelligence", "Daily voice briefings", "Outbound B2B calls"],
    color: "#7C6FFF",
  },
  {
    id: "concierge",
    tag: "Hospitality",
    name: "Aira Concierge",
    sub: "Hotel Reception AI",
    desc: "24/7 front desk in four languages. Reservations, check-in, local tips — zero missed calls.",
    features: ["Reservation handling", "4 languages: PT/EN/DE/RU", "Check-in guidance", "Local recommendations"],
    color: "#6B5FFF",
  },
  {
    id: "admin",
    tag: "Beauty & Wellness",
    name: "Aira Admin",
    sub: "Salon Receptionist AI",
    desc: "Books appointments, sends reminders and handles cancellations so your team can focus on clients.",
    features: ["Appointment booking", "Client reminders", "Cancellation management", "Booking software sync"],
    color: "#7C6FFF",
  },
  {
    id: "soon",
    tag: "Coming Soon",
    name: "Aira ???",
    sub: "New Vertical",
    desc: "We're expanding into new industries. Interested in a custom Aira for your sector? Let us know.",
    features: [],
    color: "#555",
  },
];

// ── THREE.JS PARTICLE FIELD ──
function ParticleField() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 5;

    // Particles
    const N = 1800;
    const positions = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const alphas = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sizes[i] = Math.random() * 2.5 + 0.5;
      alphas[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: new THREE.Color("#7C6FFF"),
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Grid lines
    const gridMat = new THREE.LineBasicMaterial({ color: 0x7C6FFF, opacity: 0.04, transparent: true });
    for (let i = -10; i <= 10; i += 2) {
      const hGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, i, -3), new THREE.Vector3(12, i, -3)]);
      const vGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 1.2, -8, -3), new THREE.Vector3(i * 1.2, 8, -3)]);
      scene.add(new THREE.Line(hGeo, gridMat));
      scene.add(new THREE.Line(vGeo, gridMat));
    }

    // Mouse parallax
    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    let frame;
    let t = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      t += 0.003;
      points.rotation.y = t * 0.04 + mx * 0.08;
      points.rotation.x = my * 0.04;
      mat.opacity = 0.35 + Math.sin(t) * 0.08;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const W2 = el.clientWidth, H2 = el.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}

// ── 3D CAROUSEL ──
function Carousel3D() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const N = PRODUCTS.length;

  const go = (i) => setActive(((i % N) + N) % N);

  const onPointerDown = (e) => {
    setDragging(true);
    setStartX(e.clientX ?? e.touches?.[0]?.clientX ?? 0);
  };
  const onPointerUp = (e) => {
    if (!dragging) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? startX;
    const dx = endX - startX;
    if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
    setDragging(false);
    setOffset(0);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? startX;
    setOffset(x - startX);
  };

  return (
    <div style={{ position: "relative", padding: "0 0 4rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: "0.8rem" }}>
          Our Products
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 300, color: "#fff", lineHeight: 1.1 }}>
          One intelligence, <em style={{ fontStyle: "italic", color: GOLD }}>many voices</em>
        </h2>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "0.8rem", letterSpacing: "0.06em" }}>
          ← drag or swipe →
        </p>
      </div>

      {/* 3D Stage */}
      <div
        style={{ position: "relative", height: 460, perspective: "1400px", perspectiveOrigin: "50% 45%", display: "flex", alignItems: "center", justifyContent: "center", cursor: dragging ? "grabbing" : "grab", userSelect: "none" }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        {PRODUCTS.map((p, i) => {
          const diff = i - active;
          // Wrap-around distance
          let d = diff;
          if (d > N / 2) d -= N;
          if (d < -N / 2) d += N;

          const dragOffset = dragging ? offset * 0.003 : 0;
          const angle = (d + dragOffset) * 32;
          const rad = (angle * Math.PI) / 180;
          const x = Math.sin(rad) * 320;
          const z = Math.cos(rad) * 200 - 200;
          const rotY = -angle * 0.55;
          const scale = d === 0 ? 1 : Math.max(0.72, 0.88 - Math.abs(d) * 0.06);
          const opacity = Math.abs(d) > 2.5 ? 0 : d === 0 ? 1 : Math.max(0.25, 0.6 - Math.abs(d) * 0.15);
          const isActive = i === active;

          return (
            <div
              key={p.id}
              onClick={() => { if (!dragging) go(i); }}
              style={{
                position: "absolute",
                width: 300,
                minHeight: 380,
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`,
                opacity,
                transition: dragging ? "none" : "all 0.7s cubic-bezier(0.16,1,0.3,1)",
                zIndex: 10 - Math.abs(Math.round(d)),
                background: isActive
                  ? "linear-gradient(160deg, rgba(124,111,255,0.1) 0%, rgba(20,20,25,0.97) 100%)"
                  : "rgba(12,12,15,0.95)",
                border: `1px solid ${isActive ? "rgba(124,111,255,0.3)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16,
                padding: "2.2rem 2rem",
                boxShadow: isActive ? "0 0 80px rgba(124,111,255,0.1), 0 40px 80px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.4)",
                backdropFilter: "blur(10px)",
                flexShrink: 0,
                cursor: isActive ? "default" : "pointer",
              }}
            >
              {/* Top accent line */}
              {isActive && (
                <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
              )}

              <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD, border: `1px solid rgba(124,111,255,0.25)`, display: "inline-block", padding: "0.18rem 0.65rem", borderRadius: 100, marginBottom: "1.2rem" }}>
                {p.tag}
              </div>

              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.85rem", fontWeight: 300, color: "#fff", lineHeight: 1.15, marginBottom: "0.3rem" }}>
                {p.name.split(" ")[0]} <em style={{ fontStyle: "italic", color: GOLD }}>{p.name.split(" ").slice(1).join(" ")}</em>
              </div>

              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", marginBottom: "1.2rem" }}>
                {p.sub}
              </div>

              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                {p.desc}
              </p>

              {p.features.length > 0 && (
                <ul style={{ listStyle: "none" }}>
                  {p.features.map((f, fi) => (
                    <li key={fi} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", padding: "0.32rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <span style={{ width: 3, height: 3, borderRadius: "50%", background: GOLD, opacity: 0.7, flexShrink: 0, display: "inline-block" }} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Card number */}
              <div style={{ position: "absolute", bottom: "1.2rem", right: "1.5rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "3.5rem", fontWeight: 300, color: `rgba(200,168,32,${isActive ? 0.15 : 0.06})`, lineHeight: 1 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
        {PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            style={{
              width: i === active ? 28 : 7,
              height: 7,
              borderRadius: 4,
              background: i === active ? GOLD : "rgba(255,255,255,0.12)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => go(active - 1)} style={{ position: "absolute", left: "2vw", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(5,5,7,0.8)", color: "rgba(255,255,255,0.4)", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        ‹
      </button>
      <button onClick={() => go(active + 1)} style={{ position: "absolute", right: "2vw", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(5,5,7,0.8)", color: "rgba(255,255,255,0.4)", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        ›
      </button>
    </div>
  );
}

// ── ANIMATED COUNTER ──
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 40;
        const id = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(id); }
          else setVal(Math.floor(start));
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── REVEAL WRAPPER ──
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(36px)", transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// ── WORD-BY-WORD HERO TITLE ──
function HeroTitle() {
  const words = ["Intelligence", "that", "speaks", "for", "your", "business"];
  return (
    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3.5rem,9vw,7.5rem)", fontWeight: 300, lineHeight: 1.02, letterSpacing: "-0.035em", color: "#fff", marginBottom: "1.8rem" }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.22em",
            opacity: 0,
            transform: "translateY(40px)",
            animation: `wordUp 0.8s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.07}s both`,
            color: w === "speaks" ? GOLD : "#fff",
            fontStyle: w === "speaks" ? "italic" : "normal",
          }}
        >
          {w}
        </span>
      ))}
    </h1>
  );
}

// ── CUSTOM CURSOR ──
function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  let rx = 0, ry = 0;

  useEffect(() => {
    let mx = 0, my = 0;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; if (dotRef.current) { dotRef.current.style.left = mx + "px"; dotRef.current.style.top = my + "px"; } };
    window.addEventListener("mousemove", onMove);
    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      if (ringRef.current) { ringRef.current.style.left = rx + "px"; ringRef.current.style.top = ry + "px"; }
    };
    animate();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(frame); };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", width: 10, height: 10, borderRadius: "50%", background: GOLD, transform: "translate(-50%,-50%)", mixBlendMode: "difference" }} />
      <div ref={ringRef} style={{ position: "fixed", zIndex: 9998, pointerEvents: "none", width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(124,111,255,0.45)", transform: "translate(-50%,-50%)", transition: "width 0.3s, height 0.3s" }} />
    </>
  );
}

// ── MARQUEE ──
function Marquee() {
  const items = ["Aira Assistant", "Aira Concierge", "Aira Admin", "24/7 Voice AI", "4 Languages", "aira-ai.net", "Executive AI", "Hotel Reception", "Beauty & Wellness", "Portugal · Germany · Russia"];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: DARK, padding: "0.9rem 0" }}>
      <div style={{ display: "flex", animation: "marquee 25s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", padding: "0 2rem", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
            {item}
            <span style={{ color: GOLD, opacity: 0.35 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── PRICING ──
const PLANS = [
  { tier: "Starter", name: "Aira Essential", price: "800", mo: "€200/mo", setup: "One-time setup", features: ["1 AI voice agent", "2 languages", "Calendar integration", "Telegram reports", "Monthly optimisation"], btn: "Get started", featured: false },
  { tier: "Professional", name: "Aira Professional", price: "1200", mo: "€300/mo", setup: "One-time setup", features: ["Full configuration", "All 4 languages", "Calendar + Gmail", "Outbound calls", "Daily briefings", "Weekly tuning"], btn: "Get Professional", featured: true },
  { tier: "Enterprise", name: "Aira Custom", price: null, mo: "", setup: "Tailored pricing", features: ["Multiple agents", "Custom integrations", "Dedicated team", "SLA support", "White-label"], btn: "Talk to us", featured: false },
];

// ── MAIN APP ──
export default function App() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Inter:wght@300;400;500;600&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; cursor:none !important; }
      body { background:#050507; color:#fff; font-family:'Inter',sans-serif; overflow-x:hidden; }
      @keyframes wordUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
      @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes spin { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(360deg)} }
      @keyframes scanDown { 0%{top:-2px;opacity:0} 10%{opacity:1} 90%{opacity:0.5} 100%{top:100%;opacity:0} }
      @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#7C6FFF;border-radius:2px} ::-webkit-scrollbar-track{background:#050507}
      button,a{cursor:none!important}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const S = {
    section: { padding: "8rem 5vw", position: "relative" },
    eyebrow: { fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: "0.9rem" },
    sTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,4.5vw,3.8rem)", fontWeight: 300, lineHeight: 1.08, letterSpacing: "-0.025em", color: "#fff" },
  };

  return (
    <div style={{ background: BLACK, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <Cursor />

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 4vw", background: "rgba(6,6,8,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(124,111,255,0.08)" }}>
        <a href="#" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 600, fontSize: "1.7rem", color: "#fff", textDecoration: "none" }}>
          Air<span style={{ color: GOLD }}>a</span>
        </a>
        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {["Products", "How it works", "Pricing", "Partners"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "0.76rem", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {["EN", "PT", "RU", "DE"].map(l => (
              <button key={l} onClick={() => setLang(l.toLowerCase())}
                style={{ fontSize: "0.7rem", fontWeight: 500, color: lang === l.toLowerCase() ? GOLD : "rgba(255,255,255,0.25)", background: lang === l.toLowerCase() ? "rgba(124,111,255,0.1)" : "none", border: "none", padding: "0.28rem 0.5rem", borderRadius: 3, transition: "all 0.2s", fontFamily: "'Inter',sans-serif" }}>
                {l}
              </button>
            ))}
          </div>
          <a href="#contact" style={{ fontSize: "0.78rem", fontWeight: 500, color: BLACK, background: GOLD, padding: "0.55rem 1.4rem", borderRadius: 100, textDecoration: "none", transition: "background 0.2s" }}
            onMouseEnter={e => e.target.style.background = GOLD2}
            onMouseLeave={e => e.target.style.background = GOLD}
          >Get started</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "10rem 4vw 6rem", position: "relative", overflow: "hidden" }}>
        <ParticleField />

        {/* Scan line */}
        <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}44, transparent)`, animation: "scanDown 8s linear infinite", zIndex: 1, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 900 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", border: "1px solid rgba(124,111,255,0.2)", background: "rgba(124,111,255,0.05)", padding: "0.4rem 1.1rem", borderRadius: 100, fontSize: "0.68rem", fontWeight: 500, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2.5rem", animation: "fadeIn 0.8s ease both" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, animation: "pulse 2s infinite" }} />
            AI Voice Intelligence · aira-ai.net
          </div>

          <HeroTitle />

          <p style={{ fontSize: "clamp(0.95rem,1.5vw,1.15rem)", fontWeight: 300, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 480, margin: "0 auto 3rem", animation: "wordUp 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
            AI voice agents that handle calls, manage schedules and serve clients — 24/7, in four languages.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", animation: "wordUp 0.8s 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>
            <a href="#products" style={{ fontSize: "0.85rem", fontWeight: 500, color: BLACK, background: GOLD, padding: "0.9rem 2.2rem", borderRadius: 100, textDecoration: "none", transition: "all 0.3s" }}
              onMouseEnter={e => { e.target.style.background = GOLD2; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 14px 35px rgba(124,111,255,0.35)"; }}
              onMouseLeave={e => { e.target.style.background = GOLD; e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>
              Explore products
            </a>
            <a href="#contact" style={{ fontSize: "0.85rem", fontWeight: 400, color: "rgba(255,255,255,0.65)", background: "none", padding: "0.9rem 2.2rem", borderRadius: 100, textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)", transition: "all 0.3s" }}
              onMouseEnter={e => { e.target.style.color = "#fff"; e.target.style.borderColor = "rgba(255,255,255,0.35)"; }}
              onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.65)"; e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}>
              Request demo
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "3rem", justifyContent: "center", marginTop: "5rem", paddingTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap", animation: "wordUp 0.8s 0.7s cubic-bezier(0.16,1,0.3,1) both" }}>
            {[{ n: 24, s: "/7", l: "Always available" }, { n: 4, s: "", l: "Languages" }, { n: 40, s: "%", l: "Calls missed without AI" }, { n: 1, s: "s", l: "Response time" }].map((st, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: 300, color: GOLD, lineHeight: 1 }}>
                  <Counter target={st.n} suffix={st.s} />
                </div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "0.4rem" }}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.2)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", zIndex: 2 }}>
          <span>Scroll</span>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${GOLD}, transparent)`, animation: "float 2s ease infinite" }} />
        </div>
      </section>

      <Marquee />

      {/* ── CAROUSEL / PRODUCTS ── */}
      <section id="products" style={{ background: DARK, padding: "8rem 0 6rem", overflow: "hidden" }}>
        <Carousel3D />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ ...S.section, background: BLACK }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7rem", alignItems: "center" }}>
          <div>
            <Reveal><div style={S.eyebrow}>Process</div></Reveal>
            <Reveal delay={0.1}><h2 style={S.sTitle}>Live in <em style={{ fontStyle: "italic", color: GOLD }}>days,</em><br />not months</h2></Reveal>
            <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column" }}>
              {[
                { n: "01", t: "Discovery call", d: "We understand your business, your clients, your tone of voice. 30 minutes is enough." },
                { n: "02", t: "Configuration & training", d: "We build and train your agent — knowledge base, scripts, escalation rules, integrations." },
                { n: "03", t: "Launch & optimise", d: "Your agent goes live. We monitor quality, adjust responses and improve every week." },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div style={{ display: "flex", gap: "1.5rem", padding: "1.8rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", borderTop: i === 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(124,111,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 300, color: "rgba(124,111,255,0.3)", minWidth: "2rem" }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 500, color: "#fff", marginBottom: "0.4rem" }}>{s.t}</div>
                      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Orbital */}
          <Reveal delay={0.2} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 300, height: 300 }}>
              {[300, 210, 120].map((size, i) => (
                <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: size, height: size, borderRadius: "50%", border: `1px solid rgba(200,168,32,${0.05 + i * 0.05})`, transform: "translate(-50%,-50%)", animation: i === 1 ? "spin 18s linear infinite" : i === 2 ? "spin 10s linear infinite reverse" : "none" }} />
              ))}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 70, height: 70, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,255,0.2), rgba(124,111,255,0.02))", border: "1px solid rgba(124,111,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "2rem", color: GOLD }}>A</span>
              </div>
              {[0, 1].map(i => (
                <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: i === 0 ? 8 : 5, height: i === 0 ? 8 : 5, marginTop: i === 0 ? -4 : -2.5, marginLeft: i === 0 ? -4 : -2.5, borderRadius: "50%", background: i === 0 ? GOLD : "rgba(200,168,32,0.5)", animation: `${i === 0 ? "spin" : "spin"} ${i === 0 ? 6 : 4}s linear infinite${i === 1 ? " reverse" : ""}`, transformOrigin: `${i === 0 ? 105 : 80}px 0` }} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section style={{ ...S.section, background: DARK }}>
        <Reveal style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={S.eyebrow}>Languages</div>
          <h2 style={S.sTitle}>One agent, <em style={{ fontStyle: "italic", color: GOLD }}>four languages</em></h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)", maxWidth: 800, margin: "0 auto" }}>
            {[{ flag: "🇵🇹", name: "Portuguese", native: "Português" }, { flag: "🇬🇧", name: "English", native: "English" }, { flag: "🇩🇪", name: "German", native: "Deutsch" }, { flag: "🇷🇺", name: "Russian", native: "Русский" }].map((l, i) => (
              <div key={i} style={{ background: DARK, padding: "2.5rem 1.5rem", textAlign: "center", transition: "background 0.3s", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#111115"; e.currentTarget.querySelector(".underline").style.transform = "scaleX(1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = DARK; e.currentTarget.querySelector(".underline").style.transform = "scaleX(0)"; }}>
                <div className="underline" style={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, transform: "scaleX(0)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
                <div style={{ fontSize: "2rem", marginBottom: "0.7rem" }}>{l.flag}</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 400, color: "#fff", marginBottom: "0.25rem" }}>{l.name}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>{l.native}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ ...S.section, background: BLACK }}>
        <Reveal><div style={S.eyebrow}>Pricing</div></Reveal>
        <Reveal delay={0.1}><h2 style={{ ...S.sTitle, marginBottom: "3.5rem" }}>Simple, <em style={{ fontStyle: "italic", color: GOLD }}>transparent</em> pricing</h2></Reveal>
        <Reveal delay={0.2}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)", maxWidth: 960, margin: "0 auto" }}>
            {PLANS.map((p, i) => (
              <div key={i} style={{ background: p.featured ? "#0e0e12" : BLACK, padding: "2.8rem 2.4rem", position: "relative", transition: "background 0.3s" }}>
                {p.featured && <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />}
                {p.featured && <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD, border: "1px solid rgba(124,111,255,0.25)", padding: "0.18rem 0.65rem", borderRadius: 100, display: "inline-block", marginBottom: "1.2rem" }}>Most popular</div>}
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{p.tier}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#fff", marginBottom: "1.5rem" }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "0.3rem" }}>
                  {p.price ? <><span style={{ fontSize: "1.1rem", color: GOLD }}>€</span><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 300, color: "#fff", lineHeight: 1 }}>{p.price}</span></> : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: GOLD }}>Custom</span>}
                </div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{p.setup}{p.mo ? ` · then ${p.mo}` : ""}</div>
                <ul style={{ listStyle: "none", marginBottom: "2rem" }}>
                  {p.features.map((f, fi) => (
                    <li key={fi} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" style={{ display: "block", textAlign: "center", padding: "0.8rem", borderRadius: 100, fontSize: "0.8rem", fontWeight: p.featured ? 600 : 400, textDecoration: "none", background: p.featured ? GOLD : "none", color: p.featured ? BLACK : "rgba(255,255,255,0.5)", border: p.featured ? "none" : "1px solid rgba(255,255,255,0.1)", transition: "all 0.25s" }}
                  onMouseEnter={e => { if (p.featured) { e.target.style.background = GOLD2; e.target.style.boxShadow = "0 8px 25px rgba(124,111,255,0.3)"; } else { e.target.style.borderColor = GOLD; e.target.style.color = GOLD; } }}
                  onMouseLeave={e => { if (p.featured) { e.target.style.background = GOLD; e.target.style.boxShadow = ""; } else { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(255,255,255,0.5)"; } }}>
                  {p.btn}
                </a>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── PARTNER ── */}
      <section id="partners" style={{ ...S.section, background: DARK }}>
        <Reveal>
          <div style={{ border: "1px solid rgba(255,255,255,0.05)", padding: "4rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center", maxWidth: 1000, margin: "0 auto" }}>
            <div>
              <div style={S.eyebrow}>Partnership</div>
              <h2 style={{ ...S.sTitle, marginBottom: "1rem" }}>Grow your business<br />with <em style={{ fontStyle: "italic", color: GOLD }}>Aira</em></h2>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: "2rem" }}>We work with recruitment agencies, business consultants and HR firms. Introduce Aira to your clients and earn recurring revenue.</p>
              <a href="#contact" style={{ fontSize: "0.85rem", fontWeight: 500, color: BLACK, background: GOLD, padding: "0.85rem 2rem", borderRadius: 100, textDecoration: "none", display: "inline-block", transition: "background 0.2s" }}>Become a partner</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.04)" }}>
              {[
                { icon: "💼", t: "Referral fee", d: "€500 per client placed, plus €100–200 monthly recurring commission." },
                { icon: "⚡", t: "We handle everything", d: "Setup, training, support — fully managed. You just make the introduction." },
                { icon: "🌍", t: "Perfect market fit", d: "Ideal for clients spending €1000+/month on a human assistant." },
              ].map((item, i) => (
                <div key={i} style={{ background: DARK, padding: "1.3rem 1.5rem", display: "flex", gap: "1rem", transition: "background 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#111115"}
                  onMouseLeave={e => e.currentTarget.style.background = DARK}>
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 500, color: "#fff", marginBottom: "0.2rem" }}>{item.t}</div>
                    <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ ...S.section, background: BLACK, textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <Reveal><div style={S.eyebrow}>Contact</div></Reveal>
          <Reveal delay={0.1}><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.8rem,5.5vw,4.2rem)", fontWeight: 300, lineHeight: 1.06, letterSpacing: "-0.025em", color: "#fff", marginBottom: "1.2rem" }}>
            Ready to give your<br />business a <em style={{ fontStyle: "italic", color: GOLD }}>voice?</em>
          </h2></Reveal>
          <Reveal delay={0.2}><p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: "3rem" }}>Tell us about your business and we'll respond within 24 hours.</p>
            <form style={{ display: "flex", flexDirection: "column", gap: "0.9rem", textAlign: "left" }} onSubmit={e => { e.preventDefault(); const btn = e.target.querySelector("button[type=submit]"); btn.textContent = "✓ Sent!"; btn.style.background = "#2a7a4a"; }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                {[{ label: "Name", type: "text", ph: "João Silva" }, { label: "Email", type: "email", ph: "joao@company.com" }].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{f.label}</div>
                    <input type={f.type} required placeholder={f.ph} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "0.78rem 1rem", borderRadius: 8, fontSize: "0.85rem", fontFamily: "'Inter',sans-serif", outline: "none", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = "rgba(124,111,255,0.4)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Message</div>
                <textarea rows={4} placeholder="Tell us about your business..." style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "0.78rem 1rem", borderRadius: 8, fontSize: "0.85rem", fontFamily: "'Inter',sans-serif", outline: "none", resize: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "rgba(124,111,255,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>
              <button type="submit" style={{ background: GOLD, color: BLACK, padding: "0.95rem 2.5rem", borderRadius: 100, fontSize: "0.85rem", fontWeight: 600, fontFamily: "'Inter',sans-serif", border: "none", alignSelf: "center", marginTop: "0.4rem", transition: "all 0.3s" }}
                onMouseEnter={e => { e.target.style.background = GOLD2; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 14px 35px rgba(124,111,255,0.3)"; }}
                onMouseLeave={e => { e.target.style.background = GOLD; e.target.style.transform = ""; e.target.style.boxShadow = ""; }}>
                Send message
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: BLACK, borderTop: "1px solid rgba(255,255,255,0.04)", padding: "3.5rem 5vw 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", paddingBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 600, fontSize: "1.5rem", color: "#fff", marginBottom: "0.7rem" }}>
              Air<span style={{ color: GOLD }}>a</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.7, maxWidth: 220 }}>AI voice agents for modern business. Built in Europe, deployed worldwide.</p>
          </div>
          {[["Products", ["Aira Assistant", "Aira Concierge", "Aira Admin"]], ["Company", ["How it works", "Pricing", "Partners"]], ["Contact", ["info@aira-ai.net", "Request demo"]]].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "1.2rem" }}>{title}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {links.map(l => <li key={l}><a href="#" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = GOLD} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.38)"}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.18)" }}>© 2026 Aira · Horizonte Solene Lda · Portugal · aira-ai.net</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy", "Terms"].map(l => <a key={l} href="#" style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", textDecoration: "none" }}>{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
