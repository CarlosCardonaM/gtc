// GTC & Co. Contadores Públicos

// EDITAR: número de WhatsApp del despacho (código de país + número, sin espacios ni signos)
const WHATSAPP_NUMBER = "524770000000";

document.documentElement.classList.add("js");

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

document.querySelectorAll(".js-wa").forEach((a) => {
  a.href = waLink(a.dataset.waText || "Hola");
  a.target = "_blank";
  a.rel = "noopener";
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Encabezado y menú móvil ---------- */

const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("menu");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".sr-only").textContent = open ? "Cerrar menú" : "Abrir menú";
  nav.classList.toggle("is-open", open);
};
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
});

/* ---------- Calendario fiscal ---------- */
// Fechas generales de las obligaciones más comunes. Si el día límite es sábado,
// domingo o día inhábil, se recorre al siguiente día hábil.

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
  "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const key = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function nthMonday(year, month, n) {
  const d = new Date(year, month, 1);
  const offset = (8 - d.getDay()) % 7; // días hasta el primer lunes
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

const holidayCache = new Map();
function holidays(year) {
  if (holidayCache.has(year)) return holidayCache.get(year);
  const easter = easterSunday(year);
  const list = [
    new Date(year, 0, 1),
    nthMonday(year, 1, 1),   // 5 de febrero
    nthMonday(year, 2, 3),   // 21 de marzo
    new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 3), // jueves santo
    new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2), // viernes santo
    new Date(year, 4, 1),
    new Date(year, 8, 16),
    nthMonday(year, 10, 3),  // 20 de noviembre
    new Date(year, 11, 25),
  ];
  const set = new Set(list.map(key));
  holidayCache.set(year, set);
  return set;
}

function nextBusinessDay(date) {
  const d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6 || holidays(d.getFullYear()).has(key(d))) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

const listJoin = (a) => a.length > 1 ? `${a.slice(0, -1).join(", ")} e ${a[a.length - 1]}` : a[0];

function obligationsFor(year, month) {
  const items = [];
  const on17 = ["Pago provisional de ISR e IVA", "Cuotas obrero-patronales del IMSS"];
  const short17 = ["ISR", "IVA", "IMSS"];
  if (month % 2 === 0) { on17.push("Aportaciones bimestrales al INFONAVIT"); short17.push("INFONAVIT"); }
  items.push({ date: nextBusinessDay(new Date(year, month, 17)), items: on17, short: listJoin(short17) });
  if (month === 2) items.push({ date: nextBusinessDay(new Date(year, 2, 31)), items: ["Declaración anual de personas morales"], short: "Anual de personas morales" });
  if (month === 3) items.push({ date: nextBusinessDay(new Date(year, 3, 30)), items: ["Declaración anual de personas físicas"], short: "Anual de personas físicas" });
  return items;
}

function upcomingDeadlines(from, count) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const found = [];
  let y = today.getFullYear(), m = today.getMonth();
  while (found.length < count) {
    for (const ob of obligationsFor(y, m)) {
      if (ob.date >= today) found.push(ob);
    }
    m++; if (m > 11) { m = 0; y++; }
  }
  return found.sort((a, b) => a.date - b.date).slice(0, count);
}

function renderPlaque() {
  const now = new Date();
  const [next, ...later] = upcomingDeadlines(now, 3);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((next.date - today) / 86400000);

  const numEl = document.getElementById("count-num");
  const unitEl = document.getElementById("count-unit");
  const d = next.date;

  unitEl.textContent = days === 0 ? "vence hoy" : days === 1 ? "día" : "días";
  document.getElementById("plaque-date").textContent =
    `${WEEKDAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
  document.getElementById("plaque-items").innerHTML =
    next.items.map((t) => `<li>${t}</li>`).join("");
  document.getElementById("plaque-next").innerHTML = later.map((ob) => {
    const iso = ob.date.toISOString().slice(0, 10);
    return `<li><time datetime="${iso}">${ob.date.getDate()} ${MONTHS_SHORT[ob.date.getMonth()]}</time><span>${ob.short}</span></li>`;
  }).join("");

  // Conteo animado al cargar (se omite con movimiento reducido)
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || days === 0) { numEl.textContent = days; return; }
  const start = performance.now() + 1100, duration = 1400, from = Math.min(days + 40, 99);
  numEl.textContent = from;
  const tick = (t) => {
    const p = Math.min(Math.max((t - start) / duration, 0), 1);
    const eased = 1 - Math.pow(1 - p, 4);
    numEl.textContent = Math.round(from + (days - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
if (document.getElementById("count-num")) renderPlaque();

/* ---------- Pestañas de servicios ---------- */

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    panel.hidden = !on;
    if (on) {
      panel.classList.remove("is-entering");
      void panel.offsetWidth;
      panel.classList.add("is-entering");
    }
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (dir) { e.preventDefault(); selectTab(tabs[(i + dir + tabs.length) % tabs.length], true); }
    if (e.key === "Home") { e.preventDefault(); selectTab(tabs[0], true); }
    if (e.key === "End") { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
  });
});

/* ---------- Línea del proceso ---------- */

const steps = document.getElementById("steps");
if (steps && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { steps.classList.add("is-visible"); io.disconnect(); }
  }, { threshold: 0.4 });
  io.observe(steps);
} else if (steps) {
  steps.classList.add("is-visible");
}

/* ---------- Formulario ---------- */

const form = document.getElementById("contact-form");
const summary = document.getElementById("form-errors");
if (form) initForm();

function initForm() {
  const validators = {
    "f-nombre": (v) => (v.trim().length >= 2 ? "" : "Escribe tu nombre."),
    "f-tel": (v) => (v.replace(/\D/g, "").length >= 10 ? "" : "Escribe un teléfono de 10 dígitos."),
  };

  function validateField(id) {
    const input = document.getElementById(id);
    const msg = validators[id](input.value);
    const err = document.getElementById(id.replace("f-", "e-"));
    err.textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return msg;
  }

  Object.keys(validators).forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("blur", () => { if (input.value) validateField(id); });
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") validateField(id);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errors = Object.keys(validators)
      .map((id) => ({ id, msg: validateField(id) }))
      .filter((x) => x.msg);

    if (errors.length) {
      summary.innerHTML = `<h3>Revisa estos datos</h3><ul>${errors
        .map((x) => `<li><a href="#${x.id}">${x.msg}</a></li>`).join("")}</ul>`;
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;

    const data = new FormData(form);
    const lines = [
      `Hola, soy ${data.get("nombre").trim()}.`,
      `Tipo de cliente: ${data.get("tipo")}.`,
      `Necesito ayuda con: ${data.get("servicio")}.`,
      data.get("mensaje").trim() ? `Detalles: ${data.get("mensaje").trim()}` : "",
      `Mi teléfono: ${data.get("telefono").trim()}`,
    ].filter(Boolean);

    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  summary.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    document.querySelector(a.getAttribute("href")).focus();
  });
}

/* ---------- Índice de páginas legales ---------- */

const tocLinks = [...document.querySelectorAll(".toc a")];
if (tocLinks.length && "IntersectionObserver" in window) {
  const byId = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const visible = new Set();
  const mark = (link) => {
    tocLinks.forEach((a) => a.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "true");
  };
  const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  const tocIo = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
    const current = [...byId.keys()].find((id) => visible.has(id));
    if (current && !atBottom()) mark(byId.get(current));
  }, { rootMargin: "-20% 0px -60% 0px" });
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) tocIo.observe(el); });
  // Las últimas secciones son cortas y no alcanzan la franja de observación
  window.addEventListener("scroll", () => { if (atBottom()) mark(tocLinks[tocLinks.length - 1]); }, { passive: true });
  tocLinks.forEach((a) => a.addEventListener("click", () => setTimeout(() => mark(a), 600)));
}
