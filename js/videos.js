/* =========================================================
   TE RESUELVO · Videos de las secciones
   - Cada video se carga recién al acercarse a la pantalla y se
     pausa al salir de ella (360p en celular, 720p en computadora).
   - Con «ahorro de datos» o «reducir movimiento» solo se muestra
     el póster; el video arranca si la persona lo toca.
   ========================================================= */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const con = navigator.connection || {};
  const ahorro = !!con.saveData || /(^|-)2g$/.test(con.effectiveType || "");
  const grande = () => window.matchMedia("(min-width: 960px)").matches;
  const fuente = (slug) => `video/${slug}-${grande() && !ahorro ? 720 : 360}.mp4`;
  const automatico = !reduce && !ahorro;

  /* ---------- Videos de las secciones ---------- */
  const vids = [...document.querySelectorAll("video.vid[data-video]")];
  const cargar = (v) => { if (!v.src) { v.src = fuente(v.dataset.video); } };
  if (automatico) {
    const cerca = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { cargar(e.target); cerca.unobserve(e.target); } }), { rootMargin: "300px 0px" });
    const visible = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { cargar(e.target); e.target.play().catch(() => {}); } else e.target.pause();
    }), { threshold: 0.25 });
    vids.forEach((v) => { cerca.observe(v); visible.observe(v); });
  } else {
    // Sin reproducción automática: un botón sobre el póster
    vids.forEach((v) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "vid-play"; b.textContent = "Ver video";
      v.after(b);
      b.addEventListener("click", () => { cargar(v); v.controls = true; v.play().catch(() => {}); b.remove(); });
    });
  }

})();
