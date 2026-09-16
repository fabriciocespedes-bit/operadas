# OperaDAS

Plataforma de gestión operativa del Departamento de Salud Municipal de Pozo
Almonte, Servicio de Salud Tarapacá.

## Qué hace distinto

Las herramientas de programación de la APS chilena responden una pregunta:
*¿alcanzan las horas para la cartera comprometida?* Es una pregunta legítima y
se responde antes de que el año empiece.

OperaDAS responde la siguiente: **¿qué pasó con esas horas?**

Pone en una sola línea cinco eslabones que hoy viven en cinco sistemas
distintos:

```
programado  →  agendado  →  quién no llegó  →  capacidad  →  brecha
```

Y agrega la dimensión que ninguna herramienta de programación calcula: **cuánto
cuesta cada hora**, al valor efectivamente pagado por estamento.

## Las cinco vistas

**La cadena.** Para cada estamento, el recorrido completo desde las líneas de
programación hasta la brecha resultante, con el costo de cada eslabón.

**El costo.** Qué cuesta lo programado, qué cuesta la capacidad financiada, y
cuánto se paga en horas que no se convierten en atención.

**La brecha.** Las jornadas que faltan bajo tres supuestos de inasistencia. La
herramienta muestra los tres en vez de elegir uno, porque la diferencia entre
ellos es una decisión de método que corresponde al Departamento.

**La agenda.** Cupos ofrecidos, citas, inasistencia, sobrecupos y bloqueos, por
estamento.

**El cumplimiento.** Las diez metas de la Ley 19.813 y los veinte indicadores
IAAPS, cada uno con su propio corte: las metas que se nutren del REM serie P van
a junio porque ese registro es semestral, y las de la serie A acumulan hasta
agosto. Incluye la escala de tramos, la distancia al tramo que paga traducida a
casos concretos, y los cortes no lineales del IAAPS —30% en mayo, 50% en julio,
70% en septiembre, 100% en diciembre—, que permiten ir "al día" en un mes y
fallar el corte del siguiente.

## Fuentes

| Eslabón | Origen |
|---|---|
| Programación | 923 líneas de la programación operativa 2026 |
| Agenda | Reporte de productividad por profesional, enero a agosto de 2026 |
| Ejecución | REM series A, BM y D de enero a agosto; serie P de junio |
| Capacidad | Resolución Exenta 5505 que aprueba la dotación 2026 |
| Costo | ModoAPS 2026: haberes anuales sobre horas programables, por estamento |
| Metas | Resolución Exenta 04.481 del Servicio de Salud Tarapacá |

## Datos personales

El reporte de agenda de origen identifica a cada funcionario por nombre y RUN.
Ese archivo se procesa en el computador del Departamento y **nunca se publica**.
Lo que esta plataforma contiene son agregados por estamento y establecimiento:
sin nombres, sin RUN, sin remuneraciones individuales.

## Cómo verlo

Sitio estático. Basta abrir `index.html`, o servirlo desde cualquier servidor de
archivos.

```bash
python servidor.py 8778
```

Las tipografías Inter y Poppins se sirven desde `fuentes/`, de modo que
funciona sin conexión a internet.

## Límites que conviene declarar

La brecha de dotación **no está cerrada**. Tres componentes siguen en
conciliación: dónde entraba cada cargo vacante en el cálculo original, cuántas
horas aportan realmente los honorarios de convenio, y cómo se concilia el
ausentismo con las vacantes sin contar dos veces la misma hora perdida.

Los cupos bloqueados se muestran sin interpretar: no está documentado qué cuenta
el sistema de agenda como bloqueo, y puede incluir feriados, capacitación y
licencias, que son legítimos.
