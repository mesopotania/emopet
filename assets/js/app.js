/* emopet static site behaviour. Vanilla ES module. */
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_READY, WAITLIST_TABLE } from "./config.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* year */
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* header CTA appears once there's room */
function sizeCta() {
  const cta = $("[data-cta]");
  if (cta) cta.style.display = window.innerWidth >= 560 ? "inline-flex" : "none";
}
sizeCta();
addEventListener("resize", sizeCta);

/* theme */
(() => {
  const btn = $(".theme");
  if (!btn) return;
  const sync = () => {
    const dark = document.documentElement.classList.contains("dark");
    btn.setAttribute("aria-checked", String(dark));
    btn.setAttribute("aria-label", dark ? btn.dataset.toLight : btn.dataset.toDark);
  };
  sync();
  btn.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("emopet-theme", dark ? "dark" : "light"); } catch (e) {}
    sync();
  });
})();

/* reveal on scroll */
(() => {
  const items = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  );
  items.forEach((i) => io.observe(i));
})();

/* understand chart */
(() => {
  const chart = $("[data-understand-wqi]");
  if (!chart) return;
  const live = $("[data-chart-live]");
  const rest = $("[data-chart-rest]");
  const wqiLabel = chart.dataset.understandWqi;
  const restLabel = chart.dataset.understandRest;
  const bars = $$(".chart__bar", chart);
  const setLive = (bar) => {
    if (live) live.textContent = `${bar.dataset.day} · ${wqiLabel} ${bar.dataset.wqi}`;
    if (rest) rest.textContent = `${restLabel} ${Math.max(50, +bar.dataset.wqi - 6)}`;
  };
  const clear = () => bars.forEach((b) => b.classList.remove("is-active"));
  const today = bars[bars.length - 1];
  bars.forEach((bar) => {
    const show = () => { clear(); bar.classList.add("is-active"); setLive(bar); };
    bar.addEventListener("pointerenter", show);
    bar.addEventListener("focus", show);
  });
  chart.addEventListener("pointerleave", () => { clear(); if (today) setLive(today); });
  chart.addEventListener("focusout", (e) => { if (!chart.contains(e.relatedTarget)) { clear(); if (today) setLive(today); } });
})();

/* companion carousel */
(() => {
  const root = $("[data-showcase]");
  if (!root) return;
  const track = $("[data-track]", root);
  const slides = $$(".showcase__slide", track);
  const tabs = $$("[data-tab]", root);
  const dots = $$("[data-dot]", root);
  const prev = $("[data-prev]", root);
  const next = $("[data-next]", root);
  let active = 0;
  const render = () => {
    tabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === active)));
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
    if (prev) prev.disabled = active === 0;
    if (next) next.disabled = active === slides.length - 1;
  };
  const go = (i) => {
    active = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[active].offsetLeft, behavior: "smooth" });
    render();
  };
  let raf = 0;
  track.addEventListener("scroll", () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const x = track.scrollLeft;
      let nearest = 0, best = Infinity;
      slides.forEach((s, j) => { const d = Math.abs(s.offsetLeft - x); if (d < best) { best = d; nearest = j; } });
      if (nearest !== active) { active = nearest; render(); }
      raf = 0;
    });
  });
  tabs.forEach((t, i) => t.addEventListener("click", () => go(i)));
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
  prev?.addEventListener("click", () => go(active - 1));
  next?.addEventListener("click", () => go(active + 1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  });
  render();
})();

/* indicator card: gauge + activity segments */
(() => {
  const wrap = $("[data-indicator]");
  if (!wrap) return;
  const arc = $("[data-arc]", wrap);
  const num = $("[data-gauge-num]", wrap);
  const pct = $("[data-ind-pct]", wrap);
  const bars = $$(".ind-bar", wrap);
  const r = 46, circ = 2 * Math.PI * r;
  const base = 3;
  const set = (i) => {
    const level = +bars[i].dataset.level;
    const p = level / 100;
    if (arc) arc.setAttribute("stroke-dasharray", `${circ * p} ${circ}`);
    if (num) num.textContent = String(level);
    if (pct) pct.textContent = `${level}%`;
    bars.forEach((b, j) => {
      b.classList.toggle("on", j < i);
      b.classList.toggle("cur", j === i);
    });
  };
  bars.forEach((b, i) => {
    b.addEventListener("pointerenter", () => set(i));
    b.addEventListener("focus", () => set(i));
  });
  wrap.addEventListener("pointerleave", () => set(base));
  set(base);
})();

/* reading trend bars */
(() => {
  const bars = $$(".trend__bar");
  const wrap = $(".trend__bars");
  if (!wrap) return;
  const clear = () => bars.forEach((b) => b.classList.remove("is-active"));
  bars.forEach((bar) => {
    const show = () => { clear(); bar.classList.add("is-active"); };
    bar.addEventListener("pointerenter", show);
    bar.addEventListener("focus", show);
  });
  wrap.addEventListener("pointerleave", clear);
})();

/* reading cursor glow */
(() => {
  const card = $("[data-glow]");
  const glow = card && $(".reading-card__glow", card);
  if (!card || !glow || reduced) return;
  let raf = 0;
  card.addEventListener("pointermove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const b = card.getBoundingClientRect();
      glow.style.setProperty("--gx", `${((e.clientX - b.left) / b.width) * 100}%`);
      glow.style.setProperty("--gy", `${((e.clientY - b.top) / b.height) * 100}%`);
      glow.style.opacity = "1";
      raf = 0;
    });
  });
  card.addEventListener("pointerleave", () => (glow.style.opacity = "0.35"));
})();

/* waitlist */
(() => {
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  async function join(email, locale) {
    if (!SUPABASE_READY) { await new Promise((r) => setTimeout(r, 500)); return { ok: true }; }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${WAITLIST_TABLE}`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok || res.status === 409) return { ok: true };
      return { ok: false };
    } catch (e) { return { ok: false }; }
  }
  const locale = document.documentElement.lang || "fr";
  $$("form.waitlist").forEach((form) => {
    const input = $('input[type="email"]', form);
    const note = $(".waitlist__note", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      note.classList.remove("is-error");
      if (!EMAIL.test(email)) { note.textContent = note.dataset.errorEmail; note.classList.add("is-error"); input.focus(); return; }
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      note.textContent = note.dataset.submitting;
      const r = await join(email, locale);
      btn.disabled = false;
      if (r.ok) {
        const ok = document.createElement("p");
        ok.className = "waitlist__ok";
        ok.setAttribute("role", "status");
        ok.textContent = note.dataset.success;
        form.replaceWith(ok);
      } else {
        note.textContent = note.dataset.errorGeneric;
        note.classList.add("is-error");
      }
    });
    input.addEventListener("input", () => note.classList.remove("is-error"));
  });
})();
