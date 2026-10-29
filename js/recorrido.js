/* =========================================================
   TE RESUELVO · Recorrido sobre la mesa
   Una escena fija mientras se baja. Empieza con la mesa de
   herramientas de la portada. Cada oficio es una foto grande de
   fondo con otra superpuesta en un recuadro, que se mueven a
   distinta velocidad (parallax) con el scroll y con el mouse. Al
   cambiar de oficio, el actual sube despacio y se oscurece y el
   siguiente entra desde abajo por delante. El nombre entra letra
   por letra y el mouse inclina la escena.
   Sin JavaScript o con «reducir movimiento» la sección queda como
   una lista normal con la imagen de cada oficio.
   ========================================================= */
(function () {
  "use strict";
  const sec = document.querySelector(".recorrido");
  if (!sec) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lienzo = sec.querySelector(".recorrido-lienzo");
  if (reduce || !lienzo || !lienzo.getContext) return;

  const pista = sec.querySelector(".recorrido-pista");
  const escena = sec.querySelector(".recorrido-escena");
  const marco = sec.querySelector(".recorrido-marco");
  const pasos = [...sec.querySelectorAll(".paso")];
  const indice = [...sec.querySelectorAll(".recorrido-indice button")];
  const contador = sec.querySelector(".recorrido-contador");
  const N = pasos.length;
  const intro = pasos[0].classList.contains("paso-intro") ? 1 : 0;
  const ctx = lienzo.getContext("2d", { alpha: false });
  ctx.imageSmoothingQuality = "high";
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
  });

  /* ---------- Fotos: cada oficio tiene una foto grande y otra superpuesta ---------- */
  const movil = () => window.matchMedia("(max-width: 759px)").matches;
  const medios = pasos.map((p) => ({ fotos: (p.dataset.fotos || p.dataset.foto || "").split(",").filter(Boolean), imgs: null, lienzo: null, clave: "" }));
  function preparar(i) {
    const m = medios[i]; if (!m || m.imgs) return;
    m.imgs = m.fotos.map((src) => { const im = new Image(); im.decoding = "async"; im.src = movil() ? src.replace("-1600", "-900").replace("-2000", "-1000") : src; return im; });
  }
  // Recorte «cover» de una foto dentro de un rectángulo
  function cubrir(c, im, x, y, w, h) {
    const k = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / k, sh = h / k;
    c.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  }
  const listo = (m) => m && m.imgs && m.imgs.every((im) => im.complete && im.naturalWidth);

  /* ---------- Escena: foto grande de fondo y la segunda encima, en un recuadro ---------- */
  let W = 0, H = 0, dpr = 1;
  function ajustar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = marco.getBoundingClientRect();
    W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
    lienzo.width = W; lienzo.height = H; ctx.imageSmoothingQuality = "high";
  }
  const lim = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const suave = (x) => x * x * (3 - 2 * x);
  const sale = (x) => 1 - Math.pow(1 - x, 3);

  // Dibuja un oficio con dos capas en parallax.
  //   dy: corrimiento vertical de la escena (en fracción de alto); px, py: mouse (-1..1)
  //   osc: oscurecido (0..1) del oficio que se va
  function oficio(m, dy, px, py, osc, avance) {
    const [a, b] = m.imgs;
    // Fondo: más grande que la pantalla para poder moverse sin dejar bordes
    const z = 1.14, fw = W * z, fh = H * z;
    const fx = (W - fw) / 2 - px * W * 0.025, fy = (H - fh) / 2 - py * H * 0.025 + dy * H * 0.55 + (avance - 0.5) * H * 0.04;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    cubrir(ctx, a, fx, fy, fw, fh);
    // Recuadro: la segunda foto encima, se mueve más (está «más cerca»)
    if (b) {
      const movil = W < H;
      const rw = movil ? W * 0.5 : W * 0.26, rh = rw * (movil ? 1.15 : 0.78);
      const rx = movil ? W - rw - W * 0.06 : W - rw - W * 0.235;
      const ry0 = H * 0.12;
      const rx2 = rx - px * W * 0.06, ry = ry0 - py * H * 0.06 + dy * H * 1.05 - (avance - 0.5) * H * 0.1;
      const borde = 7 * dpr;
      ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = 50 * dpr; ctx.shadowOffsetY = 24 * dpr;
      ctx.fillStyle = "#0d0d0c"; ctx.fillRect(rx2 - borde, ry - borde, rw + borde * 2, rh + borde * 2);
      ctx.shadowColor = "transparent";
      cubrir(ctx, b, rx2, ry, rw, rh);
      ctx.fillStyle = "#F5CD47"; ctx.fillRect(rx2 - borde, ry + rh + borde - 4 * dpr, rw * 0.28, 4 * dpr);
    }
    if (osc > 0) { ctx.fillStyle = `rgba(13,13,12,${osc.toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }

  /* ---------- Posición según el scroll ---------- */
  const T = 0.38; // parte de cada tramo dedicada al cambio
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

  /* ---------- Inclinación 3D de la mesa con el mouse ---------- */
  let rx = 0, ry = 0, mx = 0, my = 0, ox = 0, oy = 0;
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
    const s = lim((window.scrollY - pistaTop) / tramo, 0, N - 0.0001);
    const i = Math.floor(s), t = s - i;
    [i - 1, i, i + 1, i + 2].forEach((k) => k >= 0 && k < N && preparar(k));
    const actual = medios[i], sig = medios[i + 1];

    // La mesa se inclina siguiendo al mouse y se acentúa a mitad del cambio
    const cambio = i < N - 1 ? lim((t - (1 - T)) / T) : 0;
    const arco = Math.sin(cambio * Math.PI);
    rx += (my * -5 + arco * 4 - rx) * 0.09;
    ry += (mx * 8 - ry) * 0.09;
    marco.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(1 - arco * 0.03).toFixed(3)})`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0d0d0c"; ctx.fillRect(0, 0, W, H);
    ox += (mx - ox) * 0.08; oy += (my - oy) * 0.08;
    const c = suave(cambio);
    // El que se va sube despacio y se oscurece; el siguiente entra desde abajo, por delante
    if (listo(actual)) oficio(actual, -c * 0.35, ox, oy, c * 0.75, t);
    if (c > 0 && listo(sig)) {
      const y = Math.round(H * (1 - sale(cambio)));
      ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, H - y); ctx.clip();
      oficio(sig, (1 - sale(cambio)) * 0.45, ox, oy, 0, 0);
      ctx.restore();
      ctx.fillStyle = "#F5CD47"; ctx.fillRect(0, y - 3 * dpr, W, 3 * dpr);
    }

    if (Math.abs(s - ultimoS) > 0.0005) {
      textos(s); ultimoS = s;
      const j = t > 1 - T / 2 && i < N - 1 ? i + 1 : i;
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
  window.addEventListener("resize", () => { ajustar(); medir(); ultimoS = -1; });
  window.addEventListener("load", () => { medir(); ultimoS = -1; });

  const irA = (j, suaveScroll) => window.scrollTo({ top: pistaTop + (j + 0.05) * tramo, behavior: suaveScroll ? "smooth" : "auto" });
  indice.forEach((b, k) => b.addEventListener("click", () => { medir(); irA(k + intro, true); }));
  pasos.forEach((p, j) => p.addEventListener("focusin", () => { medir(); const s = (window.scrollY - pistaTop) / tramo; if (Math.floor(s) !== j) irA(j, false); }));

  // La mesa de entrada queda pintada desde el principio (la portada ya cargó esa foto)
  ajustar(); medir(); textos(0); preparar(0);
  if (contador) contador.hidden = !!intro;
  const pintarMesa = () => { if (!activo && listo(medios[0])) { ctx.fillStyle = "#0d0d0c"; ctx.fillRect(0, 0, W, H); oficio(medios[0], 0, 0, 0, 0, 0.5); } };
  medios[0].imgs.forEach((im) => (im.complete ? pintarMesa() : im.addEventListener("load", pintarMesa)));
})();
