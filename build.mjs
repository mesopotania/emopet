/* emopet static generator.
 * Emits two plain HTML pages from the exact Lovable copy:
 *   index.html      -> "/"    (French)
 *   en/index.html   -> "/en/" (English)
 * Run: node build.mjs
 * Output is pure static HTML/CSS/JS; no runtime framework.
 */
import { messages } from "./messages.mjs";
import { writeFile, mkdir } from "node:fs/promises";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Illustrative datasets (match the Lovable components exactly)
const UNDERSTAND = [58, 64, 61, 72, 68, 74, 82];
const READING = [64, 69, 66, 74, 70, 78, 82];
const LEVELS = [12, 24, 38, 52, 66, 80, 94];
const IND_BASE = 3;

function page(locale) {
  const m = messages[locale];
  const isFr = locale === "fr";
  const base = isFr ? "" : "../"; // en page lives one level deep
  const otherHref = isFr ? "en/" : "../";
  const days = m.understand.days;

  const chartBars = UNDERSTAND.map((v, i) => {
    const today = i === UNDERSTAND.length - 1;
    return `<button type="button" class="chart__bar${today ? " is-today" : ""}" style="height:${v}%"
      data-i="${i}" data-day="${esc(days[i])}" data-wqi="${v}" data-act="${Math.round(v * 0.7)}"
      aria-label="${esc(days[i])}: WQI ${v}">
      <span class="fill"></span>
      <span class="chart__tip"><b>${esc(days[i])}</b><span>${esc(m.understand.tooltipWqi)} ${v} · ${esc(m.understand.tooltipActivity)} ${Math.round(v * 0.7)}</span></span>
    </button>`;
  }).join("");

  const readingBars = READING.map((v, i) => {
    const today = i === READING.length - 1;
    return `<button type="button" class="trend__bar${today ? " is-today" : ""}" style="height:${v}%"
      data-day="${esc(days[i])}" data-wqi="${v}" data-rsi="${Math.max(50, v - 6)}" aria-label="${esc(days[i])}: WQI ${v}">
      <span class="fill"></span>
      <span class="trend__tip"><b>${esc(days[i])}</b><span>${esc(m.reading.wqiLabel)} ${v} · RSI ${Math.max(50, v - 6)}</span></span>
    </button>`;
  }).join("");

  const confSeg = Array.from({ length: 6 }, (_, i) => `<span class="${i < 4 ? "on" : ""}"></span>`).join("");
  const actSeg = Array.from({ length: 5 }, (_, i) => `<span class="${i === 2 ? "on" : ""}"></span>`).join("");

  // Indicator activity bars (7)
  const indBars = LEVELS.map((_, i) =>
    `<button type="button" class="ind-bar${i <= IND_BASE ? (i === IND_BASE ? " cur" : " on") : ""}" data-i="${i}" data-level="${LEVELS[i]}" aria-label="${esc(m.app.activityLabel)} ${LEVELS[i]}%"></button>`,
  ).join("");

  const modules = [
    [m.app.moduleWellbeing, m.app.moduleWellbeingBody],
    [m.app.moduleData, m.app.moduleDataBody],
    [m.app.moduleJournal, m.app.moduleJournalBody],
    [m.app.moduleMap, m.app.moduleMapBody],
  ].map(([t, b]) => `<div class="module"><dt><span class="d"></span>${esc(t)}</dt><dd>${esc(b)}</dd></div>`).join("");

  const showcase = [
    { img: "mat-clean.png", kind: m.companion.matKind, name: m.companion.matName, body: m.companion.matBody, alt: m.companion.matAlt },
    { img: "tag.jpg", kind: m.companion.tagKind, name: m.companion.tagName, body: m.companion.tagBody, alt: m.companion.tagAlt },
    { img: "medallion.jpg", kind: m.companion.medalKind, name: m.companion.medalName, body: m.companion.medalBody, alt: m.companion.medalName },
  ];
  const showcaseSlides = showcase.map((it) => `<div class="showcase__slide"><div class="product">
      <div class="product__img"><img src="${base}assets/images/${it.img}" alt="${esc(it.alt)}" loading="lazy"></div>
      <div><span class="product__kind">${esc(it.kind)}</span><h3>${esc(it.name)}</h3><p>${esc(it.body)}</p></div>
    </div></div>`).join("");
  const showcaseTabs = showcase.map((it, i) => `<button type="button" role="tab" class="showcase__tab" data-tab="${i}" aria-selected="${i === 0}">${esc(it.name)}</button>`).join("");
  const showcaseDots = showcase.map((it, i) => `<button type="button" class="showcase__dot" data-dot="${i}" aria-current="${i === 0}" aria-label="${esc(it.name)}"></button>`).join("");

  const momentsPhotos = ["hero-tag.png", "vet-visit.jpg", "hero-dog.png"];
  const moments = m.moments.cards.map((c, i) => `<article class="moment lift"><div class="moment__img">
      <img src="${base}assets/images/${momentsPhotos[i]}" alt="${esc(c.alt)}" loading="lazy">
      <span class="moment__tag">${esc(c.tag)}</span></div>
      <div class="moment__body"><h3>${esc(c.headline)}</h3><p>${esc(c.body)}</p><div class="moment__meta">${esc(c.meta)}</div></div>
    </article>`).join("");

  const honestPoints = [
    [m.honest.point1Title, m.honest.point1Body],
    [m.honest.point2Title, m.honest.point2Body],
    [m.honest.point3Title, m.honest.point3Body],
  ].map(([t, b]) => `<li><h3>${esc(t)}</h3><p>${esc(b)}</p></li>`).join("");

  const compassIcons = [
    `<path d="M12 20s-6.5-4-6.5-9A3.5 3.5 0 0 1 12 8.2 3.5 3.5 0 0 1 18.5 11c0 5-6.5 9-6.5 9Z"/>`,
    `<path d="M12 12 L12.4 12.4 L12 13 L10.9 13.1 L10 12 L10.2 10.2 L12 9 L14.5 9.5 L16 12 L15.2 15.2 L12 17 L8.1 15.9 L6 12 L7.4 7.4 L12 5"/>`,
    `<circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><path d="M8.6 15.4a4.5 4.5 0 0 1 0-6.8"/><path d="M15.4 8.6a4.5 4.5 0 0 1 0 6.8"/>`,
    `<circle cx="12" cy="12" r="8.5"/><circle cx="9.2" cy="10.2" r="1" fill="currentColor" stroke="none"/><circle cx="14.8" cy="10.2" r="1" fill="currentColor" stroke="none"/><path d="M8.5 14c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2"/>`,
  ];
  const compassColors = ["text-coral", "text-indigo", "text-teal", "text-coral"];
  const compass = m.philosophy.values.map((v, i) =>
    `<li><span class="${compassColors[i]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="32" height="32" aria-hidden="true">${compassIcons[i]}</svg></span><span class="compass__label">${esc(v)}</span></li>`,
  ).join("");

  const featuredIndex = m.pricing.tiers.length - 1;
  const tiers = m.pricing.tiers.map((tier, i) => {
    const featured = i === featuredIndex;
    const feats = tier.features.map((f) =>
      `<li><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(f)}</li>`,
    ).join("");
    return `<article class="tier${featured ? " tier--featured" : ""} lift">
      <div class="tier__top"><h3>${esc(tier.name)}</h3>${featured ? `<span class="tier__badge">${esc(m.pricing.featured)}</span>` : ""}</div>
      <p class="tier__kind">${esc(tier.kind)}</p>
      <p class="tier__price">${esc(tier.price)}</p>
      <p class="tier__desc">${esc(tier.desc)}</p>
      <ul class="tier__features">${feats}</ul>
    </article>`;
  }).join("");

  const faq = m.faq.items.map((it) => `<details class="faq__item"><summary>${esc(it.q)}<span class="faq__plus" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.5v9M1.5 6h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span></summary><p>${esc(it.a)}</p></details>`).join("");

  const waitlist = (center) => `<form class="waitlist${center ? " waitlist--center" : ""}" novalidate>
      <label class="sr-only" for="email-${center ? "join" : "hero"}">${esc(m.waitlist.label)}</label>
      <div class="waitlist__row">
        <input id="email-${center ? "join" : "hero"}" class="waitlist__input" type="email" inputmode="email" autocomplete="email" placeholder="${esc(m.waitlist.placeholder)}" required>
        <button type="submit" class="btn btn--coral">${esc(m.waitlist.submit)}</button>
      </div>
      <p class="waitlist__note"
         data-note="${esc(m.waitlist.note)}"
         data-submitting="${esc(m.waitlist.submitting)}"
         data-success="${esc(m.waitlist.success)}"
         data-error-email="${esc(m.waitlist.errorEmail)}"
         data-error-generic="${esc(m.waitlist.errorGeneric)}">${esc(m.waitlist.note)}</p>
    </form>`;

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.meta.title)}</title>
<meta name="description" content="${esc(m.meta.description)}">
<link rel="icon" href="${base}assets/brand/paw.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Schibsted+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}assets/css/styles.css">
<script>try{if(localStorage.getItem("emopet-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}</script>
</head>
<body>
<a class="skip-link" href="#main">${esc(m.common.skipToContent)}</a>

<header class="header">
  <div class="container header__inner">
    <a href="#top" aria-label="emopet">
      <img class="brand-logo brand-logo--light" src="${base}assets/brand/logo-horizontal.svg" alt="emopet">
      <img class="brand-logo brand-logo--dark" src="${base}assets/brand/logo-horizontal-reversed.svg" alt="emopet">
    </a>
    <nav class="nav" aria-label="Sections">
      <a href="#companion">${esc(m.nav.companion)}</a>
      <a href="#community">${esc(m.nav.community)}</a>
      <a href="#pricing">${esc(m.nav.pricing)}</a>
      <a href="#faq">${esc(m.nav.faq)}</a>
    </nav>
    <div class="header__actions">
      <a class="locale" href="${otherHref}" aria-label="${esc(isFr ? m.common.switchToEnglish : m.common.switchToFrench)}">
        <span class="${isFr ? "" : "dim"}">FR</span><span class="sep">·</span><span class="${isFr ? "dim" : ""}">EN</span>
      </a>
      <button type="button" class="theme" role="switch" aria-label="${esc(m.common.toDarkTheme)}" data-to-dark="${esc(m.common.toDarkTheme)}" data-to-light="${esc(m.common.toLightTheme)}">
        <span class="theme__knob">
          <svg class="icon-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></g></svg>
          <svg class="icon-moon" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" fill="currentColor"/></svg>
        </span>
      </button>
      <a href="#join" class="btn btn--coral btn--sm" style="display:none" data-cta>${esc(m.nav.join)}</a>
    </div>
  </div>
</header>

<main id="main">
  <!-- Hero -->
  <section id="top">
    <div class="container hero hero__grid">
      <div>
        <h1 class="rise">${esc(m.hero.headline)}</h1>
        <p class="hero__lead lead rise rise-2">${esc(m.hero.lead)}</p>
        <div class="hero__form rise rise-3">${waitlist(false)}</div>
      </div>
      <div class="rise rise-2"><div class="frame"><img src="${base}assets/images/hero-tag.png" alt="${esc(m.hero.imageAlt)}"></div></div>
    </div>
  </section>

  <!-- Understand -->
  <section id="understand" class="section">
    <div class="container split split--wide-left">
      <div class="reveal">
        <h2 class="h2 text-indigo">${esc(m.understand.title)}</h2>
        <p class="body-text prose">${esc(m.understand.body)}</p>
        <p class="examples-label">${esc(m.understand.examplesLabel)}</p>
        <ul class="examples">
          <li><p>${esc(m.understand.example1)}</p></li>
          <li><p>${esc(m.understand.example2)}</p></li>
          <li><p>${esc(m.understand.example3)}</p></li>
        </ul>
      </div>
      <figure class="card card--hover reveal" data-chart>
        <figcaption class="card__head"><span class="card__title"><span class="dot"></span>${esc(m.understand.mockLabel)}</span><span class="muted">${esc(m.understand.mockMeta)}</span></figcaption>
        <div class="chart-live"><b data-chart-live>${esc(days[6])} · ${esc(m.understand.tooltipWqi)} ${UNDERSTAND[6]}</b><span class="muted" data-chart-rest>${esc(m.understand.tooltipRest)} ${Math.max(50, UNDERSTAND[6] - 6)}</span></div>
        <div class="chart" data-understand-wqi="${esc(m.understand.tooltipWqi)}" data-understand-rest="${esc(m.understand.tooltipRest)}">${chartBars}</div>
        <div class="chart__days">${days.map((d) => `<span>${esc(d)}</span>`).join("")}</div>
        <p class="chart-hint muted">${esc(m.understand.tooltipHint)}</p>
      </figure>
    </div>
  </section>

  <!-- Companion -->
  <section id="companion" class="section tint">
    <div class="container">
      <div style="max-width:42rem">
        <h2 class="h2 text-indigo reveal">${esc(m.companion.title)}</h2>
        <p class="lead reveal" style="margin-top:1.25rem;color:color-mix(in srgb,var(--ink) 80%,transparent)">${esc(m.companion.intro)}</p>
      </div>
      <div class="showcase reveal" data-showcase>
        <div class="showcase__tabs" role="tablist">${showcaseTabs}</div>
        <div class="showcase__viewport">
          <div class="showcase__track" tabindex="0" data-track>${showcaseSlides}</div>
          <button class="showcase__arrow showcase__arrow--prev" data-prev aria-label="Previous"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button class="showcase__arrow showcase__arrow--next" data-next aria-label="Next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
        <div class="showcase__dots">${showcaseDots}</div>
      </div>
    </div>
  </section>

  <!-- App -->
  <section id="app" class="section">
    <div class="container split">
      <div class="reveal" data-indicator>
        <figure class="indicator card card--hover">
          <figcaption class="indicator__head"><span class="t">${esc(m.app.cardTitle)}</span><span class="chip">${esc(m.app.confidenceLabel)} · ${esc(m.app.confidenceState)}</span></figcaption>
          <div class="gauge">
            <div class="gauge__ring"><svg viewBox="0 0 110 110"><circle class="gauge__track" cx="55" cy="55" r="46" fill="none" stroke-width="9"/><circle class="gauge__arc" cx="55" cy="55" r="46" fill="none" stroke-width="9" stroke-linecap="round" data-arc/></svg><span class="gauge__num" data-gauge-num>52</span></div>
            <div><p class="gauge__label">${esc(m.app.chargeLabel)}</p><p class="gauge__desc">${esc(m.app.compare)}</p></div>
          </div>
          <div class="indicator__foot">
            <div class="row"><span class="k">${esc(m.app.restLabel)}</span><span class="v"><span style="width:8px;height:8px;border-radius:50%;background:var(--teal);display:inline-block"></span>${esc(m.app.restState)}</span></div>
            <div>
              <div class="row"><span class="k">${esc(m.app.activityLabel)}</span><span class="v" data-ind-pct style="color:color-mix(in srgb,var(--indigo) 75%,transparent)">${LEVELS[IND_BASE]}%</span></div>
              <div class="seg" data-ind-bars>${indBars}</div>
              <div class="seg-legend"><span>${esc(m.app.activityLow)}</span><span>${esc(m.app.activityHigh)}</span></div>
            </div>
          </div>
          <p class="indicator__note">${esc(m.app.note)}</p>
        </figure>
      </div>
      <div class="reveal">
        <h2 class="h2 text-indigo">${esc(m.app.title)}</h2>
        <p class="lead" style="margin-top:1.25rem;color:color-mix(in srgb,var(--ink) 80%,transparent)">${esc(m.app.body)}</p>
        <dl class="modules">${modules}</dl>
      </div>
    </div>
  </section>

  <!-- Moments -->
  <section id="moments" class="section">
    <div class="container">
      <div class="center reveal">
        <p class="moments__eyebrow"><span aria-hidden="true"><svg width="22" height="22" viewBox="0 0 22 22"><rect width="22" height="22" rx="6" fill="currentColor" opacity="0.9"/><g fill="var(--sand)"><circle cx="8" cy="8" r="1.3"/><circle cx="8" cy="14" r="1.3"/><circle cx="14" cy="8" r="1.3"/><circle cx="14" cy="14" r="1.3"/></g></svg></span>${esc(m.moments.eyebrow)}</p>
        <h2 class="moments__title"><span class="text-indigo">${esc(m.moments.titleLead)}</span> <span class="accent">${esc(m.moments.titleAccent)}</span></h2>
        <p class="moments__sub">${esc(m.moments.sub)}</p>
      </div>
      <div class="moments__grid">${moments}</div>
      <div class="moments__foot reveal">
        <p>${esc(m.moments.footSub)}</p>
        <a href="#companion" class="btn btn--indigo">${esc(m.moments.cta)}</a>
      </div>
    </div>
  </section>

  <!-- Honest -->
  <section class="section on-indigo">
    <div class="container honest__grid">
      <div class="reveal"><h2 class="h2">${esc(m.honest.title)}</h2><p class="honest__intro">${esc(m.honest.body)}</p></div>
      <ul class="honest__list reveal">${honestPoints}</ul>
    </div>
  </section>

  <!-- Philosophy -->
  <section id="philosophy" class="section">
    <div class="container center">
      <p class="eyebrow text-coral reveal">${esc(m.philosophy.eyebrow)}</p>
      <h2 class="h2 reveal" style="margin-top:1.5rem"><span class="text-indigo">${esc(m.philosophy.titleLead)}</span><span class="text-coral">${esc(m.philosophy.titleAccent)}</span></h2>
      <p class="lead reveal" style="margin-top:1.5rem;max-width:42rem">${esc(m.philosophy.lead)}</p>
      <span class="ping-wrap"><span class="p1 ping"></span><span class="p2"></span></span>
      <p class="eyebrow muted" style="margin-top:2.5rem">${esc(m.philosophy.compassLabel)}</p>
      <ul class="compass">${compass}</ul>
      <div class="philosophy__closing"><p class="big">${esc(m.philosophy.closing)}</p><p class="body-text" style="margin-top:0.75rem">${esc(m.philosophy.closingSub)}</p></div>
    </div>
  </section>

  <!-- Community -->
  <section id="community" class="section">
    <div class="container split">
      <div class="reveal" style="order:2">
        <h2 class="h2 text-indigo" style="font-size:clamp(1.9rem,4vw,3rem)">${esc(m.community.title)}</h2>
        <p class="lead" style="margin-top:1.5rem;color:color-mix(in srgb,var(--ink) 80%,transparent)">${esc(m.community.body)}</p>
        <p style="margin-top:1.5rem;font-family:var(--font-display);font-size:1.25rem;line-height:1.4" class="text-indigo">${esc(m.community.second)}</p>
      </div>
      <div class="reveal" style="order:1"><div class="frame"><img src="${base}assets/images/lifestyle.png" alt="${esc(m.community.imageAlt)}" loading="lazy"></div></div>
    </div>
  </section>

  <!-- Reading -->
  <section id="reading" class="section on-night">
    <div class="container split">
      <div class="reveal" style="order:2">
        <p class="eyebrow text-teal">${esc(m.reading.eyebrow)}</p>
        <h2 class="h2" style="margin-top:1.5rem">${esc(m.reading.title)}</h2>
        <p class="reading__body">${esc(m.reading.body1)}</p>
        <p class="reading__body">${esc(m.reading.body2)}</p>
      </div>
      <div class="reveal" style="order:1">
        <div class="reading-card" data-glow>
          <div class="reading-card__glow" aria-hidden="true"></div>
          <div class="reading-card__in">
            <div class="reading__stats">
              <div class="stat"><div class="top"><span class="val">${esc(m.reading.wqiValue)}</span><span class="lab">${esc(m.reading.wqiLabel)}</span></div><p class="name">${esc(m.reading.wqiName)}</p></div>
              <div class="stat"><div class="top"><span class="val">${esc(m.reading.rsiValue)}</span><span class="lab">${esc(m.reading.rsiLabel)}</span></div><p class="name">${esc(m.reading.rsiName)}</p></div>
            </div>
            <div class="track"><div class="track__head"><span class="k">${esc(m.reading.confidenceLabel)}</span><span class="v">${esc(m.reading.confidenceValue)}</span></div><div class="track__seg">${confSeg}</div></div>
            <div class="trend"><p class="trend__label">${esc(m.reading.trendLabel)}</p><div class="trend__bars">${readingBars}</div><div class="trend__days"><span>${esc(days[0])}</span><span>${esc(days[6])}</span></div></div>
            <div class="track" style="margin-top:1.5rem"><div class="track__seg">${actSeg}</div><div class="scale-legend"><span>${esc(m.reading.sliderCalm)}</span><span>${esc(m.reading.sliderActive)}</span></div></div>
            <p class="reading-card__note">${esc(m.reading.note)}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section id="pricing" class="section tint">
    <div class="container">
      <div style="max-width:42rem">
        <h2 class="h2 text-indigo reveal">${esc(m.pricing.title)}</h2>
        <p class="lead reveal" style="margin-top:1.25rem;color:color-mix(in srgb,var(--ink) 80%,transparent)">${esc(m.pricing.intro)}</p>
      </div>
      <div class="pricing__grid reveal">${tiers}</div>
      <div class="pass reveal">
        <div><p class="pass__eyebrow">${esc(m.pricing.passEyebrow)}</p><h3>${esc(m.pricing.passName)}</h3><p class="pass__desc">${esc(m.pricing.passDesc)}</p></div>
        <div class="pass__right"><p class="pass__price">${esc(m.pricing.passPrice)}</p><span class="pass__at">${esc(m.pricing.passAtLaunch)}</span></div>
      </div>
      <div class="pricing__cta reveal"><a href="#join" class="btn btn--coral">${esc(m.pricing.cta)}</a><p class="pricing__foot">${esc(m.pricing.footnote)}</p></div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="section">
    <div class="container" style="max-width:52rem">
      <h2 class="h2 text-indigo reveal">${esc(m.faq.title)}</h2>
      <div class="faq__list reveal">${faq}</div>
    </div>
  </section>

  <!-- Join -->
  <section id="join" class="section join">
    <div class="container join__in reveal">
      <h2 class="h2 text-indigo">${esc(m.footer.joinTitle)}</h2>
      <p class="lead">${esc(m.footer.joinBody)}</p>
      <div style="margin-top:2rem;width:100%;display:flex;justify-content:center">${waitlist(true)}</div>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="container footer__in">
    <div class="footer__top">
      <div>
        <img class="footer__logo" src="${base}assets/brand/logo-horizontal-reversed.svg" alt="emopet">
        <p class="footer__tagline">${esc(m.footer.tagline)}</p>
      </div>
      <nav class="footer__links" aria-label="${esc(m.footer.contact)}">
        <a href="https://www.instagram.com/meutebreiz/" target="_blank" rel="noopener noreferrer">${esc(m.footer.instagram)}</a>
        <a href="mailto:bonjour@emopet.fr">${esc(m.footer.contact)}</a>
      </nav>
    </div>
    <p class="footer__disclaimer">${esc(m.footer.disclaimer)}</p>
    <div class="footer__legal"><p>${esc(m.footer.legalNote)}</p><p>${esc(m.footer.place)} · <span data-year></span></p></div>
  </div>
</footer>

<script type="module" src="${base}assets/js/app.js"></script>
</body>
</html>
`;
}

await writeFile(new URL("./index.html", import.meta.url), page("fr"), "utf8");
await mkdir(new URL("./en/", import.meta.url), { recursive: true });
await writeFile(new URL("./en/index.html", import.meta.url), page("en"), "utf8");
console.log("Generated index.html (fr) and en/index.html (en).");
