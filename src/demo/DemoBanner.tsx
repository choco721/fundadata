import React from 'react';
import { LogOut, PlayCircle, Repeat } from 'lucide-react';
import { DEMO_CENTRO, DEMO_MODE, DEMO_ROLE, enterDemo, exitDemo } from './demoMode';

// Ciclo de vistas del switch, en el mismo orden que el selector de entrada.
const VISTAS = [
  { role: 'fundacion' as const, centro: 1, label: 'Fundación' },
  { role: 'operador' as const, centro: 1, label: 'Operador · Niñez' },
  { role: 'operador' as const, centro: 6, label: 'Operador · Centro de día' },
];

/**
 * Barra permanente del modo demo. Va arriba del navbar (que es sticky), en el
 * flujo normal, para no pelear por el z-index.
 *
 * Cumple tres funciones: avisar que los datos son simulados, dejar cambiar de
 * rol sin volver al login, y ofrecer una salida clara.
 */
export const DemoBanner: React.FC = () => {
  if (!DEMO_MODE) return null;

  const actual = VISTAS.findIndex(
    (v) => v.role === DEMO_ROLE && (v.role === 'fundacion' || v.centro === DEMO_CENTRO),
  );
  const siguiente = VISTAS[(Math.max(actual, 0) + 1) % VISTAS.length];

  return (
    <div className="relative z-50 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-b border-amber-500/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">

        <div className="flex items-center gap-2 min-w-0">
          <PlayCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[11px] sm:text-xs text-amber-200/90 font-semibold truncate">
            Modo demo
            <span className="hidden sm:inline font-normal text-amber-200/60">
              {' '}· datos simulados, ninguna persona real. Los cambios se borran al cerrar la pestaña.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => enterDemo(siguiente.role, siguiente.centro)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border border-amber-500/30 text-amber-300 hover:bg-amber-500/15 transition-all"
            title={`Cambiar a la vista ${siguiente.label}`}
          >
            <Repeat className="w-3 h-3" />
            Ver como {siguiente.label}
          </button>
          <button
            type="button"
            onClick={exitDemo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
          >
            <LogOut className="w-3 h-3" />
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};
