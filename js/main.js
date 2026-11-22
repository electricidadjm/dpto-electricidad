/* Departamento de Electricidad y Electrónica · IES Julián Marías */
(function () {
  "use strict";

  const EMAIL = "47007525.electr@educa.jcyl.es";

  /* ------------------------------------------------------------
     EMPRESAS COLABORADORAS
     Añade aquí las empresas reales. Campos:
       nombre  (obligatorio)
       sector  (texto corto)
       web     (opcional, URL)
       logo    (opcional, ruta a una imagen, p. ej. "img/empresas/logo.png")
     ------------------------------------------------------------ */
  const EMPRESAS = [
    { nombre: "Instaladoras eléctricas", sector: "Baja tensión · Viviendas e industria" },
    { nombre: "Automatización industrial", sector: "Autómatas · Integración de sistemas" },
    { nombre: "Robótica", sector: "Integradores de robots" },
    { nombre: "Energías renovables", sector: "Fotovoltaica · Autoconsumo" },
    { nombre: "Mantenimiento industrial", sector: "Plantas de producción" },
    { nombre: "Telecomunicaciones", sector: "ICT · Redes de datos" }
  ];

  /* ---------- Cabecera y menú ---------- */
  const header = document.querySelector(".header");
  const nav = document.getElementById("nav");
  const toggle = document.querySelector(".nav-toggle");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- Enlace activo según la sección visible ---------- */
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Filtro de ciclos ---------- */
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".card");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    const f = btn.dataset.filter;
    cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.level !== f));
  }));

  /* ---------- Empresas ---------- */
  const partners = document.getElementById("partners");
  if (partners) {
    partners.innerHTML = EMPRESAS.map((e) => {
      const tag = e.web ? "a" : "div";
      const attrs = e.web ? ` href="${e.web}" target="_blank" rel="noopener"` : "";
      const logo = e.logo ? `<img src="${e.logo}" alt="Logotipo de ${e.nombre}" loading="lazy">` : "";
      return `<${tag} class="partner reveal"${attrs}>${logo}<strong>${e.nombre}</strong><span>${e.sector || ""}</span></${tag}>`;
    }).join("");
  }

  /* ---------- Animación de aparición ---------- */
  const revealTargets = document.querySelectorAll(
    ".strip__item, .section__head, .card, .feature, .gallery__item, .project, .news__item, .cert, .partner, .cta, .contact__form, .contact__info"
  );
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Visor de imágenes ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector("figcaption");
  const items = [...document.querySelectorAll(".gallery__item, .news__media")];
  let current = 0;
  let lastFocus = null;

  const show = (i) => {
    current = (i + items.length) % items.length;
    const img = items[current].querySelector("img");
    const cap = items[current].querySelector("figcaption");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : img.alt;
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector(".lightbox__close").focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  items.forEach((el, i) => {
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.addEventListener("click", () => open(i));
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
  });
  lb.querySelector(".lightbox__close").addEventListener("click", close);
  lb.querySelector(".lightbox__prev").addEventListener("click", () => show(current - 1));
  lb.querySelector(".lightbox__next").addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  /* ---------- Aviso breve ---------- */
  const toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("is-on"), 2200);
  };

  /* ---------- Copiar correo ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast("Correo copiado al portapapeles");
    } catch {
      toast(btn.dataset.copy);
    }
  }));

  /* ---------- Formulario (abre el cliente de correo) ---------- */
  const form = document.getElementById("contactForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { toast("Completa los campos obligatorios"); return; }
    const data = new FormData(form);
    const subject = `[Web Dpto. Electricidad] ${data.get("asunto")}`;
    const body = `${data.get("mensaje")}\n\n— ${data.get("nombre")}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* ---------- Año del pie ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
