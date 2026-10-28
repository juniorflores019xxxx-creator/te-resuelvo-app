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

  /* ---------- Estadísticas (Umami, sin cookies; se activa con analitica.umami en config.js) ---------- */
  const AN = CFG.analitica || {};
  if (AN.umami) {
    const s = document.createElement("script");
    s.defer = true; s.src = AN.script || "https://cloud.umami.is/script.js";
    s.dataset.websiteId = AN.umami;
    if (AN.dominios) s.dataset.domains = AN.dominios;
    document.head.appendChild(s);
  }
  // Cuenta una acción (nunca datos personales); si las estadísticas no están activas, no hace nada
  const medir = (evento, datos) => { try { if (window.umami) window.umami.track(evento, datos); } catch (e) { /* sin estadísticas */ } };

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
    waBtn.addEventListener("click", () => medir("boton-whatsapp"));
    // Se oculta sobre los botones de la portada, el recorrido y los formularios, para no tapar las acciones principales
    const tapa = new Set();
    const vigilar = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? tapa.add(e.target) : tapa.delete(e.target))); waBtn.classList.toggle("is-away", tapa.size > 0); });
    [document.getElementById("contacto")].concat($$(".hero-ctas, .recorrido-pasos")).forEach((el) => el && vigilar.observe(el));
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
  // Si la pantalla pasa a escritorio con el menú abierto, se cierra para no dejar bloqueado el scroll
  window.matchMedia("(min-width: 1000px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
  // Al llegar con un ancla (p. ej. desde /app → #contacto) se salta directo, sin animar el recorrido de toda la página
  const ancla = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (ancla) {
    document.documentElement.style.scrollBehavior = "auto";
    ancla.scrollIntoView();
    window.addEventListener("load", () => { ancla.scrollIntoView(); document.documentElement.style.scrollBehavior = ""; }, { once: true });
  }
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
          // Signos sueltos («¿», «.», «?») van en línea (clase p) para que no se separen de su palabra
          w.className = /^[^\p{L}\p{N}]+$/u.test(part) ? "w p" : "w"; w.style.setProperty("--i", i++); w.textContent = part;
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
  let actual = 0;
  const setStep = (n) => {
    actual = n;
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
      let auto = null;
      new IntersectionObserver(([e]) => {
        const small = window.innerWidth < 960;
        if (e.isIntersecting && small) { auto = setInterval(() => setStep((actual + 1) % 4), 2400); }
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

  // Botones que llevan al pre-registro (y marcan el servicio de interés)
  const goForm = (tab, cat) => {
    showTab(tab);
    if (tab === "usuario" && cat) {
      const c = $(`#form-usuario input[name="intereses"][value="${cat}"]`);
      if (c) c.checked = true;
    }
    document.getElementById("contacto").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const focusEl = $("#form-" + tab + " input");
    setTimeout(() => focusEl && focusEl.focus({ preventScroll: true }), reduce ? 0 : 650);
  };
  $$("[data-form-open]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); setMenu(false); medir("ir-a-pre-registro", { tipo: a.dataset.formOpen }); goForm(a.dataset.formOpen, a.dataset.cat); }));
  $$(".chips button, .svc-card").forEach((b) => b.addEventListener("click", () => medir("servicio-tocado", { servicio: b.dataset.cat })));
  // Departamentos del pre-registro: abre el formulario con el departamento ya escrito en «Ciudad y zona»
  $$("[data-depto]").forEach((b) => b.addEventListener("click", () => {
    medir("departamento-tocado", { departamento: b.dataset.depto });
    goForm("usuario");
    const zona = $("#u-zona");
    if (zona && !zona.value.trim()) zona.value = b.dataset.depto + ", ";
    else if (zona) zona.value = b.dataset.depto + ", " + zona.value.replace(/^[^,]*,\s*/, "");
  }));
  $$(".chips button").forEach((b) => b.addEventListener("click", () => goForm("usuario", b.dataset.cat)));
  // Tarjetas de los 11 servicios
  $$(".svc-card").forEach((b) => b.addEventListener("click", () => goForm("usuario", b.dataset.cat)));
  $$(".svc-grid").forEach((g) => { $$("li", g).forEach((li, i) => li.style.setProperty("--n", i)); io.observe(g); });

  /* ---------- Validación ---------- */
  const digits = (v) => v.replace(/\D/g, "");
  // Cada error se enlaza a su campo (aria-describedby) solo mientras está visible, para que el lector de pantalla lo lea
  $$(".form").forEach((form) => $$(".err[data-err]", form).forEach((p) => { p.id = form.id + "-err-" + p.dataset.err; }));
  const marcar = (field, on) => {
    const err = $(".err", field);
    $$("input, textarea, select", field).forEach((c) => {
      const ids = (c.getAttribute("aria-describedby") || "").split(" ").filter((x) => x && (!err || x !== err.id));
      if (on) { c.setAttribute("aria-invalid", "true"); if (err) ids.push(err.id); } else c.removeAttribute("aria-invalid");
      if (ids.length) c.setAttribute("aria-describedby", ids.join(" ")); else c.removeAttribute("aria-describedby");
    });
  };
  function clearErr(field) { if (field) { field.classList.remove("bad"); marcar(field, false); } }
  function validate(form) {
    let first = null;
    // El foco va al primer error según el orden de la página
    const bad = (el) => {
      const f = el.closest(".field"); f.classList.add("bad"); marcar(f, true);
      if (!first || first.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) first = el;
    };
    $$(".field", form).forEach(clearErr);
    // Grupos obligatorios (oficios, disponibilidad): al menos una opción marcada
    $$("fieldset[data-requerido]", form).forEach((fs) => { const ops = $$("input", fs); if (!ops.some((o) => o.checked)) bad(ops[0]); });
    $$("input[required]:not([type=radio]):not([type=checkbox]), textarea[required]", form).forEach((el) => {
      const v = el.value.trim();
      if (!v) return bad(el);
      if (el.type === "tel" && digits(v).length < 8) return bad(el);
      if (el.minLength > 0 && v.length < el.minLength) return bad(el);
    });
    $$("input[type=checkbox][required]", form).forEach((c) => { if (!c.checked) bad(c); });
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
  const FILAS = {
    usuario: [["Nombre", "nombre"], ["Celular", "telefono"], ["Ciudad y zona", "zona"], ["Servicios que me interesan", "intereses"]],
    trabajador: [["Oficios", "oficios"], ["Nombre", "nombre"], ["Celular", "telefono"], ["Zonas donde trabajo", "zona"], ["Experiencia", "experiencia"], ["Herramientas propias", "herramientas"], ["Disponibilidad", "disponibilidad"], ["Sobre mi trabajo", "mensaje"]],
  };
  const waMensaje = (form, key) => {
    const lineas = FILAS[key].map(([t, n]) => [t, val(form, n)]).filter(([, v]) => v).map(([t, v]) => `*${t}:* ${v}`);
    const inicio = key === "usuario"
      ? "Hola Te Resuelvo, quiero pre-registrarme para usar la app. Avísenme cuando esté lista."
      : "Hola Te Resuelvo, quiero pre-registrarme como técnico. Avísenme cuando pueda registrarme en la app.";
    return inicio + "\n\n" + lineas.join("\n") + "\n\nAcepto que me escriban por WhatsApp para avisarme del lanzamiento.";
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
    // Para las estadísticas solo se cuentan los servicios u oficios marcados, nunca nombre, teléfono ni zona
    const resumen = key === "usuario"
      ? { intereses: val(form, "intereses") || "ninguno" }
      : { oficios: val(form, "oficios"), disponibilidad: val(form, "disponibilidad") };
    if (!url && wa) {
      medir("pre-registro-" + key, resumen);
      // Sin backend: se abre WhatsApp con el pre-registro escrito; el envío lo confirma la persona en WhatsApp
      const link = `https://wa.me/${wa}?text=${encodeURIComponent(waMensaje(form, key))}`;
      window.open(link, "_blank", "noopener");
      status.classList.add("warn");
      status.innerHTML = "<b>Abrimos WhatsApp con tus datos ya escritos.</b> Toca <b>Enviar</b> en WhatsApp para completar tu pre-registro. Te escribiremos por ese mismo chat cuando la app esté lista."
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
    // Las casillas múltiples viajan como un solo texto separado por comas
    ["intereses", "oficios", "disponibilidad"].forEach((n) => { if (data.has(n)) { const v = val(form, n); data.delete(n); data.append(n, v); } });
    data.append("origen", "web");

    btn.setAttribute("aria-busy", "true");
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(url, { method: "POST", body: data, headers: { Accept: "application/json" }, signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      status.classList.add("ok");
      status.innerHTML = key === "usuario"
        ? "<b>¡Listo, ya estás pre-registrado!</b> Te avisaremos por WhatsApp cuando la app esté lista."
        : "<b>¡Recibimos tus datos!</b> Te escribiremos por WhatsApp cuando puedas completar tu registro en la app.";
      medir("pre-registro-" + key, resumen);
      form.reset();
    } catch (err) {
      status.classList.add("fail");
      status.innerHTML = "<b>No pudimos enviar el formulario.</b> Revisa tu conexión e inténtalo de nuevo. Tus datos siguen escritos.";
    } finally { clearTimeout(t); btn.removeAttribute("aria-busy"); }
  }));
})();
