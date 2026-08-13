// Modo demo — flag de runtime, no de build.
//
// La demo tiene que convivir con los usuarios reales en el MISMO deploy: quien
// entra por el link de LinkedIn aprieta un botón y ve la app funcionando con
// datos simulados, sin registrarse. Por eso no sirve una VITE_* (build-time).
//
// Se guarda en sessionStorage y no en localStorage a propósito:
//   - es por pestaña, así que la demo nunca pisa la sesión real de Supabase
//     (que vive en localStorage) si el usuario tiene las dos cosas abiertas;
//   - cerrar la pestaña termina la demo, sin estado colgado.
//
// La lectura es SÍNCRONA a nivel módulo porque `supabase` es un singleton que
// se crea en tiempo de import: el flag tiene que estar resuelto antes de eso.

const KEY = 'fundadata_demo_role';
const KEY_CENTRO = 'fundadata_demo_centro';

export type DemoRole = 'operador' | 'fundacion';

const read = (k: string): string | null => {
  try {
    return sessionStorage.getItem(k);
  } catch {
    // sessionStorage puede tirar en modo incógnito estricto o con cookies bloqueadas
    return null;
  }
};

export const DEMO_ROLE: DemoRole | null = (() => {
  const v = read(KEY);
  return v === 'operador' || v === 'fundacion' ? v : null;
})();

export const DEMO_MODE = DEMO_ROLE !== null;

/**
 * Centro asignado al operador demo. Se elige al entrar para poder mostrar los
 * dos tipos de ficha: la de niñez y la de centro de día, que son formularios
 * distintos. Por defecto, un centro de niñez.
 */
export const DEMO_CENTRO: number = Number(read(KEY_CENTRO)) || 1;

/**
 * Entra a la demo con el rol indicado. Hace un reload duro porque el cliente de
 * Supabase ya fue creado: la única forma de cambiarlo por el mock es reiniciar
 * el bundle con el flag ya puesto. Sirve también para cambiar de rol adentro.
 */
export const enterDemo = (role: DemoRole, centroId = 1) => {
  try {
    sessionStorage.setItem(KEY, role);
    sessionStorage.setItem(KEY_CENTRO, String(centroId));
  } catch {
    // Sin sessionStorage no hay demo posible; avisamos en vez de romper mudo.
    alert('Tu navegador tiene el almacenamiento bloqueado y la demo no puede iniciarse.');
    return;
  }
  window.location.replace('/');
};

/** Sale de la demo y vuelve al login real. */
export const exitDemo = () => {
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY_CENTRO);
  } catch {
    /* nada que limpiar */
  }
  window.location.replace('/login');
};
