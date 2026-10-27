/* =========================================================
   TE RESUELVO · Páginas secundarias (términos, privacidad, 404, app)
   Año del pie, enlaces de WhatsApp y enlace inteligente de
   descarga, tomados de js/config.js.
   El HTML trae el número como respaldo por si no hay JavaScript.
   ========================================================= */
(function () {
  "use strict";
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- Enlace inteligente (app.html) ----------
     Celular con su tienda cargada en config.js → Google Play o App Store.
     Cualquier otro caso (app sin publicar, computadora) → pre-registro de la web. */
  if (document.body.hasAttribute("data-enlace-app")) {
    const apps = (window.TR_CONFIG || {}).apps || {};
    const ua = navigator.userAgent || "";
    // Los iPad recientes se presentan como Mac: se reconocen por la pantalla táctil
    const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    location.replace((android && apps.android) || (ios && apps.ios) || "index.html#contacto");
    return;
  }

  const c = (window.TR_CONFIG || {}).contacto || {};
  const n = (c.whatsapp || "").replace(/\D/g, "");
  if (!n) return;
  // data-wa="mensaje" abre el chat con el saludo de config.js; data-wa-numero muestra el número
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = "https://wa.me/" + n + (a.dataset.wa === "mensaje" && c.whatsappMensaje ? "?text=" + encodeURIComponent(c.whatsappMensaje) : "");
    if (a.hasAttribute("data-wa-numero")) a.textContent = "+" + n.slice(0, 3) + " " + n.slice(3);
  });
})();
