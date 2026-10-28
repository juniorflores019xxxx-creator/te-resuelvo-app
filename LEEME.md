# Te Resuelvo · Página web

Sitio estático (HTML, CSS y JavaScript sin dependencias). Se abre con doble clic en `index.html` o se sube tal cual a cualquier hosting (Hostinger, GitHub Pages).

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Secciones: encabezado, portada, servicios (3 composiciones), los 11 servicios, cómo funciona, confianza, trabajadores, pre-registro (dos partes: usuarios y técnicos, cada una con sus requisitos y su formulario), llamada final y pie |
| `terminos.html` · `privacidad.html` | Páginas legales |
| `app.html` | **Enlace inteligente de descarga** (`/app`): abre Google Play o App Store según el celular; si no hay tienda, lleva al pre-registro de la web |
| `404.html` | Página de error de GitHub Pages (funciona en el servidor; abierta con doble clic no carga estilos) |
| `sitemap.xml` | Mapa del sitio para buscadores |
| `css/estilos.css` | Diseño. Paleta: negro `#161616`, amarillo `#F5CD47`, blanco `#FFFFFF`. Tipografía Inter |
| `js/config.js` | **Puntos de integración** (WhatsApp, redes, formularios, tiendas y páginas legales) |
| `js/main.js` | Portada: subtítulos animados, reel, revelados, pasos de «Cómo funciona», pestañas y formularios |
| `js/paginas.js` | Páginas legales, 404 y `app.html`: año del pie, enlaces de WhatsApp y enlace inteligente, tomados de `config.js` |
| `img/` | Fotos en WebP (900 y 1600 px), logo oficial (`logo-te-resuelvo.png`, 512 px) y su versión liviana para el encabezado (`logo-96.png`) |

## Modo pre-lanzamiento

La app todavía no está publicada: la web invita a **pre-registrarse** (arrancamos en Santa Cruz) para avisar por WhatsApp, con el enlace de descarga, cuando esté lista. Al lanzar, hay que cambiar los textos «Próximamente», «Muy pronto», «Sé de los primeros» y «Así funcionará la app», y cargar `apps.android` / `apps.ios`.

## Enlace inteligente de descarga

Comparte siempre **un solo enlace**: `/app` (con el dominio, `teresuelvo.com.bo/app`). En un Android abre Google Play; en un iPhone o iPad, App Store. En cualquier otro caso (computadora, o mientras `apps.android` y `apps.ios` estén vacíos) lleva directo a la sección de pre-registro de la web (`index.html#contacto`). Para activarlo al lanzar, basta con cargar esos dos enlaces en `js/config.js`.

## Estadísticas (Umami)

Se activan poniendo el ID del sitio en `analitica.umami` (`js/config.js`). Umami no usa cookies ni identifica a las personas, y solo cuenta en los dominios de `analitica.dominios`. Acciones que se cuentan:

| Acción | Datos que guarda |
|---|---|
| `servicio-tocado` | el servicio de la tarjeta o del problema frecuente |
| `ir-a-pre-registro` | `usuario` o `trabajador` |
| `pre-registro-usuario` | servicios que le interesan |
| `pre-registro-trabajador` | oficios y disponibilidad |
| `boton-whatsapp` | — |

Las visitas que llegan por el enlace `/app` aparecen con `utm_source=app`. Nunca se envían nombre, teléfono ni zona.

## Cómo se envían los formularios hoy

Mientras `endpoints` esté vacío y haya número en `contacto.whatsapp`, cada formulario **abre WhatsApp con los datos ya escritos** y la persona solo toca «Enviar».

Sin endpoint ni WhatsApp, el formulario valida pero **no envía nada** y lo avisa. Con un endpoint configurado: muestra estado de carga, éxito solo si el servidor responde bien, y error (conservando los datos) si falla.

## Integraciones (`js/config.js`)

- `endpoints.usuario` · URL que recibe los pre-registros de clientes por `POST` (multipart/form-data): `nombre`, `telefono`, `zona`, `intereses` (separados por comas), `acepto` y `origen=web`.
- `endpoints.trabajador` · URL que recibe los pre-registros de técnicos: `oficios` y `disponibilidad` (separados por comas), `nombre`, `telefono`, `zona`, `experiencia`, `herramientas`, `mensaje`, `acepto` y `origen=web`.
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
- Portada «mesa de herramientas»: foto de Pexels 4312860 (Anna Shvets), en `img/mesa/` (1000 y 2000 px).
- Fotos de los 11 servicios en `img/oficios/` (dos por oficio, `<oficio>-1` y `-2`, en 1600 px para computadora y 900 px para celular), todas de Pexels con técnicos con uniforme. IDs: electricidad 35154098 y 442160; plomería 39885422 y 29226620; climatización 5463575 y 32588555; limpieza 6196677 y 9462636; jardinería 38936338 y 33357127; carpintería 313776 y 5974413; pintura 37556460 y 5493662; cerrajería 35578808 y 35287856; albañilería 30081237 y 19688828; mudanzas 20706507 y 7464262; fumigación 32055757 y 19789837; técnico de la sección de trabajadores 21812146. Para cambiar una foto por una propia, se reemplazan sus dos tamaños con el mismo nombre.

## Accesibilidad y rendimiento

- Los títulos se escriben normal en el HTML y se muestran en mayúsculas con CSS; son texto real (seleccionable y legible por lectores de pantalla).
- Los errores de los formularios se enlazan a su campo (`aria-invalid` y `aria-describedby`).
- Con «reducir movimiento» activado en el sistema, las animaciones se desactivan.
- Imágenes con `srcset`, carga diferida fuera de la primera pantalla y la foto principal precargada. Inter se carga como fuente variable.

## Animaciones (GSAP + ScrollTrigger)

- `js/cine.js` usa [GSAP 3.12.5](https://gsap.com) y ScrollTrigger, cargados desde cdnjs:
  - parallax en la portada;
  - las imágenes se expanden al hacer scroll: la entrada al recorrido, la foto del técnico y la foto final;
  - profundidad en los títulos;
  - la cinta de departamentos corre con el scroll.
- Con «reducir movimiento» o si la librería no carga, la página funciona igual, sin animaciones.
- `js/recorrido.js` maneja aparte el recorrido de los 11 servicios: dos fotos por oficio que se cortan en piezas al pasar al siguiente.
- Pre-registro: cada departamento es un botón que abre el formulario con el departamento ya escrito y lo cuenta en las estadísticas (evento `departamento-tocado`, sin datos personales).

