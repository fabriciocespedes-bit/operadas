/* OperaDAS · la cadena completa de la programación operativa.
   Departamento de Salud Municipal de Pozo Almonte. */
(function () {
"use strict";

const D = window.OPERADAS;
const N  = n => (n == null ? "—" : Math.round(n).toLocaleString("es-CL"));
const N1 = n => (n == null ? "—" : Number(n).toLocaleString("es-CL",
              {minimumFractionDigits:1, maximumFractionDigits:1}));
const N2 = n => (n == null ? "—" : Number(n).toLocaleString("es-CL",
              {minimumFractionDigits:2, maximumFractionDigits:2}));
const P0 = n => (n == null ? "—" : (n*100).toLocaleString("es-CL",
              {maximumFractionDigits:0}) + "%");
const P1 = n => (n == null ? "—" : (n*100).toLocaleString("es-CL",
              {minimumFractionDigits:1, maximumFractionDigits:1}) + "%");
/* los montos anuales se leen mejor en millones */
const M  = n => (n == null ? "—" : "$" + Number(n/1e6).toLocaleString("es-CL",
              {maximumFractionDigits:0}) + " M");
const M1 = n => (n == null ? "—" : "$" + Number(n/1e6).toLocaleString("es-CL",
              {minimumFractionDigits:1, maximumFractionDigits:1}) + " M");

const C = {inst:"#1e3a8a", inst400:"#5b82d6", inst200:"#bfd3fe",
           oro:"#f4b400", rojo:"#b91c1c", verde:"#15803d", ambar:"#b45309",
           faint:"#8698bd"};

/* ─────────────────────────────── utilidades ───────────────────────────── */
const nodo = html => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
const el = (t, a) => {
  const n = document.createElementNS("http://www.w3.org/2000/svg", t);
  for (const k in a) n.setAttribute(k, a[k]);
  return n;
};

const tip = document.getElementById("tip");
function conTip(n, html){
  const ver = ev => {
    tip.innerHTML = html;
    tip.style.opacity = "1";
    const r = tip.getBoundingClientRect();
    let x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + r.width  > innerWidth  - 8) x = ev.clientX - r.width  - 14;
    if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  };
  n.addEventListener("mousemove", ver);
  n.addEventListener("mouseleave", () => tip.style.opacity = "0");
  n.setAttribute("tabindex", "0");
  n.addEventListener("focus", () => {
    const b = n.getBoundingClientRect();
    ver({clientX:b.right, clientY:b.top});
  });
  n.addEventListener("blur", () => tip.style.opacity = "0");
}

const kpi = (lab, val, hint, tono) => nodo(
  `<div class="kpi ${tono||""}"><div class="lab">${lab}</div>
   <div class="val">${val}</div>
   ${hint ? `<div class="hint">${hint}</div>` : ""}</div>`);

function card(titulo, sub, cuerpo){
  const c = nodo(`<div class="card">${titulo ?
    `<div class="card-h"><h3>${titulo}</h3>${
      sub ? `<p>${sub}</p>` : ""}</div>` : ""}<div class="card-b"></div></div>`);
  c.querySelector(".card-b").appendChild(cuerpo);
  return c;
}

function tabla(cols, filas, opt){
  opt = opt || {};
  const w = nodo(`<div><div class="scroll-x"><table><thead><tr>${
    cols.map(c=>`<th class="${c.num?"num":""}">${c.t}</th>`).join("")
  }</tr></thead><tbody></tbody></table></div>${
    opt.nota ? `<p class="nota">${opt.nota}</p>` : ""}</div>`);
  const tb = w.querySelector("tbody");
  filas.forEach(f => {
    const tr = nodo(`<tr class="${f.__tot?"tot":""}">${
      cols.map(c=>`<td class="${c.num?"num":""}">${
        f[c.k] == null ? "—" : f[c.k]}</td>`).join("")}</tr>`);
    tb.appendChild(tr);
  });
  return w;
}

/* eje con topes redondos */
function ejeBonito(max, n){
  if (max <= 0) return {tope:1, paso:1};
  const crudo = max / n, mag = Math.pow(10, Math.floor(Math.log10(crudo)));
  const norm = crudo / mag;
  const paso = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5
             : norm <= 5 ? 5 : 10) * mag;
  return {tope: Math.ceil(max/paso)*paso, paso};
}

function barrasH(cfg){
  const d = cfg.datos, filaH = cfg.filaH||26, etA = cfg.etAncho||96;
  const w = cfg.ancho||780, h = d.length*filaH + 34;
  const ml = etA+8, mr = 62, aw = w-ml-mr;
  const svg = el("svg",{class:"chart", viewBox:`0 0 ${w} ${h}`, role:"img",
                        "aria-label":cfg.etiqueta||"gráfico"});
  const max = cfg.max != null ? cfg.max
            : ejeBonito(Math.max(...d.map(x=>Math.abs(x.val)))*1.08, 4).tope;
  d.forEach((r,i) => {
    const y = i*filaH + 6, bh = filaH-11;
    const t = el("text",{x:etA, y:y+bh/2+4, "text-anchor":"end", class:"ax"});
    t.textContent = r.et; svg.appendChild(t);
    const bw = Math.max(2, Math.abs(r.val)/max*aw);
    const g = el("g",{class:"mark"});
    g.appendChild(el("rect",{x:ml, y:y, width:bw, height:bh, rx:3,
                             fill:r.color||C.inst}));
    const v = el("text",{x:ml+bw+7, y:y+bh/2+4, class:"ax",
                         fill:r.color||C.inst, "font-weight":"600"});
    v.textContent = (cfg.fmt||N)(r.val); g.appendChild(v);
    if (r.tip) conTip(g, r.tip);
    svg.appendChild(g);
  });
  if (cfg.ref != null){
    const x = ml + cfg.ref/max*aw;
    svg.appendChild(el("line",{x1:x, y1:0, x2:x, y2:d.length*filaH,
                               class:"ref"}));
    const t = el("text",{x:x, y:d.length*filaH+16, class:"ax",
                         "text-anchor":"middle"});
    t.textContent = cfg.refRot||""; svg.appendChild(t);
  }
  return svg;
}

/* ───────────────────────────── vistas ─────────────────────────────────── */
const VISTAS = [];
const V = (nom, fn) => VISTAS.push({nom, fn});

/* ── 1 · la cadena ─────────────────────────────────────────────────────── */
let selEst = "MED";

V("Balance operativo", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc">
    <h2>Lo programado, lo agendado y lo atendido frente a la capacidad</h2>
    <p>Cada eslabón viene de un sistema distinto y tiene su propio período y su
    propia unidad. No son cinco cantidades que se resten entre sí: se leen
    juntas para ubicar dónde la operación se separa del plan.
    <strong>Haz clic en cualquier eslabón</strong> para ver qué mide
    exactamente, de dónde sale y qué falta aclarar.</p></div>`));

  const sel = nodo(`<div class="selector"></div>`);
  D.estamentos.forEach(e => {
    const b = nodo(`<button type="button" aria-pressed="${e.cod===selEst}"
      >${e.nom}</button>`);
    b.addEventListener("click", () => { selEst = e.cod; pintar(); });
    sel.appendChild(b);
  });
  f.appendChild(sel);

  const caja = nodo(`<div></div>`);
  f.appendChild(caja);

  function pintar(){
    document.querySelectorAll(".selector button").forEach((b,i) =>
      b.setAttribute("aria-pressed", String(D.estamentos[i].cod === selEst)));
    caja.innerHTML = "";
    const e = D.estamentos.find(x => x.cod === selEst);
    const hPerdidas = e.nsp != null ? e.dir * e.nsp : null;
    const brecha = e.cap - e.req;

    const cad = nodo(`<div class="cadena"></div>`);
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
         ojo:(e.compensacion != null
           ? `La hora no queda necesariamente vacía: ${N(e.no_programadas)} citas se atendieron fuera de cupo programado, entre sobrecupo y atención espontánea. Eso compensa el ${P0(e.compensacion)} de las inasistencias de este estamento. `
           : "") + "La programación asume 20% uniforme para todos los estamentos. Este es el dato medido, y varía mucho entre uno y otro."}},
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
    }

    const det = [];
    Object.entries(e.ciclos||{}).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) =>
      det.push({d:k, h:N(v), p:P1(v/e.dir), t:"ciclo vital"}));
    Object.entries(e.acciones||{}).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) =>
      det.push({d:k, h:N(v), p:P1(v/e.dir), t:"tipo de acción"}));
    if (det.length) caja.appendChild(card("En qué se van las horas directas", "",
      tabla([{t:"", k:"t"}, {t:"Componente", k:"d"},
             {t:"Horas al año", k:"h", num:true},
             {t:"Del total directo", k:"p", num:true}], det)));
  }
  pintar();
  return f;
});

function mostrarFicha(p, e){
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

/* ── 2 · el costo ──────────────────────────────────────────────────────── */
V("El costo", () => {
  const f = document.createDocumentFragment();
  const T = D.total;
  f.appendChild(nodo(`<div class="enc">
    <h2>Cuánto cuesta lo que programamos</h2>
    <p>Valor hora efectivamente pagado por estamento, tomado de las
    remuneraciones del año. Ninguna herramienta de programación calcula esto:
    todas se quedan en horas.</p></div>`));

  const g = nodo(`<div class="grid g4"></div>`);
  g.appendChild(kpi("Costo de lo programado", M(T.costo_req),
    `${N(T.req)} horas al año`, "inst"));
  g.appendChild(kpi("Costo de la capacidad", M(T.costo_cap),
    `${N(T.cap)} horas disponibles`));
  g.appendChild(kpi("Capacidad sin atención registrada", M(T.costo_nsp),
    `${P1(T.costo_nsp/T.costo_req)} de lo programado · no es ahorro`, "oro"));
  g.appendChild(kpi("Diferencia", M(T.costo_req - T.costo_cap),
    "Lo programado por sobre lo financiado", "rojo"));
  f.appendChild(g);

  f.appendChild(nodo(`<div class="aviso a-oro">
    <strong>${M(T.costo_nsp)} al año de capacidad pagada que no quedó
    registrada como atención.</strong> Es la inasistencia observada aplicada a
    las horas de atención directa, valorizada al costo real de cada estamento.
    Conviene leerla con tres reservas. <strong>No es un ahorro:</strong> la
    hora se paga igual. <strong>No es tiempo ocioso comprobado:</strong> parte
    de ese tiempo pudo ocuparse en otra cosa que el reporte de agenda no
    registra. Y <strong>no es capacidad que se libere:</strong> si la asistencia
    mejora, la carga efectiva del profesional aumenta, no disminuye. Es la
    medida de cuánta capacidad ya financiada podría aprovecharse mejor.</div>`));

  const con = D.estamentos.filter(e => e.costo_nsp);
  f.appendChild(card("Costo de la inasistencia por estamento",
    "Horas directas perdidas × valor hora del estamento.",
    barrasH({datos: con.slice().sort((a,b)=>b.costo_nsp-a.costo_nsp).map(e=>({
      et:e.nom, val:e.costo_nsp/1e6, color:C.oro,
      tip:`<b>${e.nom}</b><br>${P1(e.nsp)} de inasistencia<br>
           ${N(e.dir*e.nsp)} horas al año<br>
           <span class="l">valor hora ${"$"+N(e.valor_hora)}</span>`
    })), fmt:v=>"$"+N1(v)+" M", etAncho:150, filaH:25, ancho:820,
       etiqueta:"Costo anual de la inasistencia por estamento"})));

  f.appendChild(card("Detalle económico por estamento", "",
    tabla([
      {t:"Estamento", k:"e"}, {t:"Valor hora", k:"vh", num:true},
      {t:"Horas programadas", k:"h", num:true},
      {t:"Costo de lo programado", k:"cr", num:true},
      {t:"Costo de la capacidad", k:"cc", num:true},
      {t:"Costo de la inasistencia", k:"cn", num:true},
    ], D.estamentos.slice().sort((a,b)=>(b.costo_req||0)-(a.costo_req||0))
      .map(e=>({
        e:`<b>${e.nom}</b>`, vh:"$"+N(e.valor_hora), h:N(e.req),
        cr:M1(e.costo_req), cc:M1(e.costo_cap),
        cn:e.costo_nsp ? M1(e.costo_nsp) : "—"
      })).concat([{__tot:true, e:"<b>TOTAL</b>", vh:"",
        h:`<b>${N(D.total.req)}</b>`, cr:`<b>${M(D.total.costo_req)}</b>`,
        cc:`<b>${M(D.total.costo_cap)}</b>`,
        cn:`<b>${M(D.total.costo_nsp)}</b>`}]),
      {nota:"El valor hora sale de dividir los haberes anuales efectivamente pagados por las horas programables del año, excluyendo jornadas de relleno. Es costo de remuneración, no costo total de la prestación: no incluye insumos, fármacos ni gastos de operación."})));
  return f;
});

/* ── 3 · la brecha ─────────────────────────────────────────────────────── */
V("La brecha", () => {
  const f = document.createDocumentFragment();
  f.appendChild(nodo(`<div class="enc">
    <h2>Cuántas jornadas faltan, y bajo qué supuesto</h2>
    <p>La misma brecha cambia según cómo se trate la inasistencia. OperaDAS
    muestra los tres escenarios en vez de elegir uno, porque la diferencia
    entre ellos es una decisión de método que corresponde al Departamento, no
    a la herramienta.</p></div>`));

  const B = D.brecha.deficit;
  const g = nodo(`<div class="grid g3"></div>`);
  g.appendChild(kpi("Sin ajustar por inasistencia", N2(B["sin ajuste"])+" JCE",
    "Supone que toda hora agendada se atiende", "ambar"));
  g.appendChild(kpi("Con el supuesto de 20%", N2(B["supuesto 20%"])+" JCE",
    "El supuesto que usa la programación", "rojo"));
  g.appendChild(kpi("Con la inasistencia observada", N2(B["observado"])+" JCE",
    "Medida por estamento, enero a agosto", "rojo"));
  f.appendChild(g);

  f.appendChild(nodo(`<div class="aviso a-rojo">
    <strong>Reconocer la inasistencia empeora la brecha, no la mejora.</strong>
    La cifra que se venía informando no consideraba el fenómeno. Con el dato
    medido el déficit llega a ${N2(B["observado"])} jornadas, y con el supuesto
    del 20% a ${N2(B["supuesto 20%"])}. El ajuste se aplica solo a las horas de
    atención directa: las indirectas no se agendan con pacientes.</div>`));

  f.appendChild(card("Brecha por estamento en los tres escenarios",
    "Jornadas completas equivalentes. Negativo es déficit.",
    barrasH({datos: D.estamentos.map(e=>({
      et:e.nom, val:e.jce_obs, color: e.jce_obs<0 ? C.rojo : C.inst400,
      tip:`<b>${e.nom}</b><br>
           sin ajuste ${N2(e.jce_sin)} · con 20% ${N2(e.jce_20)}<br>
           <b>observado ${N2(e.jce_obs)}</b><br>
           <span class="l">NSP ${P1(e.nsp)}${e.nsp_propio?"":" (global)"}</span>`
    })), fmt:N2, etAncho:150, filaH:25, ancho:820, ref:0,
       etiqueta:"Brecha por estamento con la inasistencia observada"})));

  f.appendChild(card("Detalle", "",
    tabla([
      {t:"Estamento", k:"e"}, {t:"Requerido (h)", k:"req", num:true},
      {t:"Capacidad (h)", k:"cap", num:true},
      {t:"NSP observado", k:"nsp", num:true},
      {t:"Sin ajuste", k:"a", num:true}, {t:"Con 20%", k:"b", num:true},
      {t:"Observado", k:"c", num:true},
    ], D.estamentos.map(e=>({
      e:`<b>${e.nom}</b>${e.nsp_propio?"":" *"}`, req:N(e.req), cap:N(e.cap),
      nsp:P1(e.nsp), a:N2(e.jce_sin), b:N2(e.jce_20),
      c:`<b>${N2(e.jce_obs)}</b>`
    })), {nota:"Los estamentos con asterisco no tienen volumen propio suficiente en el registro de agenda y usan el NSP global de la comuna. Nutrición es el único donde el dato real empeora la brecha respecto del supuesto, porque su inasistencia de 21,3% supera el 20% asumido."})));
  return f;
});

/* ── 4 · la agenda ─────────────────────────────────────────────────────── */
V("La agenda", () => {
  const f = document.createDocumentFragment();
  const T = D.total;
  const comp = D.agenda_mes.filter(m => !m.parcial);
  const tc = comp.reduce((a,m)=>a+m.citas,0);
  const ti = comp.reduce((a,m)=>a+m.inasistencias,0);
  const tcu = comp.reduce((a,m)=>a+m.cupos,0);
  const tbl = comp.reduce((a,m)=>a+m.bloqueados,0);

  f.appendChild(nodo(`<div class="enc">
    <h2>Qué pasa con las horas que se ofrecen</h2>
    <p>Reporte de productividad por profesional, ${D.meta.corte_agenda}, en los
    cuatro establecimientos con población inscrita. Los datos de origen
    identifican al funcionario; acá van agregados por estamento, sin nombres ni
    RUN.</p></div>`));

  const g = nodo(`<div class="grid g4"></div>`);
  g.appendChild(kpi("Citas agendadas", N(tc), "Enero a agosto", "inst"));
  g.appendChild(kpi("Inasistencia", P1(ti/tc),
    `${N(ti)} citas · supuesto ${P0(D.meta.nsp_supuesto)}`, "rojo"));
  g.appendChild(kpi("Citas fuera de cupo",
    N(D.agenda_total.sobrecupos+D.agenda_total.espontanea),
    `${N(D.agenda_total.sobrecupos)} sobrecupos · ${N(D.agenda_total.espontanea)} espontáneas`,
    "verde"));
  g.appendChild(kpi("Cupos bloqueados", N(tbl),
    `${P1(tbl/(tcu+tbl))} del total · sin clasificar`, "ambar"));
  f.appendChild(g);

  const est = D.agenda_estamento.filter(e => e.citas >= 200);
  f.appendChild(card("Inasistencia por estamento",
    "La línea marca el supuesto de la programación.",
    barrasH({datos: est.slice().sort((a,b)=>b.nsp-a.nsp).map(e=>({
      et:e.nom, val:e.nsp,
      color: e.nsp >= D.meta.nsp_supuesto ? C.rojo : C.inst,
      tip:`<b>${e.nom}</b><br>${N(e.inasistencias)} de ${N(e.citas)} citas<br>
           <span class="l">neto de reutilización ${P1(e.nsp_neto)}</span>`
    })), max:0.25, ref:D.meta.nsp_supuesto, refRot:"supuesto 20%",
       fmt:P1, etAncho:150, filaH:25, ancho:820,
       etiqueta:"Inasistencia por estamento"})));

  const T2 = D.agenda_total;
  T2.cupos = T2.cupos_programados;
  const comp2 = T2.sobrecupos + T2.espontanea;
  f.appendChild(nodo(`<div class="aviso a-info">
    <strong>La inasistencia no deja la hora vacía por sí sola.</strong>
    En los mismos ocho meses se atendieron ${N(comp2)} citas fuera de cupo
    programado: ${N(T2.sobrecupos)} sobrecupos y ${N(T2.espontanea)} de
    atención espontánea. En el agregado eso equivale al
    ${P0(comp2/T2.inasistencias)} de las ${N(T2.inasistencias)} inasistencias.
    Pero el agregado engaña: la compensación es muy desigual, y no ocurre en el
    mismo box ni con el mismo profesional que perdió la cita.</div>`));

  const cmp = D.agenda_estamento.filter(e => e.citas >= 200 && e.inasistencias > 0)
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
    ], D.agenda_estamento.filter(e=>e.citas>=200).slice()
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
    quien administra las agendas.</div>`));

  f.appendChild(card("Detalle de agenda por estamento", "",
    tabla([
      {t:"Estamento", k:"e"}, {t:"Cupos ofrecidos", k:"cu", num:true},
      {t:"Citas", k:"c", num:true}, {t:"Ocupación", k:"o", num:true},
      {t:"Inasistencias", k:"i", num:true}, {t:"NSP", k:"n", num:true},
      {t:"Reutilizadas", k:"r", num:true},
      {t:"Sobrecupos", k:"s", num:true}, {t:"Bloqueados", k:"b", num:true},
    ], est.slice().sort((a,b)=>b.citas-a.citas).map(e=>({
      e:`<b>${e.nom}</b>`, cu:N(e.cupos), c:N(e.citas), o:P1(e.ocupacion),
      i:N(e.inasistencias), n:P1(e.nsp), r:N(e.reutilizadas),
      s:N(e.sobrecupos), b:N(e.bloqueados)
    })), {nota:"La ocupación supera el 100% donde se cita por sobre los cupos programados, mediante sobrecupo y atención espontánea."})));
  return f;
});

/* ───────────────────────────── navegación ─────────────────────────────── */
const pest = document.getElementById("pestanas");
const lienzo = document.getElementById("lienzo");
let actual = 0;

function ir(i){
  actual = i;
  pest.querySelectorAll("button").forEach((b,k) =>
    b.setAttribute("aria-current", String(k===i)));
  lienzo.innerHTML = "";
  const v = nodo(`<div class="vista"></div>`);
  v.appendChild(VISTAS[i].fn());
  lienzo.appendChild(v);
  scrollTo({top:0, behavior:"instant"});
  location.hash = "v" + i;
}

VISTAS.forEach((v,i) => {
  const b = nodo(`<button type="button">${v.nom}</button>`);
  b.addEventListener("click", () => ir(i));
  pest.appendChild(b);
});

const fu = document.getElementById("fuentes");
fu.appendChild(nodo(`<dl>${D.fuentes.map(([k,v]) =>
  `<dt>${k}:</dt> <dd>${v}</dd>`).join("")}</dl>`));

const h = parseInt((location.hash||"").replace("#v",""), 10);
ir(Number.isInteger(h) && h >= 0 && h < VISTAS.length ? h : 0);

})();
