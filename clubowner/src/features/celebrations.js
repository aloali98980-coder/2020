import { getLanguage, translateDOM } from "../i18n/index.js";
import { esc } from "../ui/format.js";
import { CELEBRATION_COPY, CELEBRATION_TEXTS } from "../data/celebrationTexts.js";
import { clubCity } from "../services/celebrations.js";

const local = (copy) => copy?.[getLanguage()] || copy?.en || copy?.ar || "";

function speakerFor(save) {
  return (save.players || [])
    .filter((player) => player.clubId === save.clubId && player.status !== "retired")
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
}

function firework(cx, cy, delay = 0, color = "#ffd36b") {
  return `<g class="scene-firework" style="--delay:${delay}s;--spark:${color}" transform="translate(${cx} ${cy})">
    <circle r="3"/><path d="M0-6V-50M0 6V50M-6 0H-50M6 0H50M-4-4-36-36M4 4 36 36M4-4 36-36M-4 4-36 36"/>
  </g>`;
}

function trophyMarkup(size = "large") {
  const transform = size === "large" ? "translate(460 140) scale(1.35)" : "translate(474 177) scale(.9)";
  return `<g class="scene-trophy" transform="${transform}">
    <path class="trophy-cup" d="M-42-48h84v22c0 37-18 57-42 61-24-4-42-24-42-61z"/>
    <path class="trophy-handle" d="M-42-37h-20v15c0 20 13 27 28 28M42-37h20v15c0 20-13 27-28 28"/>
    <path class="trophy-stem" d="M-10 34h20v23h-20zM-27 58h54v13h-54z"/>
    <path class="trophy-glint" d="M-24-34v34"/>
  </g>`;
}

function derbyMarkup() {
  return `<g class="scene-derby-flags">
    <path d="M340 264V94h36l42 19v88l-42-18h-36"/><path d="M582 264V94h-36l-42 19v88l42-18h36"/>
    <path class="flag-home" d="M376 94 418 113v88l-42-18z"/><path class="flag-rival" d="M546 94 504 113v88l42-18z"/>
    <text x="394" y="155" class="scene-flag-mark">★</text><text x="520" y="155" class="scene-flag-mark">★</text>
  </g>`;
}

function pitchMarkup() {
  return `<g class="scene-pitch">
    <path d="M118 281h764v132H118z"/><path d="M500 281v132m-382-66h135a44 44 0 0 1 0 88H118m764-88H747a44 44 0 0 0 0 88h135"/>
    <circle cx="500" cy="347" r="42"/><path d="M118 304h75v86h-75m764-86h-75v86h75"/>
    <g class="pitch-fan" transform="translate(220 264)"><circle cx="0" cy="0" r="8"/><path d="M0 8v30m0-20-14 12m14-12 14 12m-14 8-12 15m12-15 12 15"/></g>
    <g class="pitch-fan" transform="translate(380 260)"><circle cx="0" cy="0" r="8"/><path d="M0 8v30m0-20-14 12m14-12 14 12m-14 8-12 15m12-15 12 15"/></g>
    <g class="pitch-fan" transform="translate(580 260)"><circle cx="0" cy="0" r="8"/><path d="M0 8v30m0-20-14 12m14-12 14 12m-14 8-12 15m12-15 12 15"/></g>
    <g class="pitch-fan" transform="translate(750 264)"><circle cx="0" cy="0" r="8"/><path d="M0 8v30m0-20-14 12m14-12 14 12m-14 8-12 15m12-15 12 15"/></g>
  </g>`;
}

function sceneSvg(save, record) {
  const kind = record.kind;
  const titleScene = kind === "title";
  const city = esc(clubCity(save));
  const center = titleScene || kind === "cup" ? trophyMarkup(titleScene ? "large" : "small") : "";
  const special = kind === "derby" ? derbyMarkup() : kind === "promotion" ? pitchMarkup() : "";
  return `<svg class="celebration-scene ${titleScene ? "grand-scene" : "mini-scene"}" viewBox="0 0 1000 470" role="img" aria-label="${esc(`${local(CELEBRATION_TEXTS[kind]?.kicker)} ${city}`)}">
    <defs>
      <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#111d39"/><stop offset="1" stop-color="#21385a"/></linearGradient>
      <linearGradient id="scene-ground" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#234d49"/><stop offset="1" stop-color="#32745b"/></linearGradient>
    </defs>
    <rect width="1000" height="470" rx="22" fill="url(#scene-sky)"/>
    ${firework(150, 112, 0.15, "#ffbe55")}${firework(835, 93, 0.75, "#92e8cb")}${firework(695, 183, 1.2, "#ed7ca5")}
    <path class="scene-city" d="M0 280V214h76v-54h62v108h48v-76h71v-51h64v139h48v-96h64v96h64v-60h66v60h43V169h80v111h40v-78h64v-55h70v133h62v-91h72v181H0z"/>
    <path class="scene-window" d="M91 184h18v15H91zm84 53h19v20h-19zm92-63h20v18h-20zm111 41h18v16h-18zm108-45h19v18h-19zm174 20h20v17h-20zm125-27h20v19h-20zm105 49h18v16h-18z"/>
    <rect y="340" width="1000" height="130" fill="url(#scene-ground)"/>
    <path class="scene-route" d="M0 390 C160 350 250 415 390 381 S650 350 760 390 S910 410 1000 374"/>
    ${center}${special}
    ${titleScene ? `<g class="celebration-bus"><path d="M52 308h172a13 13 0 0 1 13 13v37H43v-38a12 12 0 0 1 9-12z"/><path d="M64 298h128v12H64z"/><path class="bus-open-top" d="M80 298v-22h97v22"/><path class="bus-window" d="M61 317h36v20H61zm44 0h37v20h-37zm45 0h30v20h-30z"/><circle cx="79" cy="359" r="10"/><circle cx="204" cy="359" r="10"/><path class="bus-trophy" d="M103 290h19v-5h-19zm3-5v-14h13v14"/></g>` : ""}
    <g class="scene-crowd"><path d="M0 431h1000v39H0z"/><path d="M12 431v-23m35 23v-34m45 34v-25m45 25v-40m49 40v-26m39 26v-33m45 33v-24m49 24v-39m51 39v-26m47 26v-36m52 36v-24m46 24v-40m52 40v-28m47 28v-36m52 36v-25m51 25v-39m47 39v-26m49 26v-34m50 34v-24m45 24v-36m50 36v-29"/></g>
    <text x="500" y="454" class="scene-city-name" text-anchor="middle">${city}</text>
  </svg>`;
}

export function celebrationOverlay(save, record, queueCount = 1) {
  const lang = getLanguage();
  const copy = CELEBRATION_TEXTS[record.kind] || CELEBRATION_TEXTS.cup;
  const speaker = speakerFor(save);
  const name = speaker
    ? lang === "ar"
      ? speaker.name
      : speaker.nameLatin || speaker.name
    : save.owner;
  const title = record.name
    ? `${local(copy.label)} — ${record.name}`
    : local(copy.label);
  const reward = record.reward || {};
  return `<div class="modal-backdrop celebration-backdrop">
    <section class="celebration-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1">
      <header class="celebration-head"><span class="eyebrow">${esc(local(copy.kicker))}</span><h2>${esc(title)}</h2><p>${esc(local(CELEBRATION_COPY.bigCity))} · ${esc(local(CELEBRATION_COPY.broadcast))}</p></header>
      ${sceneSvg(save, record)}
      <div class="celebration-copy-grid">
        <article class="celebration-speech"><span>🎙️ ${esc(name || save.owner)}</span><p>“${esc(local(copy.speech))}”</p></article>
        <article class="celebration-effects"><strong>${esc(local(CELEBRATION_COPY.social))}</strong><p>+${Number(reward.merchandise || 0).toLocaleString("en-US")} · +${Number(reward.sponsor || 0).toLocaleString("en-US")} · ${esc(local(copy.merchandise))} · ${esc(local(copy.sponsor))}</p><small>${esc(local(CELEBRATION_COPY.tifo))} · ${esc(local(CELEBRATION_COPY.pitch))}</small></article>
      </div>
      <footer class="celebration-footer"><span>${record.kind === "title" ? esc(local(CELEBRATION_COPY.bus)) : esc(local(CELEBRATION_COPY.rivals))}</span><button type="button" class="btn primary" data-action="celebration-next">${esc(local(queueCount > 1 ? CELEBRATION_COPY.next : CELEBRATION_COPY.close))}</button></footer>
    </section>
  </div>`;
}

export function showCelebrationScreen(save, record, queueCount = 1, onDone = () => {}) {
  const root = document.getElementById("modal-root");
  if (!root) return onDone();
  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    root.innerHTML = "";
    root.removeEventListener("click", handler);
    document.body.classList.remove("modal-open");
    onDone();
  };
  const handler = (event) => {
    const action = event.target.closest("[data-action]");
    if (!action && !event.target.classList.contains("celebration-backdrop")) return;
    if (!action || action.dataset.action === "celebration-next") {
      event.preventDefault();
      event.stopPropagation();
      finish();
    }
  };
  root.innerHTML = celebrationOverlay(save, record, queueCount);
  root.addEventListener("click", handler);
  document.body.classList.add("modal-open");
  translateDOM(root);
  root.querySelector(".celebration-modal")?.focus();
}
