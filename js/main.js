/* =========================================================
   TE RESUELVO · Interacción de la página
   Módulos: encabezado · subtítulos animados · reel del hero ·
   revelados · cómo funciona · pestañas · formularios · configuración
   ========================================================= */
(function () {
  "use strict";
  const CFG = window.TR_CONFIG || { endpoints: {}, apps: {}, contacto: {}, legal: {} };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Configuración: contacto, tiendas y páginas legales ---------- */
  $("#anio").textContent = new Date().getFullYear();
  const fc = $("#footer-contact");
  if (CFG.contacto.whatsapp) { const n = CFG.contacto.whatsapp.replace(/\D/g, ""); fc.insertAdjacentHTML("beforeend", `<a href="https://wa.me/${n}" target="_blank" rel="noopener">WhatsApp: +${n.slice(0, 3)} ${n.slice(3)}</a>`); }
  if (CFG.contacto.correo) fc.insertAdjacentHTML("beforeend", `<a href="mailto:${CFG.contacto.correo}">${CFG.contacto.correo}</a>`);
  if (!fc.children.length) fc.insertAdjacentHTML("beforeend", `<a href="#contacto">Escríbenos desde el formulario</a>`);
  // Redes sociales y WhatsApp (pie de página, llamada final y botón flotante)
  const R = CFG.redes || {};
  const wa = (CFG.contacto.whatsapp || "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(CFG.contacto.whatsappMensaje || "Hola Te Resuelvo")}` : "";
  const redes = [
    ["WhatsApp", waUrl, "i-whatsapp"],
    ["Facebook", R.facebook, "i-facebook"],
    ["Instagram", R.instagram, "i-instagram"],
    ["TikTok", R.tiktok, "i-tiktok"],
  ].filter(([, url]) => url);
  $$("[data-social]").forEach((ul) => {
    ul.innerHTML = redes.map(([n, url, ico]) => `<li><a href="${url}" target="_blank" rel="noopener" aria-label="Te Resuelvo en ${n}"><svg aria-hidden="true"><use href="#${ico}"/></svg></a></li>`).join("");
  });
  const follow = $("#final-follow"); if (follow) follow.hidden = !redes.length;
  const waBtn = $("#wa-float");
  if (waBtn && waUrl) {
    waBtn.href = waUrl; waBtn.hidden = false;
    // Se oculta sobre los formularios para no tapar los botones de envío
    const forms = document.getElementById("contacto");
    new IntersectionObserver(([e]) => waBtn.classList.toggle("is-away", e.isIntersecting), { threshold: 0.25 }).observe(forms);
  }
  const legal = [];
  if (CFG.legal.terminos) legal.push(`<a href="${CFG.legal.terminos}">Términos y condiciones</a>`);
  if (CFG.legal.privacidad) legal.push(`<a href="${CFG.legal.privacidad}">Política de privacidad</a>`);
  $("#footer-legal").innerHTML = legal.join(" · ");
  const stores = $("#stores");
  if (CFG.apps.android) stores.insertAdjacentHTML("beforeend", `<a class="btn btn-outline btn-sm" href="${CFG.apps.android}" target="_blank" rel="noopener">Descargar en Google Play</a>`);
  if (CFG.apps.ios) stores.insertAdjacentHTML("beforeend", `<a class="btn btn-outline btn-sm" href="${CFG.apps.ios}" target="_blank" rel="noopener">Descargar en App Store</a>`);
  stores.hidden = !stores.children.length;

  /* ---------- Encabezado y menú móvil ---------- */
  const header = $("#header"), burger = $("#burger"), menu = $("#menu-movil");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.documentElement.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); burger.focus(); } });
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Enlace activo según la sección visible
  const navLinks = $$(".nav a");
  const secIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["inicio", "servicios", "como-funciona", "trabajadores", "contacto"].forEach((id) => { const s = document.getElementById(id); if (s) secIO.observe(s); });

  /* ---------- Subtítulos: separar palabras conservando las destacadas ---------- */
  function splitWords(el) {
    let i = 0;
    const walk = (node) => [...node.childNodes].forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement("span");
          w.className = "w"; w.style.setProperty("--i", i++); w.textContent = part;
          frag.appendChild(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1) walk(ch);
    });
    walk(el);
    return i;
  }
  const playSubs = (el) => {
    if (el.classList.contains("in")) return;
    el.classList.add("in");
    const n = +el.dataset.words || 0;
    setTimeout(() => el.classList.add("lit"), reduce ? 0 : n * 75 + 450);
  };
  $$("[data-subs]").forEach((el) => { el.dataset.words = splitWords(el); });

  /* ---------- Revelados al hacer scroll ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    if (e.target.hasAttribute("data-subs")) playSubs(e.target); else e.target.classList.add("in");
    io.unobserve(e.target);
  }), { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
  $$("[data-subs]:not([data-subs-now]), .reveal").forEach((el) => io.observe(el));
  // Título principal: entra al cargar
  $$("[data-subs-now]").forEach((el) => setTimeout(() => playSubs(el), reduce ? 0 : 150));

  /* ---------- Reel de subtítulos sobre la foto principal ---------- */
  const reel = $("[data-reel]");
  if (reel) {
    const lines = $$(".reel-line", reel);
    lines.forEach(splitWords);
    if (!reduce) {
      let k = -1, timer = null, visible = true;
      const step = () => {
        lines.forEach((l) => l.classList.remove("is-on", "is-lit"));
        k = (k + 1) % lines.length;
        const line = lines[k];
        line.classList.add("is-on");
        const n = $$(".w", line).length;
        setTimeout(() => line.classList.add("is-lit"), n * 110 + 250);
      };
      const start = () => { if (!timer && visible && !document.hidden) { step(); timer = setInterval(step, 2300); } };
      const stop = () => { clearInterval(timer); timer = null; };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(reel);
      document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
      setTimeout(start, 1200);
    }
  }

  /* ---------- Cómo funciona: pasos sincronizados con el teléfono ---------- */
  const steps = $$(".step"), screens = $$(".scr");
  const setStep = (n) => {
    steps.forEach((s) => s.classList.toggle("is-on", +s.dataset.step === n));
    screens.forEach((s) => s.classList.toggle("is-on", +s.dataset.scr === n));
  };
  if (steps.length) {
    setStep(0);
    const stepIO = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setStep(+e.target.dataset.step); }), { rootMargin: "-48% 0px -48% 0px" });
    steps.forEach((s) => stepIO.observe(s));
    steps.forEach((s) => s.addEventListener("click", () => setStep(+s.dataset.step)));
    // En celulares el teléfono queda debajo de los pasos: avanza solo mientras se ve
    const phone = $(".phone-como");
    if (phone && !reduce) {
      let auto = null, cur = 0;
      new IntersectionObserver(([e]) => {
        const small = window.innerWidth < 960;
        if (e.isIntersecting && small) { auto = setInterval(() => { cur = (cur + 1) % 4; setStep(cur); }, 2400); }
        else { clearInterval(auto); auto = null; }
      }, { threshold: 0.6 }).observe(phone);
    }
  }

  /* ---------- Pestañas de formularios ---------- */
  const tabs = $$(".tab");
  const showTab = (name, focus) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById("panel-" + t.dataset.tab).hidden = !on;
      if (on && focus) t.focus();
    });
  };
  tabs.forEach((t) => {
    t.addEventListener("click", () => showTab(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const i = tabs.indexOf(t), next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      showTab(next.dataset.tab, true);
    });
  });

  // Botones que llevan al formulario (y preseleccionan servicio o problema)
  const goForm = (tab, cat, detalle) => {
    showTab(tab);
    if (tab === "solicitud" && cat) {
      const r = $(`#form-solicitud input[name="servicio"][value="${cat}"]`);
      if (r) { r.checked = true; clearErr(r.closest(".field")); }
    }
    const ta = $("#s-detalle");
    if (detalle && ta && !ta.value.trim()) ta.value = detalle + ". ";
    const target = document.getElementById("contacto");
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const focusEl = tab === "solicitud" ? (detalle ? ta : $("#form-solicitud input[name=servicio]:checked") || $("#form-solicitud input[name=servicio]")) : $("#form-trabajador input[name=oficios]");
    setTimeout(() => focusEl && focusEl.focus({ preventScroll: true }), reduce ? 0 : 650);
  };
  $$("[data-form-open]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); setMenu(false); goForm(a.dataset.formOpen, a.dataset.cat); }));
  $$(".chips button").forEach((b) => b.addEventListener("click", () => goForm("solicitud", b.dataset.cat, b.dataset.detalle)));
  // Tarjetas de los 11 servicios
  $$(".svc-card").forEach((b) => b.addEventListener("click", () => goForm("solicitud", b.dataset.cat)));
  $$(".svc-grid").forEach((g) => { $$("li", g).forEach((li, i) => li.style.setProperty("--n", i)); io.observe(g); });

  /* ---------- Fotos adjuntas (máximo 3, 5 MB cada una) ---------- */
  const fileInput = $("#s-fotos"), previews = $("#s-previews");
  let fotos = [];
  const renderFotos = () => {
    previews.innerHTML = "";
    fotos.forEach((f, idx) => {
      const fig = document.createElement("figure");
      const img = document.createElement("img"); img.alt = "Foto adjunta " + (idx + 1); img.src = URL.createObjectURL(f);
      const del = document.createElement("button"); del.type = "button"; del.textContent = "×"; del.setAttribute("aria-label", "Quitar foto " + (idx + 1));
      del.addEventListener("click", () => { fotos.splice(idx, 1); renderFotos(); });
      fig.append(img, del); previews.appendChild(fig);
    });
  };
  if (fileInput) fileInput.addEventListener("change", () => {
    const field = fileInput.closest(".field");
    const nuevas = [...fileInput.files].filter((f) => f.type.startsWith("image/"));
    const malas = nuevas.filter((f) => f.size > 5 * 1024 * 1024);
    const todas = fotos.concat(nuevas.filter((f) => f.size <= 5 * 1024 * 1024));
    fotos = todas.slice(0, 3);
    field.classList.toggle("bad", malas.length > 0 || todas.length > 3);
    fileInput.value = "";
    renderFotos();
  });

  /* ---------- Validación ---------- */
  const digits = (v) => v.replace(/\D/g, "");
  function clearErr(field) { if (field) field.classList.remove("bad"); }
  function validate(form) {
    let first = null;
    const bad = (el) => { const f = el.closest(".field"); f.classList.add("bad"); if (!first) first = el; };
    $$(".field", form).forEach(clearErr);
    const radios = $$("input[name=servicio]", form);
    if (radios.length && !radios.some((r) => r.checked)) bad(radios[0]);
    const checks = $$("input[name=oficios]", form);
    if (checks.length && !checks.some((c) => c.checked)) bad(checks[0]);
    $$("input[required]:not([type=radio]), textarea[required]", form).forEach((el) => {
      const v = el.value.trim();
      if (!v) return bad(el);
      if (el.type === "tel" && digits(v).length < 8) return bad(el);
      if (el.minLength > 0 && v.length < el.minLength) return bad(el);
    });
    if (first) first.focus();
    return !first;
  }
  $$(".form").forEach((form) => {
    form.addEventListener("input", (e) => clearErr(e.target.closest(".field")));
    form.addEventListener("change", (e) => clearErr(e.target.closest(".field")));
  });

  /* ---------- Envío ---------- */
  // Arma el mensaje de WhatsApp con los datos del formulario (se usa mientras no haya endpoint)
  const val = (form, name) => {
    const els = $$(`[name="${name}"]`, form);
    if (!els.length) return "";
    if (els[0].type === "radio" || els[0].type === "checkbox") return els.filter((el) => el.checked).map((el) => el.value).join(", ");
    return els[0].value.trim();
  };
  const waMensaje = (form, key) => {
    const filas = key === "solicitud"
      ? [["Servicio", "servicio"], ["Problema", "detalle"], ["Ciudad y zona", "zona"], ["Precio que propongo (Bs)", "presupuesto"], ["Para cuándo", "cuando"], ["Nombre", "nombre"], ["Celular", "telefono"]]
      : [["Oficios", "oficios"], ["Nombre", "nombre"], ["Celular", "telefono"], ["Zonas donde trabajo", "zona"], ["Experiencia", "experiencia"], ["Sobre mi trabajo", "mensaje"]];
    const lineas = filas.map(([t, n]) => [t, val(form, n)]).filter(([, v]) => v).map(([t, v]) => `*${t}:* ${v}`);
    const inicio = key === "solicitud" ? "Hola Te Resuelvo, quiero solicitar un servicio." : "Hola Te Resuelvo, quiero trabajar como técnico en la app.";
    let txt = inicio + "\n\n" + lineas.join("\n");
    if (key === "solicitud" && fotos.length) txt += `\n\nTengo ${fotos.length} foto${fotos.length > 1 ? "s" : ""} del problema; las envío en este chat.`;
    return txt;
  };
  // Mientras el formulario no tenga endpoint, se avisa que se enviará por WhatsApp
  $$(".form").forEach((form) => {
    if (!(CFG.endpoints || {})[form.dataset.endpoint] && wa) {
      const note = $(".form-note", form);
      if (note) note.insertAdjacentHTML("afterbegin", "<b>Se enviará por WhatsApp.</b> ");
    }
  });

  $$(".form").forEach((form) => form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $(".form-status", form), btn = $("button[type=submit]", form);
    status.className = "form-status full"; status.textContent = "";
    if (!validate(form)) return;

    const key = form.dataset.endpoint, url = (CFG.endpoints || {})[key];
    if (!url && wa) {
      // Sin backend: se abre WhatsApp con la solicitud escrita; el envío lo confirma la persona en WhatsApp
      const link = `https://wa.me/${wa}?text=${encodeURIComponent(waMensaje(form, key))}`;
      window.open(link, "_blank", "noopener");
      status.classList.add("warn");
      status.innerHTML = "<b>Abrimos WhatsApp con tus datos ya escritos.</b> Toca <b>Enviar</b> en WhatsApp para que recibamos tu " + (key === "solicitud" ? "solicitud" : "registro") + "."
        + (key === "solicitud" && fotos.length ? " Luego adjunta tus fotos en el mismo chat." : "")
        + ` <a class="wa-link" href="${link}" target="_blank" rel="noopener">Si no se abrió, toca aquí para abrir WhatsApp</a>.`;
      return;
    }
    if (!url) {
      // Sin backend ni WhatsApp: no se simula ningún envío
      status.classList.add("warn");
      status.innerHTML = "<b>Este formulario todavía no está conectado.</b> Tus datos <b>no se enviaron</b>. Estamos terminando de habilitarlo; vuelve a intentarlo pronto.";
      return;
    }

    const data = new FormData(form);
    data.delete("fotos");
    if (key === "solicitud") fotos.forEach((f, i) => data.append("fotos", f, f.name || "foto-" + (i + 1) + ".jpg"));
    if (key === "trabajador") { data.delete("oficios"); data.append("oficios", $$("input[name=oficios]:checked", form).map((c) => c.value).join(", ")); }
    data.append("origen", "web");

    btn.setAttribute("aria-busy", "true");
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(url, { method: "POST", body: data, headers: { Accept: "application/json" }, signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      status.classList.add("ok");
      status.innerHTML = key === "solicitud"
        ? "<b>¡Recibimos tu solicitud!</b> Te contactaremos por el número que nos dejaste."
        : "<b>¡Recibimos tus datos!</b> Te contactaremos para verificar tu perfil.";
      form.reset(); fotos = []; renderFotos && renderFotos();
    } catch (err) {
      status.classList.add("fail");
      status.innerHTML = "<b>No pudimos enviar el formulario.</b> Revisa tu conexión e inténtalo de nuevo. Tus datos siguen escritos.";
    } finally { clearTimeout(t); btn.removeAttribute("aria-busy"); }
  }));
})();
