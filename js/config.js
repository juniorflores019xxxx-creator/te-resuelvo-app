/* ==========================================================
   TE RESUELVO · PUNTOS DE INTEGRACIÓN
   Este es el único archivo que hay que tocar para conectar la web.
   ========================================================== */
window.TR_CONFIG = {
  /* URL que recibirá cada formulario por POST (FormData):
     tu backend, la API de la app, Formspree, un webhook de Make/Zapier, etc.
     Mientras estén vacías, los formularios se envían por WhatsApp
     (contacto.whatsapp); sin WhatsApp, avisan que todavía no están conectados. */
  endpoints: {
    usuario: "",     // Pre-registros de clientes (lista de espera de la app)
    trabajador: ""   // Pre-registros de técnicos
  },

  /* Enlaces de descarga de la app. Vacíos = los botones de tienda no se muestran. */
  apps: {
    android: "",     // p. ej. https://play.google.com/store/apps/details?id=...
    ios: ""          // p. ej. https://apps.apple.com/...
  },

  /* Datos de contacto públicos de Te Resuelvo. Vacíos = no se muestran. */
  contacto: {
    whatsapp: "59176365928",   // solo dígitos con código de país
    whatsappMensaje: "Hola Te Resuelvo, tengo una consulta.",
    correo: "teresuelvoo@gmail.com"
  },

  /* Redes sociales. Vacías = no se muestran. */
  redes: {
    facebook: "https://www.facebook.com/profile.php?id=61595675542080",
    instagram: "",   // pendiente: cuenta de Instagram de Te Resuelvo (no usar la personal)
    tiktok: "https://www.tiktok.com/@te.resuelvo1"
  },

  /* Estadísticas de visitas con Umami (sin cookies, no identifica a las personas).
     umami vacío = no se mide nada. El ID se copia del panel de Umami
     (Settings → Websites → Edit → Tracking code: el valor de data-website-id). */
  analitica: {
    umami: "",
    script: "https://cloud.umami.is/script.js",
    // Solo se cuenta en estos dominios (abrir la web en tu computadora no suma visitas)
    dominios: "juniorflores019xxxx-creator.github.io,teresuelvo.com.bo,www.teresuelvo.com.bo"
  },

  /* Páginas legales. Vacías = no se muestran en el pie de página. */
  legal: {
    terminos: "terminos.html",
    privacidad: "privacidad.html"
  }
};
