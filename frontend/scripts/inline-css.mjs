/**
 * Mete el CSS de entrada dentro del HTML.
 *
 * Servido aparte, el navegador tiene que pedir el archivo y esperarlo antes de
 * pintar: sobre una red móvil eso es un viaje de ida y vuelta entero, medio
 * segundo largo, con la pantalla en blanco. Incrustado viaja en la misma
 * respuesta que el HTML y la página pinta apenas llega.
 *
 * Solo aplica al CSS de la entrada. Los de las vistas diferidas (dashboard,
 * legales) siguen como archivos, que es lo correcto: no los necesita quien
 * entra a la landing.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const indexPath = join(dist, 'index.html')

if (!existsSync(indexPath)) {
  console.error('[inline-css] no hay dist/index.html; ¿corriste el build?')
  process.exit(1)
}

let html = readFileSync(indexPath, 'utf8')
const link = /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/

const match = html.match(link)
if (!match) {
  console.log('[inline-css] el HTML no referencia CSS de entrada; no hay nada que hacer')
  process.exit(0)
}

const href = match[1].replace(/^\//, '')
const cssPath = join(dist, href)

if (!existsSync(cssPath)) {
  console.error(`[inline-css] no encontré ${cssPath}`)
  process.exit(1)
}

const css = readFileSync(cssPath, 'utf8')
html = html.replace(link, `<style>${css}</style>`)
writeFileSync(indexPath, html)

console.log(`[inline-css] ${(css.length / 1024).toFixed(1)} KB incrustados desde ${href}`)
