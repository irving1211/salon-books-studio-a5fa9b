/* Salon Books prototype core, shared by the three directions (copied into each as shared.js).
   Fictional demo data only (Salón Brisa). Totals follow the demo's own figures; the prototype never defines financial rules:
   each entry carries `inTotals` as the real demo shows it, and a new entry counts only when it has a category that is not
   waiting for the accountant. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var RM = matchMedia('(prefers-reduced-motion: reduce)');
  var SB = window.SB = window.SB || {};
  var LS = function (k, v) { try { if (v === undefined) return localStorage.getItem('sb-' + k); localStorage.setItem('sb-' + k, v); } catch (e) { return null; } };

  // ---------------- data ----------------
  SB.business = 'Salón Brisa';
  SB.today = '2026-10-12';
  SB.months = ['2026-08', '2026-09', '2026-10'];
  SB.renters = [
    { id: 'carmen', name: 'Carmen Silla (ficticia)', short: 'Carmen', colour: '#c4657a' },
    { id: 'dalia', name: 'Dalia Silla (ficticia)', short: 'Dalia', colour: '#6a7fc4' },
    { id: 'lucia', name: 'Lucía Estilista (ficticia)', short: 'Lucía', colour: '#c49a3a' }
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
    E('e1', '2026-10-10', 'Guantes (ficticio)', 19.99, 'out', { cat: 'materiales', account: 'Caja de efectivo', receipt: true }),
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
    E('e12', '2026-09-18', 'Renta del local (ficticio)', 300, 'out', { cat: 'renta' }),
    E('e13', '2026-09-15', 'Champú vendido con impuesto (ficticio)', 25.5, 'in', { inTotals: false, flag: 'Pendiente de tu contador' }),
    E('e14', '2026-09-12', 'Servicios con propina (ficticio)', 330, 'in'),
    E('e15', '2026-09-10', 'Cobro hecho por el salón a quien renta', 90, 'in', { who: 'carmen' }),
    E('e16', '2026-09-05', 'Corte, lavado y peinado (ficticio)', 150, 'in'),
    E('e17', '2026-09-05', 'Corte y peinado (ficticio)', 120, 'in'),
    E('e18', '2026-09-04', 'Pago de renta', 400, 'in', { inTotals: false, status: 'Anulado', who: 'dalia' }),
    E('e19', '2026-08-25', 'Comisión del procesador (ficticio)', 15, 'out', { cat: 'comisiones' }),
    E('e20', '2026-08-20', 'Servicios en efectivo (ficticio)', 250, 'in'),
    E('e21', '2026-08-14', 'Depósito del procesador (ficticio)', 600, 'move', { inTotals: false }),
    E('e22', '2026-08-12', 'Luz de agosto (ficticio)', 120, 'out', { cat: 'luz' }),
    E('e23', '2026-08-10', 'Tintes y champú (ficticio)', 85.5, 'out', { cat: 'materiales' }),
    E('e24', '2026-08-06', 'Pago de renta', 400, 'in', { who: 'lucia' }),
    E('e25', '2026-08-03', 'Servicios del día (ficticio)', 600, 'in'),
    E('e26', '2026-08-01', 'Aporte de la dueña (ficticio)', 1000, 'in', { inTotals: false })
  ];
  SB.attention = [
    { id: 'a1', kind: 'close', title: 'Cerrar septiembre de 2026', sub: 'El mes terminó y falta cerrarlo', why: 'Cuando cierras un mes, sus números quedan fijos para tu contador. Antes hay que resolver o confirmar sus pendientes.' },
    { id: 'a2', kind: 'dup', title: 'Posible movimiento repetido', date: '2026-10-10', amount: 19.99, entry: 'e2', why: 'Hay dos anotaciones iguales el mismo día. Si una sobra, anúlala en Dinero. Si las dos son reales, confírmalo aquí.' },
    { id: 'a3', kind: 'cat', title: 'Compra sin categoría', date: '2026-10-08', amount: 12, entry: 'e4', why: 'Elige una categoría para que la compra cuente en tus libros. Si no la sabes, pregúntale a tu contador.' },
    { id: 'a4', kind: 'tax', title: 'Impuesto de venta pendiente', date: '2026-09-15', amount: 25.5, why: 'Cobraste impuesto de ventas. Se guarda esperando a tu contador.' },
    { id: 'a5', kind: 'equip', title: 'Compra de equipo para revisar', date: '2026-09-22', amount: 450, why: 'Las compras de equipo las revisa tu contador antes de que cuenten.' }
  ];
  SB.receipts = [
    { id: 'r1', date: '2026-10-10', title: 'Suministros Rivera (ficticio)', amount: 19.99, done: true },
    { id: 'r2', date: '2026-09-18', title: 'Renta del local (ficticio)', amount: 300, done: true },
    { id: 'r3', date: '2026-10-11', title: 'Recibo sin anotar', amount: null, done: false }
  ];
  SB.state = { month: '2026-10', filter: 'all', q: '', firstLoad: true };

  // ---------------- format ----------------
  var MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  SB.money = function (n, o) {
    o = o || {}; var s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var sign = o.sign ? (o.sign === 'in' ? '+ ' : o.sign === 'out' ? '− ' : '') : (n < 0 ? '− ' : '');
    return sign + 'US$' + s;
  };
  SB.parts = function (n) { var s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.'); return { int: s[0], dec: s[1] }; };
  SB.monthLabel = function (m, short) { var p = m.split('-'); return short ? MES3[+p[1] - 1] : MES[+p[1] - 1] + ' de ' + p[0]; };
  SB.cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  SB.monthName = function (m) { return MES[+m.split('-')[1] - 1]; };
  SB.dateShort = function (d) { var p = d.split('-'); return +p[2] + ' ' + MES3[+p[1] - 1] + ' ' + p[0]; };
  SB.dayLabel = function (d) {
    if (d === SB.today) return 'Hoy';
    var t = new Date(SB.today + 'T12:00'), x = new Date(d + 'T12:00'), diff = Math.round((t - x) / 864e5);
    if (diff === 1) return 'Ayer';
    var p = d.split('-'); var wd = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][x.getDay()];
    return wd + ' ' + (+p[2]) + ' ' + MES3[+p[1] - 1];
  };
  SB.longDate = function (d) { var x = new Date(d + "T12:00"), p = d.split("-"); return ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][x.getDay()] + " " + (+p[2]) + " de " + MES[+p[1] - 1]; };
  SB.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  SB.renter = function (id) { return SB.renters.find(function (r) { return r.id === id; }); };

  // ---------------- numbers ----------------
  SB.totals = function (m) {
    var t = { in: 0, out: 0, res: 0, outside: [] };
    SB.entries.forEach(function (e) {
      if (e.date.slice(0, 7) !== m) return;
      if (e.inTotals) { if (e.dir === 'in') t.in += e.amount; else if (e.dir === 'out') t.out += e.amount; }
      else if (e.flag) t.outside.push(e);
    });
    t.in = Math.round(t.in * 100) / 100; t.out = Math.round(t.out * 100) / 100; t.res = Math.round((t.in - t.out) * 100) / 100;
    return t;
  };
  SB.series = function () { return SB.months.map(function (m) { var t = SB.totals(m); return { m: m, label: SB.monthLabel(m, true), in: t.in, out: t.out, res: t.res }; }); };
  SB.attentionOpen = function () { return SB.attention.filter(function (a) { return !a.done; }); };
  SB.filters = [['all', 'Todo'], ['in', 'Entradas'], ['out', 'Compras'], ['rent', 'Rentas'], ['pending', 'Pendientes'], ['receipt', 'Con recibo']];
  SB.list = function (opts) {
    opts = opts || {}; var m = opts.month, f = opts.filter || 'all', q = (opts.q || '').trim().toLowerCase();
    var items = SB.entries.filter(function (e) {
      if (m && e.date.slice(0, 7) !== m) return false;
      if (f === 'in' && e.dir !== 'in') return false;
      if (f === 'out' && e.dir !== 'out') return false;
      if (f === 'rent' && !e.who) return false;
      if (f === 'pending' && !e.flag) return false;
      if (f === 'receipt' && !e.receipt) return false;
      if (q) { var hay = (e.title + ' ' + (e.cat ? SB.cat(e.cat).name : '') + ' ' + e.amount.toFixed(2) + ' ' + (e.who ? SB.renter(e.who).short : '')).toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    }).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    var groups = [], last = null;
    items.forEach(function (e) { if (!last || last.date !== e.date) { last = { date: e.date, label: SB.dayLabel(e.date), items: [] }; groups.push(last); } last.items.push(e); });
    return { items: items, groups: groups };
  };
  SB.sub = function (e) {
    var p = [];
    if (e.dir === 'move') p.push('Entre tus cuentas'); else p.push(e.dir === 'in' ? 'Entró dinero' : 'Salió dinero');
    if (e.cat) p.push(SB.cat(e.cat).name);
    if (e.who) p.push(SB.renter(e.who).short);
    return p.join(' · ');
  };

  // ---------------- icons (24px, stroke) ----------------
  var P = {
    home: '<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
    receipt: '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
    check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
    more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
    in: '<path d="M12 4v13M6.5 11.5 12 17l5.5-5.5"/><path d="M5 20h14"/>',
    out: '<path d="M12 20V7M6.5 12.5 12 7l5.5 5.5"/><path d="M5 4h14"/>',
    scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8.5 9h7M8.5 12h7M8.5 15h4"/>',
    camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
    chev: '<path d="m9.5 6 6 6-6 6"/>', chevL: '<path d="m14.5 6-6 6 6 6"/>',
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
    dots: '<circle cx="12" cy="6" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="18" r="1.3"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    move: '<path d="M4 8.5h14l-3.5-3.5M20 15.5H6l3.5 3.5"/>',
    team: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.4M17.5 13.8A5.5 5.5 0 0 1 20.5 19"/>',
    chart: '<path d="M4 19.5h16M7 16V11M12 16V6.5M17 16v-3.5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/>',
    vibrate: '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4.5 9v6M19.5 9v6M2 10.5v3M22 10.5v3"/>',
    sparkle: '<path d="M12 4.5 13.6 10.4 19.5 12l-5.9 1.6L12 19.5l-1.6-5.9L4.5 12l5.9-1.6z"/>'
  };
  SB.icon = function (n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (P[n] || '') + '</svg>'; };

  // ---------------- receipt illustration (fictional) ----------------
  SB.receiptSVG = function (cls) {
    var mono = "font-family='ui-monospace,Menlo,Consolas,monospace'";
    var l = function (y, a, b, w) { return "<text x='22' y='" + y + "' " + mono + " font-size='13' fill='#2b2925'" + (w ? " font-weight='700'" : '') + ">" + a + "</text>" + (b ? "<text x='238' y='" + y + "' text-anchor='end' " + mono + " font-size='13' fill='#2b2925'" + (w ? " font-weight='700'" : '') + ">" + b + "</text>" : ''); };
    var zig = ''; for (var i = 0; i <= 26; i++) zig += (i * 10) + ',' + (i % 2 ? 452 : 446) + ' ';
    return "<svg class='" + (cls || 'receipt') + "' viewBox='0 0 260 460' role='img' aria-label='Foto del recibo (ficticio): Suministros Rivera, total US$19.99'>" +
      "<defs><filter id='rgrain'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' result='n'/><feColorMatrix in='n' values='0 0 0 0 .55 0 0 0 0 .5 0 0 0 0 .45 0 0 0 .09 0'/><feBlend in='SourceGraphic' mode='multiply'/></filter>" +
      "<linearGradient id='rshade' x1='0' x2='1'><stop offset='0' stop-color='#000' stop-opacity='.06'/><stop offset='.5' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.05'/></linearGradient></defs>" +
      "<polygon points='0,0 260,0 260,450 " + zig.trim().split(' ').reverse().join(' ') + "' fill='#fbf8f1' filter='url(#rgrain)'/>" +
      "<rect width='260' height='452' fill='url(#rshade)'/>" +
      "<text x='130' y='40' text-anchor='middle' " + mono + " font-size='15' font-weight='700' fill='#2b2925'>SUMINISTROS RIVERA</text>" +
      "<text x='130' y='58' text-anchor='middle' " + mono + " font-size='11' fill='#55514a'>BELLEZA PROFESIONAL (FICTICIO)</text>" +
      "<text x='130' y='74' text-anchor='middle' " + mono + " font-size='11' fill='#55514a'>LAWRENCE MA</text>" +
      "<line x1='22' y1='92' x2='238' y2='92' stroke='#8c877c' stroke-dasharray='3 3'/>" +
      l(116, '10/10/2026', '11:42') + l(146, 'GUANTES NITRILO M', '9.99') + l(166, ' CAJA 100', '') + l(190, 'GUANTES NITRILO S', '8.82') +
      "<line x1='22' y1='212' x2='238' y2='212' stroke='#8c877c' stroke-dasharray='3 3'/>" +
      l(236, 'SUBTOTAL', '18.81') + l(258, 'IMPUESTO 6.25%', '1.18') + l(290, 'TOTAL', '19.99', 1) + l(316, 'EFECTIVO', '20.00') + l(336, 'CAMBIO', '0.01') +
      "<line x1='22' y1='358' x2='238' y2='358' stroke='#8c877c' stroke-dasharray='3 3'/>" +
      "<text x='130' y='384' text-anchor='middle' " + mono + " font-size='11' fill='#55514a'>GRACIAS POR SU COMPRA</text>" +
      "<g fill='#2b2925'>" + [0, 3, 5, 6, 9, 11, 14, 15, 17, 20, 22, 23, 26, 28, 31, 33, 34, 37, 39, 42, 44, 45, 48, 50].map(function (x, i) { return "<rect x='" + (70 + x * 2.4) + "' y='398' width='" + (i % 3 ? 1.4 : 2.6) + "' height='30'/>"; }).join('') + "</g></svg>";
  };

  // ---------------- charts ----------------
  SB.barChart = function (o) {
    o = o || {}; var s = SB.series(), W = o.w || 280, H = o.h || 96, max = 0, cur = SB.state.month;
    s.forEach(function (x) { max = Math.max(max, x.in, x.out); });
    var gw = W / s.length, bw = Math.min(16, gw / 4), out = '';
    s.forEach(function (x, i) {
      var cx = gw * i + gw / 2, hi = Math.max(2, x.in / max * (H - 22)), ho = Math.max(2, x.out / max * (H - 22)), on = x.m === cur;
      out += "<g class='bar-g" + (on ? ' on' : '') + "' style='--i:" + i + "'><rect class='bar bar-in' x='" + (cx - bw - 2) + "' y='" + (H - 18 - hi) + "' width='" + bw + "' height='" + hi + "' rx='" + Math.min(4, bw / 2) + "'/>" +
        "<rect class='bar bar-out' x='" + (cx + 2) + "' y='" + (H - 18 - ho) + "' width='" + bw + "' height='" + ho + "' rx='" + Math.min(4, bw / 2) + "'/>" +
        "<text class='bar-l' x='" + cx + "' y='" + (H - 3) + "' text-anchor='middle'>" + x.label + "</text></g>";
    });
    return "<svg class='chart bars' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Entró y salió por mes: " + s.map(function (x) { return x.label + ' entró ' + SB.money(x.in) + ', salió ' + SB.money(x.out); }).join('; ') + "'>" + out + "</svg>";
  };
  SB.lineChart = function (o) {
    o = o || {}; var s = SB.series(), W = o.w || 320, H = o.h || 90, pad = 8, key = o.key || 'res';
    var vals = s.map(function (x) { return x[key]; }), mx = Math.max.apply(0, vals), mn = Math.min(0, Math.min.apply(0, vals));
    var pts = vals.map(function (v, i) { return [pad + i * (W - pad * 2) / (vals.length - 1), pad + (1 - (v - mn) / ((mx - mn) || 1)) * (H - pad * 2 - 14)]; });
    var d = pts.map(function (p, i) { if (!i) return 'M' + p[0] + ' ' + p[1]; var q = pts[i - 1], cx = (q[0] + p[0]) / 2; return 'C' + cx + ' ' + q[1] + ' ' + cx + ' ' + p[1] + ' ' + p[0] + ' ' + p[1]; }).join(' ');
    var area = d + ' L' + pts[pts.length - 1][0] + ' ' + (H - 14) + ' L' + pts[0][0] + ' ' + (H - 14) + 'Z';
    var dots = pts.map(function (p, i) { return "<circle class='ln-dot" + (s[i].m === SB.state.month ? ' on' : '') + "' cx='" + p[0] + "' cy='" + p[1] + "' r='" + (s[i].m === SB.state.month ? 4.5 : 3) + "'/><text class='bar-l' x='" + p[0] + "' y='" + (H - 1) + "' text-anchor='" + (i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle') + "'>" + s[i].label + "</text>"; }).join('');
    return "<svg class='chart line' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Resultado estimado por mes: " + s.map(function (x) { return x.label + ' ' + SB.money(x[key]); }).join('; ') + "'><path class='ln-area' d='" + area + "'/><path class='ln draw' d='" + d + "' pathLength='1'/>" + dots + "</svg>";
  };

  // ---------------- feedback: haptics, toast ----------------
  SB.prefs = { haptics: LS('haptics') !== '0', theme: LS('theme') || null };
  var sw = null;
  function iosTick() {
    if (!sw) { sw = doc.createElement('label'); sw.setAttribute('aria-hidden', 'true'); sw.style.cssText = 'position:fixed;left:-200px;top:0;opacity:0;pointer-events:none'; var i = doc.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1; sw.appendChild(i); doc.body.appendChild(sw); }
    sw.click();
  }
  SB.haptic = function (kind) {
    if (!SB.prefs.haptics) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    var pat = { tap: 8, select: 6, success: [12, 50, 18], warn: [24, 60, 24], heavy: 20 }[kind || 'tap'];
    try { if (navigator.vibrate) { navigator.vibrate(pat); return; } } catch (e) { }
    try { iosTick(); if (kind === 'success' || kind === 'warn') setTimeout(iosTick, 90); } catch (e) { }
  };
  SB.toast = function (msg, kind) {
    var t = doc.getElementById('sb-toast');
    if (!t) { t = doc.createElement('div'); t.id = 'sb-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); doc.body.appendChild(t); }
    t.innerHTML = '<span class="toast-ic">' + SB.icon(kind === 'warn' ? 'info' : 'check') + '</span><span>' + msg + '</span>';
    t.className = 'toast show ' + (kind || '');
    clearTimeout(t._h); t._h = setTimeout(function () { t.className = 'toast ' + (kind || ''); }, 2600);
  };

  // ---------------- theme ----------------
  SB.applyTheme = function (pref) {
    if (pref !== undefined) { SB.prefs.theme = pref; LS('theme', pref || ''); }
    var p = SB.prefs.theme || SB.defaultTheme || 'light';
    var dark = p === 'dark' || (p === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    var m = doc.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(root).getPropertyValue('--chrome').trim() || (dark ? '#111' : '#fff');
  };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { SB.applyTheme(); });

  // ---------------- count-up ----------------
  SB.prev = {};
  SB.countUps = function (scope) {
    (scope || doc).querySelectorAll('[data-count]').forEach(function (el) {
      var to = parseFloat(el.dataset.count), key = el.dataset.key || '', from = key in SB.prev ? SB.prev[key] : (el.dataset.from ? parseFloat(el.dataset.from) : to * .6);
      SB.prev[key] = to;
      var fmt = el.dataset.fmt === 'parts' ? function (v) { var p = SB.parts(v); return '<span class="cu-cur">US$</span>' + p.int + '<span class="cu-dec">.' + p.dec + '</span>'; } : function (v) { return SB.money(v); };
      if (RM.matches || from === to || SB.motionOff) { el.innerHTML = fmt(to); return; }
      var t0 = performance.now(), dur = +(el.dataset.dur || 900);
      (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.innerHTML = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); })(t0);
    });
  };

  // ---------------- sheets ----------------
  SB.sheet = function (html, o) {
    o = o || {}; var last = doc.activeElement;
    var w = doc.createElement('div'); w.className = 'sheet-wrap ' + (o.cls || '');
    w.innerHTML = '<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-label="' + SB.esc(o.label || 'Detalle') + '"><div class="grab" aria-hidden="true"></div>' + html + '</div>';
    doc.body.appendChild(w);
    var sh = w.querySelector('.sheet');
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('open'); }); });
    function close(v) {
      if (w._closing) return; w._closing = 1; w.classList.remove('open'); sh.style.transform = '';
      setTimeout(function () { w.remove(); if (last && last.focus) last.focus(); }, RM.matches ? 0 : 340);
      doc.removeEventListener('keydown', key); if (o.onClose) o.onClose(v);
    }
    function key(e) { if (e.key === 'Escape') close(); }
    doc.addEventListener('keydown', key);
    w.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) { SB.haptic('select'); close(); } });
    // drag to dismiss
    var g = w.querySelector('.grab'), y0 = null, dy = 0;
    function down(e) { if (e.target.closest('input,select,textarea,button:not(.grab)')) return; if (sh.scrollTop > 0 && e.target !== g) return; y0 = e.clientY; dy = 0; sh.style.transition = 'none'; }
    function mv(e) { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = 'translateY(' + dy + 'px)'; }
    function up() { if (y0 === null) return; y0 = null; sh.style.transition = ''; if (dy > 110) { SB.haptic('select'); close(); } else sh.style.transform = ''; }
    sh.addEventListener('pointerdown', down); addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    setTimeout(function () { var f = sh.querySelector('[autofocus]') || sh.querySelector('button,[href],input,select'); if (f) f.focus({ preventScroll: true }); }, 60);
    if (o.onMount) o.onMount(sh, close);
    return close;
  };

  // ---------------- swipe ----------------
  SB.swipe = function (el, onLeft, onRight) {
    var x0 = null, y0 = 0;
    el.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    el.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { (dx < 0 ? onLeft : onRight)(); } });
  };
  SB.stepMonth = function (d) {
    var i = SB.months.indexOf(SB.state.month) + d;
    if (i < 0 || i >= SB.months.length) { SB.haptic('warn'); SB.toast(i < 0 ? 'No hay meses anteriores en la demostración' : 'Octubre es el mes abierto', 'warn'); return false; }
    SB.state.month = SB.months[i]; SB.haptic('select'); SB.navDir = d; SB.render(); return true;
  };

  // ---------------- router + render ----------------
  SB.routes = {}; SB.navDir = 0;
  // The route lives in ?s= (the tweaks bar owns the #hash for its settings); a legacy #/route still works on first load.
  SB.route = function () { var s = new URLSearchParams(location.search).get('s'); var h = s || (location.hash.indexOf('#/') === 0 ? location.hash.slice(2) : '') || 'inicio'; var p = h.split('/'); return { name: p[0], arg: p[1] }; };
  SB.go = function (h) {
    var u = new URL(location.href); u.searchParams.set('s', h); if (u.hash.indexOf('#/') === 0) u.hash = '';
    if (u.href === location.href) { SB.render(); return; }
    history.pushState(null, '', u.href); onRoute();
  };
  var TABS = ['inicio', 'dinero', 'recibos', 'revisar', 'mas'];
  SB.render = function (opts) {
    var r = SB.route(), fn = SB.routes[r.name] || SB.routes.inicio, screen = doc.getElementById('screen');
    var draw = function () {
      screen.classList.remove('reading', 'read'); screen.innerHTML = fn(r.arg);
      screen.dataset.route = r.name;
      doc.querySelectorAll('[data-tab]').forEach(function (t) { var on = t.dataset.tab === (TABS.indexOf(r.name) >= 0 ? r.name : SB.parentTab || ''); t.classList.toggle('on', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
      SB.countUps(screen);
      if (SB.after) SB.after(r, screen);
      if (SB.routeAfter && SB.routeAfter[r.name]) SB.routeAfter[r.name](screen, r.arg);
      var h1 = screen.querySelector('h1'); if (h1 && opts && opts.focus) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    };
    root.dataset.nav = SB.navDir > 0 ? 'fwd' : SB.navDir < 0 ? 'back' : 'swap';
    if (doc.startViewTransition && !RM.matches && !SB.motionOff && !(opts && opts.instant)) doc.startViewTransition(draw); else draw();
    SB.navDir = 0;
  };
  var lastTab = 0;
  function onRoute() {
    var r = SB.route(), i = TABS.indexOf(r.name);
    if (!SB.navDir) SB.navDir = i >= 0 ? (i > lastTab ? 1 : i < lastTab ? -1 : 0) : 1;
    if (i >= 0) lastTab = i;
    SB.render({ focus: true }); scrollTo({ top: 0 });
  }
  addEventListener('popstate', function () { SB.navDir = -1; onRoute(); });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#/"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); SB.go(a.getAttribute('href').slice(2));
  });
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('button,a,[role=button],label.chip,.tap');
    if (b && !b.disabled) SB.haptic(b.dataset.h || 'tap');
  });
  doc.addEventListener('touchstart', function () { }, { passive: true });
  doc.addEventListener('click', function (e) { if (e.target.closest('[data-theme-toggle]')) { SB.applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'); SB.render({ instant: true }); } });

  // ---------------- saving (prototype) ----------------
  SB.addEntry = function (e) {
    e.id = 'n' + Date.now(); e.date = e.date || SB.today;
    var c = e.cat && SB.cat(e.cat); e.inTotals = e.dir === 'in' ? !e.taxPending : !!(c && !c.pending);
    if (e.dir === 'out' && !c) e.flag = 'Sin clasificar'; else if (c && c.pending) e.flag = 'Pendiente de tu contador';
    if (e.dir === 'in' && e.taxPending) e.flag = 'Pendiente de tu contador';
    SB.entries.unshift(e); SB.state.month = e.date.slice(0, 7); SB.justSaved = e.id;
    return e;
  };
  SB.resolve = function (id, how) {
    var a = SB.attention.find(function (x) { return x.id === id; }); if (!a) return;
    if (a.kind === 'cat' && how && how.cat) { var en = SB.entries.find(function (x) { return x.id === a.entry; }); en.cat = how.cat; var c = SB.cat(how.cat); en.inTotals = !c.pending; en.flag = c.pending ? 'Pendiente de tu contador' : null; }
    if (a.kind === 'dup' && how === 'void') { var d = SB.entries.find(function (x) { return x.id === a.entry; }); d.inTotals = false; d.status = 'Anulado'; }
    a.done = true;
  };

  // Shared detail sheet for an entry ("Explicar este número" style)
  SB.entrySheet = function (id) {
    var e = SB.entries.find(function (x) { return x.id === id; }); if (!e) return;
    var rows = [['Fecha', SB.dateShort(e.date)], ['Monto', SB.money(e.amount)], ['Tipo', e.dir === 'in' ? 'Entró dinero' : e.dir === 'out' ? 'Salió dinero' : 'Entre tus cuentas']];
    if (e.cat) rows.push(['Categoría', SB.cat(e.cat).name]);
    if (e.who) rows.push(['Persona', SB.renter(e.who).name]);
    if (e.account) rows.push(['Cuenta', e.account]);
    var why = e.status === 'Anulado' ? 'Está anulado: se ve en la lista, pero no cuenta en tus libros.' : !e.inTotals ? (e.flag === 'Sin clasificar' ? 'Se guardó, pero no cuenta hasta que tenga categoría.' : e.flag ? 'Se guardó, pero espera a tu contador antes de contar.' : e.kind === 'payout' ? 'Es dinero de otra persona que pasó por el salón: no es un gasto tuyo.' : e.dir === 'move' ? 'Es dinero que pasó entre tus cuentas: no entra ni sale del salón.' : 'No cuenta en los totales del mes.') : 'Cuenta en los totales de ' + SB.monthLabel(e.date.slice(0, 7)) + '.';
    SB.sheet('<div class="sh-body"><p class="sh-kicker">' + SB.dayLabel(e.date) + '</p><h2 class="sh-title">' + SB.esc(e.title) + '</h2><p class="sh-amount ' + e.dir + '">' + SB.money(e.amount, { sign: e.dir }) + '</p>' +
      '<dl class="sh-dl">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + SB.esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="sh-why">' + SB.icon('info') + '<span>' + why + '</span></p>' + (e.receipt ? '<div class="sh-receipt">' + SB.receiptSVG('receipt mini') + '</div>' : '') +
      '<button class="btn btn-quiet sh-done" data-close>Listo</button></div>', { label: e.title });
  };

  // Attention item sheet (Revisar decisions: Confirmar / Para tu contador / Posponer)
  SB.attentionSheet = function (id) {
    var a = SB.attention.find(function (x) { return x.id === id; }); if (!a) return;
    var body = '';
    if (a.kind === 'cat') {
      body = '<p class="sh-label">Elige la categoría</p><div class="chips wrap">' + SB.cats.filter(function (c) { return c.icon; }).map(function (c) { return '<button class="chip" data-cat="' + c.id + '">' + SB.icon(c.icon) + c.name + '</button>'; }).join('') + '</div>';
    } else if (a.kind === 'dup') {
      body = '<div class="dup-pair"><div>' + SB.icon('receipt') + '<b>Guantes (ficticio)</b><span>10 oct · US$19.99 · con recibo</span></div><div>' + SB.icon('receipt') + '<b>Guantes (ficticio)</b><span>10 oct · US$19.99 · sin recibo</span></div></div>' +
        '<div class="sh-actions"><button class="btn btn-main" data-do="void">Anular la segunda</button><button class="btn btn-quiet" data-do="confirm">Las dos son reales</button></div>';
    } else {
      body = '<p class="sh-label">Tu decisión</p><div class="sh-actions col"><button class="btn btn-main" data-do="confirm">Confirmar · lo revisé</button><button class="btn btn-quiet" data-do="accountant">Para tu contador</button><button class="btn btn-quiet" data-do="later">Posponer</button></div>';
    }
    SB.sheet('<div class="sh-body"><p class="sh-kicker need">' + SB.icon('flag') + 'Necesita tu atención</p><h2 class="sh-title">' + a.title + '</h2>' + (a.amount ? '<p class="sh-meta">' + SB.dateShort(a.date) + ' · ' + SB.money(a.amount) + '</p>' : '<p class="sh-meta">' + a.sub + '</p>') + '<p class="sh-why">' + SB.icon('info') + '<span>' + a.why + '</span></p>' + body + '</div>', {
      label: a.title,
      onMount: function (sh, close) {
        sh.addEventListener('click', function (e) {
          var c = e.target.closest('[data-cat]'), d = e.target.closest('[data-do]');
          if (c) { c.classList.add('sel'); SB.resolve(a.id, { cat: c.dataset.cat }); SB.haptic('success'); setTimeout(function () { close(); SB.toast('Listo: ahora cuenta como ' + SB.cat(c.dataset.cat).name); SB.render({ instant: false }); }, 260); }
          if (d) { if (d.dataset.do === 'later') { close(); SB.toast('Lo verás aquí otra vez mañana'); return; } SB.resolve(a.id, d.dataset.do === 'void' ? 'void' : null); SB.haptic('success'); close(); SB.toast(d.dataset.do === 'void' ? 'Anulada. Ya no cuenta en tus libros' : d.dataset.do === 'accountant' ? 'Guardado para tu contador' : 'Confirmado'); SB.render(); }
        });
      }
    });
  };

  // ---------------- shared form behaviour ----------------
  SB.bindForm = function (scope, dir) {
    var f = scope.querySelector('form'); if (!f) return;
    var amt = f.querySelector('[name=amount]');
    var fmtAmt = function () { var v = amt.value.replace(/[^0-9.]/g, ''); var p = v.split('.'); if (p.length > 2) v = p[0] + '.' + p.slice(1).join(''); if (p[1] && p[1].length > 2) v = p[0] + '.' + p[1].slice(0, 2); amt.value = v; var big = scope.querySelector('[data-amt-echo]'); if (big) big.textContent = v ? SB.money(parseFloat(v) || 0) : 'US$0.00'; };
    if (amt) amt.addEventListener('input', fmtAmt);
    scope.querySelectorAll('[data-key]').forEach(function (k) { k.addEventListener('click', function () { var v = amt.value, key = k.dataset.key; if (key === 'del') v = v.slice(0, -1); else if (key === '.' && v.indexOf('.') >= 0) return; else if (/\.\d\d$/.test(v)) { SB.haptic('warn'); return; } else v = (v === '0' && key !== '.') ? key : v + key; amt.value = v; fmtAmt(); }); });
    f.addEventListener('change', function (e) { if (e.target.name === 'cat' || e.target.name === 'account' || e.target.name === 'who') SB.haptic('select'); var more = f.querySelector('[name=catMore]'); if (e.target === more && more.value) { f.querySelectorAll('[name=cat]').forEach(function (r) { r.checked = false; }); } if (e.target.name === 'cat' && more) more.value = ''; });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var v = parseFloat(amt.value);
      var err = f.querySelector('.form-err');
      if (!(v > 0)) { SB.haptic('warn'); amt.closest('.field, .amt-wrap').classList.add('bad'); if (err) { err.textContent = 'Escribe el monto, por ejemplo 45.50'; err.hidden = false; } amt.focus(); return; }
      var fd = new FormData(f), cat = fd.get('catMore') || fd.get('cat') || null;
      if (cat === 'none') cat = null;
      var btn = f.querySelector('[type=submit]'); btn.classList.add('saving'); btn.disabled = true;
      setTimeout(function () {
        var en = SB.addEntry({ dir: dir, amount: v, title: (fd.get('title') || '').trim() || (dir === 'in' ? 'Entrada sin descripción' : 'Compra sin descripción'), cat: dir === 'out' ? cat : null, account: fd.get('account'), receipt: !!scope.querySelector('.receipt'), who: fd.get('who') || null, taxPending: !!parseFloat(fd.get('tax') || '0') });
        btn.classList.remove('saving'); btn.classList.add('saved'); SB.haptic('success');
        setTimeout(function () { SB.toast(en.inTotals ? 'Se guardó · ' + SB.money(v) : 'Se guardó, pero todavía no cuenta: ' + (en.flag || '').toLowerCase()); SB.navDir = -1; SB.go('inicio'); }, 520);
      }, 420);
    });
  };
  // scan simulation: shows the receipt, "reads" it, then fills the form
  SB.simulateRead = function (scope, cb) {
    var f = scope.querySelector('form'); if (!f) return;
    scope.classList.add('reading');
    setTimeout(function () {
      scope.classList.remove('reading'); scope.classList.add('read');
      var set = function (n, v) { var el = f.querySelector('[name=' + n + ']'); if (el) { el.value = v; el.dispatchEvent(new Event('input')); el.closest('.field, .amt-wrap') && el.closest('.field, .amt-wrap').classList.add('from-receipt'); } };
      set('amount', '19.99'); set('title', 'Guantes de nitrilo · Suministros Rivera (ficticio)');
      var r = f.querySelector('[name=cat][value=materiales]'); if (r) { r.checked = true; r.closest('label').classList.add('suggested'); }
      var acc = f.querySelector('[name=account][value="Caja de efectivo"]'); if (acc) acc.checked = true;
      SB.haptic('success'); if (cb) cb();
    }, RM.matches ? 50 : 1500);
  };

  // ---------------- boot ----------------
  SB.boot = function () {
    root.classList.toggle("touch", matchMedia("(pointer:coarse)").matches || (navigator.maxTouchPoints > 0 && innerWidth < 820));
    SB.applyTheme();
    var m = SB.months; // keep
    var r = SB.route(); lastTab = Math.max(0, TABS.indexOf(r.name));
    var screen = doc.getElementById('screen');
    if (SB.skeleton && !RM.matches) { screen.innerHTML = SB.skeleton(); setTimeout(function () { SB.render({ instant: true }); }, 520); } else SB.render({ instant: true });
  };
})();
