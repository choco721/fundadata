import React from 'react';
import { Building2, ClipboardList, Heart, HeartPulse, PlayCircle, ShieldCheck } from 'lucide-react';
import { enterDemo } from './demoMode';

// Se ofrecen los dos tipos de centro porque la ficha de niñez y la de centro de
// día son formularios distintos: con una sola opción, media app queda invisible.
const ROLES = [
  {
    role: 'fundacion' as const,
    centro: 1,
    titulo: 'Fundación',
    subtitulo: 'Vista global',
    detalle: 'Indicadores de los 10 centros, pirámide etaria, tablero de asistencia, exportación a CSV y panel de administración de operadores.',
    icon: Building2,
    acento: 'violet',
  },
  {
    role: 'operador' as const,
    centro: 1,
    titulo: 'Operador · Niñez',
    subtitulo: 'Rayito de Luz',
    detalle: 'Fichas de niñez: escolaridad, tutores para los avisos por WhatsApp, indicadores de vulnerabilidad y asistencia diaria.',
    icon: ClipboardList,
    acento: 'emerald',
  },
  {
    role: 'operador' as const,
    centro: 6,
    titulo: 'Operador · Centro de día',
    subtitulo: 'Renacer',
    detalle: 'Fichas de adultos: CUD, obra social, medicación, movilidad, situación habitacional y jubilación.',
    icon: HeartPulse,
    acento: 'sky',
  },
];

const ACENTOS: Record<string, { chip: string; card: string; icon: string }> = {
  violet: {
    chip: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    card: 'hover:border-violet-500/50 hover:bg-violet-500/5',
    icon: 'bg-violet-500/15 border-violet-500/25 text-violet-400',
  },
  emerald: {
    chip: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    card: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    icon: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
  },
  sky: {
    chip: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    card: 'hover:border-sky-500/50 hover:bg-sky-500/5',
    icon: 'bg-sky-500/15 border-sky-500/25 text-sky-400',
  },
};

/** Las tarjetas de rol. Se usa embebido en el login y en la página /demo. */
export const DemoRolePicker: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {ROLES.map(({ role, centro, titulo, subtitulo, detalle, icon: Icon, acento }) => {
      const c = ACENTOS[acento];
      return (
        <button
          key={`${role}-${centro}`}
          type="button"
          onClick={() => enterDemo(role, centro)}
          className={`text-left p-5 rounded-2xl bg-slate-950/60 border border-slate-700/60 transition-all duration-200 ${c.card}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="font-black text-white text-base">{titulo}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${c.chip}`}>
                {subtitulo}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{detalle}</p>
        </button>
      );
    })}
  </div>
);

/** Aviso legal de la demo. Va junto al selector, en los dos lugares. */
export const DemoDisclaimer: React.FC = () => (
  <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
    <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
    <p className="text-[11px] text-slate-500 leading-relaxed">
      Todos los datos que vas a ver son <span className="text-slate-300 font-semibold">simulados</span> y no
      corresponden a ninguna persona real. Podés crear, editar y guardar libremente: los cambios viven sólo en tu
      navegador y se borran al cerrar la pestaña.
    </p>
  </div>
);

/** Página completa en /demo — es el link para compartir. */
export const DemoLanding: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden px-4 py-10">

    {/* Fondo animado, igual al del login */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="animate-blob absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/8 blur-[100px]" />
      <div className="animate-blob-delay absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-400/6 blur-[100px]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
    </div>

    <div className="relative z-10 text-center mb-8 animate-fadeIn">
      <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-5 glow-emerald">
        <Heart className="w-8 h-8 text-slate-950" strokeWidth={2.5} />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">
        Funda<span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Data</span>
      </h1>
      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
        <PlayCircle className="w-3 h-3" />
        Demo interactiva
      </div>
    </div>

    <div className="relative z-10 w-full max-w-2xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        <h2 className="text-lg font-black text-white mb-1">Elegí con qué rol querés entrar</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Es la aplicación real, con todas sus pantallas y funciones. Podés cambiar de rol en cualquier momento
          desde la barra superior.
        </p>
        <DemoRolePicker />
        <DemoDisclaimer />
      </div>

      <a
        href="/login"
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all text-sm font-semibold"
      >
        Ir al inicio de sesión real
      </a>
    </div>

    <p className="relative z-10 text-center text-xs text-slate-600 mt-6">
      © 2026 FundaData · Salud Comunitaria
    </p>
  </div>
);
