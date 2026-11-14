/* Salon Books · Libreta engine (round 2, 2026-11-14). Shared by the three Libreta variants.
   Fictional demo data only (Salón Brisa). Totals follow the demo's own rules: each entry carries `inTotals`; a new entry counts
   only when it has a category that is not waiting for the accountant. August–October are the demo's original figures
   (October: entró US$200.00, salió US$39.98, resultado US$160.02); January–July are added fictional months so "Año" has a story.

   The engine never re-renders a screen for an in-page control. A screen is rendered once when you arrive on its tab; after that,
   period / filter / search / resolve / theme changes PATCH the bound elements ([data-b]) in place: numbers count from the value
   on screen, the line chart morphs between shapes, lists cross-fade inside their own box. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var RM = matchMedia('(prefers-reduced-motion: reduce)');
  var SB = window.SB = window.SB || {};
  var LS = function (k, v) { try { if (v === undefined) return localStorage.getItem('sb2-' + k); localStorage.setItem('sb2-' + k, v); } catch (e) { return null; } };
  var still = function () { return RM.matches || SB.motionOff; };

  // ======================= data =======================
  SB.business = 'Salón Brisa';
  SB.today = '2026-10-10';
  SB.renters = [
    { id: 'carmen', name: 'Carmen Silla (ficticia)', short: 'Carmen', colour: '#c4657a', role: 'Renta una silla' },
    { id: 'dalia', name: 'Dalia Silla (ficticia)', short: 'Dalia', colour: '#6a7fc4', role: 'Renta una silla' },
    { id: 'lucia', name: 'Lucía Estilista (ficticia)', short: 'Lucía', colour: '#c49a3a', role: 'Estilista' }
  ];
  SB.cats = [
    { id: 'materiales', name: 'Materiales del salón', icon: 'scissors' },
    { id: 'renta', name: 'Renta del local', icon: 'store' },
    { id: 'luz', name: 'Luz, agua y gas', icon: 'bolt' },
    { id: 'publicidad', name: 'Publicidad', icon: 'megaphone' },
    { id: 'comisiones', name: 'Comisiones de cobros con tarjeta', icon: 'card' },
    { id: 'programas', name: 'Programas y suscripciones', icon: 'app' },
    { id: 'productos', name: 'Productos', pending: true },
    { id: 'seguros', name: 'Seguros', pending: true },
    { id: 'servicios-prof', name: 'Servicios profesionales' },
    { id: 'educacion', name: 'Educación y cursos', pending: true },
    { id: 'licencias', name: 'Licencias y permisos', pending: true },
    { id: 'limpieza', name: 'Limpieza', pending: true },
    { id: 'reparaciones', name: 'Reparaciones y mantenimiento' },
    { id: 'oficina', name: 'Material de oficina', pending: true },
    { id: 'telefono', name: 'Teléfono e internet', pending: true },
    { id: 'equipo', name: 'Equipo', pending: true },
    { id: 'otros', name: 'Otros gastos' }
  ];
  SB.cat = function (id) { return SB.cats.find(function (c) { return c.id === id; }); };
  var E = function (id, date, title, amount, dir, o) { return Object.assign({ id: id, date: date, title: title, amount: amount, dir: dir, inTotals: true }, o || {}); };
  SB.entries = [
    E('e1', '2026-10-10', 'Guantes (ficticio)', 19.99, 'out', { cat: 'materiales', account: 'Caja de efectivo', receipt: 'r1' }),
    E('e2', '2026-10-10', 'Guantes (ficticio)', 19.99, 'out', { cat: 'materiales', account: 'Caja de efectivo', dup: true }),
    E('e3', '2026-10-09', 'Servicios del día (ficticio)', 200, 'in', { account: 'Caja de efectivo' }),
    E('e4', '2026-10-08', 'Compra sin categoría (ficticio)', 12, 'out', { inTotals: false, flag: 'Sin clasificar', account: 'Cuenta bancaria' }),
    E('e5', '2026-10-06', 'Venta anotada por error (ficticio)', 50, 'in', { inTotals: false, status: 'Anulado' }),
    E('e6', '2026-10-02', 'Pago a quien renta', 150, 'out', { inTotals: false, who: 'carmen', kind: 'payout' }),
    E('e7', '2026-09-30', 'Pago de propinas', 30, 'out', { inTotals: false, who: 'lucia', kind: 'payout' }),
    E('e8', '2026-09-28', 'Anuncio en redes (ficticio)', 45, 'out', { cat: 'publicidad' }),
    E('e9', '2026-09-25', 'Depósito del procesador (ficticio)', 630, 'move', { inTotals: false }),
    E('e10', '2026-09-22', 'Secadora nueva (ficticia)', 450, 'out', { cat: 'equipo', inTotals: false, flag: 'Pendiente de tu contador' }),
    E('e11', '2026-09-20', 'Cobro hecho por el salón a quien renta', 60, 'in', { who: 'dalia' }),
    E('e12', '2026-09-18', 'Renta del local (ficticio)', 300, 'out', { cat: 'renta', receipt: 'r2' }),
    E('e13', '2026-09-15', 'Champú vendido con impuesto (ficticio)', 25.5, 'in', { inTotals: false, flag: 'Pendiente de tu contador' }),
    E('e14', '2026-09-12', 'Servicios con propina (ficticio)', 330, 'in'),
    E('e15', '2026-09-10', 'Cobro hecho por el salón a quien renta', 90, 'in', { who: 'carmen' }),
    E('e16', '2026-09-05', 'Corte, lavado y peinado (ficticio)', 150, 'in'),
    E('e17', '2026-09-05', 'Corte y peinado (ficticio)', 120, 'in'),
    E('e18', '2026-09-04', 'Pago de renta', 400, 'in', { inTotals: false, status: 'Anulado', who: 'dalia' }),
    E('e19', '2026-08-25', 'Comisión del procesador (ficticio)', 15, 'out', { cat: 'comisiones' }),
    E('e20', '2026-08-20', 'Servicios en efectivo (ficticio)', 250, 'in'),
    E('e21', '2026-08-14', 'Depósito del procesador (ficticio)', 600, 'move', { inTotals: false }),
    E('e22', '2026-08-12', 'Luz de agosto (ficticio)', 120, 'out', { cat: 'luz', receipt: 'r4' }),
    E('e23', '2026-08-10', 'Tintes y champú (ficticio)', 85.5, 'out', { cat: 'materiales', receipt: 'r5' }),
    E('e24', '2026-08-06', 'Pago de renta', 400, 'in', { who: 'lucia' }),
    E('e25', '2026-08-03', 'Servicios del día (ficticio)', 600, 'in'),
    E('e26', '2026-08-01', 'Aporte de la dueña (ficticio)', 1000, 'in', { inTotals: false })
  ];
  // January–July: added fictional months (closed), same kinds of entries as the demo's own.
  (function () {
    var F = [0, .82, .9, 1.04, 1.1, 1.18, 1.26, 1.07], MES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio'];
    var r2 = function (n) { return Math.round(n * 100) / 100; };
    for (var m = 1; m <= 7; m++) {
      var mm = (m < 10 ? '0' : '') + m, f = F[m], d = function (x) { return '2026-' + mm + '-' + (x < 10 ? '0' : '') + x; }, id = 'g' + m + '-';
      SB.entries.push(
        E(id + 1, d(26), 'Servicios de la semana (ficticio)', r2(410 * f), 'in'),
        E(id + 2, d(22), 'Anuncio en redes (ficticio)', r2(35 + m * 2), 'out', { cat: 'publicidad' }),
        E(id + 3, d(19), 'Corte y color (ficticio)', r2(290 * f + 12), 'in'),
        E(id + 4, d(15), 'Luz, agua y gas de ' + MES[m] + ' (ficticio)', r2(150 - m * 6.5), 'out', { cat: 'luz' }),
        E(id + 5, d(12), 'Servicios de la semana (ficticio)', r2(455 * f), 'in'),
        E(id + 6, d(9), 'Tintes y champú (ficticio)', r2(84 + m * 4.15), 'out', { cat: 'materiales' }),
        E(id + 7, d(6), 'Pago de renta', 400, 'in', { who: 'lucia' }),
        E(id + 8, d(5), 'Servicios del día (ficticio)', r2(380 * f), 'in'),
        E(id + 9, d(3), 'Renta del local (ficticio)', 300, 'out', { cat: 'renta' }),
        E(id + 10, d(28), 'Comisión del procesador (ficticio)', r2(11 + m * 1.2), 'out', { cat: 'comisiones' }),
        E(id + 11, d(14), 'Depósito del procesador (ficticio)', r2(520 * f), 'move', { inTotals: false })
      );
    }
  })();
  SB.attention = [
    { id: 'a1', kind: 'close', title: 'Cerrar septiembre de 2026', ask: '¿Ya está listo septiembre para tu contador?', sub: 'El mes terminó y falta cerrarlo', why: 'Cuando cierras un mes, sus números quedan fijos para tu contador. Antes hay que resolver o confirmar sus pendientes.' },
    { id: 'a2', kind: 'dup', title: 'Posible movimiento repetido', ask: '¿Pagaste dos veces estos guantes?', date: '2026-10-10', amount: 19.99, entry: 'e2', why: 'Hay dos anotaciones iguales el mismo día. Si una sobra, anúlala. Si las dos son reales, confírmalo.' },
    { id: 'a3', kind: 'cat', title: 'Compra sin categoría', ask: '¿En qué fue esta compra de US$12?', date: '2026-10-08', amount: 12, entry: 'e4', why: 'Elige una categoría para que la compra cuente en tus libros. Si no la sabes, pregúntale a tu contador.' },
    { id: 'a4', kind: 'tax', title: 'Impuesto de venta pendiente', ask: 'Cobraste impuesto: ¿se lo pasamos a tu contador?', date: '2026-09-15', amount: 25.5, why: 'Cobraste impuesto de ventas. Se guarda esperando a tu contador.' },
    { id: 'a5', kind: 'equip', title: 'Compra de equipo para revisar', ask: 'La secadora nueva: tu contador decide si cuenta', date: '2026-09-22', amount: 450, why: 'Las compras de equipo las revisa tu contador antes de que cuenten.' }
  ];
  SB.attention.push(SB.attention.shift()); // the month close goes last: decide the rest first
  SB.receipts = [
    { id: 'r3', date: '2026-10-10', title: 'Recibo sin anotar', shop: 'Foto de hoy', amount: null, done: false },
    { id: 'r1', date: '2026-10-10', title: 'Suministros Rivera (ficticio)', shop: 'Guantes de nitrilo', amount: 19.99, done: true, entry: 'e1' },
    { id: 'r2', date: '2026-09-18', title: 'Renta del local (ficticio)', shop: 'Recibo del dueño del local', amount: 300, done: true, entry: 'e12' },
    { id: 'r6', date: '2026-09-22', title: 'Secadora nueva (ficticia)', shop: 'Espera a tu contador', amount: 450, done: true, entry: 'e10', wait: true },
    { id: 'r4', date: '2026-08-12', title: 'Luz de agosto (ficticio)', shop: 'Compañía de luz', amount: 120, done: true, entry: 'e22' },
    { id: 'r5', date: '2026-08-10', title: 'Tintes y champú (ficticio)', shop: 'Suministros Rivera', amount: 85.5, done: true, entry: 'e23' }
  ];
  SB.state = { mode: 'month', month: '2026-10', week: '2026-10-05', filter: 'all', q: '', rfilter: 'all', view: 'list' };

  // ======================= format =======================
  var MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  SB.MES = MES; SB.MES3 = MES3;
  SB.money = function (n, o) {
    o = o || {}; var s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var sign = o.sign ? (o.sign === 'in' ? '+ ' : o.sign === 'out' ? '− ' : '') : (n < 0 ? '− ' : '');
    return sign + 'US$' + s;
  };
  SB.parts = function (n) { var s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.'); return { int: s[0], dec: s[1], neg: n < -0.004 }; };
  SB.fmtParts = function (v) { var p = SB.parts(v); return (p.neg ? '<span class="cu-neg">−</span>' : '') + '<span class="cu-cur">US$</span>' + p.int + '<span class="cu-dec">.' + p.dec + '</span>'; };
  SB.cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  SB.monthLabel = function (m, short) { var p = m.split('-'); return short ? MES3[+p[1] - 1] : MES[+p[1] - 1] + ' de ' + p[0]; };
  SB.monthName = function (m) { return MES[+m.split('-')[1] - 1]; };
  SB.dateShort = function (d) { var p = d.split('-'); return +p[2] + ' ' + MES3[+p[1] - 1] + ' ' + p[0]; };
  SB.dm = function (d) { var p = d.split('-'); return +p[2] + ' ' + MES3[+p[1] - 1]; };
  SB.dayLabel = function (d) {
    if (d === SB.today) return 'Hoy';
    var t = new Date(SB.today + 'T12:00'), x = new Date(d + 'T12:00'), diff = Math.round((t - x) / 864e5);
    if (diff === 1) return 'Ayer';
    var p = d.split('-'); return DIAS[x.getDay()] + ' ' + (+p[2]) + ' ' + MES3[+p[1] - 1];
  };
  SB.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  SB.renter = function (id) { return SB.renters.find(function (r) { return r.id === id; }); };
  var iso = function (dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); };
  var addDays = function (d, n) { var x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return iso(x); };
  var daysIn = function (m) { var p = m.split('-'); return new Date(+p[0], +p[1], 0).getDate(); };
  SB.addDays = addDays;

  // ======================= periods =======================
  // mode: 'week' (Mon–Sun), 'month', 'year' (January 1 to today). The anchor for week/month is in state.
  SB.FIRST = '2026-01-01';
  SB.period = function (mode) {
    var s = SB.state; mode = mode || s.mode; var p = { mode: mode };
    if (mode === 'month') {
      p.start = s.month + '-01'; p.end = s.month + '-' + daysIn(s.month);
      p.title = SB.cap(SB.monthName(s.month)); p.year = s.month.slice(0, 4); p.long = SB.monthLabel(s.month);
      p.state = s.month === SB.today.slice(0, 7) ? 'Mes en curso' : (s.month === '2026-09' && !SB.closedSept) ? 'Sin cerrar' : 'Cerrado';
      p.canPrev = s.month > '2026-01'; p.canNext = s.month < SB.today.slice(0, 7);
      p.word = 'el mes'; p.kicker = 'Resultado de ' + SB.monthName(s.month);
    } else if (mode === 'week') {
      p.start = s.week; p.end = addDays(s.week, 6);
      var a = s.week.split('-'), b = p.end.split('-');
      p.title = (+a[2]) + (a[1] === b[1] ? '' : ' ' + MES3[+a[1] - 1]) + '–' + (+b[2]) + ' ' + MES3[+b[1] - 1];
      p.year = b[0]; p.long = 'semana del ' + (+a[2]) + ' de ' + MES[+a[1] - 1];
      p.state = SB.today >= p.start && SB.today <= p.end ? 'Esta semana' : p.end < SB.today ? 'Semana pasada' : '';
      if (p.state === 'Semana pasada' && addDays(p.end, 7) < SB.today) p.state = 'Cerrada';
      p.canPrev = p.start > '2026-01-05'; p.canNext = p.end < SB.today;
      p.word = 'la semana'; p.kicker = 'Resultado de la semana';
    } else {
      p.start = SB.FIRST; p.end = SB.today; p.title = 'Enero–' + SB.monthName(SB.today); p.year = '2026'; p.long = 'enero a ' + SB.monthName(SB.today) + ' de 2026';
      p.state = 'En el año'; p.canPrev = false; p.canNext = false; p.word = 'el año'; p.kicker = 'Resultado del año, hasta hoy';
    }
    p.key = mode + ':' + p.start;
    return p;
  };
  SB.inP = function (e, p) { return e.date >= p.start && e.date <= p.end; };
  SB.totals = function (p) {
    var t = { in: 0, out: 0, res: 0, outside: [], n: 0 };
    SB.entries.forEach(function (e) {
      if (!SB.inP(e, p)) return; t.n++;
      if (e.inTotals) { if (e.dir === 'in') t.in += e.amount; else if (e.dir === 'out') t.out += e.amount; }
      else if (e.flag) t.outside.push(e);
    });
    t.in = Math.round(t.in * 100) / 100; t.out = Math.round(t.out * 100) / 100; t.res = Math.round((t.in - t.out) * 100) / 100;
    return t;
  };
  var net = function (e) { return e.inTotals ? (e.dir === 'in' ? e.amount : e.dir === 'out' ? -e.amount : 0) : 0; };
  // running result through the period, one point per day (week, month) or per month (year); the line ends at the big number
  SB.series = function (p) {
    var pts = [], ticks = [], cum = 0;
    if (p.mode === 'year') {
      var lastM = +SB.today.slice(5, 7);
      for (var m = 1; m <= lastM; m++) {
        var mm = '2026-' + String(m).padStart(2, '0'), mv = 0;
        SB.entries.forEach(function (e) { if (e.date.slice(0, 7) === mm && e.date <= SB.today) mv += net(e); });
        cum += mv; pts.push({ x: (m - 1) / 11, v: cum, label: SB.cap(MES[m - 1]) + (m === lastM ? ' (hasta hoy)' : ''), delta: mv });
        ticks.push({ x: (m - 1) / 11, t: MES3[m - 1].slice(0, 3) });
      }
      ticks.push({ x: 1, t: 'dic', future: true });
    } else {
      var n = p.mode === 'week' ? 7 : daysIn(p.start.slice(0, 7));
      for (var i = 0; i < n; i++) {
        var d = addDays(p.start, i), dv = 0; if (d > SB.today) break;
        SB.entries.forEach(function (e) { if (e.date === d) dv += net(e); });
        cum += dv; pts.push({ x: i / (n - 1), v: cum, label: SB.cap(SB.dayLabel(d)) + (d === SB.today || SB.dayLabel(d) === 'Ayer' ? ' · ' + SB.dm(d) : ''), delta: dv, date: d });
      }
      if (p.mode === 'week') ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].forEach(function (t, i) { ticks.push({ x: i / 6, t: t, future: addDays(p.start, i) > SB.today }); });
      else [1, 8, 15, 22, n].forEach(function (dd) { var d = p.start.slice(0, 8) + String(dd).padStart(2, '0'); ticks.push({ x: (dd - 1) / (n - 1), t: dd === 1 ? '1 ' + MES3[+p.start.slice(5, 7) - 1] : String(dd), future: d > SB.today }); });
    }
    for (var k = 0; k < pts.length; k++) pts[k].v = Math.round(pts[k].v * 100) / 100;
    return { pts: pts, ticks: ticks, mode: p.mode };
  };
  // compare with the same stretch of the previous period, so week and month each say something of their own
  SB.compare = function (p) {
    var r2 = function (n) { return Math.round(n * 100) / 100; };
    if (p.mode === 'year') { var t = SB.totals(p), mo = +SB.today.slice(5, 7) - 1 + (+SB.today.slice(8, 10)) / 31; return { t: 'Promedio ' + M(r2(t.res / mo)) + ' al mes', dir: 0 }; }
    var cur = SB.totals(p), len = Math.round((new Date(p.end + 'T12:00') - new Date(p.start + 'T12:00')) / 864e5) + 1, upto = p.end > SB.today ? SB.today : p.end;
    var days = Math.round((new Date(upto + 'T12:00') - new Date(p.start + 'T12:00')) / 864e5);
    var ps, pe, label;
    if (p.mode === 'week') { ps = addDays(p.start, -7); pe = addDays(ps, days); label = p.end > SB.today ? 'la semana pasada a estas alturas' : 'la semana anterior'; }
    else { var y = +p.start.slice(0, 4), m = +p.start.slice(5, 7) - 1; if (m < 1) { m = 12; y--; } var pm = y + '-' + String(m).padStart(2, '0'); ps = pm + '-01'; pe = p.end > SB.today ? pm + '-' + String(Math.min(daysIn(pm), days + 1)).padStart(2, '0') : pm + '-' + daysIn(pm); label = p.end > SB.today ? '1–' + (days + 1) + ' de ' + SB.monthName(pm) : SB.monthName(pm); }
    if (ps < '2026-01-01') return { t: 'Primer periodo de la demostración', dir: 0 };
    var prev = SB.totals({ start: ps, end: pe }), d = r2(cur.res - prev.res);
    if (Math.abs(d) < 0.005) return { t: 'Igual que ' + label, dir: 0 };
    return { t: M(Math.abs(d)) + (d > 0 ? ' más' : ' menos') + ' que ' + label, dir: d > 0 ? 1 : -1, prev: prev.res };
  };
  SB.attentionOpen = function () { return SB.attention.filter(function (a) { return !a.done; }); };
  SB.filters = [['all', 'Todo'], ['in', 'Entradas'], ['out', 'Compras'], ['pending', 'Por revisar'], ['off', 'No cuentan'], ['rent', 'Sillas'], ['receipt', 'Con recibo']];
  SB.dupOpen = function (e) { var a = SB.attention.find(function (x) { return x.kind === 'dup'; }); return !!(a && !a.done && e.date === a.date && e.amount === a.amount && e.cat === 'materiales' && !e.status); };
  // why a row does or does not count, in owner words (shown on every row)
  SB.why = function (e) {
    if (e.status) return { t: 'Anulado · no cuenta', k: 'void' };
    if (SB.dupOpen(e)) return { t: 'Posible repetido · revisa', k: 'need' };
    if (e.flag === 'Sin clasificar') return { t: 'Sin categoría · no cuenta', k: 'need' };
    if (e.flag) return { t: 'Espera a tu contador', k: 'wait' };
    if (e.kind === 'payout') return { t: 'Dinero de ' + SB.renter(e.who).short + ' · no es gasto tuyo', k: 'off' };
    if (e.kind === 'tips') return { t: 'Propinas de tu equipo · no cuentan', k: 'off' };
    if (e.dir === 'move') return { t: 'Entre tus cuentas · no cuenta', k: 'off' };
    if (!e.inTotals) return { t: 'Aporte tuyo · no cuenta', k: 'off' };
    return null;
  };
  // the readable tag shown on a row (Dinero, Inicio): says plainly why a row does not count
  SB.tagFor = function (e) {
    if (e.status) return { t: 'Anulado', k: 'void' };
    if (SB.dupOpen(e)) return { t: '¿Repetido?', k: 'need', need: 'a2' };
    if (e.flag === 'Sin clasificar') return { t: 'Sin categoría · no cuenta', k: 'need' };
    if (e.flag) return { t: 'Espera a tu contador', k: 'wait' };
    if (e.kind === 'payout') return { t: 'No cuenta · dinero de ' + SB.renter(e.who).short, k: 'off' };
    if (e.kind === 'tips') return { t: 'No cuenta · propinas de tu equipo', k: 'off' };
    if (e.dir === 'move') return { t: 'No cuenta · entre tus cuentas', k: 'off' };
    if (!e.inTotals) return { t: 'No cuenta · aporte tuyo', k: 'off' };
    return null;
  };
  SB.tagHtml = function (w, cls) {
    if (!w) return '';
    return '<span class="' + cls + ' ' + (cls === 'tag' ? 'tag-' : 'k-') + w.k + '"' + (w.need ? ' data-tag-need="' + w.need + '" role="link" title="Abrir la decisión en Revisar"' : '') + '>' + w.t + (w.need ? ' ›' : '') + '</span>';
  };
  SB.list = function (o) {
    o = o || {}; var p = o.period, f = o.filter || 'all', q = (o.q || '').trim().toLowerCase();
    var items = SB.entries.filter(function (e) {
      if (e.date > SB.today) return false;
      if (p && !SB.inP(e, p)) return false;
      if (f === 'in' && e.dir !== 'in') return false;
      if (f === 'out' && (e.dir !== 'out' || e.kind === 'payout')) return false;
      if (f === 'rent' && !e.who) return false;
      if (f === 'pending' && !e.flag && !SB.dupOpen(e)) return false;
      if (f === 'off' && e.inTotals) return false;
      if (f === 'receipt' && !e.receipt) return false;
      if (q) { var hay = (e.title + ' ' + (e.cat ? SB.cat(e.cat).name : '') + ' ' + e.amount.toFixed(2) + ' ' + (e.who ? SB.renter(e.who).short : '')).toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    var groups = [], last = null;
    items.forEach(function (e) { if (!last || last.date !== e.date) { last = { date: e.date, label: SB.dayLabel(e.date), items: [] }; groups.push(last); } last.items.push(e); });
    return { items: items, groups: groups };
  };
  SB.byCat = function (p) {
    var map = {}, total = 0, wait = [];
    SB.entries.forEach(function (e) {
      if (!SB.inP(e, p) || e.dir !== 'out') return;
      if (e.inTotals && e.cat) { map[e.cat] = (map[e.cat] || 0) + e.amount; total += e.amount; }
      else if (e.flag) wait.push(e);
    });
    var rows = Object.keys(map).map(function (k) { return { cat: SB.cat(k), v: Math.round(map[k] * 100) / 100 }; }).sort(function (a, b) { return b.v - a.v; });
    return { rows: rows, total: Math.round(total * 100) / 100, wait: wait };
  };
  SB.sub = function (e) {
    var p = [];
    if (e.dir === 'move') p.push('Entre tus cuentas'); else p.push(e.dir === 'in' ? 'Entró dinero' : 'Salió dinero');
    if (e.cat) p.push(SB.cat(e.cat).name);
    if (e.who) p.push(SB.renter(e.who).short);
    return p.join(' · ');
  };

  // ======================= icons =======================
  var P = {
    home: '<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
    receipt: '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
    check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
    more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
    in: '<path d="M12 4v13M6.5 11.5 12 17l5.5-5.5"/><path d="M5 20h14"/>',
    out: '<path d="M12 20V7M6.5 12.5 12 7l5.5 5.5"/><path d="M5 4h14"/>',
    camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    chev: '<path d="m9.5 6 6 6-6 6"/>', chevL: '<path d="m14.5 6-6 6 6 6"/>', chevD: '<path d="m6 9.5 6 6 6-6"/>',
    flag: '<path d="M5.5 21V4.5M5.5 5h11l-2.2 3.8L16.5 12.5h-11"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
    scissors: '<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.6 8.4 19 17M8.6 15.6 19 7"/>',
    store: '<path d="M4 9.5 5.5 4.5h13L20 9.5M4 9.5h16v.5a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0A2.7 2.7 0 0 1 4 10zM5 12.5V20h14v-7.5M10 20v-4.5h4V20"/>',
    bolt: '<path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z"/>',
    megaphone: '<path d="M4 10v4h3l7 4V6L7 10zM17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
    app: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    move: '<path d="M4 8.5h14l-3.5-3.5M20 15.5H6l3.5 3.5"/>',
    team: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.4M17.5 13.8A5.5 5.5 0 0 1 20.5 19"/>',
    chart: '<path d="M4 19.5h16M7 16V11M12 16V6.5M17 16v-3.5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/>',
    vibrate: '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4.5 9v6M19.5 9v6M2 10.5v3M22 10.5v3"/>',
    sparkle: '<path d="M12 4.5 13.6 10.4 19.5 12l-5.9 1.6L12 19.5l-1.6-5.9L4.5 12l5.9-1.6z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    doc: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5A.5.5 0 0 1 6.5 20V4a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5v.01M4.5 12v.01M4.5 17.5v.01"/>',
    pie: '<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z"/><path d="M15 3.9A8.5 8.5 0 0 1 20.1 9H15z"/>'
  };
  SB.icon = function (n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (P[n] || '') + '</svg>'; };
  var I = SB.icon, M = SB.money, esc = SB.esc;

  // ======================= receipt illustration (fictional) =======================
  SB.receiptSVG = function (cls, o) {
    o = o || {}; var mono = "font-family='ui-monospace,Menlo,Consolas,monospace'";
    var l = function (y, a, b, w) { return "<text x='22' y='" + y + "' " + mono + " font-size='13' fill='#2b2925'" + (w ? " font-weight='700'" : '') + ">" + a + "</text>" + (b ? "<text x='238' y='" + y + "' text-anchor='end' " + mono + " font-size='13' fill='#2b2925'" + (w ? " font-weight='700'" : '') + ">" + b + "</text>" : ''); };
    var zig = ''; for (var i = 0; i <= 26; i++) zig += (i * 10) + ',' + (i % 2 ? 452 : 446) + ' ';
    var shop = o.shop || 'SUMINISTROS RIVERA', total = o.total || '19.99';
    return "<svg class='" + (cls || 'receipt') + "' viewBox='0 0 260 460' role='img' aria-label='Foto del recibo (ficticio): " + shop + ", total US$" + total + "'>" +
      "<polygon points='0,0 260,0 260,450 " + zig.trim().split(' ').reverse().join(' ') + "' fill='#fbf8f1'/>" +
      "<text x='130' y='40' text-anchor='middle' " + mono + " font-size='15' font-weight='700' fill='#2b2925'>" + shop + "</text>" +
      "<text x='130' y='58' text-anchor='middle' " + mono + " font-size='11' fill='#55514a'>(FICTICIO)</text>" +
      "<text x='130' y='74' text-anchor='middle' " + mono + " font-size='11' fill='#55514a'>LAWRENCE MA</text>" +
      "<line x1='22' y1='92' x2='238' y2='92' stroke='#8c877c' stroke-dasharray='3 3'/>" +
      l(116, o.date || '10/10/2026', '11:42') + l(146, o.l1 || 'GUANTES NITRILO M', o.v1 || '9.99') + l(166, o.l1b === undefined ? ' CAJA 100' : o.l1b, '') + l(190, o.l2 || 'GUANTES NITRILO S', o.v2 || '8.82') +
      "<line x1='22' y1='212' x2='238' y2='212' stroke='#8c877c' stroke-dasharray='3 3'/>" +
      l(236, 'SUBTOTAL', o.sub || '18.81') + l(258, 'IMPUESTO 6.25%', o.tax || '1.18') + l(290, 'TOTAL', total, 1) + l(316, 'EFECTIVO', o.paid || '20.00') +
      "<line x1='22' y1='358' x2='238' y2='358' stroke='#8c877c' stroke-dasharray='3 3'/>" +
      "<text x='130' y='384' text-anchor='middle' " + mono + " font-size='11' fill='#55514a'>GRACIAS POR SU COMPRA</text>" +
      "<g fill='#2b2925'>" + [0, 3, 5, 6, 9, 11, 14, 15, 17, 20, 22, 23, 26, 28, 31, 33, 34, 37, 39, 42, 44, 45, 48, 50].map(function (x, i) { return "<rect x='" + (70 + x * 2.4) + "' y='398' width='" + (i % 3 ? 1.4 : 2.6) + "' height='30'/>"; }).join('') + "</g></svg>";
  };
  SB.receiptFor = function (r) {
    var o = { r1: {}, r2: { shop: 'RENTA DEL LOCAL', date: '09/18/2026', l1: 'RENTA SEPTIEMBRE', v1: '300.00', l1b: '', l2: 'LOCAL 4B', v2: '', sub: '300.00', tax: '0.00', total: '300.00', paid: '300.00' },
      r3: { shop: 'BELLEZA TOTAL', date: '10/10/2026', l1: 'PEINES (2)', v1: '7.50', l1b: '', l2: 'GORRAS DE BAÑO', v2: '4.40', sub: '11.90', tax: '0.74', total: '12.64', paid: '15.00' },
      r4: { shop: 'COMPAÑÍA DE LUZ', date: '08/12/2026', l1: 'SERVICIO AGOSTO', v1: '120.00', l1b: '', l2: '', v2: '', sub: '120.00', tax: '0.00', total: '120.00', paid: '120.00' },
      r5: { shop: 'SUMINISTROS RIVERA', date: '08/10/2026', l1: 'TINTE 6N (4)', v1: '48.00', l1b: '', l2: 'CHAMPÚ 1 L (3)', v2: '32.47', sub: '80.47', tax: '5.03', total: '85.50', paid: '90.00' },
      r6: { shop: 'EQUIPO PRO SALÓN', date: '09/22/2026', l1: 'SECADORA 2000 W', v1: '423.53', l1b: '', l2: '', v2: '', sub: '423.53', tax: '26.47', total: '450.00', paid: '450.00' } }[r.id] || {};
    return o;
  };

  // ======================= motion helpers =======================
  SB.ease = function (k) { return 1 - Math.pow(1 - k, 3); };
  SB.count = function (el, to, o) {
    o = o || {}; var fmt = el.dataset.fmt === 'parts' ? SB.fmtParts : function (v) { return M(v); };
    var from = el._v !== undefined ? el._v : (SB.mem[el.dataset.b] !== undefined ? SB.mem[el.dataset.b] : (SB.booted ? to : 0));
    el._v = to; SB.mem[el.dataset.b] = to; cancelAnimationFrame(el._raf);
    if (still() || Math.abs(from - to) < 0.005) { el.innerHTML = fmt(to); return; }
    var t0 = performance.now(), dur = o.dur || 620;
    (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.innerHTML = fmt(from + (to - from) * e); if (k < 1) el._raf = requestAnimationFrame(step); })(t0);
    clearTimeout(el._fin); el._fin = setTimeout(function () { if (el._v === to) { cancelAnimationFrame(el._raf); el.innerHTML = fmt(to); } }, dur + 80);
  };
  SB.mem = {};
  // cross-fade the contents of one box, animating its height; nothing outside the box moves except by layout
  SB.swap = function (el, html, o) {
    o = o || {}; if (el._html === html) return; var first = el._html === undefined; el._html = html;
    if (first || still() || !el.animate) { el.innerHTML = html; return; }
    var h0 = el.offsetHeight; el.innerHTML = html; var h1 = el.offsetHeight;
    var dx = (SB.navDir || 0) * 14;
    el.animate([{ opacity: 0, transform: 'translateX(' + dx + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (Math.abs(h1 - h0) > 2 && !o.noHeight) el.animate([{ height: h0 + 'px', overflow: 'hidden' }, { height: h1 + 'px', overflow: 'hidden' }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };
  SB.slideText = function (el, text) {
    if (el._t === text) return; var first = el._t === undefined; el._t = text; el.textContent = text;
    if (first || still() || !el.animate) return; var dx = (SB.navDir || 0) * 16;
    el.animate([{ opacity: 0, transform: 'translateX(' + dx + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };

  // ======================= line chart (Bloque's line, with morph + scrub) =======================
  function mono(P) {
    var n = P.length, dx = [], m = [], t = [];
    for (var i = 0; i < n - 1; i++) { dx[i] = P[i + 1][0] - P[i][0]; m[i] = (P[i + 1][1] - P[i][1]) / (dx[i] || 1); }
    t[0] = m[0] || 0; t[n - 1] = m[n - 2] || 0;
    for (i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : 3 * (dx[i - 1] + dx[i]) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    return {
      d: function () { if (n === 1) return 'M' + P[0][0] + ' ' + P[0][1]; var s = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1); for (var i = 0; i < n - 1; i++) { var h = dx[i] / 3; s += 'C' + (P[i][0] + h).toFixed(1) + ' ' + (P[i][1] + t[i] * h).toFixed(1) + ' ' + (P[i + 1][0] - h).toFixed(1) + ' ' + (P[i + 1][1] - t[i + 1] * h).toFixed(1) + ' ' + P[i + 1][0].toFixed(1) + ' ' + P[i + 1][1].toFixed(1); } return s; },
      at: function (x) { if (n === 1) return P[0][1]; var i = 0; while (i < n - 2 && x > P[i + 1][0]) i++; var h = dx[i] || 1, s = Math.max(0, Math.min(1, (x - P[i][0]) / h)), s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * P[i][1] + (s3 - 2 * s2 + s) * h * t[i] + (-2 * s3 + 3 * s2) * P[i + 1][1] + (s3 - s2) * h * t[i + 1]; }
    };
  }
  var NS = 'http://www.w3.org/2000/svg', chartN = 0;
  SB.Chart = function (box) {
    var self = this, id = 'cg' + (++chartN), H = +box.dataset.h || 120, padT = +(box.dataset.padt || 26), padB = +(box.dataset.padb || 24), padX = +(box.dataset.padx || 0);
    box.innerHTML = '<svg class="cb" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="cb-g0"/><stop offset="1" class="cb-g1"/></linearGradient></defs>' +
      '<g class="cb-grid"></g><line class="cb-zero"/><path class="cb-area" fill="url(#' + id + ')"/><path class="cb-future"/><path class="cb-line"/><g class="cb-ticks"></g>' +
      '<line class="cb-rule"/><circle class="cb-end" r="5"/><circle class="cb-halo" r="5"/><circle class="cb-scrub" r="5.5"/></svg><div class="cb-tip" aria-hidden="true"><b></b><span></span></div><p class="sr cb-sr" aria-live="polite"></p>' + (LS('scrubbed') ? '' : '<span class="cb-hint" aria-hidden="true">' + SB.icon('chevL') + 'Desliza el dedo por la línea' + SB.icon('chev') + '</span>');
    var svg = box.querySelector('svg'), q = function (s) { return svg.querySelector(s); };
    var area = q('.cb-area'), line = q('.cb-line'), fut = q('.cb-future'), end = q('.cb-end'), halo = q('.cb-halo'), ticksG = q('.cb-ticks'), zero = q('.cb-zero'), rule = q('.cb-rule'), scrub = q('.cb-scrub'), grid = q('.cb-grid');
    var tip = box.querySelector('.cb-tip'), sr = box.querySelector('.cb-sr');
    var N = 90, cur = null, W = 0, data = null, raf = 0;
    function layout(s) {
      W = box.clientWidth || 320; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
      var vals = s.pts.map(function (p) { return p.v; }), lo = Math.min(0, Math.min.apply(0, vals.length ? vals : [0])), hi = Math.max(0, Math.max.apply(0, vals.length ? vals : [0]));
      if (hi - lo < 1) hi = lo + 100; var span = hi - lo; hi += span * 0.06;
      var Y = function (v) { return padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB); }, X = function (x) { return padX + x * (W - padX * 2); };
      var P = s.pts.map(function (p) { return [X(p.x), Y(p.v)]; }); if (!P.length) P = [[X(0), Y(0)]];
      var sp = mono(P), x0 = P[0][0], x1 = P[P.length - 1][0], samp = [];
      for (var i = 0; i < N; i++) { var x = x0 + (x1 - x0) * i / (N - 1); samp.push([x, sp.at(x)]); }
      return { P: P, d: sp.d(), samp: samp, Y: Y, X: X, y0: Y(0), lo: lo, base: H - padB };
    }
    function paint(samp, y0, base, final) {
      var d = final || ('M' + samp.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L'));
      var a = samp[0], b = samp[samp.length - 1];
      line.setAttribute('d', d); area.setAttribute('d', d + 'L' + b[0].toFixed(1) + ' ' + base + 'L' + a[0].toFixed(1) + ' ' + base + 'Z');
      end.setAttribute('cx', b[0]); end.setAttribute('cy', b[1]); halo.setAttribute('cx', b[0]); halo.setAttribute('cy', b[1]);
      zero.setAttribute('x1', 0); zero.setAttribute('x2', W); zero.setAttribute('y1', y0); zero.setAttribute('y2', y0);
      var fx = padX + (W - padX * 2); fut.setAttribute('d', b[0] < fx - 2 ? 'M' + b[0] + ' ' + b[1] + 'H' + fx : '');
    }
    function drawTicks(s, L, animate) {
      var g = doc.createElementNS(NS, 'g');
      var gap = s.ticks.length > 1 ? (L.X(s.ticks[1].x) - L.X(s.ticks[0].x)) : 99, thin = gap < 34;
      s.ticks.forEach(function (t, i) {
        if (thin && (s.mode === 'year' ? (s.pts.length - 1 - i) % 2 !== 0 : (i % 2 === 1 && i !== s.ticks.length - 1))) return;
        var tx = doc.createElementNS(NS, 'text'), x = L.X(t.x); tx.setAttribute('x', x); tx.setAttribute('y', H - 6);
        tx.setAttribute('text-anchor', x < 13 ? 'start' : x > W - 13 ? 'end' : 'middle'); tx.setAttribute('class', 'cb-t' + (t.future ? ' fut' : '')); tx.textContent = t.t; g.appendChild(tx);
      });
      var olds = Array.prototype.slice.call(ticksG.children); ticksG.appendChild(g);
      olds.forEach(function (old) { if (animate && old.animate && !old._gone) { old._gone = 1; old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }); setTimeout(function () { old.remove(); }, 200); } else old.remove(); });
      if (animate && g.animate) g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
      // light grid at the ticks
      grid.innerHTML = s.ticks.map(function (t) { var x = L.X(t.x); return '<line x1="' + x + '" x2="' + x + '" y1="' + padT * .5 + '" y2="' + (H - padB) + '"/>'; }).join('');
    }
    this.set = function (s, o) {
      o = o || {}; data = s; var L = layout(s), from = cur; cancelAnimationFrame(raf); hideTip();
      sr.textContent = s.pts.length ? 'Gráfica: ' + s.pts[0].label + ' ' + M(s.pts[0].v) + ' hasta ' + s.pts[s.pts.length - 1].label + ' ' + M(s.pts[s.pts.length - 1].v) : '';
      drawTicks(s, L, !!from && !still());
      box.classList.toggle('flat', s.pts.every(function (p) { return Math.abs(p.v) < 0.005; }));
      zero.style.opacity = L.lo < 0 ? 1 : 0;
      if (!from || still() || o.instant) { paint(L.samp, L.y0, L.base, L.d); cur = L; if (!from && !still() && !SB.booted) { line.style.strokeDasharray = line.getTotalLength(); line.style.strokeDashoffset = line.getTotalLength(); line.getBoundingClientRect(); line.style.transition = 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)'; line.style.strokeDashoffset = 0; setTimeout(function () { line.style.transition = ''; line.style.strokeDasharray = ''; line.style.strokeDashoffset = ''; }, 1050); } return; }
      var a = from.samp, b = L.samp, t0 = performance.now(), dur = 560, ya = from.y0, yb = L.y0;
      box.classList.add('morph');
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), smp = [];
        for (var i = 0; i < N; i++) smp.push([a[i][0] + (b[i][0] - a[i][0]) * e, a[i][1] + (b[i][1] - a[i][1]) * e]);
        if (k < 1) { paint(smp, ya + (yb - ya) * e, L.base); raf = requestAnimationFrame(step); } else { paint(L.samp, L.y0, L.base, L.d); box.classList.remove('morph'); }
      })(t0);
      clearTimeout(self._fin); self._fin = setTimeout(function () { if (cur === L) { cancelAnimationFrame(raf); paint(L.samp, L.y0, L.base, L.d); box.classList.remove('morph'); } }, dur + 80);
      cur = L;
    };
    this.resize = function () { if (data && box.clientWidth && Math.abs(box.clientWidth - W) > 1) { var L = layout(data); paint(L.samp, L.y0, L.base, L.d); drawTicks(data, L, false); cur = L; } };
    // scrub: drag sideways to read the running total on any day; vertical moves still scroll the page
    var active = false, lastI = -1;
    function at(ev) {
      if (!cur || !data || !data.pts.length) return; var r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * (W / r.width), best = 0, bd = 1e9;
      cur.P.forEach(function (p, i) { var dd = Math.abs(p[0] - x); if (dd < bd) { bd = dd; best = i; } });
      var p = cur.P[best], pt = data.pts[best];
      rule.setAttribute('x1', p[0]); rule.setAttribute('x2', p[0]); rule.setAttribute('y1', padT * .4); rule.setAttribute('y2', H - padB);
      scrub.setAttribute('cx', p[0]); scrub.setAttribute('cy', p[1]); box.classList.add('scrubbing');
      tip.querySelector('b').textContent = M(pt.v); tip.querySelector('span').textContent = pt.label + (pt.delta ? ' · ' + (pt.delta > 0 ? '+' : '−') + ' ' + M(Math.abs(pt.delta)).replace('US$', 'US$') + ' ese ' + (data.mode === 'year' ? 'mes' : 'día') : '');
      var tw = tip.offsetWidth, left = Math.max(0, Math.min(r.width - tw, p[0] * r.width / W - tw / 2)); tip.style.transform = 'translateX(' + left + 'px)';
      if (best !== lastI) { lastI = best; SB.haptic('select'); }
    }
    function hideTip() { box.classList.remove('scrubbing'); lastI = -1; }
    svg.addEventListener('pointerdown', function (e) { active = true; at(e); var h = box.querySelector('.cb-hint'); if (h) { h.remove(); LS('scrubbed', '1'); } });
    svg.addEventListener('pointermove', function (e) { if (active || e.pointerType === 'mouse') at(e); });
    addEventListener('pointerup', function () { if (active) { active = false; setTimeout(hideTip, 900); } });
    svg.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hideTip(); });
    if (window.ResizeObserver) new ResizeObserver(function () { self.resize(); }).observe(box);
  };

  // ======================= haptics, toast =======================
  SB.prefs = { haptics: LS('haptics') !== '0', theme: LS('theme') || null };
  var sw = null;
  function iosTick() {
    if (!sw) { sw = doc.createElement('label'); sw.setAttribute('aria-hidden', 'true'); sw.style.cssText = 'position:fixed;left:-200px;top:0;opacity:0;pointer-events:none'; var i = doc.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1; sw.appendChild(i); doc.body.appendChild(sw); }
    sw.click();
  }
  SB.haptic = function (kind) {
    if (!SB.prefs.haptics) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    var pat = { tap: 8, select: 5, success: [12, 50, 18], warn: [24, 60, 24], heavy: 20 }[kind || 'tap'];
    try { if (navigator.vibrate) { navigator.vibrate(pat); return; } } catch (e) { }
    try { iosTick(); if (kind === 'success' || kind === 'warn') setTimeout(iosTick, 90); } catch (e) { }
  };
  SB.toast = function (msg, kind, undo) {
    var t = doc.getElementById('sb-toast');
    if (!t) { t = doc.createElement('div'); t.id = 'sb-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); doc.body.appendChild(t); }
    t.innerHTML = '<span class="toast-ic">' + I(kind === 'warn' ? 'info' : 'check') + '</span><span class="toast-t">' + msg + '</span>' + (undo ? '<button class="toast-undo" type="button">Deshacer</button>' : '');
    t.className = 'toast show ' + (kind || '') + (undo ? ' has-undo' : '');
    if (undo) t.querySelector('.toast-undo').onclick = function () { clearTimeout(t._h); t.className = 'toast'; undo(); SB.haptic('select'); };
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = 'toast ' + (kind || ''); }, undo ? 5200 : 2600);
  };

  // ======================= theme (no re-render) =======================
  SB.applyTheme = function (pref) {
    if (pref !== undefined) { SB.prefs.theme = pref; LS('theme', pref || ''); }
    var p = SB.prefs.theme || SB.defaultTheme || 'light';
    var dark = p === 'dark' || (p === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (SB.booted && !still()) { root.classList.add('theming'); clearTimeout(SB._th); SB._th = setTimeout(function () { root.classList.remove('theming'); }, 450); }
    root.dataset.theme = dark ? 'dark' : 'light';
    doc.querySelectorAll('[data-theme-toggle]').forEach(function (b) { b.innerHTML = I(dark ? 'sun' : 'moon'); b.setAttribute('aria-label', 'Cambiar a modo ' + (dark ? 'claro' : 'oscuro')); });
    doc.querySelectorAll('[data-theme-set]').forEach(function (b) { var on = b.dataset.themeSet === p; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
    var m = doc.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(root).getPropertyValue(SB.chromeVar || '--chrome').trim() || (dark ? '#111' : '#fff');
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { SB.applyTheme(); });

  // ======================= sheets =======================
  SB.sheet = function (html, o) {
    o = o || {}; var last = doc.activeElement;
    var w = doc.createElement('div'); w.className = 'sheet-wrap ' + (o.cls || '');
    w.innerHTML = '<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(o.label || 'Detalle') + '"><div class="grab" aria-hidden="true"></div>' + html + '</div>';
    doc.body.appendChild(w);
    var sh = w.querySelector('.sheet');
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('open'); }); });
    function close(v) {
      if (w._closing) return; w._closing = 1; w.classList.remove('open'); sh.style.transform = '';
      setTimeout(function () { w.remove(); if (last && last.focus) last.focus({ preventScroll: true }); }, still() ? 0 : 340);
      doc.removeEventListener('keydown', key); if (o.onClose) o.onClose(v);
    }
    function key(e) { if (e.key === 'Escape') close(); }
    doc.addEventListener('keydown', key);
    w.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) { SB.haptic('select'); close(); } });
    var g = w.querySelector('.grab'), y0 = null, dy = 0;
    function down(e) { if (e.target.closest('input,select,textarea,button:not(.grab),a')) return; if (sh.scrollTop > 0 && e.target !== g) return; y0 = e.clientY; dy = 0; sh.style.transition = 'none'; }
    function mv(e) { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = 'translateY(' + dy + 'px)'; }
    function up() { if (y0 === null) return; y0 = null; sh.style.transition = ''; if (dy > 110) { SB.haptic('select'); close(); } else sh.style.transform = ''; }
    sh.addEventListener('pointerdown', down); addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    setTimeout(function () { var f = sh.querySelector('[autofocus]') || sh.querySelector('button:not(.grab),[href],input,select'); if (f) f.focus({ preventScroll: true }); }, 60);
    if (o.onMount) o.onMount(sh, close);
    return close;
  };

  // ======================= router =======================
  // Routes live in ?s= (the tweaks bar owns the #hash). A tab change swaps #screen only: the tab bar never re-draws,
  // the new screen slides in from the side you tapped, scroll is remembered per tab, entrance motion plays once per visit.
  SB.routes = {}; SB.navDir = 0; SB.TABS = ['inicio', 'dinero', 'recibos', 'revisar', 'mas'];
  SB.route = function () { var s = new URLSearchParams(location.search).get('s') || 'inicio'; var p = s.split('/'); return { name: p[0], arg: p[1] }; };
  var scrollMem = {}, curName = null;
  SB.go = function (h, o) {
    o = o || {}; var u = new URL(location.href); u.searchParams.set('s', h);
    if (u.href === location.href && !o.force) { if (SB.routes[SB.route().name]) scrollTo({ top: 0, behavior: still() ? 'auto' : 'smooth' }); return; }
    if (curName) scrollMem[curName] = scrollY;
    history[o.replace ? 'replaceState' : 'pushState'](null, '', u.href); show(o);
  };
  function show(o) {
    o = o || {}; var r = SB.route(), view = SB.routes[r.name] || SB.routes.inicio, screen = doc.getElementById('screen');
    var from = SB.TABS.indexOf(curName), to = SB.TABS.indexOf(r.name);
    var dir = o.dir !== undefined ? o.dir : (to >= 0 && from >= 0 ? Math.sign(to - from) : (to < 0 ? 1 : -1));
    curName = r.name; SB.charts = [];
    screen.innerHTML = view.render(r.arg); screen.dataset.route = r.name; root.dataset.route = r.name;
    doc.querySelectorAll('[data-tab]').forEach(function (t) { var on = t.dataset.tab === (to >= 0 ? r.name : (view.tab || '')); t.classList.toggle('on', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    SB.navDir = 0; mountBound(screen); if (view.mount) view.mount(screen, r.arg); SB.updateGlobal();
    var y = o.keepScroll ? scrollY : (scrollMem[r.name] || 0); scrollTo({ top: to >= 0 ? y : 0 });
    if (!SB.booted) { screen.classList.add('enter'); setTimeout(function () { screen.classList.remove('enter'); }, 900); }
    else if (!still() && screen.animate) screen.animate([{ opacity: 0, transform: 'translateX(' + (dir * 22) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (o.focus !== false && SB.booted) { var h1 = screen.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } }
  }
  addEventListener('popstate', function () { if (curName) scrollMem[curName] = scrollY; show({ dir: -1 }); });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#/"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); SB.go(a.getAttribute('href').slice(2));
  });
  doc.addEventListener('click', function (e) { var b = e.target.closest('button,a,[role=button],label.chip,.tap'); if (b && !b.disabled) SB.haptic(b.dataset.h || 'tap'); });
  doc.addEventListener('touchstart', function () { }, { passive: true });

  // ======================= bindings: the patch layer =======================
  // Any element with data-b="key" is kept current by SB.refresh(); screens never re-render for in-page changes.
  SB.binders = {
    ptitle: function (el, c) { SB.slideText(el, c.p.title); },
    pyear: function (el, c) { SB.slideText(el, c.p.year); },
    plong: function (el, c) { SB.slideText(el, SB.cap(c.p.long)); },
    pstate: function (el, c) { SB.slideText(el, c.p.state); el.dataset.state = c.p.state; el.hidden = !c.p.state; },
    pkick: function (el, c) { SB.slideText(el, el.dataset.short ? 'Resultado estimado' : c.p.kicker); },
    pword: function (el, c) { SB.slideText(el, c.p.word); },
    res: function (el, c) { SB.count(el, c.t.res); el.closest('[data-sign]') && (el.closest('[data-sign]').dataset.sign = c.t.res < 0 ? 'neg' : 'pos'); },
    in: function (el, c) { SB.count(el, c.t.in); },
    out: function (el, c) { SB.count(el, c.t.out); },
    chart: function (el, c) { if (!el._chart) { el._chart = new SB.Chart(el); } SB.charts.push(el._chart); el._chart.set(SB.series(c.p)); },
    seg: function (el, c) { el.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === c.state.mode); }); SB.segSync(el); },
    prev: function (el, c) { el.setAttribute('aria-disabled', !c.p.canPrev); },
    next: function (el, c) { el.setAttribute('aria-disabled', !c.p.canNext); },
    needs: function (el) { SB.swap(el, SB.ui.needs(+(el.dataset.max || 3), el.dataset.style)); },
    needcount: function (el) { var n = SB.attentionOpen().length; el.textContent = n; el.hidden = !n; },
    recent: function (el) { SB.swap(el, SB.ui.recent(+(el.dataset.n || 5), el.dataset.style)); },
    list: function (el, c) { var L = SB.list({ period: c.state.q ? null : c.p, filter: c.state.filter, q: c.state.q }); SB.swap(el, (SB.ui[el.dataset.style || 'groups'] || SB.ui.groups)(L.groups, c)); },
    listsum: function (el, c) { var L = SB.list({ period: c.state.q ? null : c.p, filter: c.state.filter, q: c.state.q }); SB.slideText(el, c.state.q ? L.items.length + ' resultado' + (L.items.length === 1 ? '' : 's') + ' en todo el año' : L.items.length + ' movimiento' + (L.items.length === 1 ? '' : 's') + ' en ' + c.p.word); },
    cats: function (el, c) { SB.swap(el, SB.ui.cats(c.p, el.dataset.style)); },
    filters: function (el, c) { SB.edgeFade(el); el.querySelectorAll('[data-filter]').forEach(function (b) { var on = b.dataset.filter === c.state.filter; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); }); },
    review: function (el) { SB.swap(el, SB.ui.review(el.dataset.style), { noHeight: el.dataset.style === 'stack' }); },
    progress: function (el) { var all = SB.attention.length, done = all - SB.attentionOpen().length; el.style.setProperty('--p', done / all); el.setAttribute('aria-valuenow', done); },
    progresstext: function (el) { var all = SB.attention.length, done = all - SB.attentionOpen().length; SB.slideText(el, done === all ? 'Todo resuelto' : done + ' de ' + all + ' resueltos'); },
    receipts: function (el, c) { SB.swap(el, SB.ui.receipts(c.state.rfilter, el.dataset.style)); },
    rfilters: function (el, c) { el.querySelectorAll('[data-rfilter]').forEach(function (b) { var on = b.dataset.rfilter === c.state.rfilter; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); }); SB.segSync(el); },
    views: function (el, c) { el.querySelectorAll('[data-view]').forEach(function (b) { var on = b.dataset.view === c.state.view; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); }); SB.segSync(el); doc.querySelectorAll('[data-viewpane]').forEach(function (p) { var on = p.dataset.viewpane === c.state.view; if (p.hidden === !on) return; p.hidden = !on; if (on && !still() && p.animate) p.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' }); }); },
    cmp: function (el, c) { var x = SB.compare(c.p); SB.slideText(el, x.t); el.dataset.dir = x.dir; },
    alert: function (el) { SB.swap(el, SB.ui.alert(), { noHeight: true }); },
    warn: function (el, c) { var a = SB.attention.find(function (x) { return x.kind === 'dup'; }), on = a && !a.done && a.date >= c.p.start && a.date <= c.p.end; el.hidden = !on; if (on) el.innerHTML = I('flag') + '<span>Puede haber un repetido de ' + M(a.amount) + '</span><b>Revisar</b>'; },
    sqline: function (el) { var l = SB.square.last; el.innerHTML = 'Ventas de Square: ' + (l ? 'al día hasta el ' + SB.dm(l.until) : 'sin importar todavía') + ' <span aria-hidden="true">·</span> <b>Subir</b>' + I('chev'); },
    rcount: function (el) { var n = SB.receipts.filter(function (r) { return !r.done; }).length; el.textContent = n; el.hidden = !n; }
  };
  // a visible fade on the side where a chip row still scrolls
  SB.edgeFade = function (el) {
    var w = el.parentNode; if (!w || !w.classList.contains('chips-wrap')) return;
    var upd = function () { w.classList.toggle('at-start', el.scrollLeft < 4); w.classList.toggle('at-end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 4); };
    if (!el._fade) { el._fade = 1; el.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); }
    upd(); requestAnimationFrame(upd);
  };
  function ctx() { var p = SB.period(); return { p: p, t: SB.totals(p), state: SB.state }; }
  function mountBound(scope) { var c = ctx(); scope.querySelectorAll('[data-b]').forEach(function (el) { var f = SB.binders[el.dataset.b]; if (f) f(el, c); }); }
  SB.refresh = function (only) {
    var c = ctx(), scope = doc.getElementById('screen');
    scope.querySelectorAll('[data-b]').forEach(function (el) { if (only && only.indexOf(el.dataset.b) < 0) return; var f = SB.binders[el.dataset.b]; if (f) f(el, c); });
    SB.updateGlobal(); SB.navDir = 0;
  };
  SB.updateGlobal = function () { var n = SB.attentionOpen().length; doc.querySelectorAll('[data-badge]').forEach(function (x) { x.textContent = n || ''; x.hidden = !n; }); };

  // segmented controls with a sliding indicator (period, receipts filter, views)
  SB.segSync = function (el) {
    var ind = el.querySelector('.seg-ind'), on = el.querySelector('[aria-pressed=true],[aria-selected=true],.sel'); if (!ind || !on) return;
    var place = function () { ind.style.width = on.offsetWidth + 'px'; ind.style.transform = 'translateX(' + on.offsetLeft + 'px)'; if (el.classList.contains('vtabs')) { ind.style.height = on.offsetHeight + 'px'; ind.style.transform = 'translateY(' + on.offsetTop + 'px)'; } };
    if (!ind._placed) { ind.style.transition = 'none'; place(); ind.getBoundingClientRect(); ind.style.transition = ''; ind._placed = 1; if (!on.offsetWidth) requestAnimationFrame(function () { ind.style.transition = 'none'; place(); ind.getBoundingClientRect(); ind.style.transition = ''; }); } else place();
  };
  addEventListener('resize', function () { doc.querySelectorAll('.seg-ind').forEach(function (i) { i._placed = 0; }); doc.querySelectorAll('[data-b=seg],[data-b=rfilters],[data-b=views]').forEach(SB.segSync); });
  doc.fonts && doc.fonts.ready.then(function () { doc.querySelectorAll('.seg-ind').forEach(function (i) { i._placed = 0; }); doc.querySelectorAll('[data-b=seg],[data-b=rfilters],[data-b=views]').forEach(SB.segSync); });

  // ======================= state changes (all in place) =======================
  var ORDER = ['week', 'month', 'year'];
  SB.setMode = function (m) {
    if (m === SB.state.mode) return;
    SB.navDir = ORDER.indexOf(m) > ORDER.indexOf(SB.state.mode) ? 1 : -1; SB.state.mode = m;
    if (m === 'week') { var mm = SB.state.month, wk = mondayOf(mm === SB.today.slice(0, 7) ? SB.today : addDays(mm + '-' + '01', 14)); SB.state.week = wk; }
    SB.haptic('select'); LS('mode', m); SB.refresh();
  };
  function mondayOf(d) { var x = new Date(d + 'T12:00'), wd = (x.getDay() + 6) % 7; return addDays(d, -wd); }
  SB.step = function (d) {
    var p = SB.period();
    if ((d < 0 && !p.canPrev) || (d > 0 && !p.canNext)) {
      SB.haptic('warn');
      SB.toast(p.mode === 'year' ? 'La demostración solo tiene 2026' : d < 0 ? 'No hay datos antes de enero en la demostración' : 'Todavía no llegamos ahí', 'warn'); return false;
    }
    if (p.mode === 'month') { var y = +SB.state.month.slice(0, 4), m = +SB.state.month.slice(5) + d; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } SB.state.month = y + '-' + String(m).padStart(2, '0'); }
    else if (p.mode === 'week') { SB.state.week = addDays(SB.state.week, 7 * d); SB.state.month = addDays(SB.state.week, 3).slice(0, 7); }
    SB.navDir = d; SB.haptic('select'); SB.refresh(); return true;
  };
  SB.swipe = function (el, onLeft, onRight) {
    var x0 = null, y0 = 0;
    el.addEventListener('pointerdown', function (e) { if (e.target.closest('.chartbox,button,a')) return; x0 = e.clientX; y0 = e.clientY; });
    el.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { (dx < 0 ? onLeft : onRight)(); } });
  };

  // ======================= shared UI pieces =======================
  SB.ui = {};
  SB.ui.back = function (to, label) { return '<a class="back" href="#/' + to + '" data-back>' + I('chevL') + '<span>' + label + '</span></a>'; };
  SB.ui.seg = function (cls) {
    var m = SB.state.mode;
    return '<div class="seg3 ' + (cls || '') + '" role="group" aria-label="Periodo" data-b="seg"><span class="seg-ind" aria-hidden="true"></span>' +
      [['week', 'Semana'], ['month', 'Mes'], ['year', 'Año']].map(function (x) { return '<button type="button" data-mode="' + x[0] + '" aria-pressed="' + (m === x[0]) + '" data-h="select">' + x[1] + '</button>'; }).join('') + '</div>';
  };
  SB.ui.prev = function (cls) { return '<button class="step ' + (cls || '') + '" data-step="-1" data-b="prev" aria-label="Periodo anterior">' + I('chevL') + '</button>'; };
  SB.ui.next = function (cls) { return '<button class="step ' + (cls || '') + '" data-step="1" data-b="next" aria-label="Periodo siguiente">' + I('chev') + '</button>'; };
  SB.ui.big = function (cls) { return '<p class="big ' + (cls || '') + '" data-b="res" data-fmt="parts" aria-live="polite"></p>'; };
  SB.ui.chart = function (h, cls, o) { o = o || {}; return '<div class="chartbox ' + (cls || '') + '" data-b="chart" data-h="' + (h || 120) + '"' + (o.padx !== undefined ? ' data-padx="' + o.padx + '"' : '') + (o.padt !== undefined ? ' data-padt="' + o.padt + '"' : '') + (o.padb !== undefined ? ' data-padb="' + o.padb + '"' : '') + ' role="img" aria-label="Cómo se fue acumulando el resultado"></div>'; };
  SB.ui.truth = 'Ingresos menos gastos, antes de la revisión de tu contador. No es un cálculo de impuestos.';
  SB.ui.row = function (e, o) {
    o = o || {}; var r = e.who && SB.renter(e.who);
    var tag = (e.square ? '<span class="tag tag-sq">Square</span> ' : '') + SB.tagHtml(SB.tagFor(e), 'tag');
    var ic = e.dir === 'in' ? 'in' : e.dir === 'move' ? 'move' : (e.cat && SB.cat(e.cat).icon) || 'out';
    return '<li><button class="row' + (e.status ? ' is-void' : '') + (SB.justSaved === e.id ? ' just' : '') + '" data-entry="' + e.id + '" data-h="select">' +
      '<span class="row-ic ' + e.dir + '"' + (r ? ' style="--who:' + r.colour + '"' : '') + '>' + (r ? '<span class="who-dot" aria-hidden="true"></span>' : '') + I(ic) + '</span>' +
      '<span class="row-main"><span class="row-title">' + esc(e.title) + '</span><span class="row-sub">' + (o.date ? SB.dm(e.date) + ' · ' : '') + esc(SB.sub(e)) + '</span>' + tag + '</span>' +
      '<span class="row-amt ' + e.dir + '">' + M(e.amount, { sign: e.dir === 'move' ? null : e.dir }) + '</span></button></li>';
  };
  function daySum(items) { var n = 0; items.forEach(function (e) { n += net(e); }); return Math.abs(n) > 0.004 ? M(n, { sign: n > 0 ? 'in' : 'out' }) : ''; }
  var empty = function () { return '<div class="empty">' + I('search') + '<p>No hay movimientos con eso en este periodo.</p><button class="btn btn-quiet" data-clear>Quitar filtros</button></div>'; };
  SB.ui.groups = function (groups) {
    if (!groups.length) return empty();
    return groups.map(function (g) { return '<section class="day"><h3 class="day-h"><span>' + g.label + '</span><span class="day-sum">' + daySum(g.items) + '</span></h3><ul class="rows">' + g.items.map(function (e) { return SB.ui.row(e); }).join('') + '</ul></section>'; }).join('');
  };
  // ledger: debit / credit columns (Cuaderno)
  SB.ui.ledger = function (groups) {
    if (!groups.length) return empty();
    return '<div class="ledger" role="table" aria-label="Movimientos"><div class="lg-head" role="row"><span role="columnheader">Concepto</span><span role="columnheader">Entró</span><span role="columnheader">Salió</span></div>' +
      groups.map(function (g) {
        return '<div class="lg-day" role="rowgroup"><div class="lg-date" role="row"><span role="cell">' + SB.cap(g.label) + '</span><span role="cell" class="lg-ds">' + daySum(g.items) + '</span></div>' + g.items.map(function (e) {
          var r = e.who && SB.renter(e.who), cls = (e.status ? ' is-void' : '') + (!e.inTotals ? ' off' : '') + (SB.justSaved === e.id ? ' just' : '');
          var w = SB.tagFor(e); if (w) cls += ' why-' + w.k;
          return '<button class="lg-row' + cls + '" role="row" data-entry="' + e.id + '" data-h="select"><span class="lg-c" role="cell">' + (r ? '<i class="who-pip" style="--who:' + r.colour + '"></i>' : '') + '<b>' + esc(e.title) + '</b><small>' + esc(e.cat ? SB.cat(e.cat).name : SB.sub(e)) + '</small><span class="lg-tags">' + (e.square ? '<em class="lg-sq">Square</em>' : '') + SB.tagHtml(w, 'lg-why').replace(/<em/, '<em') + '</span></span>' +
            '<span class="lg-n in" role="cell">' + (e.dir === 'in' ? M(e.amount).replace('US$', '') : '') + '</span><span class="lg-n out" role="cell">' + (e.dir === 'out' || e.dir === 'move' ? M(e.amount).replace('US$', '') : '') + '</span></button>';
        }).join('') + '</div>';
      }).join('') + '</div>';
  };
  // compact rows (Milimetrado)
  SB.ui.compact = function (groups) {
    if (!groups.length) return empty();
    return groups.map(function (g) { return '<section class="cday"><h3 class="cday-h"><span>' + SB.cap(g.label) + '</span><i></i><span>' + daySum(g.items) + '</span></h3>' + g.items.map(function (e) {
      var r = e.who && SB.renter(e.who), w = SB.why(e), mark = w ? w.k : e.dir;
      return '<button class="crow ' + (e.status ? 'is-void ' : '') + (SB.justSaved === e.id ? 'just' : '') + '" data-entry="' + e.id + '" data-h="select"><span class="cmark ' + mark + '"' + (r ? ' style="--who:' + r.colour + '"' : '') + '></span><span class="crow-t">' + esc(e.title) + '<small>' + esc(e.cat ? SB.cat(e.cat).name : SB.sub(e)) + '</small>' + (w ? '<em class="cwhy ' + w.k + '">' + w.t + '</em>' : '') + '</span><span class="crow-n ' + e.dir + '">' + M(e.amount, { sign: e.dir === 'move' ? null : e.dir }) + '</span></button>';
    }).join('') + '</section>'; }).join('');
  };
  SB.ui.recent = function (n, style) {
    var items = SB.list({}).items.slice(0, n || 5), groups = [];
    items.forEach(function (e) { var g = groups[groups.length - 1]; if (!g || g.date !== e.date) groups.push(g = { date: e.date, label: SB.dayLabel(e.date), items: [] }); g.items.push(e); });
    return (SB.ui[style] || SB.ui.groups)(groups);
  };
  var NIC = { close: 'lock', dup: 'receipt', cat: 'scissors', tax: 'info', equip: 'bolt' };
  SB.ui.alert = function () {
    var open = SB.attentionOpen(); if (!open.length) return '<a class="alert ok" href="#/revisar">' + I('check') + '<span><b>Todo al día</b><span>No hay nada por revisar</span></span></a>';
    return '<a class="alert" href="#/revisar"><span class="al-n">' + open.length + '</span><span><b>' + (open.length === 1 ? '1 cosa por revisar' : open.length + ' cosas por revisar') + '</b><span>' + open[0].title + (open.length > 1 ? ' y ' + (open.length - 1) + ' más' : '') + '</span></span>' + I('chev') + '</a>';
  };
  SB.ui.needs = function (max, style) {
    var open = SB.attentionOpen();
    if (!open.length) return '<div class="all-clear">' + I('check') + '<p><b>Todo al día.</b> No hay nada que necesite tu atención.</p></div>';
    var more = open.length > max ? '<a class="need-more" href="#/revisar">' + (open.length - max) + ' más en Revisar' + I('chev') + '</a>' : '';
    if (style === 'slips') return '<div class="slips" data-carousel>' + open.map(function (a) { return '<button class="slip" data-need="' + a.id + '"><span class="slip-ic">' + I(NIC[a.kind]) + '</span><b>' + a.title + '</b><span>' + (a.amount ? SB.dm(a.date) + ' · ' + M(a.amount) : a.sub) + '</span><span class="slip-go">Resolver' + I('chev') + '</span></button>'; }).join('') + '</div>';
    if (style === 'notes') return '<ul class="notes">' + open.slice(0, max).map(function (a) { return '<li><button class="note" data-need="' + a.id + '"><span class="note-n">' + I(NIC[a.kind]) + '</span><span class="note-t"><b>' + a.title + '</b><span>' + (a.amount ? SB.dm(a.date) + ' · ' + M(a.amount) : a.sub) + '</span></span>' + I('chev', 'need-chev') + '</button></li>'; }).join('') + '</ul>' + more;
    return '<ul class="need-list">' + open.slice(0, max).map(function (a) { return '<li><button class="need" data-need="' + a.id + '"><span class="need-dot" aria-hidden="true"></span><span class="need-main"><span class="need-title">' + a.title + '</span><span class="need-sub">' + (a.amount ? SB.dm(a.date) + ' · ' + M(a.amount) : a.sub) + '</span></span>' + I('chev', 'need-chev') + '</button></li>'; }).join('') + '</ul>' + more;
  };
  SB.ui.actions = function (cls, four) {
    return '<nav class="actions ' + (cls || '') + '" aria-label="Anotar">' +
      '<a class="act primary" href="#/anotar/in"><span class="act-c">' + I('in') + '</span><span class="act-l">Entró dinero<small>Te pagaron</small></span></a>' +
      '<a class="act" href="#/anotar/out"><span class="act-c">' + I('out') + '</span><span class="act-l">Pagué algo<small>Gastaste</small></span></a>' +
      '<a class="act" href="#/anotar/scan"><span class="act-c">' + I('camera') + '</span><span class="act-l">Escanear<small>Abre la cámara</small></span></a>' +
      (four ? '<a class="act" href="#/dinero"><span class="act-c">' + I('search') + '</span><span class="act-l">Buscar<small>Por palabra o monto</small></span></a>' : '') + '</nav>';
  };
  SB.ui.search = function () { return '<label class="search">' + I('search') + '<input id="q" type="search" placeholder="Buscar por palabra o monto" value="' + esc(SB.state.q) + '" autocomplete="off" aria-label="Buscar movimientos"></label>'; };
  SB.ui.filterChips = function () { return '<div class="chips-wrap at-start"><div class="chips scroll" role="group" aria-label="Filtros" data-b="filters">' + SB.filters.map(function (f) { return '<button class="chip" data-filter="' + f[0] + '" aria-pressed="false" data-h="select">' + f[1] + '</button>'; }).join('') + '</div></div>'; };
  SB.ui.cats = function (p, style) {
    var c = SB.byCat(p), mx = c.rows.length ? c.rows[0].v : 1;
    if (!c.rows.length && !c.wait.length) return '<p class="muted-p">No hay gastos con categoría en ' + p.word + '.</p>';
    return '<ul class="cats ' + (style || '') + '">' + c.rows.map(function (r, i) { return '<li><span class="cat-ic">' + I(r.cat.icon || 'out') + '</span><span class="cat-main"><span class="cat-top"><b>' + r.cat.name + '</b><span class="cat-v">' + M(r.v) + '</span></span><span class="cat-bar"><i style="--w:' + (r.v / mx).toFixed(3) + ';--i:' + i + '"></i></span><small>' + Math.round(r.v / c.total * 100) + ' % de lo que salió</small></span></li>'; }).join('') + '</ul>' +
      (c.wait.length ? '<p class="cat-wait">' + I('clock') + '<span>Esperando a tu contador, todavía no cuentan: ' + c.wait.map(function (e) { return esc(e.title) + ' (' + M(e.amount) + ')'; }).join(', ') + '.</span></p>' : '');
  };
  SB.ui.receipts = function (f, style) {
    var list = SB.receipts.filter(function (r) { return f === 'todo' ? !r.done : f === 'done' ? r.done : true; });
    if (!list.length) return '<div class="all-clear">' + I('check') + '<p><b>Todos tus recibos están anotados.</b></p></div>';
    if (style === 'slips') return '<ul class="shoebox">' + list.map(function (r, i) { return '<li style="--r:' + ([-2.2, 1.6, -1, 2.4, -1.8, 1][i % 6]) + 'deg"><button class="rslip' + (r.done ? '' : ' todo') + '" data-receipt="' + r.id + '"><span class="rslip-img">' + SB.receiptSVG('receipt thumb', SB.receiptFor(r)) + '<span class="stamp ' + (r.done ? (r.wait ? 'wait' : 'ok') : 'todo') + '">' + (r.done ? (r.wait ? 'Espera contador' : 'Anotado') : 'Falta anotar') + '</span></span><span class="rslip-m"><b>' + esc(r.title) + '</b><span>' + SB.dm(r.date) + (r.amount ? ' · ' + M(r.amount) : '') + '</span></span></button></li>'; }).join('') + '</ul>';
    if (style === 'rows') {
      var g = {}; list.forEach(function (r) { var k = r.date.slice(0, 7); (g[k] = g[k] || []).push(r); });
      return Object.keys(g).sort().reverse().map(function (k) { return '<section class="rgroup"><h3 class="cday-h"><span>' + SB.cap(SB.monthLabel(k)) + '</span><i></i><span>' + g[k].length + '</span></h3>' + g[k].map(function (r) { return '<button class="rrow' + (r.done ? '' : ' todo') + '" data-receipt="' + r.id + '"><span class="rrow-img">' + SB.receiptSVG('receipt thumb', SB.receiptFor(r)) + '</span><span class="rrow-t"><b>' + esc(r.title) + '</b><span>' + esc(r.shop) + '</span><span class="tag ' + (r.done ? (r.wait ? 'tag-wait' : 'tag-ok') : 'tag-need') + '">' + (r.done ? (r.wait ? 'Espera a tu contador' : 'Anotado') : 'Falta anotarlo') + '</span></span><span class="rrow-n">' + (r.amount ? M(r.amount) : '—') + '<small>' + SB.dm(r.date) + '</small></span></button>'; }).join('') + '</section>'; }).join('');
    }
    return '<ul class="receipt-grid">' + list.map(function (r) { return '<li><button class="rcard' + (r.done ? '' : ' todo') + '" data-receipt="' + r.id + '"><span class="rthumb">' + SB.receiptSVG('receipt thumb', SB.receiptFor(r)) + '</span><span class="rmeta"><b>' + esc(r.title) + '</b><span>' + SB.dm(r.date) + (r.amount ? ' · ' + M(r.amount) : '') + '</span>' + (r.done ? '<span class="tag ' + (r.wait ? 'tag-wait">Espera a tu contador' : 'tag-ok">Anotado') + '</span>' : '<span class="tag tag-need">Falta anotarlo</span>') + '</span></button></li>'; }).join('') + '</ul>';
  };
  SB.ui.rfilter = function (cls) {
    return '<div class="seg3 ' + (cls || '') + '" role="group" aria-label="Qué recibos ver" data-b="rfilters"><span class="seg-ind" aria-hidden="true"></span>' +
      [['all', 'Todos'], ['todo', 'Faltan'], ['done', 'Anotados']].map(function (x) { return '<button type="button" data-rfilter="' + x[0] + '" aria-pressed="' + (SB.state.rfilter === x[0]) + '" data-h="select">' + x[1] + (x[0] === 'todo' ? ' <span class="mini-count" data-b="rcount"></span>' : '') + '</button>'; }).join('') + '</div>';
  };
  SB.ui.viewSeg = function (cls) {
    return '<div class="seg3 two ' + (cls || '') + '" role="group" aria-label="Cómo ver" data-b="views"><span class="seg-ind" aria-hidden="true"></span>' +
      [['list', 'Movimientos', 'list'], ['cats', 'En qué se fue', 'pie']].map(function (x) { return '<button type="button" data-view="' + x[0] + '" aria-pressed="' + (SB.state.view === x[0]) + '" data-h="select">' + I(x[2]) + x[1] + '</button>'; }).join('') + '</div>';
  };
  // Revisar: decisions right on the item
  function decisions(a) {
    if (a.kind === 'cat') return '<div class="rv-acts"><button class="btn btn-main" data-pick-cat="' + a.id + '">Elegir categoría</button><button class="btn btn-quiet" data-do="accountant" data-id="' + a.id + '">Para tu contador</button></div>';
    if (a.kind === 'dup') return '<div class="rv-acts"><button class="btn btn-main" data-do="void" data-id="' + a.id + '">Anular la segunda</button><button class="btn btn-quiet" data-do="confirm" data-id="' + a.id + '">Las dos son reales</button></div>';
    if (a.kind === 'close') return '<div class="rv-acts"><button class="btn btn-main" data-close-month="' + a.id + '">' + I('lock') + 'Ver y cerrar septiembre</button><button class="btn btn-quiet" data-do="later" data-id="' + a.id + '">Más tarde</button></div>';
    return '<div class="rv-acts"><button class="btn btn-main" data-do="confirm" data-id="' + a.id + '">Lo revisé</button><button class="btn btn-quiet" data-do="accountant" data-id="' + a.id + '">Para tu contador</button></div>';
  }
  // what still blocks closing September, and what closing means, in plain words
  SB.closeBlockers = function () { return SB.attentionOpen().filter(function (a) { return a.kind !== 'close' && a.date && a.date.slice(0, 7) === '2026-09'; }); };
  SB.closeInfo = function () {
    var b = SB.closeBlockers();
    return '<div class="rv-block">' + (b.length ? '<p class="rv-bh">' + I('flag') + 'Falta resolver antes de cerrar (' + b.length + ')</p><ul>' + b.map(function (a) { return '<li><button type="button" data-need="' + a.id + '"><span class="need-dot"></span><span>' + a.title + '<small>' + SB.dm(a.date) + ' · ' + M(a.amount) + '</small></span>' + I('chev') + '</button></li>'; }).join('') + '</ul>' : '<p class="rv-bh ok">' + I('check') + 'Nada falta: septiembre está listo para cerrar.</p>') +
      '<p class="rv-close">' + I('lock') + '<span><b>Cerrar quiere decir:</b> ya no se puede cambiar sin reabrirlo. Para reabrirlo: Más → «Septiembre está cerrado» → Reabrir.</span></p></div>';
  };
  SB.ui.review = function (style) {
    var open = SB.attentionOpen(), all = SB.attention.length;
    if (!open.length) return '<div class="all-clear big-clear">' + I('check') + '<p><b>Todo resuelto.</b> Tus libros están al día para tu contador.</p></div>';
    var item = function (a, i) { return '<article class="rv" data-rv="' + a.id + '" style="--k:' + i + '"><p class="rv-k">' + I(NIC[a.kind]) + a.title + '</p><h3 class="rv-t">' + a.ask + '</h3><p class="rv-meta">' + (a.amount ? SB.dateShort(a.date) + ' · ' + M(a.amount) : a.sub) + '</p><p class="rv-why">' + a.why + '</p>' + (a.kind === 'close' ? SB.closeInfo() : '') + decisions(a) + '</article>'; };
    if (style === 'stack') return '<div class="stack" style="--n:' + open.length + '">' + open.slice(0, 3).map(function (a, i) { return item(a, i); }).reverse().join('') + '</div>' + (open.length > 1 ? '<p class="stack-l">Después de esta (' + (open.length - 1) + '):</p><ul class="stack-next">' + open.slice(1).map(function (a) { return '<li><button data-need="' + a.id + '"><span class="need-dot"></span>' + a.title + (a.amount ? '<small>' + M(a.amount) + '</small>' : '') + '</button></li>'; }).join('') + '</ul>' : '');
    if (style === 'check') return '<ul class="checklist">' + SB.attention.map(function (a) { return '<li class="ck' + (a.done ? ' done' : '') + '">' + (a.done ? '<div class="ck-row"><span class="ck-box on">' + I('check') + '</span><span class="ck-t"><b>' + a.title + '</b><span>Resuelto</span></span></div>' : '<details class="ck-d"' + (a === open[0] ? ' open' : '') + '><summary class="ck-row"><span class="ck-box"></span><span class="ck-t"><b>' + a.ask + '</b><span>' + a.title + ' · ' + (a.amount ? SB.dm(a.date) + ' · ' + M(a.amount) : a.sub) + '</span></span>' + I('chevD', 'ck-chev') + '</summary><div class="ck-body"><p class="rv-why">' + a.why + '</p>' + decisions(a) + '</div></details>') + '</li>'; }).join('') + '</ul>';
    return '<div class="rv-list">' + open.map(item).join('') + '</div>';
  };

  // ======================= sheets with content =======================
  SB.entrySheet = function (id) {
    var e = SB.entries.find(function (x) { return x.id === id; }); if (!e) return;
    var rows = [['Fecha', SB.dateShort(e.date)], ['Monto', M(e.amount)], ['Tipo', e.dir === 'in' ? 'Entró dinero' : e.dir === 'out' ? 'Salió dinero' : 'Entre tus cuentas']];
    if (e.cat) rows.push(['Categoría', SB.cat(e.cat).name]);
    if (e.who) rows.push(['Persona', SB.renter(e.who).name]);
    if (e.account) rows.push(['Cuenta', e.account]);
    var att = SB.attention.find(function (a) { return !a.done && (a.entry === e.id || (a.kind === 'dup' && SB.dupOpen(e))); });
    var why = SB.dupOpen(e) ? 'Hay otra anotación igual el mismo día. Cuenta hasta que decidas si una sobra.' : e.status === 'Anulado' ? 'Está anulado: se ve en la lista, pero no cuenta en tus libros.' : !e.inTotals ? (e.flag === 'Sin clasificar' ? 'Se guardó, pero no cuenta hasta que tenga categoría.' : e.flag ? 'Se guardó, pero espera a tu contador antes de contar.' : e.kind === 'payout' ? 'Es dinero de otra persona que pasó por el salón: no es un gasto tuyo.' : e.dir === 'move' ? 'Es dinero que pasó entre tus cuentas: no entra ni sale del salón.' : 'No cuenta en los totales.') : 'Cuenta en los totales de ' + SB.monthLabel(e.date.slice(0, 7)) + '.';
    var rc = e.receipt && SB.receipts.find(function (r) { return r.id === e.receipt; });
    SB.sheet('<div class="sh-body"><p class="sh-kicker">' + SB.cap(SB.dayLabel(e.date)) + '</p><h2 class="sh-title">' + esc(e.title) + '</h2><p class="sh-amount ' + e.dir + '">' + M(e.amount, { sign: e.dir === 'move' ? null : e.dir }) + '</p>' +
      '<dl class="sh-dl">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="sh-why">' + I('info') + '<span>' + why + '</span></p>' + (rc ? '<button class="sh-receipt" data-zoom="' + rc.id + '" aria-label="Ver el recibo en grande">' + SB.receiptSVG('receipt mini', SB.receiptFor(rc)) + '</button>' : '') +
      (att ? '<button class="btn btn-main" data-need="' + att.id + '">' + I('flag') + 'Resolver ahora</button>' : '') + (e.who ? '<button class="btn btn-quiet" data-renter="' + e.who + '">Ver todo lo de ' + SB.renter(e.who).short + '</button>' : '') +
      '<button class="btn btn-quiet sh-done" data-close>Listo</button></div>', { label: e.title });
  };
  SB.explain = function (kind) {
    var p = SB.period(), t = SB.totals(p), list = SB.entries.filter(function (e) { return SB.inP(e, p) && e.inTotals && (kind === 'res' ? e.dir !== 'move' : e.dir === kind); }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var title = kind === 'in' ? 'Entró' : kind === 'out' ? 'Salió' : 'Resultado estimado', val = kind === 'in' ? t.in : kind === 'out' ? t.out : t.res;
    SB.sheet('<div class="sh-body"><p class="sh-kicker">' + SB.cap(p.long) + '</p><h2 class="sh-title">' + title + '</h2><p class="sh-amount">' + M(val) + '</p>' +
      (kind === 'res' ? '<div class="sh-eq"><span>Entró<b>' + M(t.in) + '</b></span><i>−</i><span>Salió<b>' + M(t.out) + '</b></span><i>=</i><span>Resultado<b>' + M(t.res) + '</b></span></div><p class="sh-why">' + I('info') + '<span>' + SB.ui.truth + '</span></p>' : '') +
      '<p class="sh-label">Lo que suma este número (' + list.length + ')</p><ul class="rows">' + list.slice(0, 40).map(function (e) { return SB.ui.row(e, { date: true }); }).join('') + '</ul>' + (list.length > 40 ? '<p class="hint">Y ' + (list.length - 40) + ' más en Dinero.</p>' : '') +
      (function () { var off = SB.entries.filter(function (e) { return SB.inP(e, p) && !e.inTotals; }); if (!off.length) return ''; var g = {}; off.forEach(function (e) { var w = SB.why(e).t.split(' · ')[0]; (g[w] = g[w] || []).push(e); }); return '<p class="sh-label">Fuera de este número (' + off.length + ')</p><div class="offlist">' + Object.keys(g).map(function (k) { var n = g[k].reduce(function (s, e) { return s + e.amount; }, 0); return '<div><span>' + k + ' <small>(' + g[k].length + ')</small></span><b>' + M(n) + '</b></div>'; }).join('') + '</div>'; })() +
      (p.mode === 'year' ? '<button class="btn btn-quiet" data-report>' + I('doc') + 'Ver el resumen por categoría</button>' : '') +
      '<button class="btn btn-quiet sh-done" data-close>Listo</button></div>', { label: title });
  };
  SB.anotarSheet = function () {
    SB.sheet('<div class="sh-body"><h2 class="sh-title">¿Qué quieres anotar?</h2><div class="anotar-grid">' +
      '<a class="anotar in" href="#/anotar/in" data-close>' + I('in') + '<b>Entró dinero</b><span>Lo que te pagaron</span></a>' +
      '<a class="anotar out" href="#/anotar/out" data-close>' + I('out') + '<b>Pagué algo</b><span>Lo que gastaste</span></a>' +
      '<a class="anotar scan" href="#/anotar/scan" data-close>' + I('camera') + '<b>Escanear recibo</b><span>Guarda la foto del recibo</span></a></div></div>', { label: 'Anotar', cls: 'sheet-anotar' });
  };
  SB.receiptSheet = function (id) {
    var r = SB.receipts.find(function (x) { return x.id === id; }); if (!r) return; var e = r.entry && SB.entries.find(function (x) { return x.id === r.entry; });
    SB.sheet('<div class="sh-body"><p class="sh-kicker">' + SB.cap(SB.dayLabel(r.date)) + '</p><h2 class="sh-title">' + esc(r.title) + '</h2><button class="sh-receipt big" data-zoom="' + r.id + '" aria-label="Ver el recibo en grande">' + SB.receiptSVG('receipt mini', SB.receiptFor(r)) + '</button>' +
      (e ? '<p class="sh-label">Anotado como</p><ul class="rows">' + SB.ui.row(e, { date: true }) + '</ul>' : '<p class="sh-why">' + I('info') + '<span>Esta foto está guardada, pero todavía no está en tus libros.</span></p><a class="btn btn-main" href="#/anotar/scan" data-close>' + I('sparkle') + 'Anotar este recibo</a>') +
      '<button class="btn btn-quiet sh-done" data-close>Listo</button></div>', { label: r.title });
  };
  SB.catSheet = function (aid) {
    var a = SB.attention.find(function (x) { return x.id === aid; });
    SB.sheet('<div class="sh-body"><p class="sh-kicker need">' + I('flag') + 'Compra sin categoría</p><h2 class="sh-title">¿En qué fue esta compra?</h2><p class="sh-meta">' + SB.dateShort(a.date) + ' · ' + M(a.amount) + '</p><div class="chips wrap">' + SB.cats.filter(function (c) { return c.icon; }).map(function (c) { return '<button class="chip" data-cat="' + c.id + '">' + I(c.icon) + c.name + '</button>'; }).join('') + '</div><button class="btn btn-quiet sh-done" data-close>Cancelar</button></div>', {
      label: 'Elegir categoría', onMount: function (sh, close) {
        sh.addEventListener('click', function (e) { var c = e.target.closest('[data-cat]'); if (!c) return; c.classList.add('sel'); SB.haptic('success'); setTimeout(function () { close(); SB.decide(aid, { cat: c.dataset.cat }); }, 220); });
      }
    });
  };
  SB.attentionSheet = function (id) {
    var a = SB.attention.find(function (x) { return x.id === id; }); if (!a) return;
    SB.sheet('<div class="sh-body sh-rv"><p class="sh-kicker need">' + I('flag') + 'Necesita tu atención</p><h2 class="sh-title">' + a.title + '</h2><p class="sh-meta">' + (a.amount ? SB.dateShort(a.date) + ' · ' + M(a.amount) : a.sub) + '</p><p class="sh-why">' + I('info') + '<span>' + a.why + '</span></p>' +
      (a.kind === 'dup' ? '<div class="dup-pair"><div>' + I('receipt') + '<b>Guantes (ficticio)</b><span>10 oct · US$19.99 · con recibo</span></div><div>' + I('receipt') + '<b>Guantes (ficticio)</b><span>10 oct · US$19.99 · sin recibo</span></div></div>' : '') + decisions(a) + '</div>', { label: a.title, cls: 'sheet-rv' });
  };
  // one place that applies a decision, closes what is open, animates the item away and patches every number
  SB.closeSheet = function (aid) {
    var p = { start: '2026-09-01', end: '2026-09-30' }, t = SB.totals(p), open = SB.closeBlockers();
    SB.sheet('<div class="sh-body"><p class="sh-kicker">' + I('lock') + 'Cerrar el mes</p><h2 class="sh-title">¿Cerrar septiembre?</h2><p class="sh-why">' + I('lock') + '<span><b>Ya no se puede cambiar sin reabrirlo.</b> Para reabrirlo: Más → «Septiembre está cerrado» → Reabrir.</span></p><div class="sh-eq"><span>Entró<b>' + M(t.in) + '</b></span><i>−</i><span>Salió<b>' + M(t.out) + '</b></span><i>=</i><span>Resultado<b>' + M(t.res) + '</b></span></div>' +
      (open.length ? '<p class="sh-label">Todavía falta resolver (' + open.length + ')</p><ul class="rv-miss">' + open.map(function (a) { return '<li><span class="need-dot"></span><span>' + a.title + '</span><b>' + M(a.amount) + '</b></li>'; }).join('') + '</ul><p class="sh-why warnbox">' + I('flag') + '<span>Si cierras ahora, esto queda fuera del resultado de septiembre. Mejor resuélvelo primero en Revisar.</span></p>' : '<p class="sh-why">' + I('check') + '<span>No falta nada por resolver en septiembre.</span></p>') +
      (t.outside.length ? '<p class="sh-label">Se quedan fuera y esperan a tu contador</p><ul class="rows">' + t.outside.map(function (e) { return SB.ui.row(e, { date: true }); }).join('') + '</ul>' : '') +
      '<div class="sh-actions"><button class="btn btn-main" data-do="confirm" data-id="' + aid + '">' + I('lock') + 'Sí, cerrar septiembre</button></div><button class="btn btn-quiet sh-done" data-close>Todavía no</button></div>', { label: 'Cerrar septiembre' });
  };
  // a plain confirmation before something that changes the books
  SB.confirmSheet = function (o) {
    SB.sheet('<div class="sh-body"><p class="sh-kicker need">' + I('flag') + o.kicker + '</p><h2 class="sh-title">' + o.title + '</h2><p class="sh-why">' + I('info') + '<span>' + o.text + '</span></p><div class="sh-actions"><button class="btn btn-main" data-yes>' + o.yes + '</button></div><button class="btn btn-quiet sh-done" data-close>' + (o.no || 'No, volver') + '</button></div>', {
      label: o.title, onMount: function (sh, close) { sh.querySelector('[data-yes]').addEventListener('click', function () { close(); o.onYes(); }); }
    });
  };
  SB.reopenSept = function () {
    var a = SB.attention.find(function (x) { return x.kind === 'close'; });
    var redraw = function () { if (SB.route().name === 'mas') SB.go('mas', { force: true, replace: true, dir: 0, keepScroll: true }); };
    SB.confirmSheet({ kicker: 'Reabrir el mes', title: '¿Reabrir septiembre?', text: 'Septiembre volverá a poder cambiarse. Quedará otra vez en tu lista de Revisar para cerrarlo de nuevo.', yes: 'Sí, reabrir septiembre', onYes: function () {
      var was = SB.closedSept; SB.closedSept = null; a.done = false; SB.haptic('success');
      SB.toast('Reabriste septiembre', null, function () { SB.closedSept = was; a.done = true; SB.refresh(); redraw(); });
      SB.refresh(); redraw();
    } });
  };
  SB.decide = function (id, how) {
    var a = SB.attention.find(function (x) { return x.id === id; }); if (!a) return;
    if (how === 'later') {
      var i0 = SB.attention.indexOf(a); SB.attention.splice(i0, 1); SB.attention.push(a); closeSheets();
      SB.toast('Dejaste «' + a.title + '» para más tarde', null, function () { SB.attention.splice(SB.attention.indexOf(a), 1); SB.attention.splice(i0, 0, a); SB.refresh(); });
      SB.refresh(); return;
    }
    var card = doc.querySelector('[data-rv="' + id + '"]'), en0 = a.entry && SB.entries.find(function (x) { return x.id === a.entry; }), snap = en0 && JSON.stringify(en0);
    var undo = function () { a.done = false; if (en0) Object.keys(en0).forEach(function (k) { delete en0[k]; }), Object.assign(en0, JSON.parse(snap)); if (a.kind === 'close') SB.closedSept = null; SB.refresh(); };
    var say = function () {
      var amt = a.amount ? ' de ' + M(a.amount) : '';
      if (a.kind === 'cat') return how && how.cat ? 'Anotaste la compra' + amt + ' como «' + SB.cat(how.cat).name + '»' : 'Dejaste la compra' + amt + ' para tu contador';
      if (a.kind === 'dup') return how === 'void' ? 'Anulaste la segunda anotación de guantes (' + M(a.amount) + ')' : 'Confirmaste que las dos anotaciones de guantes son reales';
      if (a.kind === 'tax') return how === 'accountant' ? 'Pasaste el impuesto' + amt + ' a tu contador' : 'Marcaste el impuesto' + amt + ' como revisado';
      if (a.kind === 'equip') return how === 'accountant' ? 'Dejaste la secadora para tu contador' : 'Marcaste la secadora como revisada';
      if (a.kind === 'close') return 'Cerraste septiembre';
      return 'Resolviste «' + a.title + '»';
    };
    var apply = function () {
      if (a.kind === 'cat' && how && how.cat) { var en = SB.entries.find(function (x) { return x.id === a.entry; }); en.cat = how.cat; var c = SB.cat(how.cat); en.inTotals = !c.pending; en.flag = c.pending ? 'Pendiente de tu contador' : null; }
      if (a.kind === 'dup' && how === 'void') { var d = SB.entries.find(function (x) { return x.id === a.entry; }); d.inTotals = false; d.status = 'Anulado'; }
      a.done = true; SB.haptic('success'); if (a.kind === 'close') SB.closedSept = { by: 'Mía', at: SB.today };
      SB.toast(say(), null, undo);
      SB.refresh();
    };
    closeSheets();
    if (card && !still() && card.animate) { var anim = card.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(40px) rotate(2deg)' }], { duration: 240, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }); anim.onfinish = apply; }
    else apply();
  };
  function closeSheets() { doc.querySelectorAll('.sheet-wrap .scrim').forEach(function (s) { s.click(); }); }
  SB.reportPeriod = function (key) {
    if (key === 'year') return SB.period('year');
    var m = key.slice(2); return { start: m + '-01', end: m + '-' + daysIn(m), long: SB.monthLabel(m), title: SB.cap(SB.monthName(m)), word: 'el mes' };
  };
  SB.reportBody = function (key) {
    var p = SB.reportPeriod(key), t = SB.totals(p), c = SB.byCat(p), ins = {};
    SB.entries.forEach(function (e) { if (SB.inP(e, p) && e.inTotals && e.dir === 'in') { var k = e.who ? 'Renta de sillas que cobraste' : 'Servicios y ventas'; ins[k] = (ins[k] || 0) + e.amount; } });
    var offs = SB.entries.filter(function (e) { return SB.inP(e, p) && !e.inTotals && !e.flag; });
    var row = function (a, b, cls) { return '<div class="rp-r ' + (cls || '') + '"><span>' + a + '</span><span>' + M(b) + '</span></div>'; };
    return '<div class="report"><p class="rp-h">Entró</p>' + (Object.keys(ins).map(function (k) { return row(k, ins[k]); }).join('') || '<div class="rp-r"><span>Nada en este periodo</span><span></span></div>') + row('Total que entró', t.in, 'tot') +
      '<p class="rp-h">Salió, por categoría</p>' + (c.rows.map(function (r) { return row(r.cat.name, r.v); }).join('') || '<div class="rp-r"><span>Nada en este periodo</span><span></span></div>') + row('Total que salió', t.out, 'tot') +
      row('Resultado estimado', t.res, 'grand') + '<p class="rp-h">Esperando a tu contador</p>' + (t.outside.map(function (e) { return '<div class="rp-r wait"><span>' + esc(e.title) + ' · ' + SB.dm(e.date) + '</span><span>' + M(e.amount) + '</span></div>'; }).join('') || '<div class="rp-r wait"><span>Nada</span><span></span></div>') + '<p class="rp-h">No es del salón o no cuenta</p>' + (offs.map(function (e) { return '<div class="rp-r wait"><span>' + SB.why(e).t.split(' · ')[0] + ': ' + esc(e.title) + ' · ' + SB.dm(e.date) + '</span><span>' + M(e.amount) + '</span></div>'; }).join('') || '<div class="rp-r wait"><span>Nada</span><span></span></div>') + '</div>';
  };
  SB.reportSheet = function () {
    var keys = [['year', 'Enero a hoy'], ['m:2026-10', 'Octubre'], ['m:2026-09', 'Septiembre'], ['m:2026-08', 'Agosto']], cur = 'year', fmt = 'PDF';
    var sub = function (k) { var p = SB.reportPeriod(k); return k === 'year' ? 'Enero a octubre de 2026 · hasta el ' + SB.dateShort(SB.today) : SB.cap(p.long); };
    SB.sheet('<div class="sh-body"><p class="sh-kicker">' + SB.business + ' · demostración</p><h2 class="sh-title">Resumen para tu contador</h2><p class="sh-meta" data-rp-sub>' + sub(cur) + '</p>' +
      '<fieldset class="field"><legend>¿Qué periodo?</legend><div class="chips wrap" role="group" aria-label="Periodo del resumen">' + keys.map(function (k) { return '<button type="button" class="chip' + (k[0] === cur ? ' sel' : '') + '" data-rp="' + k[0] + '" aria-pressed="' + (k[0] === cur) + '">' + k[1] + '</button>'; }).join('') + '</div></fieldset>' +
      '<div data-rp-body>' + SB.reportBody(cur) + '</div>' +
      '<p class="sh-why">' + I('info') + '<span>' + SB.ui.truth + ' Los anulados y el dinero entre tus cuentas no están aquí.</span></p>' +
      '<fieldset class="field rp-send"><legend>Enviar a mi contador</legend><div class="chips wrap" role="group" aria-label="Formato"><button type="button" class="chip sel" data-rp-fmt="PDF" aria-pressed="true">' + I('doc') + 'PDF</button><button type="button" class="chip" data-rp-fmt="CSV" aria-pressed="false">' + I('list') + 'CSV (Excel)</button></div></fieldset>' +
      '<div class="sh-actions"><button class="btn btn-main" data-rp-send>' + I('doc') + 'Enviar a mi contador</button></div><button class="btn btn-quiet sh-done" data-close>Listo</button></div>', {
      label: 'Resumen para tu contador', cls: 'sheet-report', onMount: function (sh) {
        sh.addEventListener('click', function (e) {
          var b = e.target.closest('[data-rp]'), f = e.target.closest('[data-rp-fmt]'), send = e.target.closest('[data-rp-send]');
          if (b) { cur = b.dataset.rp; sh.querySelectorAll('[data-rp]').forEach(function (x) { var on = x === b; x.classList.toggle('sel', on); x.setAttribute('aria-pressed', on); }); sh.querySelector('[data-rp-body]').innerHTML = SB.reportBody(cur); sh.querySelector('[data-rp-sub]').textContent = sub(cur); }
          if (f) { fmt = f.dataset.rpFmt; sh.querySelectorAll('[data-rp-fmt]').forEach(function (x) { var on = x === f; x.classList.toggle('sel', on); x.setAttribute('aria-pressed', on); }); }
          if (send) { var lab = keys.filter(function (k) { return k[0] === cur; })[0][1]; SB.haptic('success'); SB.toast('Resumen de ' + lab.toLowerCase() + ' en ' + fmt + ' listo para tu contador. Demostración: no se envía nada', 'warn'); }
        });
      }
    });
  };
  SB.renterStats = function (id) {
    var p = SB.period('year'), st = { rent: 0, held: 0, tips: 0, given: 0, list: [] }, r2 = function (n) { return Math.round(n * 100) / 100; };
    SB.entries.forEach(function (e) {
      if (e.who !== id || !SB.inP(e, p)) return; st.list.push(e); if (e.status) return;
      if (e.dir === 'in') { if (/^Pago de renta/.test(e.title)) st.rent += e.amount; else st.held += e.amount; }
      else if (e.dir === 'out') { if (/propinas/i.test(e.title)) st.tips += e.amount; else st.given += e.amount; }
    });
    st.list.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    st.left = r2(st.held - st.given); ['rent', 'held', 'tips', 'given'].forEach(function (k) { st[k] = r2(st[k]); });
    return st;
  };
  SB.renterSheet = function (id) {
    var r = SB.renter(id), st = SB.renterStats(id), no = '<em class="rs-no">No es gasto del salón</em>';
    var left = st.left > 0.004 ? { v: st.left, n: 'El salón todavía le debe entregar esto.' } : st.left < -0.004 ? { v: 0, n: 'Al corriente. Ya le entregaste ' + M(-st.left) + ' de más.' } : { v: 0, n: 'Al corriente: no le debes nada.' };
    SB.sheet('<div class="sh-body renter-sh" style="--who:' + r.colour + '"><p class="sh-kicker"><i class="who-pip2"></i>Mi silla · ' + r.role + ' · enero a hoy</p><h2 class="sh-title">' + r.name + '</h2>' +
      '<div class="rs-grid">' +
      '<div><span>Renta pagada</span><b>' + M(st.rent) + '</b><small>Lo que ' + r.short + ' le pagó al salón por su silla.</small>' + no + '</div>' +
      '<div><span>Cobros que el salón guardó para ella</span><b>' + M(st.held) + '</b><small>Clientes que pagaron en el salón por su trabajo.</small>' + no + '</div>' +
      '<div><span>Propinas</span><b>' + M(st.tips) + '</b><small>Propinas que ya le entregaste.</small>' + no + '</div>' +
      '<div class="rs-left"><span>Falta por liquidar</span><b>' + M(left.v) + '</b><small>' + left.n + '</small>' + no + '</div></div>' +
      '<p class="sh-label">Movimientos de ' + r.short + ' (' + st.list.length + ')</p><ul class="rows">' + st.list.map(function (e) { return SB.ui.row(e, { date: true }); }).join('') + '</ul>' +
      '<div class="sh-actions"><button class="btn btn-main" data-share-renter="' + r.short + '">' + I('doc') + 'Compartir</button></div><button class="btn btn-quiet sh-done" data-close>Listo</button></div>', { label: 'Mi silla · ' + r.name, cls: 'sheet-renter' });
  };
  SB.teamSheet = function () {
    var p = SB.period('year');
    SB.sheet('<div class="sh-body"><h2 class="sh-title">Equipo y sillas</h2><p class="sh-meta">Cada persona tiene su color en tus listas.</p><ul class="team">' + SB.renters.map(function (r) {
      var inn = 0, outp = 0; SB.entries.forEach(function (e) { if (e.who === r.id && SB.inP(e, p) && !e.status) { if (e.dir === 'in') inn += e.amount; else outp += e.amount; } });
      return '<li style="--who:' + r.colour + '" data-renter="' + r.id + '" role="button" tabindex="0"><span class="tm-av">' + r.short[0] + '</span><span class="tm-t"><b>' + r.name + '</b><span>' + r.role + '</span></span><span class="tm-n"><small>Le cobraste</small>' + M(inn) + (outp ? '<small>Le pagaste</small>' + M(outp) : '') + '</span></li>';
    }).join('') + '</ul><p class="sh-why">' + I('info') + '<span>Lo que le pagas a quien renta o sus propinas es dinero de esa persona: no es un gasto tuyo y no baja tu resultado.</span></p><button class="btn btn-quiet sh-done" data-close>Listo</button></div>', { label: 'Equipo y sillas' });
  };

  // ======================= global delegation =======================
  doc.addEventListener('click', function (e) {
    var x;
    if ((x = e.target.closest('[data-mode]'))) { SB.setMode(x.dataset.mode); return; }
    if ((x = e.target.closest('[data-step]'))) { SB.step(+x.dataset.step); return; }
    if ((x = e.target.closest('[data-renter]'))) { SB.renterSheet(x.dataset.renter); return; }
    if ((x = e.target.closest('[data-close-month]'))) { SB.closeSheet(x.dataset.closeMonth); return; }
    if ((x = e.target.closest('[data-tag-need]'))) { e.stopPropagation(); SB.attentionSheet(x.dataset.tagNeed); return; }
    if ((x = e.target.closest('[data-share-renter]'))) { SB.haptic('success'); SB.toast('Hoja de ' + x.dataset.shareRenter + ' lista para compartir. Demostración: no se envía nada', 'warn'); return; }
    if ((x = e.target.closest('[data-go]'))) { SB.go(x.dataset.go); return; }
    if ((x = e.target.closest('[data-reopen]'))) { SB.reopenSept(); return; }
    if ((x = e.target.closest('[data-scroll-to]'))) { var tg = doc.querySelector(x.dataset.scrollTo); if (tg) tg.scrollIntoView({ block: 'center', behavior: still() ? 'auto' : 'smooth' }); return; }
    if ((x = e.target.closest('[data-demo-share]'))) { SB.toast('En la demostración no se envía nada', 'warn'); return; }
    if ((x = e.target.closest('[data-warn]'))) { SB.attentionSheet('a2'); return; }
    if ((x = e.target.closest('[data-entry]'))) { SB.entrySheet(x.dataset.entry); return; }
    if ((x = e.target.closest('[data-need]'))) { SB.attentionSheet(x.dataset.need); return; }
    if ((x = e.target.closest('[data-pick-cat]'))) { SB.catSheet(x.dataset.pickCat); return; }
    if ((x = e.target.closest('[data-do]'))) {
      if (x.dataset.do === 'void') { var idv = x.dataset.id; SB.confirmSheet({ kicker: 'Anular', title: '¿Anular la segunda anotación?', text: 'Se queda en tu lista marcada «Anulado» y ya no cuenta: el gasto de guantes baja de ' + M(39.98) + ' a ' + M(19.99) + ' en octubre.', yes: 'Sí, anular', onYes: function () { SB.decide(idv, 'void'); } }); return; }
      SB.decide(x.dataset.id, x.dataset.do); return;
    }
    if ((x = e.target.closest('[data-explain]'))) { SB.explain(x.dataset.explain); return; }
    if ((x = e.target.closest('[data-anotar]'))) { SB.anotarSheet(); return; }
    if ((x = e.target.closest('[data-receipt]'))) { SB.receiptSheet(x.dataset.receipt); return; }
    if ((x = e.target.closest('[data-filter]'))) { if (SB.state.filter !== x.dataset.filter) { SB.state.filter = x.dataset.filter; SB.refresh(['filters', 'list', 'listsum']); } x.scrollIntoView && x.scrollIntoView({ inline: 'center', block: 'nearest', behavior: still() ? 'auto' : 'smooth' }); return; }
    if ((x = e.target.closest('[data-rfilter]'))) { if (SB.state.rfilter !== x.dataset.rfilter) { var o = ['all', 'todo', 'done']; SB.navDir = Math.sign(o.indexOf(x.dataset.rfilter) - o.indexOf(SB.state.rfilter)); SB.state.rfilter = x.dataset.rfilter; SB.refresh(['rfilters', 'receipts']); } return; }
    if ((x = e.target.closest('[data-view]'))) { if (SB.state.view !== x.dataset.view) { SB.state.view = x.dataset.view; SB.refresh(['views']); } return; }
    if ((x = e.target.closest('[data-clear]'))) { SB.state.filter = 'all'; SB.state.q = ''; var q = doc.getElementById('q'); if (q) q.value = ''; SB.refresh(); return; }
    if ((x = e.target.closest('[data-theme-set]'))) { SB.applyTheme(x.dataset.themeSet); return; }
    if ((x = e.target.closest('[data-theme-toggle]'))) { SB.applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); return; }
    if ((x = e.target.closest('[data-report]'))) { SB.reportSheet(); return; }
    if ((x = e.target.closest('[data-team]'))) { SB.teamSheet(); return; }
    if ((x = e.target.closest('[data-demo-dl]'))) { SB.toast('En la demostración no se descarga nada', 'warn'); return; }
    if ((x = e.target.closest('[data-lang]'))) { SB.toast('Inglés llega en la versión real', 'warn'); return; }
    if ((x = e.target.closest('[data-zoom]'))) { var r = SB.receipts.find(function (y) { return y.id === x.dataset.zoom; }) || { id: 'r1' }; SB.sheet('<div class="sh-body zoom-body">' + SB.receiptSVG('receipt zoomed', SB.receiptFor(r)) + '<button class="btn btn-quiet sh-done" data-close>Cerrar</button></div>', { label: 'Foto del recibo', cls: 'sheet-zoom' }); return; }
  });
  doc.addEventListener('input', function (e) { if (e.target.id === 'q') { SB.state.q = e.target.value; var only = ['list', 'listsum']; if (SB.state.q && SB.state.filter !== 'all') { SB.state.filter = 'all'; only.push('filters'); } SB.refresh(only); } });
  doc.addEventListener('change', function (e) { if (e.target.id === 'haptics') { SB.prefs.haptics = e.target.checked; LS('haptics', e.target.checked ? '1' : '0'); if (e.target.checked) SB.haptic('success'); } });
  doc.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input,textarea,select,.sheet')) return;
    if (e.key === 'ArrowLeft') { if (doc.querySelector('[data-b=prev]')) SB.step(-1); } else if (e.key === 'ArrowRight') { if (doc.querySelector('[data-b=next]')) SB.step(1); }
  });

  // ======================= forms =======================
  SB.lastCat = LS('lastcat') || null;
  // the 3 categories used most (by count of purchases); the last one used goes first
  SB.topCats = function () {
    var n = {}; SB.entries.forEach(function (e) { if (e.dir === 'out' && e.cat && e.kind !== 'payout') n[e.cat] = (n[e.cat] || 0) + 1; });
    var all = SB.cats.map(function (c) { return c.id; }).filter(function (id) { return n[id]; }).sort(function (a, b) { return n[b] - n[a]; });
    var last = SB.lastCat && SB.cat(SB.lastCat) ? SB.lastCat : null;
    return { ids: (last ? [last].concat(all.filter(function (id) { return id !== last; })) : all).slice(0, 3), last: last };
  };
  SB.ui.catGrid = function () {
    var T = SB.topCats(), top = T.ids;
    return '<fieldset class="field cats-f"><legend>¿En qué fue?</legend><div class="cat-grid">' + top.map(function (id, i) { var c = SB.cat(id); return '<label class="cat-t"><input type="radio" name="cat" value="' + id + '"' + (i === 0 ? ' checked' : '') + '>' + I(c.icon || 'out') + '<span>' + c.name + (i === 0 ? '<small>' + (T.last ? 'La última que usaste' : 'La que más usas') + '</small>' : '') + '</span></label>'; }).join('') + '</div>' +
      '<div class="cat-row"><select name="catMore" class="cat-more" aria-label="Otra categoría"><option value="">Otra categoría…</option>' + SB.cats.filter(function (c) { return top.indexOf(c.id) < 0; }).map(function (c) { return '<option value="' + c.id + '">' + c.name + (c.pending ? ' (espera a tu contador)' : '') + '</option>'; }).join('') + '</select></div>' +
      '<label class="cat-t cat-none"><input type="radio" name="cat" value="none">' + I('info') + '<span>No sé, que decida mi contador<small>Se guarda y espera a tu contador: todavía no cuenta.</small></span></label></fieldset>';
  };
  SB.ui.dateChips = function () {
    return '<fieldset class="field"><legend>¿Cuándo?</legend><div class="chips wrap date-chips"><label class="chip"><input type="radio" name="dwhen" value="' + SB.today + '" checked><span>Hoy · ' + SB.dm(SB.today) + '</span></label><label class="chip"><input type="radio" name="dwhen" value="' + addDays(SB.today, -1) + '"><span>Ayer</span></label><label class="chip"><input type="radio" name="dwhen" value="other"><span>Otro día</span></label></div><input class="date-other" id="date" name="date" type="date" value="' + SB.today + '" min="2026-01-01" max="' + SB.today + '" hidden aria-label="Fecha"></fieldset>';
  };
  SB.ui.catChips = function () {
    return '<fieldset class="field cats-f"><legend>Categoría</legend><div class="chips wrap">' +
      SB.cats.filter(function (c) { return c.icon; }).map(function (c) { return '<label class="chip"><input type="radio" name="cat" value="' + c.id + '">' + I(c.icon) + '<span>' + c.name + '</span></label>'; }).join('') +
      '<label class="chip chip-quiet"><input type="radio" name="cat" value="none">' + I('info') + '<span>No sé la categoría</span></label></div>' +
      '<select name="catMore" class="cat-more" aria-label="Más categorías"><option value="">Más categorías…</option>' + SB.cats.filter(function (c) { return !c.icon; }).map(function (c) { return '<option value="' + c.id + '">' + c.name + (c.pending ? ' — espera a tu contador' : '') + '</option>'; }).join('') + '</select>' +
      '<p class="hint">Las que dicen «espera a tu contador» se guardan, pero todavía no cuentan.</p></fieldset>';
  };
  SB.ui.accounts = function (dir) {
    var a = dir === 'in' ? ['Caja de efectivo', 'Cuenta bancaria', 'Tarjetas'] : ['Caja de efectivo', 'Cuenta bancaria'];
    return '<fieldset class="field"><legend>' + (dir === 'in' ? '¿A dónde entró?' : '¿De dónde salió?') + '</legend><div class="seg">' + a.map(function (x, i) { return '<label class="seg-b"><input type="radio" name="account" value="' + x + '"' + (i === 0 ? ' checked' : '') + '><span>' + x + '</span></label>'; }).join('') + '</div></fieldset>';
  };
  SB.ui.amountField = function (label) { return '<div class="field amt-wrap"><label for="amount">' + label + '</label><div class="amt"><span class="amt-cur">US$</span><input id="amount" name="amount" inputmode="decimal" autocomplete="off" placeholder="0.00" aria-describedby="amt-err"></div><p class="form-err" id="amt-err" hidden></p></div>'; };
  SB.ui.dateField = function () { return '<div class="field"><label for="date">Fecha</label><input id="date" name="date" type="date" value="' + SB.today + '" min="2026-01-01" max="' + SB.today + '"></div>'; };
  SB.ui.titleField = function () { return '<div class="field"><label for="title">Qué fue</label><input id="title" name="title" autocomplete="off" placeholder="Por ejemplo: tintes y champú"></div>'; };
  SB.ui.incomeExtras = function () {
    return '<details class="field more"><summary>' + I('plus') + 'Venta de productos, impuesto o propinas</summary><div class="more-in">' +
      '<div class="field"><label for="tax">Impuesto de ventas cobrado (opcional)</label><input id="tax" name="tax" inputmode="decimal" placeholder="0.00"><p class="hint">Si cobraste impuesto, se guarda esperando a tu contador.</p></div>' +
      '<fieldset class="field"><legend>¿Es de alguien del equipo?</legend><div class="chips wrap"><label class="chip"><input type="radio" name="who" value="" checked><span>Es del salón</span></label>' + SB.renters.map(function (r) { return '<label class="chip who" style="--who:' + r.colour + '"><input type="radio" name="who" value="' + r.id + '"><i></i><span>' + r.short + '</span></label>'; }).join('') + '</div></fieldset></div></details>';
  };
  SB.ui.formBody = function (dir) {
    return dir === 'in' ? SB.ui.amountField('Cuánto entró') + SB.ui.accounts('in') + SB.ui.dateChips() + SB.ui.titleField() + SB.ui.incomeExtras()
      : SB.ui.amountField('Cuánto pagaste') + SB.ui.catGrid() + SB.ui.dateChips() + SB.ui.accounts('out') + SB.ui.titleField();
  };
  SB.ui.submit = function (dir) { return '<div class="submit-bar"><button class="btn btn-main btn-save" type="submit"><span class="s-idle">' + (dir === 'in' ? 'Guardar entrada' : 'Guardar gasto') + '</span><span class="s-busy" aria-hidden="true"></span><span class="s-ok">' + I('check') + 'Guardado</span></button></div>'; };
  SB.ui.form = function (kind) {
    kind = kind || 'out'; var dir = kind === 'in' ? 'in' : 'out', scan = kind === 'scan';
    return '<div class="form-page ' + (scan ? 'has-receipt' : '') + '">' + SB.ui.back('inicio', 'Inicio') +
      '<header class="page-h"><h1>' + (dir === 'in' ? 'Entró dinero' : scan ? 'Revisa el recibo' : 'Pagué algo') + '</h1></header><p class="form-when">' + I('clock') + '<span>Fecha: <b>Hoy · ' + SB.dm(SB.today) + '</b></span><button type="button" class="linkbtn" data-scroll-to=".date-chips">Cambiar</button></p>' +
      (scan ? '<div class="receipt-pane"><button class="receipt-frame" data-zoom="r3" aria-label="Ver la foto del recibo en grande">' + SB.receiptSVG('receipt', SB.receiptFor({ id: 'r1' })) + '<span class="scanline" aria-hidden="true"></span></button><p class="read-status" aria-live="polite"><span class="rs-reading">' + I('sparkle') + 'Leyendo el recibo…</span><span class="rs-read">' + I('check') + 'Leímos esto del recibo. Revísalo antes de guardar.</span></p></div>' : '') +
      '<form class="form" novalidate>' + SB.ui.formBody(dir) + SB.ui.submit(dir) + '</form></div>';
  };
  SB.addEntry = function (e) {
    e.id = 'n' + Date.now(); e.date = e.date || SB.today;
    var c = e.cat && SB.cat(e.cat); e.inTotals = e.dir === 'in' ? !e.taxPending : !!(c && !c.pending);
    if (e.dir === 'out' && !c) e.flag = 'Sin clasificar'; else if (c && c.pending) e.flag = 'Pendiente de tu contador';
    if (e.dir === 'in' && e.taxPending) e.flag = 'Pendiente de tu contador';
    SB.entries.unshift(e); SB.state.month = e.date.slice(0, 7); SB.state.week = mondayOf(e.date); SB.justSaved = e.id;
    setTimeout(function () { SB.justSaved = null; }, 2500);
    return e;
  };
  SB.bindForm = function (scope, dir) {
    var f = scope.querySelector('form'); if (!f) return;
    var amt = f.querySelector('[name=amount]');
    var fmtAmt = function () { var v = amt.value.replace(/[^0-9.]/g, ''); var p = v.split('.'); if (p.length > 2) v = p[0] + '.' + p.slice(1).join(''); if (p[1] && p[1].length > 2) v = p[0] + '.' + p[1].slice(0, 2); amt.value = v; var big = scope.querySelector('[data-amt-echo]'); if (big) big.textContent = v ? M(parseFloat(v) || 0) : 'US$0.00'; amt.closest('.amt-wrap').classList.remove('bad'); var er = f.querySelector('.form-err'); if (er) er.hidden = true; };
    if (amt) amt.addEventListener('input', fmtAmt);
    scope.querySelectorAll('[data-key]').forEach(function (k) { k.addEventListener('click', function () { var v = amt.value, key = k.dataset.key; if (key === 'del') v = v.slice(0, -1); else if (key === '.' && v.indexOf('.') >= 0) return; else if (/\.\d\d$/.test(v)) { SB.haptic('warn'); return; } else v = (v === '0' && key !== '.') ? key : v + key; amt.value = v; fmtAmt(); }); });
    f.addEventListener('change', function (e) { if (e.target.name === 'dwhen') { var o = f.querySelector('.date-other'); o.hidden = e.target.value !== 'other'; if (e.target.value !== 'other') o.value = e.target.value; else o.focus(); } if (e.target.name === 'cat' || e.target.name === 'account' || e.target.name === 'who') SB.haptic('select'); var more = f.querySelector('[name=catMore]'); if (e.target === more && more.value) { f.querySelectorAll('[name=cat]').forEach(function (r) { r.checked = false; }); } if (e.target.name === 'cat' && more) more.value = ''; });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var v = parseFloat(amt.value), err = f.querySelector('.form-err');
      if (!(v > 0)) { SB.haptic('warn'); amt.closest('.amt-wrap').classList.add('bad'); if (err) { err.textContent = 'Escribe el monto, por ejemplo 45.50'; err.hidden = false; } amt.focus(); return; }
      var fd = new FormData(f), cat = fd.get('catMore') || fd.get('cat') || null; if (cat === 'none') cat = null;
      var btn = f.querySelector('[type=submit]'); btn.classList.add('saving'); btn.disabled = true;
      setTimeout(function () {
        var en = SB.addEntry({ dir: dir, amount: v, date: fd.get('date') || SB.today, title: (fd.get('title') || '').trim() || (dir === 'in' ? 'Entrada sin descripción' : 'Compra sin descripción'), cat: dir === 'out' ? cat : null, account: fd.get('account'), receipt: scope.querySelector('.receipt-pane') ? 'r3' : null, who: fd.get('who') || null, taxPending: !!parseFloat(fd.get('tax') || '0') });
        if (cat) { SB.lastCat = cat; LS('lastcat', cat); } if (en.receipt) { var rr = SB.receipts.find(function (r) { return r.id === 'r3'; }); if (rr) { rr.done = true; rr.entry = en.id; rr.amount = v; rr.title = en.title; } }
        btn.classList.remove('saving'); btn.classList.add('saved'); SB.haptic('success');
        setTimeout(function () { SB.toast(en.inTotals ? 'Se guardó · ' + M(v) : 'Se guardó, pero todavía no cuenta: ' + (en.flag || '').toLowerCase()); SB.go('inicio', { dir: -1 }); }, 480);
      }, 380);
    });
  };
  SB.simulateRead = function (scope) {
    var f = scope.querySelector('form'); if (!f) return;
    scope.classList.add('reading');
    setTimeout(function () {
      scope.classList.remove('reading'); scope.classList.add('read');
      var set = function (n, v) { var el = f.querySelector('[name=' + n + ']'); if (el) { el.value = v; el.dispatchEvent(new Event('input')); var w = el.closest('.field'); if (w) w.classList.add('from-receipt'); } };
      set('amount', '19.99'); set('title', 'Guantes de nitrilo · Suministros Rivera (ficticio)');
      var r = f.querySelector('[name=cat][value=materiales]'); if (r) { r.checked = true; r.closest('label').classList.add('suggested'); }
      SB.haptic('success');
    }, still() ? 50 : 1500);
  };
  SB.routes.anotar = { tab: '', render: function (kind) { return SB.ui.form(kind); }, mount: function (s, kind) { SB.bindForm(s, kind === 'in' ? 'in' : 'out'); if (kind === 'scan') SB.simulateRead(s); else { var a = s.querySelector('#amount'); if (a) setTimeout(function () { a.focus({ preventScroll: true }); }, 320); } } };

  SB.ui.tabbar = function () {
    var t = [['inicio', 'Inicio', 'home'], ['dinero', 'Dinero', 'money'], ['recibos', 'Recibos', 'receipt'], ['revisar', 'Revisar', 'check'], ['mas', 'Más', 'more']];
    return t.map(function (x) { var badge = x[0] === 'revisar' ? '<span class="badge" data-badge></span>' : ''; return '<a class="tab" data-tab="' + x[0] + '" href="#/' + x[0] + '" data-h="select"><span class="tab-ic">' + I(x[2]) + badge + '</span><span class="tab-l">' + x[1] + '</span></a>'; }).join('');
  };
  SB.ui.lang = function () { return '<button class="lang" data-lang aria-label="Idioma: español. Cambiar a inglés"><b>ES</b><span>EN</span></button>'; };
  SB.ui.settings = function () {
    var th = SB.prefs.theme || SB.defaultTheme || 'light';
    return '<section class="set"><h2 class="set-h">Cómo se ve</h2><div class="seg" role="group" aria-label="Tema">' + [['light', 'Claro', 'sun'], ['dark', 'Oscuro', 'moon'], ['auto', 'Automático', 'vibrate']].map(function (o) { return '<button class="seg-b' + (th === o[0] ? ' sel' : '') + '" data-theme-set="' + o[0] + '" aria-pressed="' + (th === o[0]) + '">' + I(o[2]) + o[1] + '</button>'; }).join('') + '</div></section>' +
      '<section class="set"><h2 class="set-h">Cómo responde</h2><label class="switch-row"><span>' + I('vibrate') + '<span><b>Vibración al tocar</b><small>En teléfonos que lo permiten</small></span></span><input type="checkbox" role="switch" id="haptics"' + (SB.prefs.haptics ? ' checked' : '') + '></label></section>';
  };

  // ======================= Ventas de Square (simulated import) =======================
  // No real file is read: any file you pick, or the sample, loads the same fictional October 1-9 sales.
  // Per sale: sale = what the salon earns, tip = goes to the stylist, tax = held, fee = Square's commission (an expense).
  var SQ = SB.square = { phase: 'idle', range: 'month', from: '2026-10-01', to: '2026-10-09', file: null, last: null, batch: 0 };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var Q = function (id, date, t, sale, tip, tax, dup) { return { id: id, date: date, title: t + ' (ficticio)', sale: sale, tip: tip, tax: tax, fee: r2((sale + tip + tax) * 0.029 + 0.3), imported: !!dup, pre: !!dup }; };
  SQ.orders = [
    Q('s1', '2026-10-01', 'Corte y peinado', 45, 8, 0), Q('s2', '2026-10-01', 'Tinte completo', 80, 15, 0),
    Q('s3', '2026-10-02', 'Corte de caballero', 25, 5, 0),
    Q('s4', '2026-10-03', 'Peinado de fiesta', 60, 10, 0), Q('s5', '2026-10-03', 'Champú vendido', 18, 0, 1.13),
    Q('s6', '2026-10-04', 'Corte y color', 95, 18, 0),
    Q('s7', '2026-10-06', 'Manicura', 35, 6, 0), Q('s8', '2026-10-06', 'Alisado', 120, 20, 0),
    Q('s9', '2026-10-07', 'Corte de niña', 20, 4, 0), Q('s10', '2026-10-07', 'Tratamiento de keratina', 40, 7, 0),
    Q('s11', '2026-10-08', 'Corte y peinado', 50, 9, 0),
    Q('s12', '2026-10-09', 'Corte y peinado', 80, 14, 0, true), Q('s13', '2026-10-09', 'Tinte y secado', 120, 22, 0, true)
  ];
  SQ.rangeOf = function () {
    if (SQ.range === 'month') return { from: SB.today.slice(0, 7) + '-01', to: SB.today };
    if (SQ.range === 'year') return { from: SB.FIRST, to: SB.today };
    return { from: SQ.from, to: SQ.to };
  };
  SQ.view = function () {
    var R = SQ.rangeOf(), days = {}, T = { nNew: 0, nDup: 0, sale: 0, tip: 0, tax: 0, fee: 0 };
    SQ.orders.filter(function (o) { return o.date >= R.from && o.date <= R.to; }).forEach(function (o) {
      var d = days[o.date] = days[o.date] || { date: o.date, orders: [], nNew: 0, nDup: 0, sale: 0, tip: 0, tax: 0, fee: 0 };
      d.orders.push(o);
      if (o.imported) { d.nDup++; T.nDup++; } else { d.nNew++; T.nNew++; ['sale', 'tip', 'tax', 'fee'].forEach(function (k) { d[k] += o[k]; T[k] += o[k]; }); }
    });
    ['sale', 'tip', 'tax', 'fee'].forEach(function (k) { T[k] = r2(T[k]); });
    return { days: Object.keys(days).sort().map(function (k) { var d = days[k]; ['sale', 'tip', 'tax', 'fee'].forEach(function (x) { d[x] = r2(d[x]); }); return d; }), T: T };
  };
  SQ.status = function () { var l = SQ.last; return l ? 'Última importación: ' + SB.dm(l.at) + ' · ' + l.n + ' ventas, hasta el ' + SB.dm(l.until) : 'Todavía no has importado ventas'; };
  SQ.preview = function () {
    var V = SQ.view(), T = V.T;
    if (!V.days.length) return '<div class="empty">' + I('search') + '<p>No hay ventas en esas fechas.</p></div>';
    var dl = function (a, b, note, cls) { return '<div class="' + (cls || '') + '"><dt>' + a + '<small>' + note + '</small></dt><dd>' + b + '</dd></div>'; };
    return '<div class="sq-file">' + I('doc') + '<span><b>' + esc(SQ.file || 'ventas-square-ejemplo.csv') + '</b><small>' + (SQ.file && SQ.file !== 'ventas-square-ejemplo.csv' ? 'Demostración: no leemos tu archivo, mostramos ventas de ejemplo.' : 'Archivo de ejemplo con ventas ficticias.') + '</small></span></div>' +
      '<p class="sq-count"><b>' + T.nNew + ' ventas nuevas</b>' + (T.nDup ? ' · ' + T.nDup + ' ya estaban anotadas, no se repiten' : '') + '</p>' +
      V.days.map(function (d) {
        return '<section class="sq-day"><h3><span>' + SB.cap(SB.dayLabel(d.date)) + '</span><b>' + (d.nNew ? M(d.sale) : 'Sin ventas nuevas') + '</b></h3><ul class="sq-orders">' + d.orders.map(function (o) { return '<li class="' + (o.imported ? 'dup' : '') + '"><span>' + esc(o.title) + (o.imported ? ' <em>Ya anotada</em>' : '') + '</span><span>' + M(o.sale) + '</span></li>'; }).join('') + '</ul>' +
          (d.nNew ? '<dl class="sq-dl">' + dl('Ventas', M(d.sale), 'entra a tu salón', 'in') + dl('Propinas', M(d.tip), 'van a tu equipo, no son ingreso del salón', 'off') + dl('Impuesto de venta', M(d.tax), 'se guarda, no es ingreso', 'off') + dl('Comisión de Square', '− ' + M(d.fee), 'es un gasto', 'out') + '</dl>' : '') +
          (d.nDup ? '<p class="sq-dup">' + I('check') + d.nDup + ' ya estaban anotadas, no se repiten</p>' : '') + '</section>';
      }).join('') +
      '<div class="sq-total"><p class="sq-th">Al importar, esto cambia en tus libros</p><div><span>Entra (ventas)</span><b>+ ' + M(T.sale) + '</b></div><div><span>Sale (comisión de Square)</span><b>− ' + M(T.fee) + '</b></div><div class="off"><span>No cuenta: propinas de tu equipo</span><b>' + M(T.tip) + '</b></div><div class="off"><span>No cuenta: impuesto guardado</span><b>' + M(T.tax) + '</b></div></div>' +
      '<div class="submit-bar sq-bar"><button class="btn btn-main btn-save" type="button" data-sq-import' + (T.nNew ? '' : ' disabled') + '>' + (T.nNew ? 'Importar ' + T.nNew + ' ventas' : 'No hay ventas nuevas') + '</button><button class="btn btn-quiet" type="button" data-sq-cancel>Cancelar</button></div>';
  };
  SQ.render = function () {
    SQ.phase = 'idle';
    var chips = [['month', 'Este mes'], ['year', 'Desde enero'], ['custom', 'Elegir fechas']];
    return '<div class="square">' + SB.ui.back('mas', 'Más') + '<header class="page-h"><h1>Ventas de Square</h1></header>' +
      '<p class="sq-status ' + (SQ.last ? 'ok' : '') + '" data-sq="status">' + I(SQ.last ? 'check' : 'clock') + '<span>' + SQ.status() + '</span></p>' +
      '<ol class="sq-steps"><li><b>1</b><span>Descarga el archivo de Square</span></li><li><b>2</b><span>Súbelo aquí</span></li><li><b>3</b><span>Revisa y confirma</span></li></ol>' +
      '<fieldset class="field sq-range"><legend>¿Desde cuándo traer las ventas?</legend><div class="chips wrap" role="group" aria-label="Fechas">' + chips.map(function (c) { return '<button type="button" class="chip' + (SQ.range === c[0] ? ' sel' : '') + '" data-sq-range="' + c[0] + '" aria-pressed="' + (SQ.range === c[0]) + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      '<div class="sq-dates" data-sq="dates"' + (SQ.range === 'custom' ? '' : ' hidden') + '><label>Desde<input type="date" id="sq-from" value="' + SQ.from + '" min="2026-01-01" max="' + SB.today + '"></label><label>Hasta<input type="date" id="sq-to" value="' + SQ.to + '" min="2026-01-01" max="' + SB.today + '"></label></div>' +
      '<p class="hint">Así también se anotan las ventas viejas. El archivo de ejemplo solo trae ventas del 1 al 9 de oct.</p></fieldset>' +
      '<div class="sq-actions"><label class="btn btn-main sq-file-btn" for="sq-file">' + I('plus') + 'Subir archivo de Square</label><input type="file" id="sq-file" accept=".csv,.xlsx,text/csv" class="sq-input"><button type="button" class="btn btn-quiet" data-sq-sample>Usar archivo de ejemplo</button></div>' +
      '<div data-sq="preview" aria-live="polite"></div></div>';
  };
  SQ.paint = function () {
    var pv = doc.querySelector('[data-sq=preview]'); if (!pv) return;
    pv.innerHTML = SQ.phase === 'preview' ? SQ.preview() : '';
    var st = doc.querySelector('[data-sq=status]'); if (st) st.innerHTML = I(SQ.last ? 'check' : 'clock') + '<span>' + SQ.status() + '</span>', st.classList.toggle('ok', !!SQ.last);
    var a = doc.querySelector('.sq-actions'); if (a) a.hidden = SQ.phase === 'preview';
  };
  SQ.open = function (name) {
    SQ.file = name || 'ventas-square-ejemplo.csv'; SQ.phase = 'preview'; SQ.paint(); SB.haptic('select');
    var pv = doc.querySelector('[data-sq=preview]'); if (pv && pv.scrollIntoView) pv.scrollIntoView({ block: 'start', behavior: still() ? 'auto' : 'smooth' });
  };
  SQ.commit = function () {
    var V = SQ.view(), fresh = [], byDay = {}, tips = 0, tax = 0, until = '', sale = 0, id = ++SQ.batch, added = [];
    V.days.forEach(function (d) { d.orders.forEach(function (o) { if (!o.imported) { fresh.push(o); byDay[o.date] = (byDay[o.date] || 0) + o.fee; tips += o.tip; tax += o.tax; sale += o.sale; } }); });
    if (!fresh.length) return;
    V.days.forEach(function (d) { if (d.date > until) until = d.date; }); // up to the last day in the file, even if those sales were already noted
    var pt = SB.totals(SB.period()); SB.mem.in = pt.in; SB.mem.out = pt.out; SB.mem.res = pt.res; // so the numbers count up from what was on screen
    fresh.forEach(function (o) { o.imported = true; added.push(E('sq' + id + '-' + o.id, o.date, o.title, o.sale, 'in', { account: 'Tarjetas', square: true })); });
    Object.keys(byDay).sort().forEach(function (d) { added.push(E('sq' + id + '-f' + d, d, 'Comisión de Square (ficticia)', r2(byDay[d]), 'out', { cat: 'comisiones', account: 'Tarjetas', square: true })); });
    if (tips > 0) added.push(E('sq' + id + '-tips', until, 'Propinas de Square para tu equipo (ficticio)', r2(tips), 'in', { inTotals: false, kind: 'tips', square: true }));
    if (tax > 0) added.push(E('sq' + id + '-tax', until, 'Impuesto de venta de Square (ficticio)', r2(tax), 'in', { inTotals: false, flag: 'Pendiente de tu contador', square: true }));
    added.forEach(function (e) { SB.entries.push(e); });
    var prev = SQ.last; SQ.last = { at: SB.today, until: until, n: fresh.length }; SQ.phase = 'idle'; SQ.file = null;
    SB.state.mode = 'month'; SB.state.month = until.slice(0, 7); SB.haptic('success');
    SB.toast('Importaste ' + fresh.length + ' ventas de Square (' + M(sale) + ')', null, function () {
      var q0 = SB.totals(SB.period()); SB.mem.in = q0.in; SB.mem.out = q0.out; SB.mem.res = q0.res;
      SB.entries = SB.entries.filter(function (e) { return added.indexOf(e) < 0; }); fresh.forEach(function (o) { o.imported = false; }); SQ.last = prev; SQ.phase = 'idle';
      SB.refresh(); SQ.paint();
    });
    SB.go('dinero');
  };
  SQ.mount = function (s) {
    var root_ = s.querySelector('.square'); SQ.paint();
    root_.addEventListener('click', function (e) {
      var x;
      if ((x = e.target.closest('[data-sq-range]'))) {
        SQ.range = x.dataset.sqRange; root_.querySelectorAll('[data-sq-range]').forEach(function (b) { var on = b === x; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
        root_.querySelector('[data-sq=dates]').hidden = SQ.range !== 'custom'; if (SQ.phase === 'preview') SQ.paint(); return;
      }
      if (e.target.closest('[data-sq-sample]')) { SQ.open(); return; }
      if (e.target.closest('[data-sq-cancel]')) { SQ.phase = 'idle'; SQ.paint(); return; }
      if (e.target.closest('[data-sq-import]')) { SQ.commit(); return; }
    });
    root_.addEventListener('change', function (e) {
      if (e.target.id === 'sq-file') { var f = e.target.files && e.target.files[0]; if (f) SQ.open(f.name); e.target.value = ''; }
      if (e.target.id === 'sq-from' || e.target.id === 'sq-to') { SQ.from = root_.querySelector('#sq-from').value || SQ.from; SQ.to = root_.querySelector('#sq-to').value || SQ.to; if (SQ.from > SQ.to) { var t = SQ.from; SQ.from = SQ.to; SQ.to = t; root_.querySelector('#sq-from').value = SQ.from; root_.querySelector('#sq-to').value = SQ.to; } if (SQ.phase === 'preview') SQ.paint(); }
    });
  };

  // ======================= boot =======================
  SB.boot = function () {
    root.classList.toggle('touch', matchMedia('(pointer:coarse)').matches || (navigator.maxTouchPoints > 0 && innerWidth < 820));
    var m = LS('mode'); if (m && ORDER.indexOf(m) >= 0) SB.state.mode = m;
    SB.applyTheme();
    doc.getElementById('tabs').innerHTML = SB.ui.tabbar();
    show({ focus: false }); SB.booted = true;
  };
})();
