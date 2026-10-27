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

  /* ---------- Enlace inteligente (app.html): abre la tienda según el celular ---------- */
  const bloques = document.querySelectorAll("[data-descarga]");
  if (bloques.length) {
    const apps = (window.TR_CONFIG || {}).apps || {};
    const ua = navigator.userAgent || "";
    // Los iPad recientes se presentan como Mac: se reconocen por la pantalla táctil
    const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    const tiendas = [["Descargar en Google Play", apps.android], ["Descargar en App Store", apps.ios]].filter(([, url]) => url);
    const destino = android ? apps.android : ios ? apps.ios : "";
    const ver = !tiendas.length ? "pronto" : destino ? "abriendo" : "elegir";
    bloques.forEach((b) => { b.hidden = b.dataset.descarga !== ver; });
    // En el celular se muestra solo su tienda; en la computadora, todas
    const botones = destino ? tiendas.filter(([, url]) => url === destino) : tiendas;
    document.querySelectorAll("[data-tiendas]").forEach((cont) => {
      botones.forEach(([texto, url], i) => {
        const a = document.createElement("a");
        a.className = "btn btn-lg " + (i ? "btn-black" : "btn-yellow");
        a.href = url; a.textContent = texto;
        cont.appendChild(a);
      });
    });
    if (destino) location.replace(destino);
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
