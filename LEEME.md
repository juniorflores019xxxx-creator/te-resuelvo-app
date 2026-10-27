# Te Resuelvo · Página web

Sitio estático (HTML, CSS y JavaScript sin dependencias). Se abre con doble clic en `index.html` o se sube tal cual a cualquier hosting (Hostinger, GitHub Pages).

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Secciones: encabezado, portada, servicios (3 composiciones), los 11 servicios, cómo funciona, confianza, trabajadores, formularios (contacto), llamada final y pie |
| `terminos.html` · `privacidad.html` | Páginas legales |
| `404.html` | Página de error de GitHub Pages (funciona en el servidor; abierta con doble clic no carga estilos) |
| `sitemap.xml` | Mapa del sitio para buscadores |
| `css/estilos.css` | Diseño. Paleta: negro `#161616`, amarillo `#F5CD47`, blanco `#FFFFFF`. Tipografía Inter |
| `js/config.js` | **Puntos de integración** (WhatsApp, redes, formularios, tiendas y páginas legales) |
| `js/main.js` | Portada: subtítulos animados, reel, revelados, pasos de «Cómo funciona», pestañas y formularios |
| `js/paginas.js` | Páginas legales y 404: año del pie y enlaces de WhatsApp tomados de `config.js` |
| `img/` | Fotos en WebP (900 y 1600 px), logo oficial (`logo-te-resuelvo.png`, 512 px) y su versión liviana para el encabezado (`logo-96.png`) |

## Cómo se envían los formularios hoy

Mientras `endpoints` esté vacío y haya número en `contacto.whatsapp`, cada formulario **abre WhatsApp con los datos ya escritos** y la persona solo toca «Enviar». En ese modo se oculta el campo de fotos y se le pide mandarlas en el mismo chat.

Sin endpoint ni WhatsApp, el formulario valida pero **no envía nada** y lo avisa. Con un endpoint configurado: muestra estado de carga, éxito solo si el servidor responde bien, y error (conservando los datos) si falla.

## Integraciones (`js/config.js`)

- `endpoints.solicitud` · URL que recibe las solicitudes de servicio por `POST` (multipart/form-data): `servicio`, `detalle`, `zona`, `presupuesto`, `cuando`, `nombre`, `telefono`, `fotos` (hasta 3 imágenes de máx. 5 MB) y `origen=web`.
- `endpoints.trabajador` · URL que recibe los registros de trabajadores: `oficios` (separados por comas), `nombre`, `telefono`, `zona`, `experiencia`, `mensaje`, `origen=web`.
- `apps.android` / `apps.ios` · enlaces de descarga de la app (aparecen solos en la llamada final).
- `contacto.whatsapp` / `contacto.correo` · contacto público (pie, botón flotante, formularios, páginas legales y 404).
- `redes.*` · Facebook, Instagram y TikTok (vacío = no se muestra).
- `legal.terminos` / `legal.privacidad` · páginas legales (aparecen en el pie).

## Si cambia el número de WhatsApp

1. `js/config.js` → `contacto.whatsapp` (lo que ve la gente sale de aquí).
2. `index.html` → `telephone` dentro del bloque JSON-LD (lo leen los buscadores).
3. Opcional: la copia de respaldo en `terminos.html`, `privacidad.html` y `404.html` (solo se usa si el navegador no ejecuta JavaScript).

## Si cambia la dirección del sitio (dominio propio)

La URL completa está escrita en: `canonical`, `og:url`, `og:image` y JSON-LD de `index.html`; `canonical`, `og:url` y `og:image` de `terminos.html` y `privacidad.html`; `sitemap.xml`; y la etiqueta `base` de `404.html`. Hay que actualizarlas todas juntas.

## Contenido ilustrativo

- El teléfono de la portada y el de «Cómo funciona» muestran **ejemplos ficticios** (perfiles, calificaciones y precios), marcados como «Ejemplo ilustrativo».
- Fotografías de [Pexels](https://www.pexels.com) con licencia libre de uso comercial (IDs: 6050244, 6050247, 5463575, 6419128, 14319099, 35287856, 11429199, 32913797, 8961155).

## Accesibilidad y rendimiento

- Los títulos se escriben normal en el HTML y se muestran en mayúsculas con CSS; son texto real (seleccionable y legible por lectores de pantalla).
- Los errores de los formularios se enlazan a su campo (`aria-invalid` y `aria-describedby`).
- Con «reducir movimiento» activado en el sistema, las animaciones se desactivan.
- Imágenes con `srcset`, carga diferida fuera de la primera pantalla y la foto principal precargada. Inter se carga como fuente variable.
