/* =========================================================
   TE RESUELVO · Los 11 servicios en parallax (GSAP + ScrollTrigger)
   Cada servicio es una sección de pantalla completa que se baja
   normalmente. Las fotos se mueven más lento que el scroll (y cada
   una a su propia velocidad, para dar profundidad), el texto un
   poco más rápido, y el nombre entra letra por letra al llegar.
   Sin GSAP o con «reducir movimiento» queda como una lista normal.
   ========================================================= */
(function () {
  "use strict";
  const sec = document.querySelector(".recorrido");
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (!sec || !gsap || !ST) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ST);
  sec.classList.add("recorrido-parallax");

  const pasos = [...sec.querySelectorAll(".paso")];
  const total = pasos.filter((p) => !p.classList.contains("paso-intro")).length;
  let n = 0;
  pasos.forEach((p) => {
    // Nombre en letras sueltas (para la entrada letra por letra)
    const h = p.querySelector(".paso-nombre");
    if (!p.classList.contains("paso-intro")) {
      n++;
      const txt = h.textContent.trim();
      h.setAttribute("aria-label", txt);
      h.innerHTML = [...txt].map((c, k) => `<span class="l" aria-hidden="true" style="--k:${k}">${c === " " ? "&nbsp;" : c}</span>`).join("");
      h.insertAdjacentHTML("beforebegin", `<p class="paso-num" aria-hidden="true">${n} / ${total}</p>`);
    }
    const capa = { ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: true } };
    // Fotos: más lentas que el scroll; la segunda, más lenta todavía
    const fotos = [...p.querySelectorAll(".paso-fotos img")];
    fotos.forEach((img, k) => gsap.fromTo(img, { yPercent: -10 - k * 8 }, { yPercent: 10 + k * 8, ...capa }));
    // Texto: un poco más rápido que el scroll
    const texto = p.querySelector(".paso-texto-bloque");
    if (texto) gsap.fromTo(texto, { y: 90 }, { y: -90, ...capa });
    // Al llegar: las letras y el resto del texto entran
    ST.create({ trigger: p, start: "top 62%", end: "bottom 38%", toggleClass: "is-on" });
  });

  // El celular de la portada lleva al servicio elegido
  document.querySelectorAll("[data-ir-servicio]").forEach((b) => b.addEventListener("click", () => {
    const p = pasos.find((x) => x.dataset.cat === b.dataset.irServicio);
    if (p) p.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.TR_medir) window.TR_medir("servicio-tocado", { servicio: b.dataset.irServicio, desde: "celular" });
  }));
  window.addEventListener("load", () => ST.refresh());
})();
