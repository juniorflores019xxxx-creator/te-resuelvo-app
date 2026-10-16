# Te Resuelvo · Página web

Sitio estático (HTML, CSS y JavaScript sin dependencias). Se abre con doble clic en `index.html` o se sube tal cual a cualquier hosting (Hostinger, GitHub Pages).

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Secciones: encabezado, portada, servicios (3 composiciones), cómo funciona, trabajadores, formularios (contacto), llamada final y pie |
| `css/estilos.css` | Diseño. Paleta: negro `#161616`, amarillo `#F5CD47`, blanco `#FFFFFF`. Tipografía Inter |
| `js/config.js` | **Puntos de integración** (lo único que hay que tocar para conectar la web) |
| `js/main.js` | Subtítulos animados, reel de la portada, revelados, pasos de «Cómo funciona», pestañas, formularios |
| `img/` | Fotos en WebP (900 y 1600 px) y logo oficial |

## Integraciones pendientes (`js/config.js`)

- `endpoints.solicitud` · URL que recibe las solicitudes de servicio por `POST` (multipart/form-data): `servicio`, `detalle`, `zona`, `cuando`, `nombre`, `telefono`, `fotos` (hasta 3 imágenes de máx. 5 MB) y `origen=web`.
- `endpoints.trabajador` · URL que recibe los registros de trabajadores: `oficios` (separados por comas), `nombre`, `telefono`, `zona`, `experiencia`, `mensaje`, `origen=web`.
- `apps.android` / `apps.ios` · enlaces de descarga de la app (aparecen solos en la llamada final).
- `contacto.whatsapp` / `contacto.correo` · contacto público de Te Resuelvo (aparece en el pie).
- `legal.terminos` / `legal.privacidad` · páginas legales (aparecen en el pie).

Mientras un endpoint esté vacío, el formulario valida los datos pero **no envía nada** y le avisa al usuario que todavía no está conectado. Con un endpoint configurado: muestra estado de carga, éxito solo si el servidor responde bien, y error (conservando los datos) si falla.

## Contenido ilustrativo

- El teléfono de la portada y el de «Cómo funciona» muestran **ejemplos ficticios** (perfiles, calificaciones y precios), marcados como «Ejemplo ilustrativo».
- Fotografías de [Pexels](https://www.pexels.com) con licencia libre de uso comercial (IDs: 6050244, 6050247, 5463575, 6419128, 14319099, 35287856, 11429199, 32913797, 8961155).

## Accesibilidad y rendimiento

- Los títulos animados son texto real (seleccionable y legible por lectores de pantalla).
- Con «reducir movimiento» activado en el sistema, las animaciones se desactivan.
- Imágenes con `srcset`, carga diferida fuera de la primera pantalla y la foto principal precargada.
