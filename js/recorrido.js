/* =========================================================
   TE RESUELVO · Recorrido de los 11 servicios en carrusel
   Escena fija mientras se baja: en el centro, un carrusel 3D que
   gira en círculo; la tarjeta del frente es el oficio actual y, al
   bajar, gira: la del frente se va hacia atrás y la siguiente pasa
   al frente (al subir, al revés). Cada tarjeta tiene una foto
   grande y otra superpuesta en un recuadro, con parallax. A la
   izquierda, el texto del oficio; a la derecha, el índice. El
   mouse inclina el carrusel.
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
  riel.className = "carrusel anillo";
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
  // Luz ambiental: la foto del servicio actual, muy desenfocada, detrás del carrusel
  const ambiente = document.createElement("div");
  ambiente.className = "ambiente"; ambiente.setAttribute("aria-hidden", "true");
  ambiente.innerHTML = "<img alt=''><img alt=''>";
  escena.insertBefore(ambiente, escena.firstChild);
  const luces = [...ambiente.querySelectorAll("img")];
  let luz = 0, luzActual = -1;
  function ponerLuz(j) {
    if (j === luzActual) return;
    luzActual = j; luz = 1 - luz;
    const src = tarjetas[j]._fondo.src;
    luces[luz].src = src.replace("-1600", "-900").replace("-2000", "-1000");
    luces[luz].classList.add("is-on"); luces[1 - luz].classList.remove("is-on");
  }
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
  let pistaTop = 0, tramo = 1;
  function medir() {
    const r = pista.getBoundingClientRect();
    pistaTop = r.top + window.scrollY;
    // Unos 0,4 de tramo de margen: al entrar y al salir la escena queda quieta un momento
    tramo = Math.max(1, (pista.offsetHeight - window.innerHeight) / (N - 0.6));
  }
  function textos(s) {
    pasos.forEach((p, j) => {
      const u = s - j;
      // Cada texto entra y sale junto con su tarjeta (el relevo ocurre a mitad del giro)
      const ent = j === 0 ? 1 : lim((u + 0.42) / 0.3);
      const sal = j === N - 1 ? 0 : lim((u - 0.12) / 0.3);
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
  let activo = false, raf = 0, ultimoS = -1, pos = 0;
  function cuadro() {
    raf = requestAnimationFrame(cuadro);
    // El carrusel gira de forma continua con el scroll, sin pausas, y alcanza
    // la posición con un suavizado para que cada pasito de la rueda se sienta fluido
    const meta = lim((window.scrollY - pistaTop) / tramo - 0.2, 0, N - 1);
    pos += (meta - pos) * 0.12;
    if (Math.abs(meta - pos) < 0.0005) pos = meta;
    const sRaw = pos;

    rx += (my * -4 - rx) * 0.08; ry += (mx * 6 - ry) * 0.08;

    // Anillo: cada tarjeta en su ángulo alrededor de un eje vertical
    const ancho = tarjetas[0].offsetWidth, ang = 36, rad = (ancho / 2) / Math.tan((ang / 2) * Math.PI / 180) * 1.08;
    riel.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateZ(${(ry * 0.15).toFixed(2)}deg) translateZ(${(-rad).toFixed(1)}px) rotateY(${(-pos * ang + ry).toFixed(2)}deg)`;
    tarjetas.forEach((c, k) => {
      const d = k - pos, a = Math.abs(d);
      if (a > 2.6) { c.style.visibility = "hidden"; return; }
      c.style.visibility = "visible";
      c.style.transform = `rotateY(${(k * ang).toFixed(2)}deg) translateZ(${rad.toFixed(1)}px)`;
      c.style.setProperty("--apagar", Math.min(a, 2) * 0.32);
      c.style.zIndex = String(10 - Math.round(a * 3));
      // Parallax dentro de la tarjeta: el fondo va más lento y el recuadro más rápido
      if (c._fondo) c._fondo.style.transform = `translate3d(${(d * 12 - mx * 2).toFixed(2)}%,${(-my * 2).toFixed(2)}%,0) scale(1.22)`;
      if (c._recuadro) c._recuadro.style.transform = `translate3d(${(-d * 40 - mx * 14).toFixed(1)}px,${(-my * 12).toFixed(1)}px,40px)`;
    });

    if (Math.abs(sRaw - ultimoS) > 0.0005) {
      textos(pos); ultimoS = sRaw;
      const j = Math.round(pos);
      ponerLuz(j);
      tarjetas.forEach((c, k) => c.classList.toggle("is-frente", k === j && Math.abs(pos - j) < 0.08));
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

  const irA = (j, suaveScroll) => window.scrollTo({ top: pistaTop + (j + 0.2) * tramo, behavior: suaveScroll ? "smooth" : "auto" });
  indice.forEach((b, k) => b.addEventListener("click", () => { medir(); irA(k + intro, true); }));
  pasos.forEach((p, j) => p.addEventListener("focusin", () => { medir(); const s = (window.scrollY - pistaTop) / tramo - 0.2; if (Math.round(s) !== j) irA(j, false); }));

  medir(); textos(0);
  if (contador) contador.hidden = !!intro;
})();
