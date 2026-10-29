/* =========================================================
   TE RESUELVO · Recorrido de los 11 servicios en carrusel
   Escena fija mientras se baja: a la derecha (65 %) un carrusel
   con una tarjeta por oficio; al bajar se desliza hacia un lado y
   al subir hacia el otro. Cada tarjeta tiene una foto grande y otra
   superpuesta en un recuadro, que se mueven a distinta velocidad
   que la tarjeta (parallax). A la izquierda, el texto del oficio:
   el nombre entra letra por letra. El mouse inclina el carrusel.
   Sin JavaScript o con «reducir movimiento» queda como una lista.
   ========================================================= */
(function () {
  "use strict";
  const sec = document.querySelector(".recorrido");
  if (!sec) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const pista = sec.querySelector(".recorrido-pista");
  const escena = sec.querySelector(".recorrido-escena");
  const marco = sec.querySelector(".recorrido-marco");
  const pasos = [...sec.querySelectorAll(".paso")];
  const indice = [...sec.querySelectorAll(".recorrido-indice button")];
  const contador = sec.querySelector(".recorrido-contador");
  const N = pasos.length;
  const intro = pasos[0].classList.contains("paso-intro") ? 1 : 0;
  const movil = () => window.matchMedia("(max-width: 759px)").matches;

  /* ---------- Carrusel: una tarjeta por oficio ---------- */
  const lienzo = marco.querySelector("canvas");
  if (lienzo) lienzo.remove();
  const riel = document.createElement("div");
  riel.className = "carrusel";
  riel.setAttribute("aria-hidden", "true");
  const tarjetas = pasos.map((p) => {
    const fotos = (p.dataset.fotos || p.dataset.foto || "").split(",").filter(Boolean)
      .map((src) => (movil() ? src.replace("-1600", "-900").replace("-2000", "-1000") : src));
    const t = document.createElement("div");
    t.className = "tarjeta" + (fotos.length > 1 ? "" : " tarjeta-una");
    t.innerHTML = `<div class="tarjeta-fondo"><img src="${fotos[0]}" alt="" decoding="async"></div>` +
      (fotos[1] ? `<div class="tarjeta-recuadro"><img src="${fotos[1]}" alt="" decoding="async"></div>` : "") +
      (p.dataset.cat ? `<p class="tarjeta-nombre">${p.dataset.cat}</p>` : "");
    riel.appendChild(t);
    t._fondo = t.querySelector(".tarjeta-fondo img");
    t._recuadro = t.querySelector(".tarjeta-recuadro");
    return t;
  });
  marco.appendChild(riel);
  // Las fotos lejanas se cargan recién al acercarse
  tarjetas.forEach((t, k) => { if (k > 2) t.querySelectorAll("img").forEach((im) => { im.loading = "lazy"; }); });

  sec.classList.add("recorrido-vivo", "recorrido-carrusel");
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
  });

  const lim = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const suave = (x) => x * x * (3 - 2 * x);

  /* ---------- Posición según el scroll ---------- */
  const T = 0.45; // parte de cada tramo en la que el carrusel se mueve
  let pistaTop = 0, tramo = 1;
  function medir() {
    const r = pista.getBoundingClientRect();
    pistaTop = r.top + window.scrollY;
    tramo = Math.max(1, (pista.offsetHeight - window.innerHeight) / N);
  }
  function textos(s) {
    pasos.forEach((p, j) => {
      const u = s - j;
      const ent = j === 0 ? 1 : lim((u + T * 0.45) / (T * 0.55));
      const sal = j === N - 1 ? 0 : lim((u - (1 - T)) / (T * 0.5));
      const visible = ent > 0 && sal < 1;
      p.classList.toggle("is-on", visible && ent > 0.5 && sal < 0.5);
      p.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;
      p.style.opacity = (suave(lim(ent / 0.35)) * (1 - suave(lim((sal - 0.3) / 0.6)))).toFixed(3);
      // Parallax del texto: sube un poco mientras el oficio está en pantalla
      p.style.translate = `0 ${((0.5 - lim(u + 0.5)) * 50).toFixed(1)}px`;
      const n = p._letras.length;
      p._letras.forEach((l, k) => {
        const d = (k / Math.max(1, n - 1)) * 0.45;
        const a = suave(lim((ent - d) / 0.55)), b = suave(lim((sal - d * 0.6) / 0.6));
        l.style.transform = `translate3d(${(1 - a) * 0.9 - b * 1.1}em,${(1 - a) * 0.15}em,0) rotateY(${(1 - a) * -75 + b * 65}deg)`;
        l.style.opacity = Math.min(a, 1 - b);
      });
      const blq = suave(lim((ent - (n ? 0.35 : 0)) / (n ? 0.65 : 1))) * (1 - suave(sal));
      p._resto.forEach((el, k) => { el.style.opacity = blq; el.style.transform = `translate3d(0,${(1 - blq) * (18 + k * 8)}px,0)`; });
    });
  }

  /* ---------- Inclinación con el mouse ---------- */
  let rx = 0, ry = 0, mx = 0, my = 0;
  escena.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = escena.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2; my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });
  escena.addEventListener("pointerleave", () => { mx = 0; my = 0; });

  /* ---------- Cuadro a cuadro ---------- */
  let activo = false, raf = 0, ultimoS = -1;
  function cuadro() {
    raf = requestAnimationFrame(cuadro);
    const sRaw = lim((window.scrollY - pistaTop) / tramo, 0, N - 0.0001);
    const i = Math.floor(sRaw), t = sRaw - i;
    // Se queda un rato en cada tarjeta y después se desliza a la siguiente
    const pos = i + (i < N - 1 ? suave(lim((t - (1 - T)) / T)) : 0);

    rx += (my * -4 - rx) * 0.08; ry += (mx * 6 - ry) * 0.08;
    marco.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    const ancho = tarjetas[0].offsetWidth, paso = ancho + parseFloat(getComputedStyle(riel).columnGap || 0);
    riel.style.transform = `translate3d(${(-pos * paso).toFixed(1)}px,0,0)`;
    tarjetas.forEach((c, k) => {
      const d = k - pos, a = Math.abs(d);
      if (a > 2.2) { c.style.visibility = "hidden"; return; }
      c.style.visibility = "visible";
      // La tarjeta del centro, entera; las vecinas, más chicas y apagadas
      c.style.transform = `scale(${(1 - Math.min(a, 1) * 0.14).toFixed(3)})`;
      c.style.setProperty("--apagar", Math.min(a, 1) * 0.55);
      // Parallax dentro de la tarjeta: el fondo va más lento y el recuadro más rápido
      if (c._fondo) c._fondo.style.transform = `translate3d(${(d * 18 - mx * 2).toFixed(2)}%,${(-my * 2).toFixed(2)}%,0) scale(1.22)`;
      if (c._recuadro) c._recuadro.style.transform = `translate3d(${(-d * 60 - mx * 14).toFixed(1)}px,${(-my * 12).toFixed(1)}px,0)`;
    });

    if (Math.abs(sRaw - ultimoS) > 0.0005) {
      textos(pos); ultimoS = sRaw;
      const j = Math.round(pos);
      indice.forEach((b, k) => b.classList.toggle("is-on", k + intro === j));
      if (contador) { contador.textContent = j >= intro ? `${j - intro + 1} / ${N - intro}` : ""; contador.hidden = j < intro; }
    }
  }
  function encender(si) {
    if (si === activo) return;
    activo = si;
    if (si) { medir(); raf = requestAnimationFrame(cuadro); } else cancelAnimationFrame(raf);
  }
  new IntersectionObserver(([e]) => encender(e.isIntersecting), { rootMargin: "400px 0px" }).observe(pista);
  window.addEventListener("resize", () => { medir(); ultimoS = -1; });
  window.addEventListener("load", () => { medir(); ultimoS = -1; });

  const irA = (j, suaveScroll) => window.scrollTo({ top: pistaTop + (j + 0.05) * tramo, behavior: suaveScroll ? "smooth" : "auto" });
  indice.forEach((b, k) => b.addEventListener("click", () => { medir(); irA(k + intro, true); }));
  pasos.forEach((p, j) => p.addEventListener("focusin", () => { medir(); const s = (window.scrollY - pistaTop) / tramo; if (Math.floor(s) !== j) irA(j, false); }));

  medir(); textos(0);
  if (contador) contador.hidden = !!intro;
})();
