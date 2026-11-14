/* Tweaks bar (after Chase AI's "tweak bar": sliders and toggles for fonts, colour, motion, shadows ... go deep).
   A page sets window.TWEAKS before loading this file:
   { id, roles:{'--var':['Label','#hex']}, palettes:{Name:{'--var':'#hex'}}, fonts:{display:{var,options:{Name:'css stack'}},text:{...}},
     sel:{headings,body,buttons,cards,images,heroMedia,hero,sections,reveal}, extra:[{section,controls:[...]}], words:[{sel,label,options:[html...]}] }
   Control: {id,label,type:'range'|'toggle'|'select'|'color',min,max,step,value,options,unit,apply(v,api)}
   URL: ?tweaks=1 opens the panel, ?tw=off hides it, #tw=<base64> applies settings. Parent frames talk via postMessage {tw:...}. */
(function () {
  'use strict';
  var C = window.TWEAKS || {}; var doc = document, root = doc.documentElement;
  var Q = new URLSearchParams(location.search);
  if (Q.get('tw') === 'off') { return; }
  var sel = Object.assign({ headings: 'h1,h2,h3', body: 'p,li,blockquote,dd,figcaption', buttons: '.btn', cards: '.card', images: 'main img', heroMedia: '.hero img', hero: '.hero', sections: 'main section', reveal: 'main section > *' }, C.sel || {});
  var FONTS = { 'Anton': "'Anton',Impact,sans-serif", 'Archivo': "'Archivo',sans-serif", 'Bodoni Moda': "'Bodoni Moda',serif", 'Bricolage Grotesque': "'Bricolage Grotesque',sans-serif", 'DM Serif Display': "'DM Serif Display',serif", 'Fraunces': "'Fraunces',serif", 'Inter': "'Inter',sans-serif", 'Instrument Serif': "'Instrument Serif',serif", 'JetBrains Mono': "'JetBrains Mono',monospace", 'Manrope': "'Manrope',sans-serif", 'Oswald': "'Oswald',sans-serif", 'Playfair Display': "'Playfair Display',serif", 'Syne': "'Syne',sans-serif", 'Space Grotesk': "'Space Grotesk',sans-serif", 'Unbounded': "'Unbounded',sans-serif", 'Work Sans': "'Work Sans',sans-serif" };
  var GF = { 'Anton': 'Anton', 'Archivo': 'Archivo:wght@400..900', 'Bodoni Moda': 'Bodoni+Moda:opsz,wght@6..96,400..900', 'Bricolage Grotesque': 'Bricolage+Grotesque:opsz,wght@12..96,400..800', 'DM Serif Display': 'DM+Serif+Display', 'Fraunces': 'Fraunces:opsz,wght@9..144,300..900', 'Inter': 'Inter:wght@400..800', 'Instrument Serif': 'Instrument+Serif', 'JetBrains Mono': 'JetBrains+Mono:wght@400..700', 'Manrope': 'Manrope:wght@400..800', 'Oswald': 'Oswald:wght@400..700', 'Playfair Display': 'Playfair+Display:wght@400..900', 'Syne': 'Syne:wght@400..800', 'Space Grotesk': 'Space+Grotesk:wght@400..700', 'Unbounded': 'Unbounded:wght@400..900', 'Work Sans': 'Work+Sans:wght@400..800' };
  function fontOpts(def) { var o = { '(page default)': '' }; Object.keys(FONTS).forEach(function (k) { o[k] = k; }); return o; }
  var EASE = { 'Out (smooth)': 'cubic-bezier(.16,1,.3,1)', 'Spring (overshoot)': 'cubic-bezier(.34,1.56,.64,1)', 'Ease': 'ease', 'In-out': 'cubic-bezier(.65,0,.35,1)', 'Linear': 'linear', 'Snap': 'cubic-bezier(.9,0,.1,1)' };
  var TEX = { none: '', grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", paper: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.04' numOctaves='5'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .4 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")", grid: 'linear-gradient(rgba(127,127,127,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(127,127,127,.35) 1px,transparent 1px)', dots: 'radial-gradient(rgba(127,127,127,.55) 1px,transparent 1.5px)', lines: 'repeating-linear-gradient(0deg,rgba(127,127,127,.3) 0 1px,transparent 1px 6px)' };
  var TEXSIZE = { grain: '160px 160px', paper: '300px 300px', grid: '48px 48px', dots: '18px 18px', lines: 'auto' };

  // ---------- control schema ----------
  var roles = C.roles || {};
  var pal = Object.assign({ 'Original': {} }, C.palettes || {});
  var S = [];
  function sec(name, controls) { S.push({ name: name, controls: controls }); }
  var colour = [{ id: 'palette', label: 'Palette', type: 'select', options: Object.keys(pal), value: 'Original' }];
  Object.keys(roles).forEach(function (v) { colour.push({ id: 'role' + v, label: roles[v][0], type: 'color', value: roles[v][1], role: v }); });
  colour.push({ id: 'texture', label: 'Background texture', type: 'select', options: Object.keys(TEX), value: 'none' }, { id: 'texOpacity', label: 'Texture strength', type: 'range', min: 0, max: .5, step: .01, value: .12 }, { id: 'texBlend', label: 'Texture blend', type: 'select', options: ['overlay', 'multiply', 'screen', 'soft-light', 'normal'], value: 'overlay' }, { id: 'pageTint', label: 'Whole-page hue shift', type: 'range', min: -180, max: 180, step: 1, value: 0, unit: '°' }, { id: 'pageSat', label: 'Whole-page saturation', type: 'range', min: 0, max: 1.6, step: .05, value: 1 }, { id: 'invert', label: 'Night mode (invert lightness)', type: 'toggle', value: false });
  sec('Colour', colour);
  var F = C.fonts || {};
  sec('Type', [
    { id: 'fontD', label: 'Display font', type: 'select', options: Object.keys(fontOpts()), value: '(page default)' },
    { id: 'fontT', label: 'Text font', type: 'select', options: Object.keys(fontOpts()), value: '(page default)' },
    { id: 'dWeight', label: 'Display weight', type: 'range', min: 0, max: 900, step: 50, value: 0, hint: '0 = page default' },
    { id: 'dScale', label: 'Display size', type: 'range', min: .6, max: 1.5, step: .02, value: 1, unit: '×' },
    { id: 'dTrack', label: 'Display letter spacing', type: 'range', min: -.08, max: .12, step: .005, value: 0, unit: 'em', neutral: 0 },
    { id: 'dLead', label: 'Display line height', type: 'range', min: 0, max: 1.4, step: .02, value: 0, hint: '0 = page default' },
    { id: 'dCase', label: 'Display case', type: 'select', options: ['as designed', 'UPPERCASE', 'lowercase', 'Capitalize'], value: 'as designed' },
    { id: 'dItalic', label: 'Display italic', type: 'toggle', value: false },
    { id: 'bScale', label: 'Body text size', type: 'range', min: .8, max: 1.3, step: .02, value: 1, unit: '×' },
    { id: 'bLead', label: 'Body line height', type: 'range', min: 0, max: 2, step: .05, value: 0, hint: '0 = page default' },
    { id: 'balance', label: 'Balanced headline wrapping', type: 'toggle', value: false },
    { id: 'underline', label: 'Underline all links', type: 'toggle', value: false }
  ]);
  sec('Shape and depth', [
    { id: 'rBtn', label: 'Button corner radius', type: 'range', min: -1, max: 40, step: 1, value: -1, hint: '-1 = page default' },
    { id: 'rCard', label: 'Card corner radius', type: 'range', min: -1, max: 40, step: 1, value: -1 },
    { id: 'rImg', label: 'Image corner radius', type: 'range', min: -1, max: 40, step: 1, value: -1 },
    { id: 'btnStyle', label: 'Button style', type: 'select', options: ['as designed', 'solid', 'outline', 'underline', 'pill'], value: 'as designed' },
    { id: 'btnSize', label: 'Button size', type: 'range', min: .8, max: 1.35, step: .02, value: 1, unit: '×' },
    { id: 'shadow', label: 'Shadow strength', type: 'range', min: 0, max: 1, step: .02, value: 0 },
    { id: 'shadowBlur', label: 'Shadow softness', type: 'range', min: 0, max: 120, step: 2, value: 40, unit: 'px' },
    { id: 'shadowY', label: 'Shadow drop', type: 'range', min: 0, max: 60, step: 1, value: 18, unit: 'px' },
    { id: 'shadowTint', label: 'Shadow colour', type: 'color', value: '#000000' },
    { id: 'border', label: 'Card border width', type: 'range', min: -1, max: 4, step: .5, value: -1, unit: 'px' },
    { id: 'glass', label: 'Frosted cards', type: 'toggle', value: false }
  ]);
  sec('Layout', [
    { id: 'space', label: 'Section spacing', type: 'range', min: .4, max: 1.8, step: .05, value: 1, unit: '×' },
    { id: 'heroH', label: 'Hero height', type: 'select', options: ['as designed', '70vh', '85vh', '100vh'], value: 'as designed' },
    { id: 'align', label: 'Text alignment', type: 'select', options: ['as designed', 'left', 'center'], value: 'as designed' },
    { id: 'width', label: 'Content width', type: 'range', min: 0, max: 1600, step: 20, value: 0, unit: 'px', hint: '0 = page default' },
    { id: 'gutter', label: 'Side gutter', type: 'range', min: -1, max: 96, step: 2, value: -1, unit: 'px' }
  ]);
  sec('Images', [
    { id: 'iBright', label: 'Brightness', type: 'range', min: .4, max: 1.6, step: .02, value: 1 },
    { id: 'iContrast', label: 'Contrast', type: 'range', min: .5, max: 1.6, step: .02, value: 1 },
    { id: 'iSat', label: 'Saturation', type: 'range', min: 0, max: 2, step: .05, value: 1 },
    { id: 'iWarm', label: 'Warmth', type: 'range', min: 0, max: .6, step: .02, value: 0 },
    { id: 'iHue', label: 'Hue', type: 'range', min: -60, max: 60, step: 1, value: 0, unit: '°' },
    { id: 'iGray', label: 'Black and white', type: 'range', min: 0, max: 1, step: .05, value: 0 },
    { id: 'iBlur', label: 'Blur', type: 'range', min: 0, max: 8, step: .5, value: 0, unit: 'px' },
    { id: 'hZoom', label: 'Hero image zoom', type: 'range', min: .8, max: 1.5, step: .01, value: 1, unit: '×' },
    { id: 'hX', label: 'Hero image focus X', type: 'range', min: 0, max: 100, step: 1, value: 50, unit: '%' },
    { id: 'hY', label: 'Hero image focus Y', type: 'range', min: 0, max: 100, step: 1, value: 50, unit: '%' },
    { id: 'hTilt', label: 'Hero 3D tilt', type: 'range', min: -20, max: 20, step: 1, value: 0, unit: '°' },
    { id: 'hParallax', label: 'Hero parallax on scroll', type: 'range', min: 0, max: .6, step: .02, value: 0 },
    { id: 'hoverZoom', label: 'Image zoom on hover', type: 'range', min: 1, max: 1.15, step: .01, value: 1, unit: '×' }
  ]);
  sec('Motion', [
    { id: 'enter', label: 'How things come in', type: 'select', options: ['none', 'fade', 'rise', 'scale', 'blur', 'slide from left', 'slide from right', 'clip reveal'], value: 'none' },
    { id: 'dur', label: 'Duration', type: 'range', min: 100, max: 1800, step: 20, value: 700, unit: 'ms' },
    { id: 'ease', label: 'Easing', type: 'select', options: Object.keys(EASE), value: 'Out (smooth)' },
    { id: 'stagger', label: 'Stagger', type: 'range', min: 0, max: 300, step: 10, value: 80, unit: 'ms' },
    { id: 'dist', label: 'Travel distance', type: 'range', min: 0, max: 120, step: 2, value: 32, unit: 'px' },
    { id: 'replay', label: 'Replay when scrolled back', type: 'toggle', value: false },
    { id: 'heroIntro', label: 'Hero intro on load', type: 'select', options: ['none', 'fade up', 'zoom out', 'wipe'], value: 'none' },
    { id: 'liftBtn', label: 'Button lift on hover', type: 'range', min: 0, max: 8, step: 1, value: 0, unit: 'px' },
    { id: 'liftCard', label: 'Card lift on hover', type: 'range', min: 0, max: 12, step: 1, value: 0, unit: 'px' },
    { id: 'glow', label: 'Cursor glow', type: 'toggle', value: false },
    { id: 'glowSize', label: 'Cursor glow size', type: 'range', min: 100, max: 700, step: 10, value: 320, unit: 'px' },
    { id: 'progress', label: 'Scroll progress bar', type: 'toggle', value: false },
    { id: 'pageMotion', label: "Page's own animations", type: 'toggle', value: true }
  ]);
  (C.extra || []).forEach(function (x) { sec(x.section, x.controls); });
  if (C.words && C.words.length) sec('Words', C.words.map(function (w, i) { return { id: 'w' + i, label: w.label, type: 'select', options: w.options.map(function (o, j) { return j === 0 ? 'Original' : ('Option ' + (j + 1) + ': ' + o.replace(/<[^>]+>/g, '').slice(0, 34)); }), value: 'Original', word: w }; }));

  var ALL = {}; S.forEach(function (s) { s.controls.forEach(function (c) { ALL[c.id] = c; c.def = c.value; }); });
  var V = {}; Object.keys(ALL).forEach(function (k) { V[k] = ALL[k].def; });

  // ---------- apply ----------
  var style = doc.createElement('style'); style.id = 'tw-style'; doc.head.appendChild(style);
  var tex = doc.createElement('div'); tex.setAttribute('aria-hidden', 'true'); tex.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;display:none';
  var glow = doc.createElement('div'); glow.setAttribute('aria-hidden', 'true'); glow.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:2147482999;border-radius:50%;transform:translate(-50%,-50%);display:none;mix-blend-mode:screen';
  var bar = doc.createElement('div'); bar.setAttribute('aria-hidden', 'true'); bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:0;z-index:2147483001;display:none';
  doc.addEventListener('DOMContentLoaded', function () { doc.body.appendChild(tex); doc.body.appendChild(glow); doc.body.appendChild(bar); });
  addEventListener('pointermove', function (e) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
  addEventListener('scroll', function () { var h = root.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; var hm = doc.querySelectorAll(sel.heroMedia); if (V.hParallax) hm.forEach(function (m) { m.style.translate = '0 ' + (scrollY * V.hParallax) + 'px'; }); }, { passive: true });

  var base = new Map();
  function measure(list, prop) { list.forEach(function (el) { el.style[prop] = ''; }); list.forEach(function (el) { base.set(el.__twk = (el.__twk || Math.random()) + prop, parseFloat(getComputedStyle(el)[prop])); }); }
  function scale(selector, props, k) {
    var els = Array.prototype.slice.call(doc.querySelectorAll(selector));
    props.forEach(function (p) { els.forEach(function (el) { el.style[p] = ''; }); });
    if (k === 1) return;
    props.forEach(function (p) { var b = els.map(function (el) { return parseFloat(getComputedStyle(el)[p]) || 0; }); els.forEach(function (el, i) { if (b[i]) el.style[p] = (b[i] * k) + 'px'; }); });
  }
  var loaded = {};
  function loadFont(name) { if (!name || loaded[name] || !GF[name]) return; loaded[name] = 1; var l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + GF[name] + '&display=swap'; doc.head.appendChild(l); }
  var hex2rgba = function (h, a) { h = h.replace('#', ''); return 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',' + a + ')'; };
  var words0 = {};
  var io = null;
  function apply() {
    var css = '';
    // palette + roles
    Object.keys(roles).forEach(function (v) { if (V['role' + v] !== ALL['role' + v].def) root.style.setProperty(v, V['role' + v]); else root.style.removeProperty(v); }); /* untouched roles stay with the page so its dark theme still works */
    var ph = V.pageTint, ps = V.pageSat; var hf = [];
    if (ph) hf.push('hue-rotate(' + ph + 'deg)'); if (ps !== 1) hf.push('saturate(' + ps + ')'); if (V.invert) hf.push('invert(1) hue-rotate(180deg)');
    if (hf.length) css += 'body{filter:' + hf.join(' ') + '}' + (V.invert ? 'img,video,canvas,svg image{filter:invert(1) hue-rotate(180deg)}' : '');
    if (V.texture !== 'none') { tex.style.display = 'block'; tex.style.backgroundImage = TEX[V.texture]; tex.style.backgroundSize = TEXSIZE[V.texture]; tex.style.opacity = V.texOpacity; tex.style.mixBlendMode = V.texBlend; } else tex.style.display = 'none';
    // type
    if (V.fontD !== '(page default)') { loadFont(V.fontD); if (F.display) root.style.setProperty(F.display, FONTS[V.fontD]); css += sel.headings + '{font-family:' + FONTS[V.fontD] + '!important}'; } else if (F.display) root.style.removeProperty(F.display);
    if (V.fontT !== '(page default)') { loadFont(V.fontT); if (F.text) root.style.setProperty(F.text, FONTS[V.fontT]); css += 'body{font-family:' + FONTS[V.fontT] + '!important}'; } else if (F.text) root.style.removeProperty(F.text);
    if (V.dWeight) css += sel.headings + '{font-weight:' + V.dWeight + '!important;font-variation-settings:normal!important}';
    if (V.dTrack) css += sel.headings + '{letter-spacing:' + V.dTrack + 'em!important}';
    if (V.dLead) css += sel.headings + '{line-height:' + V.dLead + '!important}';
    if (V.dCase !== 'as designed') css += sel.headings + '{text-transform:' + { UPPERCASE: 'uppercase', lowercase: 'lowercase', Capitalize: 'capitalize' }[V.dCase] + '!important}';
    if (V.dItalic) css += sel.headings + '{font-style:italic!important}';
    if (V.bLead) css += sel.body + '{line-height:' + V.bLead + '!important}';
    if (V.balance) css += sel.headings + '{text-wrap:balance}';
    if (V.underline) css += 'main a{text-decoration:underline!important;text-underline-offset:3px}';
    // shape
    if (V.rBtn >= 0) css += sel.buttons + '{border-radius:' + V.rBtn + 'px!important}';
    if (V.rCard >= 0) css += sel.cards + '{border-radius:' + V.rCard + 'px!important;overflow:hidden}';
    if (V.rImg >= 0) css += sel.images + '{border-radius:' + V.rImg + 'px!important}';
    var acc = V['role' + (C.accentRole || Object.keys(roles)[1] || '')] || '#d32b2c';
    if (V.btnStyle === 'solid') css += sel.buttons + '{background:' + acc + '!important;color:#fff!important;box-shadow:none!important;border:0!important}';
    if (V.btnStyle === 'outline') css += sel.buttons + '{background:transparent!important;box-shadow:inset 0 0 0 2px currentColor!important;border:0!important}';
    if (V.btnStyle === 'underline') css += sel.buttons + '{background:transparent!important;box-shadow:none!important;border:0!important;border-bottom:2px solid currentColor!important;border-radius:0!important;padding-left:0!important;padding-right:0!important}';
    if (V.btnStyle === 'pill') css += sel.buttons + '{border-radius:999px!important}';
    if (V.shadow > 0) { var sh = '0 ' + V.shadowY + 'px ' + V.shadowBlur + 'px ' + hex2rgba(V.shadowTint, V.shadow); css += sel.cards + ',' + sel.images + '{box-shadow:' + sh + '!important}' + sel.buttons + '{box-shadow:0 ' + Math.round(V.shadowY / 2) + 'px ' + Math.round(V.shadowBlur / 2) + 'px ' + hex2rgba(V.shadowTint, V.shadow * .8) + '!important}'; }
    if (V.border >= 0) css += sel.cards + '{border-width:' + V.border + 'px!important;border-style:solid!important}';
    if (V.glass) css += sel.cards + '{backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);background-color:rgba(255,255,255,.08)!important}';
    // layout
    if (V.heroH !== 'as designed') css += sel.hero + '{min-height:' + V.heroH + '!important}';
    if (V.align !== 'as designed') css += 'main section{text-align:' + V.align + '}' + (V.align === 'center' ? 'main section .ctas,main section .cta,main section .row{justify-content:center}' : '');
    if (V.width) css += 'main section>*{max-width:' + V.width + 'px;margin-left:auto;margin-right:auto}';
    if (V.gutter >= 0) css += sel.sections + ',' + sel.hero + '{padding-left:' + V.gutter + 'px!important;padding-right:' + V.gutter + 'px!important}';
    // images
    var f = [];
    if (V.iBright !== 1) f.push('brightness(' + V.iBright + ')'); if (V.iContrast !== 1) f.push('contrast(' + V.iContrast + ')'); if (V.iSat !== 1) f.push('saturate(' + V.iSat + ')'); if (V.iWarm) f.push('sepia(' + V.iWarm + ')'); if (V.iHue) f.push('hue-rotate(' + V.iHue + 'deg)'); if (V.iGray) f.push('grayscale(' + V.iGray + ')'); if (V.iBlur) f.push('blur(' + V.iBlur + 'px)');
    if (f.length) css += sel.images + '{filter:' + f.join(' ') + '!important}';
    var ht = [];
    if (V.hZoom !== 1) ht.push('scale(' + V.hZoom + ')'); if (V.hTilt) ht.push('perspective(1200px) rotateY(' + V.hTilt + 'deg)');
    if (ht.length) css += sel.heroMedia + '{transform:' + ht.join(' ') + '!important;transform-origin:center}';
    if (V.hX !== 50 || V.hY !== 50) css += sel.heroMedia + '{object-position:' + V.hX + '% ' + V.hY + '%!important}';
    if (!V.hParallax) doc.querySelectorAll(sel.heroMedia).forEach(function (m) { m.style.translate = ''; });
    if (V.hoverZoom > 1) css += sel.images + '{transition:transform .5s cubic-bezier(.16,1,.3,1)}' + sel.images + ':hover{transform:scale(' + V.hoverZoom + ')}';
    // motion
    var e = EASE[V.ease];
    if (V.liftBtn) css += sel.buttons + '{transition:transform .2s ' + e + '}' + sel.buttons + ':hover{transform:translateY(-' + V.liftBtn + 'px)}';
    if (V.liftCard) css += sel.cards + '{transition:transform .3s ' + e + '}' + sel.cards + ':hover{transform:translateY(-' + V.liftCard + 'px)}';
    if (!V.pageMotion) css += '*,*::before,*::after{animation-play-state:paused!important}';
    glow.style.display = V.glow ? 'block' : 'none'; glow.style.width = glow.style.height = V.glowSize + 'px'; glow.style.background = 'radial-gradient(circle,' + hex2rgba(acc, .35) + ',transparent 65%)';
    bar.style.display = V.progress ? 'block' : 'none'; bar.style.background = acc;
    var EN = { fade: 'opacity:0', rise: 'opacity:0;transform:translateY(' + V.dist + 'px)', scale: 'opacity:0;transform:scale(.92)', blur: 'opacity:0;filter:blur(12px)', 'slide from left': 'opacity:0;transform:translateX(-' + V.dist + 'px)', 'slide from right': 'opacity:0;transform:translateX(' + V.dist + 'px)', 'clip reveal': 'clip-path:inset(0 0 100% 0)' };
    if (V.enter !== 'none') {
      css += '[data-twr]{' + EN[V.enter] + ';transition:opacity ' + V.dur + 'ms ' + e + ',transform ' + V.dur + 'ms ' + e + ',filter ' + V.dur + 'ms ' + e + ',clip-path ' + V.dur + 'ms ' + e + ';transition-delay:calc(var(--twi,0) * ' + V.stagger + 'ms)}[data-twr].twin{opacity:1;transform:none;filter:none;clip-path:inset(0 0 0 0)}';
      reveal(true);
    } else reveal(false);
    var HI = { 'fade up': '@keyframes twh{from{opacity:0;transform:translateY(30px)}}', 'zoom out': '@keyframes twh{from{opacity:0;transform:scale(1.12)}}', 'wipe': '@keyframes twh{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}' };
    if (V.heroIntro !== 'none') css += HI[V.heroIntro] + sel.hero + ' > *{animation:twh ' + Math.max(V.dur, 600) + 'ms ' + e + ' both}';
    // extras
    S.forEach(function (s) { s.controls.forEach(function (c) { if (c.apply) { var r = c.apply(V[c.id], api, V); if (typeof r === 'string') css += r; } }); });
    // words
    S.forEach(function (s) { s.controls.forEach(function (c) { if (!c.word) return; var el = doc.querySelector(c.word.sel); if (!el) return; if (!(c.id in words0)) words0[c.id] = el.innerHTML; var i = c.options.indexOf(V[c.id]); el.innerHTML = i <= 0 ? words0[c.id] : c.word.options[i]; }); });
    style.textContent = css;
    scale(sel.headings, ['fontSize'], V.dScale); scale(sel.body, ['fontSize'], V.bScale); scale(sel.sections, ['paddingTop', 'paddingBottom'], V.space); scale(sel.buttons, ['fontSize', 'minHeight', 'paddingLeft', 'paddingRight'], V.btnSize);
    updateUI(); broadcast();
  }
  function reveal(on) {
    var els = doc.querySelectorAll(sel.reveal);
    if (!on) { if (io) io.disconnect(); els.forEach(function (el) { el.removeAttribute('data-twr'); el.classList.remove('twin'); }); return; }
    if (!io) io = new IntersectionObserver(function (ent) { ent.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('twin'); else if (V.replay) x.target.classList.remove('twin'); }); }, { threshold: .12 });
    var idx = new Map();
    els.forEach(function (el) { var p = el.parentElement; var i = idx.get(p) || 0; idx.set(p, i + 1); el.style.setProperty('--twi', i); if (!el.hasAttribute('data-twr')) { el.setAttribute('data-twr', ''); el.classList.remove('twin'); io.observe(el); } });
  }
  addEventListener('resize', function () { clearTimeout(window.__twr); window.__twr = setTimeout(apply, 200); });
  var api = { root: root, doc: doc, q: function (s) { return doc.querySelectorAll(s); } };

  // ---------- state I/O ----------
  function diff() { var o = {}; Object.keys(V).forEach(function (k) { if (V[k] !== ALL[k].def) o[k] = V[k]; }); return o; }
  function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
  function dec(s) { try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (e) { return null; } }
  function load(o) { Object.keys(ALL).forEach(function (k) { V[k] = ALL[k].def; }); if (o) Object.keys(o).forEach(function (k) { if (k in V) V[k] = o[k]; }); if (o && o.palette) setPalette(o.palette, o); apply(); }
  function setPalette(name, keep) { var p = pal[name] || {}; Object.keys(roles).forEach(function (v) { var id = 'role' + v; if (keep && keep[id] !== undefined) return; V[id] = p[v] || roles[v][1]; }); }
  function broadcast() { var d = diff(); try { history.replaceState(null, '', location.pathname + location.search + (Object.keys(d).length ? '#tw=' + enc(d) : '')); } catch (e) { } if (parent !== window) parent.postMessage({ tw: 'changed', id: C.id, settings: d }, '*'); }
  addEventListener('message', function (m) { var d = m.data || {}; if (!d.tw) return; if (d.tw === 'open') open(true); if (d.tw === 'close') open(false); if (d.tw === 'set') load(d.settings); if (d.tw === 'surprise') surprise(); });

  function rnd(c) { if (c.type === 'toggle') return Math.random() < .35; if (c.type === 'select') return c.options[Math.floor(Math.random() * c.options.length)]; if (c.type === 'range') { var n = Math.round((c.min + Math.random() * (c.max - c.min)) / c.step) * c.step; return +n.toFixed(4); } return c.value; }
  function surprise() {
    load({});
    var pk = Object.keys(pal); V.palette = pk[Math.floor(Math.random() * pk.length)]; setPalette(V.palette);
    var picks = ['fontD', 'fontT', 'dTrack', 'dCase', 'rBtn', 'rCard', 'btnStyle', 'shadow', 'texture', 'iWarm', 'iSat', 'enter', 'ease', 'hZoom', 'heroIntro', 'liftBtn', 'liftCard', 'space'];
    picks.forEach(function (k) { if (Math.random() < .55) { var c = ALL[k]; V[k] = rnd(c); } });
    if (V.dTrack) V.dTrack = +(Math.max(-.04, Math.min(.06, V.dTrack))).toFixed(3);
    V.iSat = Math.max(.7, Math.min(1.3, V.iSat)); V.texOpacity = .08 + Math.random() * .12; V.shadow = Math.min(V.shadow, .45);
    S.forEach(function (s) { s.controls.forEach(function (c) { if (c.surprise && Math.random() < .6) V[c.id] = rnd(c); }); });
    apply();
  }

  // ---------- panel ----------
  var css0 = '#twp{position:fixed;top:0;right:0;bottom:0;width:340px;max-width:92vw;z-index:2147483600;background:#121316;color:#e9e7e2;font:13px/1.35 system-ui,sans-serif;display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.4);transform:translateX(105%);visibility:hidden;transition:transform .3s cubic-bezier(.16,1,.3,1),visibility 0s .3s}#twp.on{transform:none;visibility:visible;transition:transform .3s cubic-bezier(.16,1,.3,1)}#twp .c input[type=range]{min-height:28px}#twp *{box-sizing:border-box}#twp header{padding:12px 12px 8px;border-bottom:1px solid #26282d}#twp h2{font:600 15px system-ui;margin:0;display:flex;justify-content:space-between;align-items:center}#twp h2 small{color:#8d8b86;font-weight:400}#twp .tb{display:flex;gap:6px;margin-top:8px}#twp button{font:inherit;color:#e9e7e2;background:#1d1f23;border:1px solid #33363c;border-radius:7px;padding:7px 10px;cursor:pointer;min-height:32px}#twp button:hover{border-color:#6a6d74}#twp button.hot{background:#e9e7e2;color:#111}#twp input[type=search]{width:100%;margin-top:8px;background:#1b1d21;border:1px solid #33363c;border-radius:7px;color:#e9e7e2;padding:7px 9px;font:inherit}#twp .body{overflow:auto;flex:1;padding:4px 0}#twp details{border-bottom:1px solid #202227}#twp summary{list-style:none;cursor:pointer;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;font-weight:600}#twp summary::-webkit-details-marker{display:none}#twp summary span{font-weight:400;color:#8d8b86;font-size:12px}#twp summary span b{color:#ffc479;font-weight:600}#twp summary em{font-style:normal;color:#8d8b86;font-size:11px;margin-left:8px;text-decoration:underline;cursor:pointer}#twp .c{display:grid;grid-template-columns:1fr 120px;gap:6px 10px;align-items:center;padding:5px 12px}#twp .c label{color:#c9c7c1;font-size:12px}#twp .c.ch label{color:#ffc479}#twp .c input[type=range]{width:100%;accent-color:#ffc479}#twp .c select{width:100%;background:#1b1d21;color:#e9e7e2;border:1px solid #33363c;border-radius:6px;padding:4px}#twp .c input[type=color]{width:100%;height:24px;border:1px solid #33363c;border-radius:5px;background:none;padding:0}#twp .c .v{grid-column:2;font:11px ui-monospace,monospace;color:#8d8b86;text-align:right;margin-top:-4px}#twp .sw{width:38px;height:22px;border-radius:12px;background:#33363c;position:relative;justify-self:end;cursor:pointer;border:0}#twp .sw.on{background:#ffc479}#twp .sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s}#twp .sw.on::after{left:19px}#twp footer{border-top:1px solid #26282d;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}#twp footer button{font-size:12px;padding:7px 6px}#twp footer .full{grid-column:1/-1}#twt{position:fixed;right:16px;bottom:16px;z-index:2147483500;font-weight:600;font-size:14px;font-family:inherit;background:#121316;color:#fff;border:1px solid #3a3d44;border-radius:999px;min-height:44px;padding:0 18px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.35)}#twt.hid{display:none}#twtoast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#121316;color:#fff;padding:10px 16px;border-radius:10px;font:13px system-ui;z-index:2147483647;opacity:0;transition:opacity .2s;pointer-events:none}';
  var panel, ctrlEls = {};
  function toast(t) { var x = doc.getElementById('twtoast'); x.textContent = t; x.style.opacity = 1; setTimeout(function () { x.style.opacity = 0; }, 1600); }
  function fmt(c, v) { if (c.type === 'range') return (Math.round(v * 1000) / 1000) + (c.unit || ''); return ''; }
  function build() {
    var st = doc.createElement('style'); st.textContent = css0; doc.head.appendChild(st);
    var t = doc.createElement('button'); t.id = 'twt'; t.type = 'button'; t.textContent = 'Tweaks'; t.setAttribute('aria-controls', 'twp'); doc.body.appendChild(t);
    var to = doc.createElement('div'); to.id = 'twtoast'; doc.body.appendChild(to);
    panel = doc.createElement('aside'); panel.id = 'twp'; panel.setAttribute('aria-label', 'Tweaks');
    var n = 0; S.forEach(function (s) { n += s.controls.length; });
    panel.innerHTML = '<header><h2>Tweaks <small>' + n + ' controls</small></h2><div class="tb"><button type="button" data-a="surprise">Surprise me</button><button type="button" data-a="reset">Reset</button><button type="button" data-a="close" aria-label="Close tweaks">✕</button></div><input type="search" placeholder="Find a control" aria-label="Find a control"></header><div class="body"></div><footer><button type="button" data-a="snap" class="full">Save snapshot</button><button type="button" data-a="copy">Copy settings</button><button type="button" data-a="paste">Paste settings</button><button type="button" data-a="css">Copy CSS</button><button type="button" data-a="link" class="full">Copy link to this version</button></footer>';
    var body = panel.querySelector('.body');
    S.forEach(function (s, si) {
      var d = doc.createElement('details'); if (si < 2) d.open = true;
      d.innerHTML = '<summary>' + s.name + '<span><b data-cnt="' + si + '"></b><em data-rs="' + si + '">reset</em></span></summary>';
      s.controls.forEach(function (c) {
        var row = doc.createElement('div'); row.className = 'c'; row.dataset.label = (s.name + ' ' + c.label).toLowerCase();
        var id = 'twc-' + c.id.replace(/[^a-z0-9]/gi, '');
        var lab = '<label for="' + id + '">' + c.label + '</label>', inp = '';
        if (c.type === 'range') inp = '<input id="' + id + '" type="range" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '">';
        if (c.type === 'select') inp = '<select id="' + id + '">' + c.options.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
        if (c.type === 'color') inp = '<input id="' + id + '" type="color">';
        if (c.type === 'toggle') inp = '<button id="' + id + '" type="button" class="sw" role="switch" aria-checked="false"></button>';
        row.innerHTML = lab + inp + (c.type === 'range' ? '<span class="v"></span>' : '');
        var el = row.querySelector('#' + id); ctrlEls[c.id] = { el: el, row: row };
        if (c.type === 'toggle') el.addEventListener('click', function () { V[c.id] = !V[c.id]; apply(); });
        else el.addEventListener('input', function () { var v = c.type === 'range' ? +el.value : el.value; V[c.id] = v; if (c.id === 'palette') setPalette(v); apply(); });
        d.appendChild(row);
      });
      body.appendChild(d);
    });
    panel.addEventListener('click', function (e) {
      var rs = e.target.getAttribute('data-rs'); if (rs !== null) { e.preventDefault(); S[+rs].controls.forEach(function (c) { V[c.id] = c.def; }); if (S[+rs].name === 'Colour') setPalette('Original'); apply(); return; }
      var a = e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'surprise') surprise(); if (a === 'reset') load({}); if (a === 'close') open(false);
      if (a === 'copy') { navigator.clipboard.writeText(JSON.stringify(diff(), null, 1)); toast('Settings copied'); }
      if (a === 'paste') { var s = prompt('Paste settings JSON'); if (s) { try { load(JSON.parse(s)); toast('Settings applied'); } catch (x) { toast('That was not settings JSON'); } } }
      if (a === 'css') { navigator.clipboard.writeText(':root{' + Object.keys(roles).map(function (v) { return v + ':' + V['role' + v]; }).join(';') + '}\n' + style.textContent); toast('CSS copied'); }
      if (a === 'link') { navigator.clipboard.writeText(location.href); toast('Link copied'); }
      if (a === 'snap') { var nm = prompt('Name this snapshot', 'Version ' + new Date().toLocaleTimeString()); if (!nm) return; var all = JSON.parse(localStorage.getItem('tw-snaps-' + C.id) || '{}'); all[nm] = diff(); try { localStorage.setItem('tw-snaps-' + C.id, JSON.stringify(all)); } catch (x) { } if (parent !== window) parent.postMessage({ tw: 'snapshot', id: C.id, name: nm, settings: diff() }, '*'); toast('Saved "' + nm + '"'); }
    });
    panel.querySelector('input[type=search]').addEventListener('input', function (e) { var q = e.target.value.toLowerCase(); panel.querySelectorAll('.c').forEach(function (r) { r.style.display = !q || r.dataset.label.indexOf(q) >= 0 ? '' : 'none'; }); if (q) panel.querySelectorAll('details').forEach(function (d) { d.open = true; }); });
    panel.setAttribute('inert', ''); doc.body.appendChild(panel);
    t.addEventListener('click', function () { open(!panel.classList.contains('on')); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
  }
  function open(on) { if (!panel) return; panel.classList.toggle('on', on); if (on) panel.removeAttribute('inert'); else panel.setAttribute('inert', ''); var t = doc.getElementById('twt'); if (t) t.classList.toggle('hid', on); }
  function updateUI() {
    if (!panel) return;
    Object.keys(ctrlEls).forEach(function (k) { var c = ALL[k], o = ctrlEls[k], v = V[k]; if (c.type === 'toggle') { o.el.classList.toggle('on', !!v); o.el.setAttribute('aria-checked', !!v); } else if (doc.activeElement !== o.el) o.el.value = v; var vs = o.row.querySelector('.v'); if (vs) vs.textContent = fmt(c, v); o.row.classList.toggle('ch', v !== c.def); });
    S.forEach(function (s, si) { var n = s.controls.filter(function (c) { return V[c.id] !== c.def; }).length; var b = panel.querySelector('[data-cnt="' + si + '"]'); if (b) b.textContent = n ? n + ' changed · ' : ''; });
  }
  function start() {
    build();
    var h = location.hash.match(/tw=([^&]+)/); var init = h ? dec(h[1]) : null;
    if (init) load(init); else apply();
    if (Q.get('tweaks') === '1') open(true);
    if (Q.get('tw') === 'hidebtn') doc.getElementById('twt').classList.add('hid');
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
  window.__tweaks = { set: load, surprise: surprise, state: function () { return diff(); }, open: open };
})();
