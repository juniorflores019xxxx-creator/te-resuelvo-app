/* =========================================================
   TE RESUELVO · Demo «dentro de la app» (GSAP + ScrollTrigger)
   1. La portada queda fija; al bajar, el texto se aparta y el
      celular pasa al centro y crece: entramos a la app.
   2. Cada servicio se abre girando como la cara de un cubo 3D
      (inicio → Electricidad → Plomería → … → Fumigación).
   3. Al final la escena se desvanece y aparece el pre-registro.
   ========================================================= */
(function () {
  "use strict";
  const viaje = document.querySelector(".viaje");
  if (!viaje) return;
  const gsap = window.gsap, ST = window.ScrollTrigger;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || !ST || reduce) { viaje.classList.add("viaje-estatico"); return; }
  gsap.registerPlugin(ST);
  viaje.classList.add("viaje-vivo");

  const $ = (s, el = document) => el.querySelector(s);
  const app = $(".app", viaje), pantalla = $(".app-pantalla", viaje);
  const caras = [...viaje.querySelectorAll(".cara")];
  const copia = $(".hero-copy", viaje), velo = $(".viaje-velo", viaje), foto = $(".hero-photo", viaje);
  const rotulo = $(".viaje-rotulo", viaje), rNum = $(".viaje-num", viaje), rNombre = $(".viaje-nombre", viaje);
  const N = caras.length;            // inicio + 11 servicios
  const U = 1 + (N - 1) + 1.2;       // entrada + giros + desvanecimiento
  const lim = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const suave = (x) => x * x * (3 - 2 * x);
  const escritorio = () => window.matchMedia("(min-width: 960px)").matches;

  // Dónde empieza el celular: a la derecha del texto (computadora) o arriba a la derecha (celular)
  function inicio() {
    if (escritorio()) return { x: window.innerWidth * 0.27, y: window.innerHeight * 0.02, s: 0.86, r: 7 };
    return { x: window.innerWidth * 0.24, y: -window.innerHeight * 0.26, s: 0.42, r: 7 };
  }

  let actual = -1;
  function pintar(P) {
    const u = P * U;
    // 1. Entrada: el texto se aparta, la mesa se oscurece y el celular viene al centro
    const a = suave(lim(u));
    const o = inicio();
    gsap.set(copia, { autoAlpha: 1 - a, x: -80 * a });
    gsap.set(velo, { opacity: 0.25 + 0.5 * a });
    gsap.set(foto, { scale: 1 + 0.08 * a });
    const final = suave(lim(u - (U - 1.2), 0, 1));
    gsap.set(app, { x: o.x * (1 - a), y: o.y * (1 - a), scale: o.s + (1 - o.s) * a + final * 0.12, rotate: o.r * (1 - a), rotationY: escritorio() ? -14 * (1 - a) : 0 });
    const r2 = suave(lim((u - 0.75) / 0.3));
    if (rotulo) gsap.set(rotulo, { autoAlpha: escritorio() ? r2 * (1 - final) : 0, x: -30 * (1 - r2) });

    // 2. Giros de cubo: cada tramo muestra el servicio y al final gira hacia el siguiente
    const sRaw = lim(u - 1, 0, N - 1);
    const base = Math.floor(sRaw), frac = sRaw - base;
    const s = base + suave(lim((frac - 0.5) / 0.5));
    const D = pantalla.clientWidth / 2;
    caras.forEach((c, k) => {
      const r = k - s;
      if (Math.abs(r) >= 1) { c.style.visibility = "hidden"; return; }
      c.style.visibility = "visible";
      c.style.transform = `translateZ(${-D}px) rotateY(${(r * 90).toFixed(2)}deg) translateZ(${D}px)`;
      c.style.setProperty("--sombra", (Math.abs(r) * 0.6).toFixed(3));
    });
    const k = Math.round(s);
    if (k !== actual) {
      actual = k;
      caras.forEach((c, i) => c.toggleAttribute("inert", i !== k));
      if (rNombre) {
        rNombre.classList.add("is-cambio");
        setTimeout(() => {
          rNombre.textContent = k === 0 ? "Así se verá la app" : caras[k].dataset.cat;
          rNum.textContent = k === 0 ? "Te Resuelvo" : `${k} / ${N - 1}`;
          rNombre.classList.remove("is-cambio");
        }, 180);
      }
    }

    // 3. Desvanecimiento final hacia el pre-registro
    gsap.set($(".viaje-escena", viaje), { autoAlpha: 1 - final });
  }

  const st = ST.create({
    trigger: viaje, start: "top top", end: () => "+=" + window.innerHeight * U, pin: true, anticipatePin: 1, refreshPriority: 10,
    onUpdate: (self) => pintar(self.progress), onRefresh: (self) => pintar(self.progress),
  });
  pintar(0);
  // Las demás animaciones de la página se calculan después de fijar la portada
  ST.sort(); ST.refresh();

  // El pre-registro aparece con un fundido al salir de la app
  gsap.fromTo("#contacto", { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: "#contacto", start: "top bottom", end: "top 25%", scrub: 0.6 } });

  // Las opciones del inicio de la app llevan a su servicio
  const irA = (k) => window.scrollTo({ top: st.start + ((1 + k + 0.15) / U) * (st.end - st.start), behavior: "smooth" });
  viaje.querySelectorAll("[data-ir]").forEach((b) => b.addEventListener("click", () => irA(+b.dataset.ir)));
  // Con el teclado: al enfocar algo de una pantalla, el recorrido va hasta ella
  caras.forEach((c, k) => c.addEventListener("focusin", () => { if (k !== actual) window.scrollTo({ top: st.start + ((1 + k + 0.15) / U) * (st.end - st.start) }); }));
  window.addEventListener("load", () => ST.refresh());
})();
