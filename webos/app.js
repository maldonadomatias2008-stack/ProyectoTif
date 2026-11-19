const $ = s => document.querySelector(s);
const wins = {};
let z = 1, expr = '';

const KEYS = 'C ( ) / 7 8 9 * 4 5 6 - 1 2 3 + 0 . ⌫ ='.split(' ');
const WALLPAPERS = [
  'radial-gradient(circle at 30% 35%, #60b4ff, #0a3d91 60%, #051937)',
  'radial-gradient(circle at 70% 30%, #f9a8d4, #7e22ce 60%, #1e1b4b)',
  'linear-gradient(135deg, #064e3b, #14b8a6)',
];
const list = items => `<ul class="list-group list-group-flush">${items.map(([i, c, t]) =>
  `<li class="list-group-item"><i class="bi bi-${i} ${c} me-2"></i>${t}</li>`).join('')}</ul>`;

/* ── Aplicaciones ── */
const APPS = {
  notes: {
    title: 'Bloc de notas', icon: 'bi-file-earmark-text', color: '#0d6efd', size: [420, 300],
    body: `<textarea class="form-control h-100 border-0 rounded-0 shadow-none" style="resize:none" placeholder="Escribí aquí..."></textarea>`,
  },
  calc: {
    title: 'Calculadora', icon: 'bi-calculator', color: '#6c757d', size: [290, 400],
    body: `<div class="p-2 pb-0"><input id="out" class="form-control form-control-lg text-end" value="0" readonly></div>
           <div class="calc">${KEYS.map(k => `<button class="btn btn-${k === '=' ? 'primary' : 'light border'}" data-key="${k}">${k}</button>`).join('')}</div>`,
  },
  files: {
    title: 'Explorador de archivos', icon: 'bi-folder-fill', color: '#ffb900', size: [400, 300],
    body: list([
      ['folder-fill', 'text-warning', 'Documentos'], ['folder-fill', 'text-warning', 'Imágenes'], ['folder-fill', 'text-warning', 'Música'],
      ['file-earmark-word', 'text-primary', 'Informe.docx'], ['file-earmark-excel', 'text-success', 'Presupuesto.xlsx'], ['file-earmark-pdf', 'text-danger', 'Contrato.pdf'],
    ]),
  },
  settings: {
    title: 'Configuración', icon: 'bi-gear-fill', color: '#5b5fc7', size: [360, 230],
    body: `<div class="p-3">
             <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="dark"><label class="form-check-label" for="dark">Modo oscuro</label></div>
             <p class="mb-2">Fondo de pantalla</p>
             <div class="d-flex gap-2">${WALLPAPERS.map(bg => `<button class="wall" data-wall="${bg}" style="background:${bg}"></button>`).join('')}</div>
           </div>`,
  },
};

/* ── Ventanas ── */
function openApp(id) {
  const a = APPS[id];
  let w = wins[id];
  if (!w) {
    w = wins[id] = document.createElement('section');
    const n = Object.keys(wins).length * 28;
    w.className = 'win shadow';
    w.dataset.id = id;
    w.style.cssText = `width:${a.size[0]}px;height:${a.size[1]}px;left:${80 + n}px;top:${20 + n}px`;
    w.innerHTML = `
      <header class="titlebar">
        <i class="bi ${a.icon}" style="color:${a.color}"></i><span class="flex-grow-1 small">${a.title}</span>
        <button data-act="min"><i class="bi bi-dash-lg"></i></button>
        <button data-act="max"><i class="bi bi-square"></i></button>
        <button data-act="close" class="close"><i class="bi bi-x-lg"></i></button>
      </header>
      <div class="content">${a.body}</div>`;
    $('#desktop').append(w);
    drag(w);
    $(`#apps [data-open="${id}"]`).classList.add('on');
  }
  w.style.display = 'flex';
  w.style.zIndex = ++z;
}

function drag(w) {
  w.onpointerdown = () => (w.style.zIndex = ++z);
  w.querySelector('.titlebar').onpointerdown = e => {
    if (e.target.closest('button') || w.classList.contains('max')) return;
    const dx = e.clientX - w.offsetLeft, dy = e.clientY - w.offsetTop;
    document.onpointermove = ev => { w.style.left = ev.clientX - dx + 'px'; w.style.top = ev.clientY - dy + 'px'; };
    document.onpointerup = () => (document.onpointermove = null);
  };
}

/* ── Calculadora ── */
function calc(k) {
  if (expr === 'Error') expr = '';
  if (k === 'C') expr = '';
  else if (k === '⌫') expr = expr.slice(0, -1);
  else if (k === '=') { try { expr = String(Function('return ' + expr)()); } catch { expr = 'Error'; } }
  else expr += k;
  $('#out').value = expr || '0';
}

/* ── Eventos ── */
const openFrom = e => { const id = e.target.closest('[data-open]')?.dataset.open; if (id) openApp(id); };
$('#taskbar').onclick = openFrom;      // barra de tareas y menú Inicio: un clic
$('#desktop').ondblclick = openFrom;   // escritorio: doble clic

$('#desktop').onclick = e => {
  const t = e.target, act = t.closest('[data-act]')?.dataset.act, win = t.closest('.win');
  if (act === 'min') win.style.display = 'none';
  if (act === 'max') win.classList.toggle('max');
  if (act === 'close') { $(`#apps [data-open="${win.dataset.id}"]`).classList.remove('on'); delete wins[win.dataset.id]; win.remove(); }
  if (t.dataset.key) calc(t.dataset.key);
  if (t.id === 'dark') document.documentElement.dataset.bsTheme = t.checked ? 'dark' : 'light';
  if (t.dataset.wall) $('#desktop').style.background = t.dataset.wall;
};

/* ── Inicio: se generan íconos, menú y barra desde APPS ── */
const entries = Object.entries(APPS);
$('#desktop').innerHTML = entries.map(([id, a]) =>
  `<button class="icon" data-open="${id}"><i class="bi ${a.icon}" style="color:${a.color}"></i><span>${a.title}</span></button>`).join('');
$('#start').innerHTML = entries.map(([id, a]) =>
  `<li><button class="dropdown-item" data-open="${id}"><i class="bi ${a.icon} me-2" style="color:${a.color}"></i>${a.title}</button></li>`).join('') +
  `<li><hr class="dropdown-divider"></li>` +
  `<li><button class="dropdown-item" onclick="location.reload()"><i class="bi bi-arrow-repeat me-2"></i>Reiniciar (volver a la BIOS)</button></li>`;
$('#apps').innerHTML = entries.map(([id, a]) =>
  `<button data-open="${id}" title="${a.title}"><i class="bi ${a.icon}" style="color:${a.color}"></i></button>`).join('');

const tick = () => ($('#clock').textContent = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
tick();
setInterval(tick, 1000);