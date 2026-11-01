/* Leyes Transparentes — Listado de cambios en el IVA (PL 477 de 2026 Cámara) */
(function () {
  'use strict';

  // s: 'sube' | 'igual' | 'baja'   ·   v: cuándo empieza a regir
  const AL_APROBARSE = 'Al aprobarse';
  const D2028 = 'Desde 2028';

  const CATEGORIAS = [
    {
      id: 'canasta', emoji: '🧺', nombre: 'Canasta básica',
      items: [
        { e: '🧀', n: 'Queso fresco (campesino, cuajada)', a: '0% (exento)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 46: no queda en la nueva lista de exentos' },
        { e: '🫘', n: 'Fríjol, lentejas y garbanzos secos', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42: no queda en la nueva lista de excluidos' },
        { e: '🌽', n: 'Maíz para consumo humano', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🧂', n: 'Sal de cocina', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🥩', n: 'Carne de res, cerdo, pollo, cordero y conejo', a: '0% (exento)', b: '0% (exento)', s: 'igual', v: '', ref: 'Art. 46' },
        { e: '🐟', n: 'Pescado fresco, congelado y filetes', a: '0%', b: '0%', s: 'igual', v: '', ref: 'Arts. 42 y 46' },
        { e: '🥛', n: 'Leche y crema de leche', a: '0% (exento)', b: '0% (exento)', s: 'igual', v: '', ref: 'Art. 46' },
        { e: '🥚', n: 'Huevos', a: '0% (exento)', b: '0% (exento)', s: 'igual', v: '', ref: 'Art. 46' },
        { e: '🍚', n: 'Arroz para consumo humano', a: '0%', b: '0%', s: 'igual', v: '', ref: 'Arts. 42 y 46' },
        { e: '🍞', n: 'Pan y arepa de maíz', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '🟫', n: 'Panela', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '🌭', n: 'Salchichón, butifarra y mortadela', a: '0%', b: '0% (exento)', s: 'igual', v: '', ref: 'Art. 46' },
        { e: '🍼', n: 'Leche de fórmula para bebés y Bienestarina', a: '0%', b: '0%', s: 'igual', v: '', ref: 'Arts. 42 y 46' },
      ],
    },
    {
      id: 'frutas', emoji: '🥕', nombre: 'Frutas y verduras',
      items: [
        { e: '🍅', n: 'Tomate, cebolla, zanahoria, lechuga, repollo y demás hortalizas', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42: solo quedan papa, hortalizas de vaina y tubérculos' },
        { e: '🍌', n: 'Plátano y banano', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🍊', n: 'Frutas frescas (naranja, mango, piña, aguacate, manzana, etc.)', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🥔', n: 'Papa', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '🍠', n: 'Yuca, batata, ñame y otros tubérculos', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '🫛', n: 'Arveja y habichuela frescas (hortalizas de vaina)', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
      ],
    },
    {
      id: 'despensa', emoji: '🥫', nombre: 'Despensa y alimentos procesados',
      items: [
        { e: '☕', n: 'Café tostado y molido', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106: se deroga el art. 468-1 (tarifa del 5%)' },
        { e: '🍬', n: 'Azúcar', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (art. 468-1)' },
        { e: '🌾', n: 'Harina de trigo', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (art. 468-1)' },
        { e: '🍝', n: 'Pastas (espagueti, macarrones, etc.)', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (art. 468-1)' },
        { e: '🍫', n: 'Chocolate de mesa', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (art. 468-1)' },
        { e: '🫒', n: 'Aceites de cocina', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (art. 468-1)' },
        { e: '🥓', n: 'Embutidos (salchichas, jamón, chorizo)', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (art. 468-1)' },
        { e: '🍪', n: 'Galletas, mecato y comidas de paquete', a: '19%', b: '19%', s: 'igual', v: '', ref: 'Tarifa general' },
      ],
    },
    {
      id: 'bebidas', emoji: '🍷', nombre: 'Bebidas y licores',
      items: [
        { e: '🥃', n: 'Licores (aguardiente, ron, whisky, etc.)', a: '5%', b: '19%', s: 'sube', v: AL_APROBARSE, ref: 'Art. 27 y art. 106 (deroga art. 33 de la Ley 1816 de 2016)' },
        { e: '🍷', n: 'Vinos y aperitivos', a: '5%', b: '19%', s: 'sube', v: AL_APROBARSE, ref: 'Art. 27' },
        { e: '🍺', n: 'Cerveza', a: '19%', b: '19%', s: 'igual', v: '', ref: 'El IVA no cambia, pero sube el impuesto a la producción (art. 190)' },
        { e: '🥤', n: 'Gaseosas y bebidas azucaradas', a: '19%', b: '19%', s: 'igual', v: '', ref: 'Tarifa general' },
        { e: '💧', n: 'Agua sin azúcar ni sabor, hielo', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
      ],
    },
    {
      id: 'tecnologia', emoji: '💻', nombre: 'Tecnología y comunicaciones',
      items: [
        { e: '📱', n: 'Celulares y tabletas de hasta 22 UVT (≈ $1,15 millones)', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42: no queda en la nueva lista de excluidos' },
        { e: '💻', n: 'Computadores de escritorio o portátiles de hasta 50 UVT (≈ $2,6 millones)', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🌐', n: 'Internet en el hogar para estratos 1, 2 y 3', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 45: no queda en la nueva lista de servicios excluidos' },
        { e: '☁️', n: 'Hosting, páginas web y servicios en la nube', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 45' },
        { e: '📺', n: 'Televisores, consolas y electrodomésticos', a: '19%', b: '19%', s: 'igual', v: '', ref: 'Tarifa general' },
        { e: '🎓', n: 'Cursos y educación virtual para contenidos digitales', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 6' },
      ],
    },
    {
      id: 'salud', emoji: '🏥', nombre: 'Salud e higiene',
      items: [
        { e: '🩺', n: 'Medicina prepagada y planes complementarios de salud', a: '5%', b: '0% (excluido)', s: 'baja', v: D2028, ref: 'Art. 45, num. 23, y art. 106 (deroga art. 468-3)' },
        { e: '💊', n: 'Medicamentos', a: '0% (excluido)', b: '0% (exento)', s: 'igual', v: '', ref: 'Art. 46' },
        { e: '💉', n: 'Vacunas, vitaminas y antibióticos', a: '0%', b: '0% (exento)', s: 'igual', v: '', ref: 'Art. 46' },
        { e: '🩸', n: 'Toallas higiénicas, tampones y compresas', a: '0%', b: '0% (exento)', s: 'igual', v: '', ref: 'Art. 46' },
        { e: '🛡️', n: 'Preservativos y anticonceptivos femeninos', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '👓', n: 'Lentes para gafas y lentes de contacto', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '🦽', n: 'Sillas de ruedas, prótesis y audífonos', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '🧑‍⚕️', n: 'Consultas médicas, odontología y laboratorio', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 1' },
        { e: '🧼', n: 'Jabón, crema dental, papel higiénico y aseo', a: '19%', b: '19%', s: 'igual', v: '', ref: 'Tarifa general' },
      ],
    },
    {
      id: 'transporte', emoji: '🚗', nombre: 'Transporte y combustibles',
      items: [
        { e: '🔌', n: 'Carros, buses y camiones eléctricos', a: '5%', b: '19%', s: 'sube', v: AL_APROBARSE, ref: 'Art. 106: salen del art. 468-1 las partidas 87.02 a 87.07' },
        { e: '🛵', n: 'Motos y bicicletas eléctricas', a: '5%', b: '19%', s: 'sube', v: AL_APROBARSE, ref: 'Art. 106 (partidas 87.11 y 87.12)' },
        { e: '🚲', n: 'Bicicletas', a: '0% o 5%', b: '19%', s: 'sube', v: AL_APROBARSE, ref: 'Art. 106 (partida 87.12) y art. 42' },
        { e: '🔋', n: 'Baterías, motores y cargadores de vehículos eléctricos', a: '5%', b: '19%', s: 'sube', v: AL_APROBARSE, ref: 'Art. 106 (partidas 85.01, 85.04 y 85.07)' },
        { e: '⛽', n: 'Gasolina corriente', a: '19% (sin margen del minorista)', b: '19% sobre el precio completo', s: 'sube', v: D2028, ref: 'Arts. 43 y 44: el IVA también se cobra sobre el margen de la estación' },
        { e: '🚚', n: 'ACPM (diésel)', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Arts. 42 y 44' },
        { e: '🚌', n: 'Transporte público de pasajeros (bus, metro, TransMilenio)', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 7' },
        { e: '♿', n: 'Partes y accesorios de sillas de ruedas', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
      ],
    },
    {
      id: 'hogar', emoji: '🏠', nombre: 'Hogar y servicios públicos',
      items: [
        { e: '💡', n: 'Energía eléctrica', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Arts. 42 y 45' },
        { e: '🚰', n: 'Acueducto, alcantarillado y aseo', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 10' },
        { e: '🔥', n: 'Gas domiciliario (por tubería o en cilindro)', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Arts. 42 y 45' },
        { e: '🔑', n: 'Arriendo de vivienda', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 13' },
        { e: '🧱', n: 'Ladrillos y bloques de construcción', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
        { e: '🏡', n: 'Compra de vivienda (inmuebles)', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42, num. 7' },
      ],
    },
    {
      id: 'servicios', emoji: '🧾', nombre: 'Servicios',
      items: [
        { e: '🏫', n: 'Colegios, universidades y educación formal', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 5' },
        { e: '🏦', n: 'Intereses de créditos y leasing', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 14' },
        { e: '🕊️', n: 'Servicios funerarios', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 45, num. 16' },
        { e: '🛡️', n: 'Seguros de salud, cirugía y hospitalización', a: '5%', b: '0% (excluido)', s: 'baja', v: D2028, ref: 'Art. 45, num. 23' },
      ],
    },
    {
      id: 'agro', emoji: '🌱', nombre: 'Agro y campo',
      items: [
        { e: '🧪', n: 'Abonos y fertilizantes', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42: no queda en la nueva lista de excluidos' },
        { e: '🐛', n: 'Plaguicidas, herbicidas e insecticidas agrícolas', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🐄', n: 'Animales vivos (ganado, cerdos, aves)', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🌰', n: 'Semillas para siembra', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '🚜', n: 'Tractores, cosechadoras y sistemas de riego', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42' },
        { e: '📄', n: 'Seguros agropecuarios', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (deroga art. 468-3)' },
        { e: '🏭', n: 'Almacenamiento de productos agrícolas', a: '5%', b: '19%', s: 'sube', v: D2028, ref: 'Art. 106 (deroga art. 468-3)' },
        { e: '🪵', n: 'Madera en bruto', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
      ],
    },
    {
      id: 'educacion', emoji: '✏️', nombre: 'Útiles escolares',
      items: [
        { e: '📓', n: 'Cuadernos escolares', a: '0% (excluido)', b: '19%', s: 'sube', v: D2028, ref: 'Art. 42: no queda en la nueva lista de excluidos' },
        { e: '✏️', n: 'Lápices de escribir y de colorear', a: '0% (excluido)', b: '0% (excluido)', s: 'igual', v: '', ref: 'Art. 42' },
      ],
    },
    {
      id: 'apuestas', emoji: '🎰', nombre: 'Entretenimiento y apuestas',
      items: [
        { e: '🎲', n: 'Apuestas y casinos en línea (por internet)', a: '0% (excluido)', b: '19% sobre cada depósito', s: 'sube', v: AL_APROBARSE, ref: 'Art. 41: modifica el literal e) del art. 420' },
        { e: '🎰', n: 'Casinos, tragamonedas y bingos físicos', a: '19%', b: '19%', s: 'igual', v: '', ref: 'Art. 41' },
        { e: '🎟️', n: 'Loterías', a: '0% (no gravadas)', b: '0% (no gravadas)', s: 'igual', v: '', ref: 'Art. 41' },
      ],
    },
  ];

  const ESTADOS = {
    sube: { label: 'Sube', icon: '▲' },
    igual: { label: 'Igual', icon: '=' },
    baja: { label: 'Baja', icon: '▼' },
  };

  const $ = (id) => document.getElementById(id);
  const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const estado = { q: '', s: 'todos', cat: 'todas' };

  function contar() {
    const c = { sube: 0, igual: 0, baja: 0 };
    CATEGORIAS.forEach((cat) => cat.items.forEach((it) => { c[it.s]++; }));
    return c;
  }

  function itemHTML(it) {
    const st = ESTADOS[it.s];
    return `
      <li class="iva-item iva-item--${it.s}">
        <span class="iva-item__emoji" aria-hidden="true">${it.e}</span>
        <div class="iva-item__body">
          <p class="iva-item__name">${esc(it.n)}</p>
          <p class="iva-item__ref">${esc(it.ref)}${it.v ? ` · <strong>${it.v}</strong>` : ''}</p>
        </div>
        <div class="iva-item__rates" aria-label="Antes ${esc(it.a)}, después ${esc(it.b)}">
          <span class="rate rate--antes"><small>Antes</small>${esc(it.a)}</span>
          <span class="rate__arrow" aria-hidden="true">→</span>
          <span class="rate rate--despues rate--${it.s}"><small>Después</small>${esc(it.b)}</span>
        </div>
        <span class="iva-badge iva-badge--${it.s}"><span aria-hidden="true">${st.icon}</span> ${st.label}</span>
      </li>`;
  }

  function render() {
    const q = norm(estado.q.trim());
    let total = 0;
    const html = CATEGORIAS
      .filter((cat) => estado.cat === 'todas' || cat.id === estado.cat)
      .map((cat) => {
        const catMatch = q && norm(cat.nombre).includes(q);
        const items = cat.items.filter((it) =>
          (estado.s === 'todos' || it.s === estado.s) &&
          (!q || catMatch || norm(it.n + ' ' + it.ref).includes(q)));
        if (!items.length) return '';
        total += items.length;
        const suben = items.filter((it) => it.s === 'sube').length;
        return `
          <section class="card iva-cat" aria-labelledby="iva-cat-${cat.id}">
            <header class="iva-cat__head">
              <h3 id="iva-cat-${cat.id}"><span aria-hidden="true">${cat.emoji}</span> ${cat.nombre}</h3>
              <span class="iva-cat__count">${items.length} ${items.length === 1 ? 'producto' : 'productos'}${suben && estado.s !== 'sube' ? ` · ${suben} ${suben === 1 ? 'sube' : 'suben'}` : ''}</span>
            </header>
            <ul class="iva-list">${items.map(itemHTML).join('')}</ul>
          </section>`;
      }).join('');

    $('ivaResultados').innerHTML = html;
    $('ivaVacio').hidden = total > 0;
    $('ivaConteo').textContent = total
      ? `Mostrando ${total} ${total === 1 ? 'producto' : 'productos'}`
      : '';
  }

  function chips(contenedor, opciones, clave) {
    const el = $(contenedor);
    el.innerHTML = opciones.map((o) =>
      `<button type="button" class="chip${estado[clave] === o.v ? ' is-active' : ''}" data-v="${o.v}" aria-pressed="${estado[clave] === o.v}">${o.t}</button>`).join('');
    el.addEventListener('click', (ev) => {
      const b = ev.target.closest('.chip');
      if (!b) return;
      estado[clave] = b.dataset.v;
      el.querySelectorAll('.chip').forEach((c) => {
        const on = c === b;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on);
      });
      render();
    });
  }

  function init() {
    if (!$('iva')) return;
    const c = contar();
    $('ivaSuben').textContent = c.sube;
    $('ivaIgual').textContent = c.igual;
    $('ivaBajan').textContent = c.baja;

    chips('ivaEstados', [
      { v: 'todos', t: 'Todos' },
      { v: 'sube', t: `▲ Suben (${c.sube})` },
      { v: 'igual', t: `= Se mantienen (${c.igual})` },
      { v: 'baja', t: `▼ Bajan (${c.baja})` },
    ], 's');

    chips('ivaCategorias', [{ v: 'todas', t: '🗂️ Todas' }].concat(
      CATEGORIAS.map((cat) => ({ v: cat.id, t: `${cat.emoji} ${cat.nombre}` }))), 'cat');

    const input = $('ivaBuscar');
    input.addEventListener('input', () => { estado.q = input.value; render(); });
    $('ivaLimpiar').addEventListener('click', () => { input.value = ''; estado.q = ''; render(); input.focus(); });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
