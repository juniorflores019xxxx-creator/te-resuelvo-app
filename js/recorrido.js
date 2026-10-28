/* =========================================================
   TE RESUELVO · Recorrido sobre la mesa
   Una escena fija mientras se baja. Empieza con la mesa de
   herramientas de la portada; al bajar, la imagen se corta en
   piezas que se levantan de la mesa con su sombra, giran en
   perspectiva y caen en su lugar formando el video del siguiente
   oficio. El scroll mueve cada video cuadro a cuadro, el nombre
   entra letra por letra y el mouse inclina la mesa.
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
  const con = navigator.connection || {};
  const ahorro = !!con.saveData || /(^|-)2g$/.test(con.effectiveType || "");

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

  /* ---------- Imágenes y videos (se cargan el actual y los vecinos) ---------- */
  const movil = () => window.matchMedia("(max-width: 759px)").matches;
  const medios = pasos.map((p) => ({ slug: p.dataset.video, foto: p.dataset.foto, v: null, poster: null, listo: false }));
  function preparar(i) {
    const m = medios[i]; if (!m) return;
    if (!m.poster) {
      m.poster = new Image();
      m.poster.src = m.foto ? (movil() ? m.foto.replace("-2000", "-1000") : m.foto) : `img/video/${m.slug}.webp`;
    }
    if (ahorro || m.v || !m.slug) return;
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto";
    v.src = `video/${m.slug}-${movil() ? 720 : 1080}.mp4`;
    // Algunos celulares no muestran cuadros hasta que el video se reprodujo una vez
    v.addEventListener("loadeddata", () => { m.listo = true; const pr = v.play(); if (pr) pr.then(() => v.pause()).catch(() => {}); }, { once: true });
    m.v = v;
  }
  const fuente = (m) => (m && m.listo && m.v.readyState >= 2 ? m.v : m && m.poster && m.poster.complete && m.poster.naturalWidth ? m.poster : null);

  /* ---------- Piezas: cada una con su rumbo, giro y altura ---------- */
  let W = 0, H = 0, COLS = 0, ROWS = 0, piezas = [], SOMBRA = null, dpr = 1;
  function ajustar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = marco.getBoundingClientRect();
    W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
    lienzo.width = W; lienzo.height = H; ctx.imageSmoothingQuality = "high";
    COLS = movil() ? 4 : 8; ROWS = Math.max(3, Math.round(COLS * H / W));
    let s = 29; const az = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    piezas = [];
    for (let r2 = 0; r2 < ROWS; r2++) for (let c = 0; c < COLS; c++) {
      piezas.push({ c, r: r2, jx: az() * 2 - 1, jy: az() * 2 - 1, giro: (az() * 2 - 1) * 0.9, alto: 0.5 + az(), demora: az() * 0.3 });
    }
    // Las piezas que suben más se dibujan al final, encima de las demás
    piezas.sort((a, b) => a.alto - b.alto);
    // Sombra suave pre-dibujada una sola vez; se estira bajo cada pieza
    SOMBRA = document.createElement("canvas"); SOMBRA.width = SOMBRA.height = 128;
    const sc = SOMBRA.getContext("2d"); sc.filter = "blur(14px)"; sc.fillStyle = "rgba(0,0,0,.85)"; sc.fillRect(28, 28, 72, 72);
  }

  function encuadre(f) {
    const fw = f.videoWidth || f.naturalWidth, fh = f.videoHeight || f.naturalHeight;
    const k = Math.max(W / fw, H / fh);
    return { k, ox: (W - fw * k) / 2, oy: (H - fh * k) / 2, fw, fh };
  }
  function entero(f, zoom) {
    const e = encuadre(f), k = e.k * zoom;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(f, (W - e.fw * k) / 2, (H - e.fh * k) / 2, e.fw * k, e.fh * k);
  }
  const lim = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const suave = (x) => x * x * (3 - 2 * x);
  const salidaExp = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

  // salida: 0 → apoyada en la mesa, 1 → la pieza ya se levantó y se fue
  // llegada: 1 → la pieza está en el aire, 0 → cayó en su lugar
  function piezasDe(f, salida, llegada) {
    const e = encuadre(f), tw = W / COLS, th = H / ROWS;
    for (const b of piezas) {
      let p, q, alto, dx, dy, giro, alfa;
      if (salida > 0) {
        p = lim((salida - b.demora * 0.6) / (1 - b.demora * 0.6)); q = suave(p);
        alto = q * b.alto; dx = (b.jx * 0.55 + (b.c / COLS - 0.5) * 0.9) * W * q; dy = (b.jy * 0.4 - 0.25 * q) * H * q;
        giro = b.giro * q; alfa = 1 - Math.pow(p, 3);
      } else {
        p = lim((llegada - (0.3 - b.demora) * 0.6) / (1 - (0.3 - b.demora) * 0.6)); q = 1 - salidaExp(1 - p);
        alto = q * b.alto * 1.2; dx = b.jx * 0.35 * W * q; dy = (b.jy * 0.3 - 0.35 * q) * H * q;
        giro = -b.giro * 1.2 * q; alfa = 1 - Math.pow(p, 2);
      }
      if (alfa <= 0.01) continue;
      const x0 = b.c * tw, y0 = b.r * th, cx = x0 + tw / 2 + dx, cy = y0 + th / 2 + dy;
      const esc = 1 + alto * 0.55;
      // Sombra sobre la mesa: se separa y se agranda cuanto más alta va la pieza
      if (alto > 0.01) {
        ctx.globalAlpha = alfa * Math.min(1, alto * 2) * 0.8;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const sw = tw * (1 + alto * 0.9) * 1.7, sh = th * (1 + alto * 0.9) * 1.7;
        ctx.drawImage(SOMBRA, cx - sw / 2 + alto * 40 * dpr, cy - sh / 2 + alto * 70 * dpr, sw, sh);
      }
      ctx.globalAlpha = alfa;
      const co = Math.cos(giro) * esc, si = Math.sin(giro) * esc;
      ctx.setTransform(co, si, -si, co, cx, cy);
      ctx.drawImage(f, (x0 - e.ox) / e.k, (y0 - e.oy) / e.k, tw / e.k, th / e.k, -tw / 2, -th / 2, tw + 0.5, th + 0.5);
      // Borde de corte apenas visible mientras la pieza está levantada
      if (alto > 0.04) { ctx.globalAlpha = alfa * Math.min(1, alto * 3) * 0.5; ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1 / esc; ctx.strokeRect(-tw / 2, -th / 2, tw, th); }
    }
    ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* ---------- Posición según el scroll ---------- */
  const T = 0.38; // parte de cada tramo dedicada al cambio
  let pistaTop = 0, tramo = 1;
  function medir() {
    const r = pista.getBoundingClientRect();
    pistaTop = r.top + window.scrollY;
    tramo = Math.max(1, (pista.offsetHeight - window.innerHeight) / N);
  }
  // Cada video avanza con el scroll (se usa su tramo central: varios clips empiezan oscuros)
  function mover(m, t) {
    if (!m || !m.listo) return;
    const v = m.v, dur = Math.min(v.duration || 0, 10);
    if (!dur) return;
    const objetivo = (0.15 + lim(t) * 0.7) * dur;
    if (!v.seeking && Math.abs(v.currentTime - objetivo) > 1 / 40) v.currentTime = objetivo;
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
    const s = lim((window.scrollY - pistaTop) / tramo, 0, N - 0.0001);
    const i = Math.floor(s), t = s - i;
    [i - 1, i, i + 1, i + 2].forEach((k) => k >= 0 && k < N && preparar(k));
    const actual = medios[i], sig = medios[i + 1];
    mover(actual, t);
    if (sig && t > 1 - T) mover(sig, 0);

    // La mesa se inclina siguiendo al mouse y se acentúa a mitad del cambio
    const cambio = i < N - 1 ? lim((t - (1 - T)) / T) : 0;
    const arco = Math.sin(cambio * Math.PI);
    rx += (my * -4 + arco * 14 - rx) * 0.09;
    ry += (mx * 6 - ry) * 0.09;
    marco.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(1 - arco * 0.08).toFixed(3)})`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0d0d0c"; ctx.fillRect(0, 0, W, H);
    const fA = fuente(actual), fB = fuente(sig);
    if (cambio <= 0) { if (fA) entero(fA, 1); }
    else {
      if (fB) piezasDe(fB, 0, 1 - cambio);
      if (fA) piezasDe(fA, cambio, 0);
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
  const pintarMesa = () => { if (!activo) { ctx.fillStyle = "#0d0d0c"; ctx.fillRect(0, 0, W, H); entero(medios[0].poster, 1); } };
  if (medios[0].poster.complete && medios[0].poster.naturalWidth) pintarMesa(); else medios[0].poster.addEventListener("load", pintarMesa);
})();
