/**
 * Escribe el HTML ya resuelto dentro de dist.
 *
 * La landing: sin esto el HTML llega con el <div id="root"> vacío y no se ve
 * nada hasta que el navegador baja, parsea y ejecuta el JavaScript. Con el hero
 * ya escrito, la página pinta apenas llega la respuesta.
 *
 * Los legales: /terminos y /privacidad son rutas del router, así que nginx
 * devolvía el index.html de la landing y el texto aparecía recién con el
 * JavaScript. Quien lea la página sin ejecutarlo encontraba la squeeze page
 * donde debería estar la política. Ahora cada uno es un archivo propio, y como
 * no tienen nada interactivo salen sin el bundle: HTML y nada más.
 *
 * El HTML lo generan los mismos componentes que usa el navegador, así que no hay
 * nada duplicado: si alguien edita App.jsx o legal.js, esto se regenera.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = join(process.cwd(), 'dist')
const indexPath = join(dist, 'index.html')
const ssrPath = join(process.cwd(), 'dist-ssr', 'entry-ssr.js')

for (const [ruta, que] of [
  [indexPath, 'dist/index.html'],
  [ssrPath, 'dist-ssr/entry-ssr.js'],
]) {
  if (!existsSync(ruta)) {
    console.error(`[prerender] falta ${que}`)
    process.exit(1)
  }
}

const { renderLanding, renderLegal } = await import(pathToFileURL(ssrPath).href)

const plantilla = readFileSync(indexPath, 'utf8')
const root = '<div id="root"></div>'

if (!plantilla.includes(root)) {
  console.error('[prerender] no encontré el div raíz vacío en el HTML')
  process.exit(1)
}

/** Mete el markup en el div raíz. Devuelve el HTML completo. */
function armar(markup, { titulo, conBundle }) {
  if (!markup || markup.length < 200) {
    console.error('[prerender] el render salió vacío; no toco el HTML')
    process.exit(1)
  }
  let html = plantilla.replace(root, `<div id="root">${markup}</div>`)
  if (titulo) html = html.replace(/<title>[^<]*<\/title>/, `<title>${titulo}</title>`)
  if (!conBundle) html = html.replace(/<script type="module"[^>]*><\/script>\s*/, '')
  return html
}

let landing = armar(renderLanding(), { conBundle: true })

// La imagen principal (la de fetchpriority="high") se anuncia en el <head>: sin
// esto el navegador la descubre recién al parsear el cuerpo y el LCP espera.
const hero = landing.match(/<img[^>]*fetchpriority="high"[^>]*>/i)
if (hero) {
  const attr = (n) => (hero[0].match(new RegExp(`${n}="([^"]*)"`, 'i')) || [])[1]
  const srcset = attr('srcset')
  const sizes = attr('sizes')
  const link = `<link rel="preload" as="image" fetchpriority="high"${srcset ? ` imagesrcset="${srcset}"` : ` href="${attr('src')}"`}${sizes ? ` imagesizes="${sizes}"` : ''} />`
  landing = landing.replace('</title>', `</title>\n    ${link}`)
  console.log('[prerender] preload de la imagen principal')
}
writeFileSync(indexPath, landing)
console.log(`[prerender] index.html: ${(landing.length / 1024).toFixed(1)} KB`)

for (const [archivo, slug, titulo] of [
  ['terminos.html', '/terminos', 'Términos y condiciones · Aumenta Tu Valor'],
  ['privacidad.html', '/privacidad', 'Política de privacidad · Aumenta Tu Valor'],
]) {
  const html = armar(renderLegal(slug), { titulo, conBundle: false })
  writeFileSync(join(dist, archivo), html)
  console.log(`[prerender] ${archivo}: ${(html.length / 1024).toFixed(1)} KB, sin bundle`)
}
