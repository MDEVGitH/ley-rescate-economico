/* =========================================================
   Leyes Transparentes · Calculadora Ley de Rescate Económico
   Fuente: Proyecto de Ley 477 de 2026 Cámara
   Cálculo mensual de retención en la fuente (procedimiento 1)
   ========================================================= */
(() => {
  'use strict';

  const DEFAULTS = { salario: 1750905, dependientes: 0, prepagada: 0, vivienda: 0, afc: 0, smlmv: 1750905, uvt: 52374 };

  /* ---------- Reglas ---------- */

  // Tabla art. 21 del proyecto (cotización salud del empleado, según SMLMV)
  const SALUD_LEY = [
    { hasta: 1,  tasa: 0.04,  etiqueta: '1',     texto: 'hasta 1 SMLMV' },
    { hasta: 2,  tasa: 0.04,  etiqueta: '1–2',   texto: 'más de 1 y hasta 2 SMLMV' },
    { hasta: 4,  tasa: 0.055, etiqueta: '2–4',   texto: 'más de 2 y hasta 4 SMLMV' },
    { hasta: 5,  tasa: 0.06,  etiqueta: '4–5',   texto: 'más de 4 y hasta 5 SMLMV' },
    { hasta: 10, tasa: 0.065, etiqueta: '5–10',  texto: 'más de 5 y hasta 10 SMLMV' },
    { hasta: 15, tasa: 0.07,  etiqueta: '10–15', texto: 'más de 10 y hasta 15 SMLMV' },
    { hasta: 20, tasa: 0.075, etiqueta: '15–20', texto: 'más de 15 y hasta 20 SMLMV' },
    { hasta: Infinity, tasa: 0.08, etiqueta: '20–25', texto: 'más de 20 SMLMV (tope de cotización 25)' },
  ];
  const SALUD_HOY = 0.04;

  const REGIMEN = {
    hoy: {
      tope25Anual: 790, topeGlobalAnual: 1340, uvtDependiente72: true,
      // Art. 383 ET vigente (UVT mensuales)
      tabla: [[95, 0, 0], [150, 0.19, 0], [360, 0.28, 10], [640, 0.33, 69], [945, 0.35, 162], [2300, 0.37, 268], [Infinity, 0.39, 770]],
      desde: [0, 95, 150, 360, 640, 945, 2300],
    },
    ley: {
      tope25Anual: 630, topeGlobalAnual: 1180, uvtDependiente72: false,
      // Art. 50 del proyecto (nuevo art. 383 ET)
      tabla: [[65, 0, 0], [95, 0.09, 0], [150, 0.19, 3], [360, 0.28, 13], [640, 0.33, 72], [Infinity, 0.39, 164]],
      desde: [0, 65, 95, 150, 360, 640],
    },
  };

  function bandaSalud(nSmlmv) {
    return SALUD_LEY.findIndex(b => nSmlmv <= b.hasta + 1e-9);
  }

  // Fondo de Solidaridad Pensional (Ley 100, art. 27)
  function tasaFSP(n) {
    if (n < 4) return 0;
    if (n < 16) return 0.01;
    if (n < 17) return 0.012;
    if (n < 18) return 0.014;
    if (n < 19) return 0.016;
    if (n < 20) return 0.018;
    return 0.02;
  }

  function impuestoTabla(reg, baseUvt) {
    const { tabla, desde } = REGIMEN[reg];
    for (let i = 0; i < tabla.length; i++) {
      const [hasta, tasa, fijo] = tabla[i];
      if (baseUvt <= hasta) return tasa === 0 ? 0 : (baseUvt - desde[i]) * tasa + fijo;
    }
    return 0;
  }

  function calcular(d, reg) {
    const R = REGIMEN[reg];
    const U = d.uvt;
    const s = d.salario;
    const n = s / d.smlmv;
    const ibc = Math.min(Math.max(s, d.smlmv), 25 * d.smlmv);
    const nIbc = ibc / d.smlmv;

    const pension = ibc * 0.04;
    const fsp = ibc * tasaFSP(nIbc);
    const tasaSalud = reg === 'hoy' ? SALUD_HOY : SALUD_LEY[bandaSalud(nIbc)].tasa;
    const salud = ibc * tasaSalud;
    const incr = pension + fsp + salud;
    const rentaLiquida = Math.max(0, s - incr);

    const deps = Math.min(Math.max(d.dependientes, 0), 4);
    const dedDependiente = deps > 0 ? Math.min(0.10 * s, 32 * U) : 0;
    const dedPrepagada = Math.min(d.prepagada, 16 * U);
    const dedVivienda = Math.min(d.vivienda, 100 * U);
    const exAfc = Math.min(d.afc, 0.30 * s, (3800 / 12) * U);

    const deducciones = dedDependiente + dedPrepagada + dedVivienda;
    const base25 = Math.max(0, rentaLiquida - deducciones - exAfc);
    const tope25 = (R.tope25Anual / 12) * U;
    const exenta25 = Math.min(0.25 * base25, tope25);

    const subtotal = deducciones + exAfc + exenta25;
    const topeGlobal = Math.min(0.40 * rentaLiquida, (R.topeGlobalAnual / 12) * U);
    const aceptado = Math.min(subtotal, topeGlobal);
    const perdido = subtotal - aceptado;

    const extra72 = R.uvtDependiente72 ? Math.min(deps * 6 * U, Math.max(0, rentaLiquida - aceptado)) : 0;

    const base = Math.max(0, rentaLiquida - aceptado - extra72);
    const baseUvt = base / U;
    const retencion = Math.round((impuestoTabla(reg, baseUvt) * U) / 1000) * 1000;

    const totalDescuentos = pension + fsp + salud + retencion;
    const neto = s - totalDescuentos;

    return {
      n, tasaSalud, pension: pension + fsp, fsp, salud, rentaLiquida,
      dedDependiente, dedPrepagada, dedVivienda, exAfc, exenta25, tope25,
      subtotal, topeGlobal, aceptado, perdido, extra72, base, baseUvt,
      retencion, totalDescuentos, neto,
    };
  }

  /* ---------- Formato ---------- */
  const fmtCOP = v => '$' + Math.round(v).toLocaleString('es-CO');
  const fmtCompact = v => {
    const a = Math.abs(v);
    if (a >= 1e6) return '$' + (v / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 2 }) + ' M';
    if (a >= 1e3) return '$' + Math.round(v / 1e3).toLocaleString('es-CO') + ' mil';
    return '$' + Math.round(v).toLocaleString('es-CO');
  };
  const fmtPct = v => (v * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + '%';
  const fmtNum = (v, d = 2) => v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
  const parseMoney = str => Number(String(str).replace(/\D/g, '')) || 0;

  /* ---------- DOM ---------- */
  const $ = id => document.getElementById(id);
  const moneyIds = ['salario', 'prepagada', 'vivienda', 'afc', 'smlmv', 'uvt'];
  const tooltip = $('tooltip');

  function leerDatos() {
    const d = {};
    moneyIds.forEach(id => { d[id] = parseMoney($(id).value); });
    d.dependientes = Math.min(4, Math.max(0, parseInt($('dependientes').value, 10) || 0));
    if (!d.smlmv) d.smlmv = DEFAULTS.smlmv;
    if (!d.uvt) d.uvt = DEFAULTS.uvt;
    return d;
  }

  function validar(d) {
    const err = $('salarioError');
    const box = $('salario').closest('.input-money');
    let msg = '';
    if (!d.salario) msg = 'Ingresa tu salario mensual.';
    else if (d.salario < d.smlmv) msg = 'El salario no puede ser menor al salario mínimo (' + fmtCOP(d.smlmv) + ').';
    err.textContent = msg;
    box.classList.toggle('is-invalid', !!msg);
    return !msg;
  }

  function actualizar() {
    const d = leerDatos();
    if (!validar(d)) return;
    const hoy = calcular(d, 'hoy');
    const ley = calcular(d, 'ley');

    // Equivalencia en SMLMV y banda de salud
    const idx = bandaSalud(Math.min(hoy.n, 25));
    $('smlmvCount').textContent = fmtNum(hoy.n);
    $('saludHoy').textContent = fmtPct(hoy.tasaSalud);
    $('saludLey').textContent = fmtPct(ley.tasaSalud);
    $('bandaTexto').textContent = 'Rango: ' + SALUD_LEY[idx].texto;

    // Tarjetas
    $('netoHoy').textContent = fmtCOP(hoy.neto);
    $('netoLey').textContent = fmtCOP(ley.neto);
    const diff = ley.neto - hoy.neto;
    const diffEl = $('netoDiff');
    diffEl.textContent = (diff > 0 ? '+' : diff < 0 ? '−' : '') + fmtCOP(Math.abs(diff));
    diffEl.classList.toggle('is-loss', diff < 0);
    diffEl.classList.toggle('is-gain', diff > 0);
    $('netoDiffAnual').textContent = 'al mes · al año: ' + (diff < 0 ? '−' : diff > 0 ? '+' : '') + fmtCOP(Math.abs(diff * 12));

    renderDescuentos(hoy, ley);
    renderSalud(Math.min(hoy.n, 25), idx);
    renderTabla(d, hoy, ley);
  }

  /* ---------- Tabla de detalle ---------- */
  function renderTabla(d, hoy, ley) {
    const filas = [
      ['Salario mensual', d.salario, d.salario, ''],
      ['Equivalencia en salarios mínimos', null, null, '', fmtNum(hoy.n) + ' SMLMV'],
      ['(−) Pensión obligatoria' + (hoy.fsp ? ' + Fondo de Solidaridad' : ''), -hoy.pension, -ley.pension, ''],
      ['(−) Salud (' + fmtPct(hoy.tasaSalud) + ' → ' + fmtPct(ley.tasaSalud) + ')', -hoy.salud, -ley.salud, ''],
      ['Renta líquida', hoy.rentaLiquida, ley.rentaLiquida, 'is-sub'],
      ['Deducción por dependiente (10%)', hoy.dedDependiente, ley.dedDependiente, 'is-sub'],
      ['Medicina prepagada', hoy.dedPrepagada, ley.dedPrepagada, 'is-sub'],
      ['Intereses de vivienda', hoy.dedVivienda, ley.dedVivienda, 'is-sub'],
      ['Aportes AFC / voluntarios', hoy.exAfc, ley.exAfc, 'is-sub'],
      ['Renta exenta 25%', hoy.exenta25, ley.exenta25, 'is-sub'],
      ['Tope global mensual (40% / UVT)', hoy.topeGlobal, ley.topeGlobal, 'is-sub'],
      ['Beneficios aceptados', hoy.aceptado, ley.aceptado, 'is-sub'],
      ['Beneficios perdidos por el tope', hoy.perdido, ley.perdido, 'is-sub'],
      ['72 UVT por dependiente (6 UVT/mes)', hoy.extra72, ley.extra72, 'is-sub'],
      ['Base de retención', hoy.base, ley.base, 'is-sub'],
      ['(−) Retención en la fuente', -hoy.retencion, -ley.retencion, ''],
      ['Te llega al mes', hoy.neto, ley.neto, 'is-total'],
    ];
    const tbody = $('detalleTabla').querySelector('tbody');
    tbody.innerHTML = filas.map(([label, a, b, cls, special]) => {
      if (special) return `<tr class="${cls}"><td>${label}</td><td colspan="3">${special}</td></tr>`;
      const dif = b - a;
      const difCls = Math.abs(dif) < 1 ? '' : (label.includes('perdidos') || label.startsWith('Base') || label === 'Renta líquida' ? '' : dif < 0 ? 'neg' : 'pos');
      const difTxt = Math.abs(dif) < 1 ? '—' : (dif > 0 ? '+' : '−') + fmtCOP(Math.abs(dif));
      const show = v => (v < 0 ? '−' : '') + fmtCOP(Math.abs(v));
      return `<tr class="${cls}"><td>${label}</td><td>${show(a)}</td><td>${show(b)}</td><td class="${difCls}">${difTxt}</td></tr>`;
    }).join('');
  }

  /* ---------- Gráficos SVG ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.appendChild(n);
    return n;
  }

  // Barra horizontal con extremo de datos redondeado (4px) y anclada a la base
  function hBarPath(x, y, w, h, r = 4) {
    if (w <= 0) return '';
    r = Math.min(r, w, h / 2);
    return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
  }
  // Barra vertical con extremo superior redondeado
  function vBarPath(x, y, w, h, r = 4) {
    if (h <= 0) return '';
    r = Math.min(r, h, w / 2);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const m = v / p;
    const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return step * p;
  }

  function showTooltip(evt, html) {
    tooltip.innerHTML = html;
    tooltip.hidden = false;
    const pad = 14;
    const { innerWidth: W, innerHeight: H } = window;
    const r = tooltip.getBoundingClientRect();
    let x = evt.clientX + pad, y = evt.clientY + pad;
    if (x + r.width > W - 8) x = evt.clientX - r.width - pad;
    if (y + r.height > H - 8) y = evt.clientY - r.height - pad;
    tooltip.style.left = Math.max(8, x) + 'px';
    tooltip.style.top = Math.max(8, y) + 'px';
  }
  const hideTooltip = () => { tooltip.hidden = true; };

  function renderDescuentos(hoy, ley) {
    const box = $('chartDescuentos');
    const W = Math.max(300, box.clientWidth);
    const narrow = W < 520;
    const cats = [
      { label: 'Pensión', a: hoy.pension, b: ley.pension },
      { label: 'Salud', a: hoy.salud, b: ley.salud },
      { label: narrow ? 'Retención' : 'Retención en la fuente', a: hoy.retencion, b: ley.retencion },
      { label: narrow ? 'Total' : 'Total descuentos', a: hoy.totalDescuentos, b: ley.totalDescuentos },
    ];
    const barH = 18, gap = 2, groupGap = 22;
    const left = narrow ? 84 : 160, right = narrow ? 70 : 90, top = 8, bottom = 26;
    const groupH = barH * 2 + gap;
    const H = top + cats.length * groupH + (cats.length - 1) * groupGap + bottom;
    const plotW = W - left - right;
    const max = niceMax(Math.max(...cats.flatMap(c => [c.a, c.b])));
    const x = v => (v / max) * plotW;

    box.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, box);

    // Grid recesivo
    const ticks = narrow ? 2 : 4;
    for (let i = 0; i <= ticks; i++) {
      const gx = left + (plotW * i) / ticks;
      el('line', { x1: gx, x2: gx, y1: top - 4, y2: H - bottom, stroke: css('--grid'), 'stroke-width': 1 }, svg);
      const t = el('text', { x: gx, y: H - 6, 'text-anchor': 'middle', fill: css('--text-muted'), 'font-size': 11 }, svg);
      t.textContent = fmtCompact((max * i) / ticks);
    }

    const bars = [];
    cats.forEach((c, i) => {
      const gy = top + i * (groupH + groupGap);
      const g = el('g', {}, svg);
      const lbl = el('text', { x: left - 10, y: gy + groupH / 2 + 4, 'text-anchor': 'end', fill: css('--text-secondary'), 'font-size': 12.5, 'font-weight': i === cats.length - 1 ? 700 : 400 }, g);
      lbl.textContent = c.label;

      [['a', '--series-now'], ['b', '--series-law']].forEach(([k, color], j) => {
        const y = gy + j * (barH + gap);
        const p = el('path', { d: hBarPath(left, y, x(c[k]), barH), fill: css(color), class: 'bar' }, g);
        bars.push(p);
        const val = el('text', { x: left + x(c[k]) + 6, y: y + barH / 2 + 4, fill: css('--text-primary'), 'font-size': 11.5 }, g);
        val.textContent = fmtCompact(c[k]);
      });

      // Zona de interacción más grande que la marca
      const hit = el('rect', { x: 0, y: gy - groupGap / 2, width: W, height: groupH + groupGap, class: 'hit' }, g);
      const dif = c.b - c.a;
      const html = `<strong>${cats[i].label === 'Retención' ? 'Retención en la fuente' : c.label}</strong>
        <div class="row"><span><span class="swatch swatch--now"></span>Hoy</span><span>${fmtCOP(c.a)}</span></div>
        <div class="row"><span><span class="swatch swatch--law"></span>Con la ley</span><span>${fmtCOP(c.b)}</span></div>
        <div class="row"><span>Diferencia</span><span>${dif >= 0 ? '+' : '−'}${fmtCOP(Math.abs(dif))}</span></div>`;
      hit.addEventListener('mousemove', e => {
        showTooltip(e, html);
        bars.forEach(b => b.classList.toggle('is-dim', b.parentNode !== g));
      });
      hit.addEventListener('mouseleave', () => { hideTooltip(); bars.forEach(b => b.classList.remove('is-dim')); });
      hit.addEventListener('touchstart', e => { showTooltip(e.touches[0], html); }, { passive: true });
    });
  }

  function renderSalud(nSmlmv, idxUsuario) {
    const box = $('chartSalud');
    const W = Math.max(300, box.clientWidth);
    const narrow = W < 520;
    const left = 40, right = 10, top = 26, bottom = 46;
    const H = narrow ? 240 : 270;
    const plotW = W - left - right, plotH = H - top - bottom;
    const max = 0.09;
    const y = v => top + plotH - (v / max) * plotH;
    const n = SALUD_LEY.length;
    const slot = plotW / n;
    const bw = Math.min(56, slot - 2 * Math.max(2, slot * 0.18));

    box.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, box);

    [0, 0.02, 0.04, 0.06, 0.08].forEach(v => {
      el('line', { x1: left, x2: W - right, y1: y(v), y2: y(v), stroke: css('--grid'), 'stroke-width': 1 }, svg);
      const t = el('text', { x: left - 8, y: y(v) + 4, 'text-anchor': 'end', fill: css('--text-muted'), 'font-size': 11 }, svg);
      t.textContent = (v * 100) + '%';
    });

    SALUD_LEY.forEach((b, i) => {
      const cx = left + slot * i + slot / 2;
      const esUsuario = i === idxUsuario;
      const g = el('g', {}, svg);
      el('path', {
        d: vBarPath(cx - bw / 2, y(b.tasa), bw, y(0) - y(b.tasa)),
        fill: esUsuario ? css('--series-law') : css('--neutral-bar'),
        class: 'bar',
      }, g);
      const val = el('text', { x: cx, y: y(b.tasa) - 6, 'text-anchor': 'middle', fill: esUsuario ? css('--text-primary') : css('--text-secondary'), 'font-size': narrow ? 10.5 : 12, 'font-weight': esUsuario ? 700 : 400 }, g);
      val.textContent = fmtPct(b.tasa);
      const xl = el('text', { x: cx, y: H - bottom + 16, 'text-anchor': 'middle', fill: esUsuario ? css('--text-primary') : css('--text-muted'), 'font-size': narrow ? 10 : 11.5, 'font-weight': esUsuario ? 700 : 400 }, g);
      xl.textContent = b.etiqueta;
      if (esUsuario) {
        const tu = el('text', { x: cx, y: H - bottom + 31, 'text-anchor': 'middle', fill: css('--series-law'), 'font-size': 11, 'font-weight': 700 }, g);
        tu.textContent = '▲ Tú';
      }
      const hit = el('rect', { x: left + slot * i, y: top, width: slot, height: plotH + 20, class: 'hit' }, g);
      const html = `<strong>${b.texto.charAt(0).toUpperCase() + b.texto.slice(1)}</strong>
        <div class="row"><span>Hoy</span><span>${fmtPct(SALUD_HOY)}</span></div>
        <div class="row"><span>Con la ley</span><span>${fmtPct(b.tasa)}</span></div>
        ${esUsuario ? `<div class="row"><span>Tu salario</span><span>${fmtNum(nSmlmv)} SMLMV</span></div>` : ''}`;
      hit.addEventListener('mousemove', e => showTooltip(e, html));
      hit.addEventListener('mouseleave', hideTooltip);
      hit.addEventListener('touchstart', e => showTooltip(e.touches[0], html), { passive: true });
    });

    // Línea de referencia: tarifa actual 4%
    el('line', { x1: left, x2: W - right, y1: y(SALUD_HOY), y2: y(SALUD_HOY), stroke: css('--series-now'), 'stroke-width': 2, 'stroke-dasharray': '6 4' }, svg);
    if (!narrow) { const ref = el('text', { x: W - right, y: y(SALUD_HOY) - 6, 'text-anchor': 'end', fill: css('--text-primary'), 'font-size': 11.5 }, svg);
    ref.textContent = 'Hoy: 4% para todos'; }

    const axis = el('text', { x: left + plotW / 2, y: H - 2, 'text-anchor': 'middle', fill: css('--text-muted'), 'font-size': 11 }, svg);
    axis.textContent = 'Salario en salarios mínimos (SMLMV)';
  }

  /* ---------- Eventos ---------- */
  function formatearInput(input) {
    const pos = input.value.length - input.selectionStart;
    const n = parseMoney(input.value);
    input.value = n ? n.toLocaleString('es-CO') : '0';
    const p = Math.max(0, input.value.length - pos);
    try { input.setSelectionRange(p, p); } catch (_) { /* noop */ }
  }

  function init() {
    moneyIds.forEach(id => {
      const input = $(id);
      input.addEventListener('input', () => { formatearInput(input); actualizar(); });
      input.addEventListener('focus', () => { if (input.value === '0') input.select(); });
    });
    $('dependientes').addEventListener('input', actualizar);
    document.querySelectorAll('.stepper__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = $('dependientes');
        inp.value = Math.min(4, Math.max(0, (parseInt(inp.value, 10) || 0) + Number(btn.dataset.step)));
        actualizar();
      });
    });
    $('resetBtn').addEventListener('click', () => {
      moneyIds.forEach(id => { $(id).value = DEFAULTS[id].toLocaleString('es-CO'); });
      // Al restablecer, el salario vuelve a un salario mínimo
      $('salario').value = DEFAULTS.smlmv.toLocaleString('es-CO');
      $('dependientes').value = DEFAULTS.dependientes;
      actualizar();
    });

    // Modal de donaciones
    const modal = $('donarModal');
    let lastFocus = null;
    const abrirModal = e => {
      e.preventDefault();
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('no-scroll');
      $('donarClose').focus();
    };
    const cerrarModal = () => {
      modal.hidden = true;
      document.body.classList.remove('no-scroll');
      if (lastFocus) lastFocus.focus();
    };
    document.querySelectorAll('[data-open="donar"]').forEach(b => b.addEventListener('click', abrirModal));
    $('donarClose').addEventListener('click', cerrarModal);
    modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) cerrarModal(); });
    $('copiarLlave').addEventListener('click', async () => {
      const btn = $('copiarLlave');
      const llave = $('llaveBreb').textContent.trim();
      try {
        await navigator.clipboard.writeText(llave);
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = llave; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
      }
      btn.textContent = '¡Copiada!';
      setTimeout(() => { btn.textContent = 'Copiar llave'; }, 1800);
    });

    // Navbar móvil
    const toggle = $('navToggle'), menu = $('navMenu');
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));

    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(actualizar, 120); });
    window.addEventListener('scroll', hideTooltip, { passive: true });
    $('year').textContent = new Date().getFullYear();
    actualizar();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
