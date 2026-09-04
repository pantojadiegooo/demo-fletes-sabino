import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../src/scripts/quote-message.mjs';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const cssFileMatch = html.match(/href="(\/_astro\/[^\"]+\.css)"/);
assert.ok(cssFileMatch, 'No se encontró el CSS compilado.');
const css = await readFile(new URL(`../dist${cssFileMatch[1]}`, import.meta.url), 'utf8');

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const localAnchors = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
for (const anchor of localAnchors) assert.ok(ids.has(anchor), `Ancla interna rota: #${anchor}`);
assert.ok(!html.includes('href="#"'), 'Se detectó un enlace vacío.');

for (const asset of ['/favicon.svg', '/robots.txt', '/sitemap.xml']) {
  await access(new URL(`../dist${asset}`, import.meta.url));
}

assert.match(html, /href="tel:\+525532814905"/, 'Falta el enlace telefónico confirmado.');
assert.match(html, /https:\/\/wa\.me\/525532814905/, 'Falta el enlace directo a WhatsApp.');
assert.match(html, /<html lang="es-MX">/, 'El idioma del documento no es es-MX.');
assert.match(html, /rel="canonical" href="https:\/\/fletesymudanzassabino\.com\/"/, 'Canonical incorrecto.');
assert.match(html, /application\/ld\+json/, 'Falta el marcado Schema.org.');
assert.ok(!html.includes('</html><script'), 'Se detectó JavaScript fuera del documento HTML.');
assert.match(css, /prefers-reduced-motion:\s*reduce/, 'Falta soporte para movimiento reducido.');
assert.match(css, /overflow-x:\s*hidden/, 'Falta protección explícita contra overflow horizontal.');
for (const breakpoint of ['379px', '560px', '720px', '880px', '1200px']) {
  assert.ok(css.includes(breakpoint), `Falta el punto de ajuste responsive ${breakpoint}.`);
}

assert.match(html, /class="skip-link" href="#contenido"/, 'Falta el enlace para saltar al contenido.');
assert.match(css, /:focus-visible/, 'Falta un indicador de foco visible.');
for (const id of ['origen', 'destino', 'fecha', 'servicio', 'observaciones']) {
  assert.match(html, new RegExp(`<label for="${id}">`), `Falta etiqueta para ${id}.`);
}

for (const script of [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((match) => match[1])) {
  new Function(script);
}

const quote = {
  origin: 'Iztapalapa, CDMX',
  destination: 'Coyoacán, CDMX',
  date: '2026-09-20',
  service: 'Mudanza residencial',
  notes: 'Muebles y cajas',
};
const message = buildWhatsAppMessage(quote);
const url = buildWhatsAppUrl(quote);
assert.match(message, /Origen: Iztapalapa, CDMX/);
assert.match(message, /Destino: Coyoacán, CDMX/);
assert.match(message, /Servicio: Mudanza residencial/);
assert.equal(new URL(url).hostname, 'wa.me');
assert.equal(new URL(url).pathname, '/525532814905');
assert.equal(new URL(url).searchParams.get('text'), message);

const emptyOptional = buildWhatsAppMessage({ ...quote, date: '', notes: '' });
assert.match(emptyOptional, /Fecha aproximada: Por confirmar/);
assert.match(emptyOptional, /Observaciones: Sin observaciones adicionales/);

const prohibitedClaims = [
  'años de experiencia',
  'somos líderes',
  'los mejores',
  'número uno',
  'calidad garantizada',
  'experiencia incomparable',
];
const visibleText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').toLowerCase();
for (const claim of prohibitedClaims) assert.ok(!visibleText.includes(claim), `Afirmación no permitida detectada: ${claim}`);

console.log(`QA completado: ${localAnchors.length} anclas internas, teléfono, WhatsApp, SEO, movimiento reducido y cotizador verificados.`);
