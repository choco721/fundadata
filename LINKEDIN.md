# FundaData — Material para LinkedIn

---

## OPCIÓN A — Post principal (recomendado)

> Formato largo-explicado. LinkedIn corta a ~3 líneas con "ver más", así que el hook
> tiene que funcionar solo en las primeras 2 líneas.

---

Una fundación con 10 centros comunitarios manejaba a sus beneficiarios en 10 planillas de Excel separadas.

Sin visibilidad central. Sin control de duplicados. Y sin forma de darse cuenta de que un chico llevaba tres días sin aparecer.

Construimos **FundaData** para reemplazar eso.

🔹 **El problema real no era la carga de datos, era la fragmentación**

Cada centro tenía su planilla. Si una misma persona se anotaba en dos centros, la fundación la contaba dos veces en sus reportes de impacto. Si un operador cambiaba un dato sensible, no quedaba rastro de quién ni cuándo. Y las inasistencias reiteradas —el indicador más temprano de que algo anda mal en una familia— simplemente no se detectaban.

🔹 **Qué hicimos**

Una plataforma con tres roles diferenciados:

→ **Operador de centro**: registra beneficiarios, carga fichas técnicas (distintas según sea Centro de Niñez o Centro de Día para adultos mayores) y toma asistencia diaria. Solo ve su centro.

→ **Fundación**: dashboard con KPIs globales, distribución por centro, pirámide de edad/sexo, y el expediente completo de cualquier persona con su línea de tiempo de auditoría.

→ **Tutor/referente**: no entra al sistema. Recibe un WhatsApp automático cuando el chico a su cargo acumula dos días consecutivos de ausencia.

🔹 **Podés entrar y probarla ahora**

Sin registrarte y sin que te apruebe nadie: **fundadata.vercel.app/demo**

Elegís desde qué rol querés verla —Fundación, operador de un centro de niñez, u operador de un centro de día— y adentro es la aplicación real: cargás una ficha, tomás asistencia, filtrás el tablero, exportás el CSV. Los datos son íntegramente simulados y se borran al cerrar la pestaña.

🔹 **Cuatro decisiones técnicas de las que aprendí más**

**1. La seguridad vive en la base de datos, no en el frontend.**
El aislamiento entre centros está implementado con Row Level Security de PostgreSQL. Un operador no puede ver datos de otro centro aunque manipule el cliente, porque la política se evalúa en el motor de la base. Tuve que resolver un problema de recursión infinita (la política consultaba la misma tabla que estaba protegiendo) usando funciones `SECURITY DEFINER` como intermediarias.

**2. El calendario real no es el calendario del código.**
La primera versión de la detección de ausencias comparaba "hoy" contra "ayer". Funcionaba perfecto… hasta el lunes, cuando el registro anterior era el viernes. La versión final compara contra el **último registro efectivo** anterior a hoy, y calcula rachas sobre una ventana móvil de 30 días en lugar de sobre el mes calendario —así una ausencia que arranca el 30 de septiembre no se "reinicia" el 1 de octubre.

**3. Idempotencia sobre optimismo.**
La asistencia se guarda con `UPSERT` sobre una constraint única `(dni, centro, fecha)`, y cada notificación enviada queda registrada en un log que se consulta antes de disparar la siguiente. Resultado: el operador puede guardar diez veces y el tutor recibe un solo mensaje.

**4. Una demo pública sin duplicar la app.**
Quería que cualquiera pudiera ver la herramienta sin pedirme acceso, pero sin mantener dos versiones en paralelo ni exponer la base real. La app tenía una propiedad que lo hizo barato: un único módulo crea el cliente de Supabase y las cinco pantallas lo importan de ahí. Alcanzó con devolver desde ese módulo un cliente falso —un query builder encadenable sobre datos en memoria— para que la demo sea la aplicación real, línea por línea, sin tocar ni una pantalla. En modo demo no sale una sola request de red, así que la base de producción es inalcanzable por construcción.

El flag vive en `sessionStorage` y no en una variable de entorno: así el mismo deploy sirve a los usuarios reales y a los visitantes, y como es por pestaña, la demo no pisa la sesión de quien ya está trabajando.

🔹 **El stack**

React 19 + TypeScript + Vite + Tailwind CSS v4 en el frontend.
Supabase (PostgreSQL + Auth + RLS) como backend.
Una Edge Function en Deno que corre todos los días a las 12:00 vía `pg_cron` y dispara los WhatsApps a través de la API de Twilio.
Deploy en Vercel.

Los gráficos son SVG y CSS puro, sin librería de charting. Sumaban peso y no necesitábamos nada que no pudiéramos dibujar nosotros.

🔹 **Lo que me llevo**

Que el 80% del valor de este proyecto no está en el código sino en haber entendido el flujo de trabajo real de la fundación: por qué un operador necesita corregir la asistencia de ayer, por qué una persona puede pasar por varios centros a lo largo del tiempo pero solo estar activa en uno, y por qué un mensaje automático mal calibrado genera más ruido que ayuda.

Trabajo Práctico Integrador de Minería y Big Data — Licenciatura en Ciencias de Datos, UCA Rosario.
Con Juan Cruz Chocobares, Andrés Morenico y Lorenzo Mendes.

🔗 Demo interactiva (sin registro): fundadata.vercel.app/demo
💻 Código: github.com/aformen9/fundadata

#DesarrolloDeSoftware #React #TypeScript #PostgreSQL #Supabase #CienciaDeDatos #TecnologíaConImpacto #UCA

---
---

## OPCIÓN B — Versión corta

> Para si preferís algo que se lea entero sin "ver más".

---

Pasamos 10 planillas de Excel a una sola plataforma.

Una fundación con 10 centros comunitarios manejaba a sus beneficiarios en archivos separados: sin visibilidad central, sin control de duplicados entre centros, y sin manera de detectar que un chico llevaba días sin asistir.

**FundaData** resuelve las tres cosas:

✅ Base unificada con anti-duplicación — una persona no puede estar activa en dos centros a la vez
✅ Auditoría campo por campo — cada modificación queda registrada con autor y fecha
✅ Alertas automáticas por WhatsApp al tutor cuando hay 2 días consecutivos de ausencia

Lo más interesante fue implementar el aislamiento entre centros con Row Level Security de PostgreSQL: un operador no puede acceder a datos de otro centro ni manipulando el cliente, porque la restricción se evalúa dentro del motor de la base.

Y lo que más me hizo pensar: la detección de ausencias no puede comparar "hoy contra ayer". Los lunes rompen esa lógica. Termina siendo "hoy contra el último día con registro efectivo".

No hace falta que me creas nada de esto: hay una demo abierta, sin registro, con datos simulados. Entrás, elegís si querés verla como Fundación o como operador, y usás la app real.

Stack: React 19 + TypeScript + Supabase (PostgreSQL, Auth, RLS) + Edge Function en Deno + Twilio + Vercel.

TP Integrador de Minería y Big Data — Lic. en Ciencias de Datos, UCA Rosario.

🔗 fundadata.vercel.app/demo

#React #TypeScript #PostgreSQL #Supabase #TecnologíaConImpacto

---
---

## OPCIÓN C — Enfoque "un problema, una solución"

> Si querés que el post sea más técnico y menos institucional. Funciona mejor
> con audiencia de devs.

---

Escribí una función de detección de ausencias que funcionaba perfecto de martes a viernes.

Los lunes fallaba siempre.

Contexto: estábamos construyendo un sistema para una fundación con 10 centros comunitarios. Uno de los requisitos era avisar por WhatsApp al tutor cuando un chico acumulaba dos días consecutivos sin asistir.

La primera implementación era la obvia:

```sql
WHERE ausente(hoy) AND ausente(ayer)
```

El problema: los centros no cargan asistencia sábados, domingos ni feriados. El lunes, "ayer" es un domingo sin ningún registro. La condición nunca se cumplía y la alerta nunca salía —justo después del período más largo sin contacto.

La corrección fue dejar de asumir que el calendario del código coincide con el calendario operativo:

```sql
WHERE ausente(hoy)
  AND ausente( último día con registro anterior a hoy )
```

Ya no importa cuántos días pasaron. Importa cuál fue el último día que el centro efectivamente abrió.

El mismo razonamiento aplicó al cálculo de rachas: en vez de contar faltas dentro del mes calendario, usamos una ventana móvil de 30 días. Si no, una ausencia que arranca el 29 de septiembre aparece "reseteada" el 1 de octubre, exactamente cuando más importa.

Dos correcciones chicas, en dos queries. Pero son la diferencia entre un sistema de alertas que la fundación usa y uno que aprende a ignorar.

Parte de FundaData, TP Integrador de Minería y Big Data (UCA Rosario).
Stack: React 19 + TypeScript + Supabase + Edge Function en Deno + Twilio.

Hay demo abierta con datos simulados, sin registro:

🔗 fundadata.vercel.app/demo

#PostgreSQL #SQL #DesarrolloDeSoftware #React #Supabase

---
---

## Recomendaciones de formato

**Imágenes** (los posts con imagen rinden bastante más que los de solo texto):

> ✅ **Sacá todos los screenshots desde `/demo`.** Los datos ahí son sintéticos por
> construcción, así que no hay nada que anonimizar ni riesgo de filtrar una ficha
> real. Nunca uses capturas del entorno de producción: son datos de salud, consumo
> y violencia familiar de menores.
>
> Si querés la captura sin la barra amarilla de "Modo demo", ocultala con el
> inspector antes de sacarla — pero es más honesto dejarla puesta.

1. Dashboard de la Fundación con los KPIs y gráficos — es lo más vistoso que tiene
   el proyecto.
2. Panel del operador en la vista de asistencia (la tabla de seguimiento con los
   estados CRÍTICO / ATENCIÓN / REGULAR se lee muy bien en imagen).
3. El expediente con el historial de auditoría.
4. Opcional: un diagrama simple del flujo `asistencia → cron → edge function → Twilio → tutor`.

**Carrusel**: si querés más alcance, la Opción A funciona muy bien partida en
un PDF de 6-7 slides (1 problema / 2 roles / 3-4-5 decisiones técnicas / 6 stack /
7 resultado + links), con el texto del post reducido a los primeros tres párrafos.

**Timing**: martes a jueves, 8-10 AM.

**Menciones**: etiquetá a Juan Cruz Chocobares, Andrés Morenico y Lorenzo Mendes en
el cuerpo del post (no solo en comentarios) — les llega notificación y amplifica.

**Primer comentario**: dejá ahí los links (GitHub + demo) si notás que LinkedIn
te penaliza el alcance por tener enlaces externos en el cuerpo.

**Sobre el link de la demo**: usá siempre `/demo`, no la raíz. La raíz manda al
login y el que entra sin cuenta se queda en la puerta, que es justamente el
problema que la demo vino a resolver. El botón "Demo app" del login queda como
red de contención para quien llegue igual a la raíz.
