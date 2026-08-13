// Valores de configuración que dependen del despliegue y no deben quedar
// hardcodeados en el código fuente.
//
// Nota: las variables VITE_* se inyectan en el bundle del browser, así que no
// sirven para guardar secretos. El objetivo acá es que el dato no quede en el
// repositorio, no ocultarlo del usuario final.

// Número de WhatsApp de soporte de la Fundación, en formato internacional sin
// el "+" (ej: 5490000000000). Si no está configurado, los botones de contacto
// no se muestran.
export const SOPORTE_WHATSAPP: string = import.meta.env.VITE_SOPORTE_WHATSAPP || '';

export const soporteWhatsappUrl = (mensaje?: string): string | null => {
  if (!SOPORTE_WHATSAPP) return null;
  return mensaje
    ? `https://wa.me/${SOPORTE_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
    : `https://wa.me/${SOPORTE_WHATSAPP}`;
};
