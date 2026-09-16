# -*- coding: utf-8 -*-
"""OperaDAS v2 · corrige el encuadre y agrega la ficha de cada eslabón.

Tres correcciones de fondo, sobre criterio de Codex verificado:
  - subir la asistencia no libera horas: aprovecha mejor horas ya pagadas
  - el costo de la inasistencia no es un hecho cerrado mientras los cupos
    bloqueados no tengan significado operacional
  - los cinco eslabones no son cantidades directamente restables: cada uno
    tiene su propio período, alcance y unidad, y hay que declararlo
"""
import io

P = "app.js"
s = io.open(P, encoding="utf-8").read()


def rep(a, b):
    global s
    assert a in s, "NO ENCONTRADO: " + a[:80]
    s = s.replace(a, b, 1)


# ── el nombre de la vista ────────────────────────────────────────────────
rep('V("La cadena", () => {', 'V("Balance operativo", () => {')

rep('''  f.appendChild(nodo(`<div class="enc">
    <h2>De lo programado a lo que falta</h2>
    <p>Cada eslabón es un sistema distinto: la programación operativa, el
    reporte de agenda, la resolución de dotación y la planilla de
    remuneraciones. OperaDAS los pone en una sola línea para ver dónde se
    pierde lo que se planificó. Agenda de ${D.meta.corte_agenda}.</p></div>`));''',
    '''  f.appendChild(nodo(`<div class="enc">
    <h2>Lo programado, lo agendado y lo atendido frente a la capacidad</h2>
    <p>Cada eslabón viene de un sistema distinto y tiene su propio período y su
    propia unidad. No son cinco cantidades que se resten entre sí: se leen
    juntas para ubicar dónde la operación se separa del plan.
    <strong>Haz clic en cualquier eslabón</strong> para ver qué mide
    exactamente, de dónde sale y qué falta aclarar.</p></div>`));''')

# ── eslabones con período propio y ficha ─────────────────────────────────
rep('''    const cad = nodo(`<div class="cadena"></div>`);
    const pasos = [
      {paso:"1 · Programado", cifra:N(e.req), uni:"horas al año",
       nota:`${N(e.lineas)} líneas · ${N(e.actividades)} actividades`,
       plata:e.costo_req ? `cuesta ${M(e.costo_req)}` : ""},
      {paso:"2 · Agendado", cifra:N(e.citas), uni:"citas ene-ago",
       nota:e.cupos ? `${N(e.cupos)} cupos ofrecidos · ${P0(e.ocupacion)} de ocupación`
                    : "sin agenda propia registrada"},
      {paso:"3 · No asistió", cifra:e.nsp!=null?P1(e.nsp):"—",
       uni:e.citas ? `${N(e.inasistencias)} citas perdidas` : "",
       nota:e.reutilizadas ? `${N(e.reutilizadas)} cupos se reutilizaron` : "",
       plata:hPerdidas && e.valor_hora
         ? `equivale a ${M1(hPerdidas*e.valor_hora)}` : "",
       clase:"merma"},
      {paso:"4 · Capacidad", cifra:N(e.cap), uni:"horas disponibles",
       nota:`${N1(e.jornadas)} jornadas${e.vacantes_h
         ? ` · ${N(e.vacantes_h)} h vacantes` : ""}`,
       plata:e.costo_cap ? `cuesta ${M(e.costo_cap)}` : ""},
      {paso:"5 · Brecha", cifra:N2(e.jce_obs), uni:"jornadas equivalentes",
       nota:`${N(Math.abs(brecha))} horas ${brecha<0?"faltan":"sobran"}`,
       plata:`con 20% sería ${N2(e.jce_20)}`, clase:"final"},
    ];
    pasos.forEach(p => cad.appendChild(nodo(
      `<div class="eslabon ${p.clase||""}">
        <div class="paso">${p.paso}</div>
        <div class="cifra">${p.cifra}</div>
        <div class="uni">${p.uni||""}</div>
        ${p.nota ? `<div class="nota">${p.nota}</div>` : ""}
        ${p.plata ? `<div class="plata">${p.plata}</div>` : ""}
      </div>`)));
    caja.appendChild(card(`${e.nom} · la cadena completa`,
      "Cada eslabón viene de una fuente distinta; el valor está en verlos juntos.",
      cad));

    if (hPerdidas && e.valor_hora){
      caja.appendChild(nodo(`<div class="aviso a-oro">
        <strong>Lo que cuesta que no lleguen.</strong> Con
        ${P1(e.nsp)} de inasistencia sobre ${N(e.dir)} horas de atención
        directa, ${e.nom.toLowerCase()} pierde ${N(hPerdidas)} horas al año.
        Al valor hora de ${"$"+N(e.valor_hora)} son
        <strong>${M1(hPerdidas*e.valor_hora)}</strong> que se pagan y no se
        convierten en atención.${e.reutilizadas ? ` Solo
        ${N(e.reutilizadas)} de esas citas se reutilizaron.` : ""}</div>`));
    }''',
    '''    const cad = nodo(`<div class="cadena"></div>`);
    const pasos = [
      {paso:"Programado", per:"año 2026", cifra:N(e.req), uni:"horas al año",
       nota:`${N(e.lineas)} líneas · ${N(e.actividades)} actividades`,
       plata:e.costo_req ? `cuesta ${M(e.costo_req)}` : "",
       ficha:{
         mide:"Las horas que la programación operativa comprometió para este estamento: atención directa más actividades indirectas.",
         periodo:"Año completo 2026, tal como se programó.",
         formula:"Suma de las horas de cada línea. Por línea: población × prevalencia × cobertura × concentración ÷ rendimiento.",
         fuente:"Programación operativa 2026 del Departamento.",
         ojo:"72 de las 923 líneas no reproducen su propio cálculo declarado. Esa revisión está pendiente."}},
      {paso:"Agendado", per:"enero a agosto", cifra:N(e.citas), uni:"citas",
       nota:e.cupos ? `${N(e.cupos)} cupos ofrecidos · ${P0(e.ocupacion)} de ocupación`
                    : "sin agenda propia registrada",
       ficha:{
         mide:"Las citas que efectivamente se agendaron, y los cupos que se ofrecieron para tomarlas.",
         periodo:"Enero a agosto de 2026. Ocho meses, no el año completo: no es comparable con el eslabón anterior sin anualizarlo.",
         formula:"Suma de TOTAL CITA y TOTAL CUPOS PROGRAMAS del reporte de productividad, agregada por estamento.",
         fuente:"Reporte de productividad por profesional del sistema de agenda. El archivo de origen identifica al funcionario; acá va agregado.",
         ojo:e.ocupacion > 1 ? "La ocupación supera el 100% porque se cita por sobre los cupos, mediante sobrecupo y atención espontánea." : ""}},
      {paso:"No asistió", per:"enero a agosto",
       cifra:e.nsp!=null?P1(e.nsp):"—",
       uni:e.citas ? `${N(e.inasistencias)} citas` : "",
       nota:e.reutilizadas ? `${N(e.reutilizadas)} cupos se reutilizaron` : "",
       plata:hPerdidas && e.valor_hora
         ? `capacidad por ${M1(hPerdidas*e.valor_hora)}` : "",
       clase:"merma",
       ficha:{
         mide:"La proporción de citas agendadas a las que la persona no llegó.",
         periodo:"Enero a agosto de 2026.",
         formula:"Inasistencias ÷ citas. El neto descuenta los cupos que se reutilizaron con otro paciente.",
         fuente:"Mismo reporte de agenda.",
         ojo:"La programación asume 20% uniforme para todos los estamentos. Este es el dato medido, y varía mucho entre uno y otro."}},
      {paso:"Capacidad", per:"año 2026", cifra:N(e.cap), uni:"horas disponibles",
       nota:`${N1(e.jornadas)} jornadas${e.vacantes_h
         ? ` · ${N(e.vacantes_h)} h vacantes` : ""}`,
       plata:e.costo_cap ? `cuesta ${M(e.costo_cap)}` : "",
       ficha:{
         mide:"Las horas que la dotación aprobada puede entregar en el año, descontados los ajustes conocidos.",
         periodo:"Año completo 2026.",
         formula:"Jornadas × 1.754,9 horas anuales por jornada equivalente, más los ajustes declarados.",
         fuente:"Resolución Exenta 5505 que aprueba la dotación 2026.",
         ojo:"El divisor usa 218 días de referencia cuando los días programables son 223,5. Esa diferencia ya absorbe parte de la inasistencia laboral."}},
      {paso:"Brecha", per:"año 2026", cifra:N2(e.jce_obs),
       uni:"jornadas equivalentes",
       nota:`${N(Math.abs(brecha))} horas ${brecha<0?"faltan":"sobran"}`,
       plata:`con el supuesto de 20% sería ${N2(e.jce_20)}`, clase:"final",
       ficha:{
         mide:"Cuántas jornadas faltan o sobran, una vez que las horas directas se ajustan por la inasistencia observada.",
         periodo:"Año completo 2026.",
         formula:"Capacidad − (horas directas ÷ (1 − inasistencia) + horas indirectas), dividido por la jornada equivalente. Las indirectas no se ajustan porque no se agendan con pacientes.",
         fuente:"Cálculo de OperaDAS sobre las fuentes anteriores.",
         ojo:"No es una cifra cerrada. Tres componentes siguen en conciliación: dónde entraba cada cargo vacante en el cálculo original, cuántas horas aportan los honorarios de convenio, y cómo se concilia el ausentismo con las vacantes sin contar dos veces la misma hora."}},
    ];
    pasos.forEach((p,i) => {
      const n = nodo(
        `<div class="eslabon ${p.clase||""}" role="button" tabindex="0"
              aria-expanded="false">
          <div class="paso">${i+1} · ${p.paso}</div>
          <div class="per">${p.per}</div>
          <div class="cifra">${p.cifra}</div>
          <div class="uni">${p.uni||""}</div>
          ${p.nota ? `<div class="nota">${p.nota}</div>` : ""}
          ${p.plata ? `<div class="plata">${p.plata}</div>` : ""}
          <div class="abrir">qué mide ›</div>
        </div>`);
      const ver = () => mostrarFicha(p, e);
      n.addEventListener("click", ver);
      n.addEventListener("keydown", ev => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ver(); }
      });
      cad.appendChild(n);
    });
    caja.appendChild(card(`${e.nom} · balance operativo`,
      "Cada eslabón tiene su propio período y su propia unidad. Haz clic para ver la ficha.",
      cad));

    const fichaCaja = nodo(`<div id="ficha"></div>`);
    caja.appendChild(fichaCaja);

    if (hPerdidas && e.valor_hora){
      caja.appendChild(nodo(`<div class="aviso a-oro">
        <strong>Qué significa esa capacidad.</strong> Con ${P1(e.nsp)} de
        inasistencia sobre ${N(e.dir)} horas de atención directa,
        ${N(hPerdidas)} horas al año quedaron agendadas sin atención
        registrada. Al valor hora de ${"$"+N(e.valor_hora)} equivalen a
        ${M1(hPerdidas*e.valor_hora)}. <strong>No es un ahorro disponible ni
        una hora ociosa comprobada:</strong> la hora igual se paga, y parte de
        ese tiempo puede haberse ocupado en otra cosa que el reporte de agenda
        no registra. Es la medida de cuánta capacidad ya pagada podría
        aprovecharse mejor.${e.reutilizadas ? ` De esas citas,
        ${N(e.reutilizadas)} se reutilizaron con otro paciente.` : ""}</div>`));
    }''')

# ── la ficha ─────────────────────────────────────────────────────────────
rep('''/* ── 2 · el costo ──''',
    '''function mostrarFicha(p, e){
  const c = document.getElementById("ficha");
  if (!c) return;
  c.innerHTML = "";
  const f = p.ficha;
  c.appendChild(nodo(`<div class="card ficha">
    <div class="card-h">
      <h3>${p.paso} · ${e.nom}</h3>
      <p>${p.per} · ${p.cifra} ${p.uni||""}</p>
    </div>
    <div class="card-b">
      <dl class="ficha-dl">
        <dt>Qué mide</dt><dd>${f.mide}</dd>
        <dt>Período</dt><dd>${f.periodo}</dd>
        <dt>Cómo se calcula</dt><dd>${f.formula}</dd>
        <dt>De dónde sale</dt><dd>${f.fuente}</dd>
        ${f.ojo ? `<dt class="ojo">Qué falta aclarar</dt>
                   <dd class="ojo">${f.ojo}</dd>` : ""}
      </dl>
    </div>
  </div>`));
  c.scrollIntoView({behavior:"smooth", block:"nearest"});
}

/* ── 2 · el costo ──''')

# ── el encuadre del costo ────────────────────────────────────────────────
rep('''  g.appendChild(kpi("Costo de la inasistencia", M(T.costo_nsp),
    `${P1(T.costo_nsp/T.costo_req)} de lo programado`, "oro"));''',
    '''  g.appendChild(kpi("Capacidad sin atención registrada", M(T.costo_nsp),
    `${P1(T.costo_nsp/T.costo_req)} de lo programado · no es ahorro`, "oro"));''')

rep('''  f.appendChild(nodo(`<div class="aviso a-oro">
    <strong>${M(T.costo_nsp)} al año en horas que se pagan y no se
    convierten en atención.</strong> Es la inasistencia observada aplicada a
    las horas de atención directa, valorizada al costo real de cada estamento.
    No es un ahorro disponible —la hora igual se paga— pero sí es la medida de
    cuánto rinde cada punto que se recupere de asistencia.</div>`));''',
    '''  f.appendChild(nodo(`<div class="aviso a-oro">
    <strong>${M(T.costo_nsp)} al año de capacidad pagada que no quedó
    registrada como atención.</strong> Es la inasistencia observada aplicada a
    las horas de atención directa, valorizada al costo real de cada estamento.
    Conviene leerla con tres reservas. <strong>No es un ahorro:</strong> la
    hora se paga igual. <strong>No es tiempo ocioso comprobado:</strong> parte
    de ese tiempo pudo ocuparse en otra cosa que el reporte de agenda no
    registra. Y <strong>no es capacidad que se libere:</strong> si la asistencia
    mejora, la carga efectiva del profesional aumenta, no disminuye. Es la
    medida de cuánta capacidad ya financiada podría aprovecharse mejor.</div>`));''')

# ── advertencia junto al dato de bloqueos, no solo en la vista de agenda ──
rep('''  g.appendChild(kpi("Cupos bloqueados", N(tbl),
    `${P1(tbl/(tcu+tbl))} del total`, "ambar"));''',
    '''  g.appendChild(kpi("Cupos bloqueados", N(tbl),
    `${P1(tbl/(tcu+tbl))} del total · sin clasificar`, "ambar"));''')

io.open(P, "w", encoding="utf-8").write(s)
print("app.js: balance operativo, fichas y encuadre corregido")
