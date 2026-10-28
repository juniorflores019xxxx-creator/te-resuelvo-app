/* =========================================================
   TE RESUELVO · Movimiento de cine con GSAP + ScrollTrigger
   - Portada en parallax: la mesa baja más lento que el texto.
   - Las imágenes se expanden suavemente al hacer scroll
     (entrada al recorrido, técnico y llamada final).
   - Profundidad en las secciones y cinta de departamentos.
   Si GSAP no carga o la persona pidió «reducir movimiento»,
   la página queda tal cual, sin animaciones.
   ========================================================= */
(function () {
  "use strict";
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);
  const $ = (s) => document.querySelector(s);
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const suave = { ease: "none" };

    /* ---------- Portada: parallax de la mesa y del texto ---------- */
    const hero = $(".hero");
    if (hero) {
      gsap.to(".hero-photo", { yPercent: 14, scale: 1.12, ...suave, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } });
      gsap.to(".hero-copy", { y: -90, autoAlpha: 0.15, ...suave, scrollTrigger: { trigger: hero, start: "35% top", end: "bottom top", scrub: 0.6 } });
      gsap.to(".phone-hero", { y: -140, rotate: 2, ...suave, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 } });
    }

    /* ---------- Entrada al recorrido: la mesa se abre hasta ocupar toda la pantalla ---------- */
    const pista = $(".recorrido-vivo .recorrido-pista");
    if (pista) {
      gsap.fromTo(".recorrido-escena",
        { clipPath: "inset(14% 9% 14% 9% round 6px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ...suave, scrollTrigger: { trigger: pista, start: "top 92%", end: "top top", scrub: 0.6 } });
    }

    /* ---------- Imágenes que se expanden al llegar ---------- */
    const expandir = (marco, img) => {
      const m = $(marco); if (!m) return;
      gsap.fromTo(m, { clipPath: "inset(16% 14% 16% 14% round 4px)" },
        { clipPath: "inset(0% 0% 0% 0% round 2px)", ...suave, scrollTrigger: { trigger: m, start: "top 92%", end: "center 55%", scrub: 0.6 } });
      const i = m.querySelector(img);
      if (i) gsap.fromTo(i, { scale: 1.28, yPercent: -6 }, { scale: 1, yPercent: 4, ...suave, scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    };
    expandir(".workers-photo", "img");
    expandir(".final-media", "img");

    /* ---------- Profundidad en las secciones ---------- */
    gsap.utils.toArray(".como .title-lg, .trust .title-lg, .workers .title-lg, .contacto .title-lg, .final .title-xl").forEach((t) => {
      gsap.fromTo(t, { y: 70 }, { y: -20, ...suave, scrollTrigger: { trigger: t, start: "top bottom", end: "bottom 30%", scrub: 0.8 } });
    });
    const tel = $(".phone-como");
    if (tel && window.matchMedia("(min-width: 960px)").matches === false) {
      gsap.fromTo(tel, { y: 60 }, { y: -40, ...suave, scrollTrigger: { trigger: tel, start: "top bottom", end: "bottom top", scrub: 0.8 } });
    }
    // Filas de confianza: entran una tras otra desde la izquierda
    gsap.utils.toArray(".trust-grid li").forEach((li, k) => {
      gsap.from(li, { x: -40, autoAlpha: 0, duration: 0.9, ease: "expo.out", delay: (k % 4) * 0.08, scrollTrigger: { trigger: li, start: "top 88%", once: true } });
    });

    /* ---------- Departamentos: la cinta corre con el scroll y los botones suben en cascada ---------- */
    const cinta = $(".deptos-cinta");
    if (cinta) gsap.fromTo(cinta, { xPercent: 0 }, { xPercent: -50, ...suave, scrollTrigger: { trigger: ".deptos", start: "top bottom", end: "bottom top", scrub: 0.5 } });
    gsap.from(".depto", { y: 30, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: ".deptos-lista", start: "top 90%", once: true } });

    // Las medidas cambian cuando cargan las fotos y las fuentes
    window.addEventListener("load", () => ST.refresh());
  });
})();
