# -*- coding: utf-8 -*-
"""Agrega el análisis de compensación de la inasistencia.

La inasistencia no deja la hora vacía por sí sola: parte se compensa con
sobrecupos y atención espontánea. La compensación existe pero es muy desigual
entre estamentos, y esa desigualdad es lo que hay que mostrar.

Corrige además la métrica de ocupación: dividir el total de citas por los cupos
programados mezcla las citas que no ocuparon cupo, y da sobre 100% donde no
corresponde.
"""
import io

P = "app.js"
s = io.open(P, encoding="utf-8").read()


def rep(a, b):
    global s
    assert a in s, "NO ENCONTRADO: " + a[:80]
    s = s.replace(a, b, 1)


# ── ficha del eslabón «No asistió»: incorporar la compensación ───────────
rep('''       ficha:{
         mide:"La proporción de citas agendadas a las que la persona no llegó.",
         periodo:"Enero a agosto de 2026.",
         formula:"Inasistencias ÷ citas. El neto descuenta los cupos que se reutilizaron con otro paciente.",
         fuente:"Mismo reporte de agenda.",
         ojo:"La programación asume 20% uniforme para todos los estamentos. Este es el dato medido, y varía mucho entre uno y otro."}},''',
    '''       ficha:{
         mide:"La proporción de citas agendadas a las que la persona no llegó.",
         periodo:"Enero a agosto de 2026.",
         formula:"Inasistencias ÷ citas. El neto descuenta los cupos que se reutilizaron con otro paciente.",
         fuente:"Mismo reporte de agenda.",
         ojo:(e.compensacion != null
           ? `La hora no queda necesariamente vacía: ${N(e.no_programadas)} citas se atendieron fuera de cupo programado, entre sobrecupo y atención espontánea. Eso compensa el ${P0(e.compensacion)} de las inasistencias de este estamento. `
           : "") + "La programación asume 20% uniforme para todos los estamentos. Este es el dato medido, y varía mucho entre uno y otro."}},''')

# ── vista de agenda: la compensación como bloque propio ──────────────────
rep('''  f.appendChild(nodo(`<div class="aviso a-info">
    <strong>Los cupos bloqueados son la pregunta abierta.</strong> Son
    ${N(tbl)} en ocho meses, ${P1(tbl/(tcu+tbl))} del total de cupos. No
    sabemos qué cuenta el sistema como bloqueo: puede incluir feriados,
    capacitación y licencias, que son legítimos. Antes de leerlo como capacidad
    desaprovechada hay que aclararlo con quien administra las agendas.</div>`));''',
    '''  const T2 = D.total;
  const comp2 = T2.sobrecupos + T2.espontanea;
  f.appendChild(nodo(`<div class="aviso a-info">
    <strong>La inasistencia no deja la hora vacía por sí sola.</strong>
    En los mismos ocho meses se atendieron ${N(comp2)} citas fuera de cupo
    programado: ${N(T2.sobrecupos)} sobrecupos y ${N(T2.espontanea)} de
    atención espontánea. En el agregado eso equivale al
    ${P0(comp2/T2.inasistencias)} de las ${N(T2.inasistencias)} inasistencias.
    Pero el agregado engaña: la compensación es muy desigual, y no ocurre en el
    mismo box ni con el mismo profesional que perdió la cita.</div>`));

  const cmp = D.estamentos.filter(e => e.citas >= 200 && e.inasistencias > 0)
                .slice().sort((a,b)=>a.compensacion-b.compensacion);
  f.appendChild(card("Cuánto se compensa la inasistencia, por estamento",
    "Citas atendidas fuera de cupo programado sobre citas perdidas por inasistencia. La línea marca la compensación total.",
    barrasH({datos: cmp.map(e=>({
      et:e.nom, val:Math.min(e.compensacion, 3),
      color: e.compensacion >= 1 ? C.verde : e.compensacion >= .5 ? C.ambar : C.rojo,
      tip:`<b>${e.nom}</b><br>
           ${N(e.inasistencias)} inasistencias<br>
           ${N(e.sobrecupos)} sobrecupos + ${N(e.espontanea)} espontáneas<br>
           <b>compensa ${P0(e.compensacion)}</b>`
    })), max:3, ref:1, refRot:"compensación completa", fmt:P0,
       etAncho:150, filaH:25, ancho:820,
       etiqueta:"Compensación de la inasistencia por estamento"})));

  f.appendChild(nodo(`<div class="aviso a-rojo">
    <strong>Odontología y nutrición son las que de verdad pierden.</strong>
    Odontología acumula ${N(D.estamentos.find(e=>e.cod==="ODO").inasistencias)}
    inasistencias y solo compensa el
    ${P0(D.estamentos.find(e=>e.cod==="ODO").compensacion)};
    nutrición, ${N(D.estamentos.find(e=>e.cod==="NUT").inasistencias)}
    con ${P0(D.estamentos.find(e=>e.cod==="NUT").compensacion)} de
    compensación. Son box que no reciben demanda espontánea. En enfermería y
    TENS pasa lo contrario: la demanda no programada supera con holgura lo que
    se pierde.</div>`));

  f.appendChild(card("Sobrecupo y atención espontánea",
    "Sobre los cupos programados de cada estamento.",
    tabla([
      {t:"Estamento", k:"e"}, {t:"Cupos programados", k:"cu", num:true},
      {t:"Sobrecupos", k:"s", num:true}, {t:"Tasa de sobrecupo", k:"ts", num:true},
      {t:"Atención espontánea", k:"es", num:true},
      {t:"Tasa de espontánea", k:"te", num:true},
      {t:"Inasistencias", k:"i", num:true},
      {t:"Compensación", k:"c", num:true},
    ], D.estamentos.filter(e=>e.citas>=200).slice()
      .sort((a,b)=>b.cupos-a.cupos).map(e=>({
        e:`<b>${e.nom}</b>`, cu:N(e.cupos), s:N(e.sobrecupos),
        ts:P1(e.tasa_sobrecupo), es:N(e.espontanea), te:P1(e.tasa_espontanea),
        i:N(e.inasistencias),
        c:e.compensacion!=null ? `<b>${P0(e.compensacion)}</b>` : "—"
      })).concat([{__tot:true, e:"<b>TOTAL</b>", cu:`<b>${N(T2.cupos)}</b>`,
        s:`<b>${N(T2.sobrecupos)}</b>`, ts:`<b>${P1(T2.sobrecupos/T2.cupos)}</b>`,
        es:`<b>${N(T2.espontanea)}</b>`,
        te:`<b>${P1(T2.espontanea/T2.cupos)}</b>`,
        i:`<b>${N(T2.inasistencias)}</b>`,
        c:`<b>${P0(comp2/T2.inasistencias)}</b>`}]),
      {nota:"La tasa de sobrecupo comunal es de 2,2% sobre los cupos programados y la de atención espontánea 13,7%. La compensación es agregada, no por cupo: una inasistencia en odontología no la llena una consulta espontánea de morbilidad."})));

  f.appendChild(nodo(`<div class="aviso a-info">
    <strong>Los cupos bloqueados son la pregunta abierta.</strong> Son
    ${N(tbl)} en ocho meses, ${P1(tbl/(tcu+tbl))} del total de cupos. No
    sabemos qué cuenta el sistema como bloqueo: puede incluir feriados,
    capacitación y licencias, que son legítimos. Antes de leerlo como capacidad
    desaprovechada hay que aclararlo con quien administra las agendas.</div>`));

  f.appendChild(nodo(`<div class="aviso a-info">
    <strong>Y una categoría que todavía no sabemos leer.</strong>
    ${N(T2.no_atendidos)} citas quedaron registradas como «no atendidas», el
    ${P1(T2.no_atendidos/T2.citas)} del total. No son inasistencias —esas se
    cuentan aparte— y el reporte no dice qué las origina. Aparecen en todos los
    estamentos, con enfermería y TENS a la cabeza. Es la segunda pregunta para
    quien administra las agendas.</div>`));''')

# ── corregir la métrica de ocupación ─────────────────────────────────────
rep('''  g.appendChild(kpi("Ocupación de la agenda", P1(tc/tcu),
    "Citas sobre cupos ofrecidos", "verde"));''',
    '''  g.appendChild(kpi("Citas fuera de cupo", N(D.total.sobrecupos+D.total.espontanea),
    `${N(D.total.sobrecupos)} sobrecupos · ${N(D.total.espontanea)} espontáneas`,
    "verde"));''')

io.open(P, "w", encoding="utf-8").write(s)
print("app.js: compensación de la inasistencia incorporada")
