/* Default screens for the Salon Books prototype (copied into each direction as screens.js). A direction overrides any of them
   by assigning SB.routes.<name> after this file loads. Markup uses semantic class names; each direction's CSS gives the look. */
(function () {
  'use strict';
  var SB = window.SB, I = SB.icon, M = SB.money, esc = SB.esc;

  SB.ui = {};
  SB.ui.back = function (to, label) { return '<a class="back" href="#/' + to + '" data-back>' + I('chevL') + '<span>' + label + '</span></a>'; };
  SB.ui.monthStepper = function (cls) {
    var i = SB.months.indexOf(SB.state.month);
    return '<div class="stepper ' + (cls || '') + '" role="group" aria-label="Mes"><button class="step" data-step="-1" aria-label="Mes anterior"' + (i <= 0 ? ' aria-disabled="true"' : '') + '>' + I('chevL') + '</button>' +
      '<span class="step-label" aria-live="polite">' + SB.cap(SB.monthLabel(SB.state.month)) + (SB.state.month === '2026-10' ? '<small>Mes abierto</small>' : '<small>Cerrado</small>') + '</span>' +
      '<button class="step" data-step="1" aria-label="Mes siguiente"' + (i >= SB.months.length - 1 ? ' aria-disabled="true"' : '') + '>' + I('chev') + '</button></div>';
  };
  SB.ui.row = function (e, o) {
    o = o || {}; var r = e.who && SB.renter(e.who);
    var tag = e.status ? '<span class="tag tag-void">' + e.status + '</span>' : e.flag ? '<span class="tag ' + (e.flag === 'Sin clasificar' ? 'tag-need' : 'tag-wait') + '">' + e.flag + '</span>' : '';
    var ic = e.dir === 'in' ? 'in' : e.dir === 'move' ? 'move' : (e.cat && SB.cat(e.cat).icon) || 'out';
    return '<li><button class="row' + (e.status ? ' is-void' : '') + (SB.justSaved === e.id ? ' just' : '') + '" data-entry="' + e.id + '" data-h="select">' +
      '<span class="row-ic ' + e.dir + '"' + (r ? ' style="--who:' + r.colour + '"' : '') + '>' + (r ? '<span class="who-dot" aria-hidden="true"></span>' : '') + I(ic) + '</span>' +
      '<span class="row-main"><span class="row-title">' + esc(e.title) + '</span><span class="row-sub">' + (o.date ? SB.dateShort(e.date) + ' · ' : '') + esc(SB.sub(e)) + '</span>' + tag + '</span>' +
      '<span class="row-amt ' + e.dir + '">' + M(e.amount, { sign: e.dir === 'move' ? null : e.dir }) + '</span></button></li>';
  };
  SB.ui.groups = function (groups) {
    if (!groups.length) return '<div class="empty">' + I('search') + '<p>No encontramos movimientos con eso.</p><button class="btn btn-quiet" data-clear>Quitar filtros</button></div>';
    return groups.map(function (g, gi) { return '<section class="day" style="--gi:' + gi + '"><h3 class="day-h"><span>' + g.label + '</span><span class="day-sum">' + daySum(g.items) + '</span></h3><ul class="rows">' + g.items.map(function (e) { return SB.ui.row(e); }).join('') + '</ul></section>'; }).join('');
  };
  function daySum(items) { var n = 0; items.forEach(function (e) { if (e.inTotals) n += e.dir === 'in' ? e.amount : e.dir === 'out' ? -e.amount : 0; }); return n ? M(n, { sign: n > 0 ? 'in' : 'out' }) : ''; }
  SB.ui.attention = function (max) {
    var open = SB.attentionOpen();
    if (!open.length) return '<div class="all-clear">' + I('check') + '<p><b>Todo al día.</b> No hay nada que necesite tu atención.</p></div>';
    return '<ul class="need-list">' + open.slice(0, max || 9).map(function (a) { return '<li><button class="need" data-need="' + a.id + '"><span class="need-dot" aria-hidden="true"></span><span class="need-main"><span class="need-title">' + a.title + '</span><span class="need-sub">' + (a.amount ? SB.dateShort(a.date) + ' · ' + M(a.amount) : a.sub) + '</span></span>' + I('chev', 'need-chev') + '</button></li>'; }).join('') + '</ul>';
  };
  SB.ui.tabbar = function () {
    var t = [['inicio', 'Inicio', 'home'], ['dinero', 'Dinero', 'money'], ['recibos', 'Recibos', 'receipt'], ['revisar', 'Revisar', 'check'], ['mas', 'Más', 'more']];
    return t.map(function (x) { var badge = x[0] === 'revisar' ? '<span class="badge" data-badge></span>' : ''; return '<a class="tab" data-tab="' + x[0] + '" href="#/' + x[0] + '" data-h="select"><span class="tab-ic">' + I(x[2]) + badge + '</span><span class="tab-l">' + x[1] + '</span></a>'; }).join('');
  };
  SB.ui.explain = function (kind) {
    var m = SB.state.month, t = SB.totals(m), list = SB.entries.filter(function (e) { return e.date.slice(0, 7) === m && e.inTotals && (kind === 'res' ? e.dir !== 'move' : e.dir === kind); });
    var title = kind === 'in' ? 'Entró' : kind === 'out' ? 'Salió' : 'Resultado estimado', val = kind === 'in' ? t.in : kind === 'out' ? t.out : t.res;
    SB.sheet('<div class="sh-body"><p class="sh-kicker">' + SB.monthLabel(m) + '</p><h2 class="sh-title">' + title + '</h2><p class="sh-amount">' + M(val) + '</p>' +
      (kind === 'res' ? '<p class="sh-why">' + I('info') + '<span>Ingresos menos gastos, antes de la revisión de tu contador. No es un cálculo de impuestos.</span></p>' : '') +
      '<p class="sh-label">Lo que suma este número (' + list.length + ')</p><ul class="rows">' + list.map(function (e) { return SB.ui.row(e, { date: true }); }).join('') + '</ul>' +
      (t.outside.length ? '<p class="sh-why">' + I('clock') + '<span>Fuera de estos totales: ' + t.outside.length + ' registro' + (t.outside.length > 1 ? 's' : '') + ' (' + t.outside.map(function (e) { return esc(e.title) + ', ' + M(e.amount); }).join('; ') + ').</span></p>' : '') +
      '<button class="btn btn-quiet sh-done" data-close>Listo</button></div>', { label: title });
  };
  SB.ui.anotarSheet = function () {
    SB.sheet('<div class="sh-body"><h2 class="sh-title">¿Qué quieres anotar?</h2><div class="anotar-grid">' +
      '<a class="anotar in" href="#/anotar/in" data-close>' + I('in') + '<b>Entró dinero</b><span>Lo que te pagaron</span></a>' +
      '<a class="anotar out" href="#/anotar/out" data-close>' + I('out') + '<b>Pagué algo</b><span>Lo que gastaste</span></a>' +
      '<a class="anotar scan" href="#/anotar/scan" data-close>' + I('camera') + '<b>Escanear recibo</b><span>Guarda la foto del recibo</span></a></div></div>', { label: 'Anotar', cls: 'sheet-anotar' });
  };

  // global delegation for shared controls
  document.addEventListener('click', function (e) {
    var x;
    if ((x = e.target.closest('[data-entry]'))) { SB.entrySheet(x.dataset.entry); return; }
    if ((x = e.target.closest('[data-need]'))) { SB.attentionSheet(x.dataset.need); return; }
    if ((x = e.target.closest('[data-step]'))) { SB.stepMonth(+x.dataset.step); return; }
    if ((x = e.target.closest('[data-explain]'))) { SB.ui.explain(x.dataset.explain); return; }
    if ((x = e.target.closest('[data-anotar]'))) { SB.ui.anotarSheet(); return; }
    if ((x = e.target.closest('[data-filter]'))) { SB.state.filter = x.dataset.filter; SB.render({ instant: true }); var c = document.querySelector('[data-filter="' + SB.state.filter + '"]'); if (c && c.scrollIntoView) c.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); return; }
    if ((x = e.target.closest('[data-clear]'))) { SB.state.filter = 'all'; SB.state.q = ''; SB.render({ instant: true }); return; }
    if ((x = e.target.closest('[data-theme-set]'))) { SB.applyTheme(x.dataset.themeSet); SB.render({ instant: true }); return; }
    if ((x = e.target.closest('[data-back]'))) { SB.navDir = -1; }
    if ((x = e.target.closest('[data-zoom]'))) { SB.sheet('<div class="sh-body zoom-body">' + SB.receiptSVG('receipt zoomed') + '<button class="btn btn-quiet sh-done" data-close>Cerrar</button></div>', { label: 'Foto del recibo', cls: 'sheet-zoom' }); return; }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'q') { SB.state.q = e.target.value; var pos = e.target.selectionStart; var list = document.getElementById('dinero-list'); if (list) { list.innerHTML = SB.ui.groups(SB.list({ month: SB.state.q ? null : SB.state.month, filter: SB.state.filter, q: SB.state.q }).groups); } }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'haptics') { SB.prefs.haptics = e.target.checked; try { localStorage.setItem('sb-haptics', e.target.checked ? '1' : '0'); } catch (x) { } if (e.target.checked) SB.haptic('success'); }
  });
  SB.after = function () { var b = document.querySelectorAll('[data-badge]'), n = SB.attentionOpen().length; b.forEach(function (x) { x.textContent = n || ''; x.hidden = !n; }); setTimeout(function () { SB.justSaved = null; }, 1600); };

  // ---------------- screens ----------------
  SB.routes.dinero = function () {
    var L = SB.list({ month: SB.state.q ? null : SB.state.month, filter: SB.state.filter, q: SB.state.q }), t = SB.totals(SB.state.month);
    return '<header class="page-h"><h1>Dinero</h1><button class="btn btn-main btn-sm" data-anotar>' + I('plus') + 'Anotar</button></header>' +
      '<p class="lede">Todo el dinero que entra y sale de tu salón, tal como lo anotas. Cada número se puede explicar.</p>' +
      '<label class="search">' + I('search') + '<input id="q" type="search" placeholder="Buscar por palabra o monto" value="' + esc(SB.state.q) + '" autocomplete="off" aria-label="Buscar movimientos"></label>' +
      '<div class="chips scroll" role="group" aria-label="Filtros">' + SB.filters.map(function (f) { return '<button class="chip' + (SB.state.filter === f[0] ? ' sel' : '') + '" data-filter="' + f[0] + '" aria-pressed="' + (SB.state.filter === f[0]) + '" data-h="select">' + f[1] + '</button>'; }).join('') + '</div>' +
      SB.ui.monthStepper() +
      '<div class="month-sum"><button data-explain="in"><span>Entró</span><b>' + M(t.in) + '</b></button><button data-explain="out"><span>Salió</span><b>' + M(t.out) + '</b></button><button data-explain="res"><span>Resultado</span><b>' + M(t.res) + '</b></button></div>' +
      '<div id="dinero-list">' + SB.ui.groups(L.groups) + '</div>';
  };
  SB.routes.revisar = function () {
    var open = SB.attentionOpen().length, all = SB.attention.length, done = all - open;
    return '<header class="page-h"><h1>Revisar</h1></header><p class="lede">Lo que necesita tu atención, una cosa a la vez. Nada se cambia sin que tú lo confirmes.</p>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + all + '" aria-valuenow="' + done + '" aria-label="Pendientes resueltos"><span style="--p:' + (done / all) + '"></span></div><p class="progress-l">' + done + ' de ' + all + ' resueltos</p>' +
      SB.ui.attention(20);
  };
  SB.routes.recibos = function () {
    return '<header class="page-h"><h1>Recibos</h1><a class="btn btn-main btn-sm" href="#/anotar/scan">' + I('camera') + 'Escanear</a></header>' +
      '<p class="lede">Guarda aquí las fotos de tus recibos para encontrarlas cuando las necesites.</p><ul class="receipt-grid">' +
      SB.receipts.map(function (r) { return '<li><button class="rcard" data-zoom><span class="rthumb">' + SB.receiptSVG('receipt thumb') + '</span><span class="rmeta"><b>' + esc(r.title) + '</b><span>' + SB.dateShort(r.date) + (r.amount ? ' · ' + M(r.amount) : '') + '</span>' + (r.done ? '<span class="tag tag-ok">Anotado</span>' : '<span class="tag tag-need">Falta anotarlo</span>') + '</span></button></li>'; }).join('') + '</ul>';
  };
  SB.routes.mas = function () {
    var th = SB.prefs.theme || SB.defaultTheme || 'light';
    var seg = [['light', 'Claro', 'sun'], ['dark', 'Oscuro', 'moon'], ['auto', 'Como el teléfono', 'vibrate']].map(function (o) { return '<button class="seg-b' + (th === o[0] ? ' sel' : '') + '" data-theme-set="' + o[0] + '" aria-pressed="' + (th === o[0]) + '">' + I(o[2]) + o[1] + '</button>'; }).join('');
    return '<header class="page-h"><h1>Más</h1></header>' +
      '<section class="set"><h2 class="set-h">Cómo se ve</h2><div class="seg" role="group" aria-label="Tema">' + seg + '</div></section>' +
      '<section class="set"><h2 class="set-h">Cómo responde</h2><label class="switch-row"><span>' + I('vibrate') + '<span><b>Vibración al tocar</b><small>En teléfonos que lo permiten</small></span></span><input type="checkbox" role="switch" id="haptics"' + (SB.prefs.haptics ? ' checked' : '') + '></label></section>' +
      '<section class="set"><h2 class="set-h">Tu salón</h2><ul class="set-list">' +
      '<li><span class="set-row">' + I('team') + '<span><b>Equipo y sillas</b><small class="who-row">' + SB.renters.map(function (r) { return '<i style="--who:' + r.colour + '"></i>' + r.short; }).join(' ') + '</small></span>' + I('chev') + '</span></li>' +
      '<li><span class="set-row">' + I('chart') + '<span><b>Informes</b><small>Para tu contador</small></span>' + I('chev') + '</span></li>' +
      '<li><span class="set-row">' + I('globe') + '<span><b>Idioma</b><small>Español · English</small></span>' + I('chev') + '</span></li></ul></section>' +
      '<p class="demo-note">Demostración: todo lo que ves en este negocio es ficticio. Ningún dato es real.</p>';
  };

  // default forms
  SB.ui.catChips = function () {
    return '<fieldset class="field cats"><legend>Categoría</legend><div class="chips wrap">' +
      SB.cats.filter(function (c) { return c.icon; }).map(function (c) { return '<label class="chip">' + '<input type="radio" name="cat" value="' + c.id + '">' + I(c.icon) + '<span>' + c.name + '</span></label>'; }).join('') +
      '<label class="chip chip-quiet"><input type="radio" name="cat" value="none">' + I('info') + '<span>No sé la categoría</span></label></div>' +
      '<select name="catMore" class="cat-more" aria-label="Más categorías"><option value="">Más categorías…</option>' + SB.cats.filter(function (c) { return !c.icon; }).map(function (c) { return '<option value="' + c.id + '">' + c.name + (c.pending ? ' — espera a tu contador' : '') + '</option>'; }).join('') + '</select>' +
      '<p class="hint">Las que dicen «espera a tu contador» se guardan, pero todavía no cuentan.</p></fieldset>';
  };
  SB.ui.accounts = function (dir) {
    var a = dir === 'in' ? ['Caja de efectivo', 'Cuenta bancaria', 'Procesador de tarjetas'] : ['Caja de efectivo', 'Cuenta bancaria'];
    return '<fieldset class="field"><legend>' + (dir === 'in' ? '¿A dónde entró?' : '¿De dónde salió?') + '</legend><div class="seg">' + a.map(function (x, i) { return '<label class="seg-b"><input type="radio" name="account" value="' + x + '"' + (i === 0 ? ' checked' : '') + '><span>' + x + '</span></label>'; }).join('') + '</div></fieldset>';
  };
  SB.ui.amountField = function (label) {
    return '<div class="field amt-wrap"><label for="amount">' + label + '</label><div class="amt"><span class="amt-cur">US$</span><input id="amount" name="amount" inputmode="decimal" autocomplete="off" placeholder="0.00" aria-describedby="amt-err"></div><p class="form-err" id="amt-err" hidden></p></div>';
  };
  SB.ui.dateField = function () { return '<div class="field"><label for="date">Fecha</label><input id="date" name="date" type="date" value="' + SB.today + '"></div>'; };
  SB.ui.titleField = function () { return '<div class="field"><label for="title">Qué fue</label><input id="title" name="title" autocomplete="off" placeholder="Por ejemplo: tintes y champú"></div>'; };
  SB.ui.incomeExtras = function () {
    return '<details class="field more"><summary>' + I('plus') + 'Venta de productos, impuesto o propinas</summary><div class="more-in">' +
      '<div class="field"><label for="prod">Venta de productos (opcional)</label><input id="prod" name="prod" inputmode="decimal" placeholder="0.00"></div>' +
      '<div class="field"><label for="tax">Impuesto de ventas cobrado (opcional)</label><input id="tax" name="tax" inputmode="decimal" placeholder="0.00"><p class="hint">Si cobraste impuesto, se guarda esperando a tu contador.</p></div>' +
      '<div class="field"><label for="tip">Propinas (opcional)</label><input id="tip" name="tip" inputmode="decimal" placeholder="0.00"></div>' +
      '<fieldset class="field"><legend>¿De quién es la propina?</legend><div class="chips wrap"><label class="chip"><input type="radio" name="who" value="" checked><span>Todavía no sé</span></label>' + SB.renters.map(function (r) { return '<label class="chip who" style="--who:' + r.colour + '"><input type="radio" name="who" value="' + r.id + '"><i></i><span>' + r.name + '</span></label>'; }).join('') + '</div></fieldset></div></details>';
  };
  SB.ui.formBody = function (dir) {
    return dir === 'in'
      ? SB.ui.amountField('Servicios cobrados') + SB.ui.accounts('in') + SB.ui.incomeExtras() + SB.ui.titleField() + SB.ui.dateField()
      : SB.ui.amountField('Monto') + SB.ui.accounts('out') + SB.ui.catChips() + SB.ui.titleField() + SB.ui.dateField();
  };
  SB.ui.submit = function (dir) { return '<div class="submit-bar"><button class="btn btn-main btn-save" type="submit"><span class="s-idle">' + (dir === 'in' ? 'Guardar entrada' : 'Guardar gasto') + '</span><span class="s-busy" aria-hidden="true"></span><span class="s-ok">' + I('check') + 'Guardado</span></button></div>'; };
  SB.routes.anotar = function (kind) {
    kind = kind || 'out'; var dir = kind === 'in' ? 'in' : 'out', scan = kind === 'scan';
    return '<div class="form-page ' + (scan ? 'has-receipt' : '') + '">' + SB.ui.back('inicio', 'Inicio') +
      '<header class="page-h"><h1>' + (dir === 'in' ? 'Entró dinero' : scan ? 'Revisa el recibo' : 'Pagué algo') + '</h1></header>' +
      (scan ? '<div class="receipt-pane"><button class="receipt-frame" data-zoom aria-label="Ver la foto del recibo en grande">' + SB.receiptSVG() + '<span class="scanline" aria-hidden="true"></span></button><p class="read-status" aria-live="polite"><span class="rs-reading">' + I('sparkle') + 'Leyendo el recibo…</span><span class="rs-read">' + I('check') + 'Leímos esto del recibo. Revísalo antes de guardar.</span></p></div>' : '') +
      '<form class="form" novalidate>' + SB.ui.formBody(dir) + SB.ui.submit(dir) + '</form></div>';
  };
  SB.routeAfter = SB.routeAfter || {};
  SB.routeAfter.anotar = function (scope, kind) { SB.bindForm(scope, kind === 'in' ? 'in' : 'out'); if (kind === 'scan') SB.simulateRead(scope); else { var a = scope.querySelector('#amount'); if (a && matchMedia('(hover:hover)').matches) a.focus({ preventScroll: true }); } };
})();
