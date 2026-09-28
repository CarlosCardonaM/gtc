# GTC & Co. Contadores Públicos

Sitio web del despacho GTC & Co. Contadores Públicos (León, Guanajuato).

## Estructura

- `sitio-web/`: el sitio, en HTML, CSS y JavaScript sin dependencias.
  - `index.html`: página principal.
  - `guia-fiscal.html`: guía de preguntas fiscales frecuentes.
  - `aviso-de-privacidad.html` y `terminos-y-condiciones.html`: páginas legales.
  - `robots.txt`, `sitemap.xml` y `llms.txt`: archivos para buscadores y asistentes de IA.
- `Logotipo/`: archivos originales de la identidad gráfica (AI, CDR, PDF, PNG).

## Datos por completar

Busca `EDITAR` y la clase `pendiente` en los archivos de `sitio-web/`:

- Número de WhatsApp en `sitio-web/script.js`.
- Teléfono, correo, domicilio y horario.
- Dominio definitivo (hoy `gtcco.mx`) en las etiquetas `canonical`, los datos estructurados, `robots.txt`, `sitemap.xml` y `llms.txt`.

## Vista previa local

```bash
python3 -m http.server 8000 --directory sitio-web
```

Luego abre http://localhost:8000.

## Publicación

Sube el contenido de `sitio-web/` a cualquier hosting estático (Netlify, Vercel, Cloudflare Pages o GitHub Pages).
