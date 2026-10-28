/* =========================================================
   TE RESUELVO · Recorrido de los 11 servicios
   Una escena fija mientras se baja: cada servicio es un panel a
   pantalla completa con sus dos fotos. Al seguir bajando, el
   siguiente entra deslizándose, una vez desde la derecha y otra
   desde abajo, mientras el anterior se corre y se oscurece. Cada
   servicio ocupa poco scroll, para llegar pronto al pre-registro.
   Sin JavaScript o con «reducir movimiento» la sección queda como
   una lista normal con las fotos de cada oficio.
   ========================================================= */
(function () {
  "use strict";
  const sec = document.querySelector(".recorrido");
  if (!sec) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const pista = sec.querySelector(".recorrido-pista");
  const pasos = [...sec.querySelectorAll(".paso")];
  const indice = [...sec.querySelectorAll(".recorrido-indice button")];
  const contador = sec.querySelector(".recorrido-contador");
  const N = pasos.length;
  const intro = pasos[0].classList.contains("paso-intro") ? 1 : 0;
  sec.classList.add("recorrido-vivo");
  pista.style.setProperty("--n", N);

  /* ---------- Letras del nombre, una por una (el título de entrada se mueve entero) ---------- */
  pasos.forEach((p) => {
    const h = p.querySelector(".paso-nombre");
    p._letras = [];
    if (!p.classList.contains("paso-intro")) {
      const txt = h.textContent.trim();
      h.setAttribute("aria-label", txt);
      h.innerHTML = [...txt].map((c) => `<span class="l" aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");
      p._letras = [...h.querySelectorAll(".l")];
    }
    p._resto = (p._letras.length ? [] : [h]).concat([...p.querySelectorAll(".paso-frase, .paso-texto, .chips, .paso-accion")]);
    p._fotos = p.querySelector(".paso-fotos");
  });

  const lim = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const suave = (x) => x * x * (3 - 2 * x);
  // Cada cambio va en una dirección: derecha, abajo, derecha, abajo…
  const desdeAbajo = (j) => j % 2 === 0;

  /* ---------- Posición según el scroll ---------- */
  let pistaTop = 0, tramo = 1;
  function medir() {
    const r = pista.getBoundingClientRect();
    pistaTop = r.top + window.scrollY;
    tramo = Math.max(1, (pista.offsetHeight - window.innerHeight) / N);
  }

  function pintar() {
    const sRaw = lim((window.scrollY - pistaTop) / tramo, 0, N - 0.0001);
    const base = Math.floor(sRaw), frac = sRaw - base;
    // Cada tramo: primero se queda el servicio y después se desliza el siguiente
    const s = base + suave(lim((frac - 0.35) / 0.65));
    pasos.forEach((p, j) => {
      const r = j - s; // 0 = en pantalla; 1 = esperando; -1 = ya pasó
      if (r >= 1 || r <= -1) { p.style.visibility = "hidden"; p.classList.remove("is-on"); return; }
      p.style.visibility = "visible";
      const abajo = desdeAbajo(r > 0 ? j : j + 1);
      // El que entra viene entero; el que sale se corre menos y se oscurece
      const d = r > 0 ? r * 100 : r * 28;
      p.style.transform = abajo ? `translate3d(0,${d.toFixed(2)}%,0)` : `translate3d(${d.toFixed(2)}%,0,0)`;
      p.style.zIndex = r > 0 ? 2 : 1;
      p.style.setProperty("--sombra", (r < 0 ? -r * 0.6 : 0).toFixed(3));
      if (p._fotos) p._fotos.style.transform = `scale(${(1.06 - 0.06 * (1 - Math.abs(r))).toFixed(4)})`;
      // Textos: entran cuando el panel ya casi llegó y salen apenas empieza a irse
      const ent = j === 0 ? 1 : lim(1 - r * 1.6), sal = lim(-r * 2.2);
      p.classList.toggle("is-on", ent > 0.6 && sal < 0.4);
      const n = p._letras.length;
      p._letras.forEach((l, k) => {
        const dl = (k / Math.max(1, n - 1)) * 0.4;
        const a = suave(lim((ent - dl) / 0.6));
        l.style.transform = `translate3d(${(1 - a) * 0.8}em,0,0)`;
        l.style.opacity = a * (1 - sal);
      });
      const blq = suave(lim((ent - (n ? 0.3 : 0)) / (n ? 0.7 : 1))) * (1 - sal);
      p._resto.forEach((el, k) => { el.style.opacity = blq; el.style.transform = `translate3d(0,${(1 - blq) * (16 + k * 6)}px,0)`; });
    });
    const j = Math.round(s);
    indice.forEach((b, k) => b.classList.toggle("is-on", k + intro === j));
    if (contador) { contador.textContent = j >= intro ? `${j - intro + 1} / ${N - intro}` : ""; contador.hidden = j < intro; }
  }

  let raf = 0;
  const pedir = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pintar(); }); };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", () => { medir(); pintar(); });
  window.addEventListener("load", () => { medir(); pintar(); });

  // Llevar a un servicio: desde el índice del recorrido o desde el celular de la portada
  const irA = (j, suaveScroll = true) => { medir(); window.scrollTo({ top: pistaTop + (j + 0.1) * tramo, behavior: suaveScroll ? "smooth" : "auto" }); };
  indice.forEach((b, k) => b.addEventListener("click", () => irA(k + intro)));
  document.querySelectorAll("[data-ir-servicio]").forEach((b) => b.addEventListener("click", () => {
    const j = pasos.findIndex((p) => p.dataset.cat === b.dataset.irServicio);
    if (j >= 0) irA(j);
    if (window.TR_medir) window.TR_medir("servicio-tocado", { servicio: b.dataset.irServicio, desde: "celular" });
  }));
  pasos.forEach((p, j) => p.addEventListener("focusin", () => { medir(); const s = (window.scrollY - pistaTop) / tramo; if (Math.floor(s) !== j) irA(j, false); }));

  medir(); pintar();
})();
