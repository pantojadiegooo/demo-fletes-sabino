const WHATSAPP_NUMBER = '525532814905';

export function buildWhatsAppMessage({ origin, destination, date, service, notes }) {
  return [
    'Hola, quiero solicitar una cotización con Fletes y Mudanzas Sabino.',
    '',
    `Origen: ${origin.trim()}`,
    `Destino: ${destination.trim()}`,
    `Fecha aproximada: ${date.trim() || 'Por confirmar'}`,
    `Servicio: ${service.trim()}`,
    `Observaciones: ${notes.trim() || 'Sin observaciones adicionales'}`,
    '',
    'Gracias.',
  ].join('\n');
}

export function buildWhatsAppUrl(data) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
}
