/* ==========================================================
   TE RESUELVO · PUNTOS DE INTEGRACIÓN
   Este es el único archivo que hay que tocar para conectar la web.
   ========================================================== */
window.TR_CONFIG = {
  /* URL que recibirá cada formulario por POST (FormData):
     tu backend, la API de la app, Formspree, un webhook de Make/Zapier, etc.
     Mientras estén vacías, la web NO envía datos: muestra un aviso
     honesto de que el formulario todavía no está conectado. */
  endpoints: {
    solicitud: "",   // Solicitudes de servicio de clientes (incluye hasta 3 fotos)
    trabajador: ""   // Registros de trabajadores y técnicos
  },

  /* Enlaces de descarga de la app. Vacíos = los botones de tienda no se muestran. */
  apps: {
    android: "",     // p. ej. https://play.google.com/store/apps/details?id=...
    ios: ""          // p. ej. https://apps.apple.com/...
  },

  /* Datos de contacto públicos de Te Resuelvo. Vacíos = no se muestran. */
  contacto: {
    whatsapp: "59176365928",   // solo dígitos con código de país
    whatsappMensaje: "Hola Te Resuelvo, necesito un servicio.",
    correo: ""
  },

  /* Redes sociales. Vacías = no se muestran. */
  redes: {
    facebook: "https://www.facebook.com/profile.php?id=61595675542080",
    instagram: "",   // pendiente: cuenta de Instagram de Te Resuelvo (no usar la personal)
    tiktok: "https://www.tiktok.com/@te.resuelvo1"
  },

  /* Páginas legales. Vacías = no se muestran en el pie de página. */
  legal: {
    terminos: "terminos.html",
    privacidad: "privacidad.html"
  }
};
