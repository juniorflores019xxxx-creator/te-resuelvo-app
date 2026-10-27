/* =========================================================
   TE RESUELVO · Páginas secundarias (términos, privacidad, 404)
   Año del pie y enlaces de WhatsApp tomados de js/config.js.
   El HTML trae el número como respaldo por si no hay JavaScript.
   ========================================================= */
(function () {
  "use strict";
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();

  const c = (window.TR_CONFIG || {}).contacto || {};
  const n = (c.whatsapp || "").replace(/\D/g, "");
  if (!n) return;
  // data-wa="mensaje" abre el chat con el saludo de config.js; data-wa-numero muestra el número
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = "https://wa.me/" + n + (a.dataset.wa === "mensaje" && c.whatsappMensaje ? "?text=" + encodeURIComponent(c.whatsappMensaje) : "");
    if (a.hasAttribute("data-wa-numero")) a.textContent = "+" + n.slice(0, 3) + " " + n.slice(3);
  });
})();
