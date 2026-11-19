const $ = s => document.querySelector(s);
const rnd = a => a[Math.floor(Math.random() * a.length)];
const wins = {}, timers = {};
let z = 10, expr = '', errores = 0, clicks = 0, piedadClicks = 0, piedad = false, intentosLogin = 0, reint = 0;

const KEYS = 'C ( ) / 7 8 9 * 4 5 6 - 1 2 3 + 0 . ⌫ ='.split(' ');
const WALLPAPERS = [
  'radial-gradient(circle at 30% 35%, #60b4ff, #0a3d91 60%, #051937)',
  'radial-gradient(circle at 70% 30%, #f9a8d4, #7e22ce 60%, #1e1b4b)',
  'linear-gradient(135deg, #064e3b, #14b8a6)',
  '#1e3c72', // el 4º es la foto de imagenes.js
];
const list = items => `<ul class="list-group list-group-flush">${items.map(([i, c, t]) =>
  `<li class="list-group-item" onclick="falla()"><i class="bi bi-${i} ${c} me-2"></i>${t}</li>`).join('')}</ul>`;
const term = (id, intro, ph) => `<div class="term" id="t-${id}">${intro}</div><input class="term-in" data-t="${id}" placeholder="${ph}">`;

const RESP = {
  mysql: ['ERROR 1064 (42000): error de sintaxis. Falta el punto y coma;', 'ERROR 1045 (28000): Access denied for user alumno@localhost', 'ERROR 1146: la tabla escuela.notas no existe (nunca existió)', 'Query OK, 0 rows affected (se borró todo, es broma... o no)'],
  js: ['undefined', 'NaN', '0.30000000000000004', 'Uncaught TypeError: undefined is not a function', '[object Object]', 'Uncaught ReferenceError: tarea is not defined'],
};

/* ── Aplicaciones (lento:true = abre con demora y puede "no responder") ── */
const APPS = {
  pc: { title: 'Mi PC', icon: 'bi-pc-display', color: '#0dcaf0', size: [340, 260],
    body: `<div class="p-3"><p class="mb-1">ESET-OS 98 · Edición Tilt</p><p class="mb-1">Procesador: 1 neurona (compartida)</p><p class="mb-1">RAM: 4 GB (3,9 ocupados por memes)</p><p class="mb-1">Disco C:</p>
      <div class="progress mb-3"><div class="progress-bar bg-danger" style="width:98%">98% lleno</div></div><button class="btn btn-primary btn-sm" onclick="nuevaCadena()">Optimizar PC</button></div>` },
  memes: { title: 'Memes_ESET', icon: 'bi-emoji-laughing-fill', color: '#fd7e14', size: [340, 380],
    body: () => '<div class="p-2">' + [1, 2, 3, 4, 5, 6, 7, 8].map(n => `<img class="meme" src="${IMAGENES['m' + n]}" onclick="aviso('Jajaja, meme guardado 😂')">`).join('') + '</div>' },
  notes: { title: 'Bloc de notas', icon: 'bi-file-earmark-text', color: '#0d6efd', size: [420, 300],
    body: `<textarea class="form-control h-100 border-0 rounded-0 shadow-none" style="resize:none" placeholder="Escribí tu tarea acá..." oninput="corregir(this)"></textarea>` },
  calc: { title: 'Calculadora', icon: 'bi-calculator', color: '#6c757d', size: [290, 400],
    body: `<div class="p-2 pb-0"><input id="out" class="form-control form-control-lg text-end" value="0" readonly></div>
           <div class="calc">${KEYS.map(k => `<button class="btn btn-${k === '=' ? 'primary' : 'light border'}" data-key="${k}">${k}</button>`).join('')}</div>` },
  files: { title: 'Explorador de archivos', icon: 'bi-folder-fill', color: '#ffb900', size: [400, 300],
    body: list([['folder-fill', 'text-warning', 'Documentos'], ['folder-fill', 'text-warning', 'Imágenes'], ['folder-fill', 'text-warning', 'Música'],
      ['file-earmark-word', 'text-primary', 'Informe.docx'], ['file-earmark-excel', 'text-success', 'Presupuesto.xlsx'], ['file-earmark-pdf', 'text-danger', 'Contrato.pdf']]) },
  boletin: { title: 'Boletin.pdf', icon: 'bi-file-earmark-pdf-fill', color: '#dc3545', size: [420, 280],
    body: `<table class="table table-sm m-0"><tr><th>Materia</th><th>Nota</th><th>Observación</th></tr>
      <tr><td>Matemática</td><td>4</td><td>Previa asegurada</td></tr><tr><td>Dibujo técnico</td><td>6</td><td>La escuadra no sobrevivió</td></tr>
      <tr><td>Taller</td><td>8</td><td>Perdió un calibre</td></tr><tr><td>Educación Física</td><td>10</td><td>Único 10 del curso</td></tr>
      <tr><td>Promedio</td><td colspan="2"><span class="spinner-border spinner-border-sm"></span> Calculando... (desde 1998)</td></tr></table>` },
  papelera: { title: 'Papelera', icon: 'bi-trash3-fill', color: '#adb5bd', size: [360, 250],
    body: `<div class="p-3"><p class="mb-1">📄 tarea_mate_FINAL_v7.docx</p><p class="mb-1">📄 excusas_para_el_coordi.txt</p><p>⚙️ plan_B_sin_plan_A.exe</p>
      <button class="btn btn-danger btn-sm" onclick="nuevaCadena()">Vaciar papelera</button> <button class="btn btn-secondary btn-sm" onclick="nuevaCadena()">Restaurar todo</button></div>` },
  settings: { title: 'Configuración', icon: 'bi-gear-fill', color: '#5b5fc7', size: [360, 230],
    body: `<div class="p-3">
      <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="dark"><label class="form-check-label" for="dark">Modo oscuro</label></div>
      <p class="mb-2">Fondo de pantalla</p>
      <div class="d-flex gap-2">${WALLPAPERS.map((bg, i) => `<button class="wall" data-wall="${i}" style="background:${bg}"></button>`).join('')}</div></div>` },

  mysql: { title: 'MySQL', icon: 'bi-database-fill', color: '#00a3c4', size: [380, 280], lento: true,
    body: `<div class="p-2">${term('mysql', 'Welcome to the MySQL monitor.<br>Escribí un comando y apretá Enter:', 'mysql> ')}</div>` },
  js: { title: 'JavaScript', icon: 'bi-filetype-js', color: '#f7df1e', size: [380, 290], lento: true,
    body: `<div class="p-2"><p><b>JavaScript NO es Java.</b> Probá algo en la consola:</p>${term('js', '', '> ')}</div>` },
  tinkercad: { title: 'Tinkercad', icon: 'bi-cpu-fill', color: '#3aa0e0', size: [380, 240], lento: true,
    body: `<div class="centro"><div style="font-size:30px">🔋 ━━ 🔌 ━━ <span id="tk-led" style="font-size:50px">🌑</span></div><p id="tk-msg">Circuito listo (eso creés)</p><button class="btn btn-primary" onclick="simular()">▶ Iniciar simulación</button></div>` },
  youtube: { title: 'YouTube', icon: 'bi-youtube', color: '#ff0000', size: [380, 240], lento: true,
    body: `<div id="yt-caja" class="centro bg-black text-white h-100"><p>Anuncio <span id="yt-n">1</span> de 5</p><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" id="yt-b"></div></div><p><small>Este anuncio no se puede omitir</small></p><button class="btn btn-secondary" onmouseover="huir(this)" onclick="huir(this)">Omitir ›</button></div>`,
    init() {
      let n = 1, p = 0;
      every('youtube', 250, () => {
        p += 5; if (p > 100) { p = 0; n++; }
        if (n > 5) { $('#yt-caja').innerHTML = '<h4>😕</h4><p>Este video no está disponible en tu país</p><span class="badge bg-danger">Error 403</span>'; return true; }
        $('#yt-n').textContent = n; $('#yt-b').style.width = p + '%';
      });
    } },
  chrome: { title: 'Google Chrome', icon: 'bi-browser-chrome', color: '#4285f4', size: [380, 280], lento: true,
    body: `<div class="p-2"><input class="form-control form-control-sm" value="https://www.google.com" readonly><div class="centro"><div style="font-size:60px">🦖</div><h5>Sin conexión a internet</h5><p>ERR_INTERNET_DISCONNECTED</p><button class="btn btn-primary" onclick="reintentar()">Reintentar</button><p id="ch-msg"></p></div></div>` },
  vs: { title: 'Visual Studio', icon: 'bi-code-square', color: '#9b6bff', size: [380, 240], lento: true,
    body: `<div class="centro"><h4>Visual Studio 2022</h4><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" id="vs-b"></div></div><p id="vs-t">Iniciando...</p></div>`,
    init() {
      let p = 0, ticks = 0;
      every('vs', 300, () => {
        p = Math.min(99, p + 4); $('#vs-b').style.width = p + '%';
        $('#vs-t').textContent = rnd(['Cargando extensiones (1 de 4827)...', 'Indexando la solución...', 'Buscando el punto y coma perdido...', 'Descargando IntelliSense...']);
        if (++ticks > 40) { $('#vs-t').innerHTML = `<div class="alert alert-danger">Tu licencia venció. Activala completando 3 encuestas.</div><button class="btn btn-success" onclick="aviso('Encuesta 1 de 3: ¿te gusta el punto y coma?')">Activar</button>`; return true; }
      });
    } },
  cisco: { title: 'Packet Tracer', icon: 'bi-diagram-3-fill', color: '#049fd9', size: [380, 300], lento: true,
    body: `<div class="centro"><div style="font-size:34px">🖥️ ━ 🔀 ━ 🖥️</div><p><span class="badge bg-secondary">192.168.1.1</span></p><button class="btn btn-primary" onclick="ping()">Ping</button><div class="term mt-2" id="pt-out" style="height:100px">C:\\&gt;</div></div>`,
    init: () => loginCisco() },
  steam: { title: 'Steam', icon: 'bi-controller', color: '#66c0f4', size: [380, 300], lento: true,
    body: `<div class="p-3"><p><b>Counter-Strike 2</b> <span class="badge bg-danger">80 GB</span></p><p>Actualizando: 1 de 9999 archivos · <span id="st-v">3,2 KB/s</span></p>
      <div class="progress mb-3"><div class="progress-bar progress-bar-striped progress-bar-animated" id="st-b"></div></div><div class="alert alert-warning">Espacio insuficiente: tenés 0,3 GB libres.</div><p>Amigos en línea: 0</p></div>`,
    init() {
      let p = 2;
      every('steam', 500, () => {
        p += Math.random() * 3;
        if (p > 38) { p = 2; aviso('Steam: error de descarga, reiniciando 😅'); }
        $('#st-b').style.width = p + '%'; $('#st-v').textContent = (Math.random() * 5).toFixed(1) + ' KB/s';
      });
    } },
};

/* Intervalo ligado a la ventana: se corta solo si la ventana se cierra o si fn devuelve true */
function every(id, ms, fn) {
  timers[id] = setInterval(() => { if (!wins[id] || fn()) clearInterval(timers[id]); }, ms);
}

/* ── Avisos y cuadros de diálogo (Bootstrap) ── */
function aviso(texto) {
  const t = document.createElement('div');
  t.className = 'toast text-bg-dark';
  t.innerHTML = `<div class="toast-body">${texto}</div>`;
  $('#avisos').append(t);
  t.addEventListener('hidden.bs.toast', () => t.remove());
  new bootstrap.Toast(t, { delay: 4000 }).show();
}
function modal(titulo, texto, t1, f1, t2, f2) {
  $('#m-titulo').innerHTML = titulo; $('#m-texto').innerHTML = texto;
  const b1 = $('#m-b1'), b2 = $('#m-b2'), el = $('#modalTilt');
  b1.innerHTML = t1; b2.innerHTML = t2;
  b1.onclick = () => { bootstrap.Modal.getInstance(el).hide(); if (f1) setTimeout(f1, 450); };
  b2.onclick = () => { bootstrap.Modal.getInstance(el).hide(); if (f2) setTimeout(f2, 450); };
  bootstrap.Modal.getOrCreateInstance(el, { backdrop: 'static', keyboard: false }).show();
}

/* ── Ventanas ── */
function openApp(id) {
  const a = APPS[id];
  if (wins[id]) { wins[id].style.display = 'flex'; wins[id].style.zIndex = ++z; return; }
  if (!a.lento) return build(id);
  aviso('Abriendo ' + a.title + '...');
  if (Math.random() < .3 && !piedad) {
    setTimeout(() => modal(a.title + ' no responde', 'El programa no responde. ¿Qué querés hacer?',
      'Esperar', () => { aviso('Esperando...'); setTimeout(() => build(id), 2000); },
      'Cerrar programa', () => { aviso('No se puede cerrar: el programa no responde'); setTimeout(() => build(id), 1500); }), 800);
  } else setTimeout(() => build(id), 1500);
}

function build(id) {
  if (wins[id]) { wins[id].style.zIndex = ++z; return; }
  const a = APPS[id], w = wins[id] = document.createElement('section');
  const n = (Object.keys(wins).length % 8) * 28;
  w.className = 'win shadow';
  w.dataset.id = id;
  w.style.cssText = `width:${a.size[0]}px;height:${a.size[1]}px;left:${80 + n}px;top:${20 + n}px;z-index:${++z}`;
  w.innerHTML = `
    <header class="titlebar">
      <i class="bi ${a.icon}" style="color:${a.color}"></i><span class="flex-grow-1 small">${a.title}</span>
      <button data-act="min"><i class="bi bi-dash-lg"></i></button>
      <button data-act="max"><i class="bi bi-square"></i></button>
      <button data-act="close" class="close"><i class="bi bi-x-lg"></i></button>
    </header>
    <div class="content">${typeof a.body === 'function' ? a.body() : a.body}</div>`;
  $('#desktop').append(w);
  drag(w);
  $(`#apps [data-open="${id}"]`).classList.add('on');
  if (a.init) a.init();
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

function closeWin(w) {
  const id = w.dataset.id;
  clearInterval(timers[id]);
  $(`#apps [data-open="${id}"]`)?.classList.remove('on');
  delete wins[id];
  w.remove();
}

/* El botón X se escapa las primeras 5 veces */
function intentarCerrar(btn, w) {
  const i = (+btn.dataset.i || 0) + 1;
  btn.dataset.i = i;
  if (i < 6 && !piedad) {
    btn.style.position = 'relative';
    btn.style.left = -Math.random() * 120 + 'px';
    btn.style.top = Math.random() * 16 - 8 + 'px';
    aviso(rnd(['Casi... 😏', 'El botón está ocupado', 'Probá de nuevo', 'Guardá los cambios primero', 'Pedile permiso al Cordi']));
  } else closeWin(w);
}
function huir(b) {
  b.style.position = 'relative';
  b.style.left = Math.random() * 160 - 80 + 'px';
  b.style.top = Math.random() * 60 - 30 + 'px';
}

/* ── Calculadora (suma "aproximada") ── */
function calc(k) {
  if (expr === 'Error') expr = '';
  if (k === 'C') expr = '';
  else if (k === '⌫') expr = expr.slice(0, -1);
  else if (k === '=') {
    if (!expr) return;
    try {
      let r = Function('return ' + expr)();
      if (Number.isFinite(r) && Math.random() < .6) r++;
      expr = String(r);
      aviso('Resultado aproximado, como la nota');
    } catch { expr = 'Error'; }
  } else expr += k;
  $('#out').value = expr || '0';
}

/* ── Bloc de notas con autocorrección ── */
function corregir(caja) {
  const x = caja.value.replace(/tarea/gi, 'Netflix').replace(/estudiar/gi, 'dormir').replace(/prueba/gi, 'siesta')
    .replace(/matemática/gi, 'recreo').replace(/coordi/gi, 'Cordi 👀');
  if (x !== caja.value) { caja.value = x; aviso('Autocorrección aplicada ✅'); }
}
function falla() { aviso(rnd(['Archivo dañado 💀', 'Acceso denegado por el Cordi', 'No se puede abrir: falta el programa que lo abre', 'Se abrió... y se cerró solo'])); }

/* ── Funciones de las apps señuelo ── */
function simular() {
  $('#tk-led').textContent = '⏳'; $('#tk-msg').textContent = 'Simulando...';
  setTimeout(() => {
    const [l, m] = rnd([['🌑', 'El LED está al revés (de nuevo)'], ['🌑', 'Falta una resistencia de 220 ohm'], ['💥', 'La placa explotó. -3 puntos'], ['🌑', 'El cable está en el pin equivocado']]);
    if ($('#tk-led')) { $('#tk-led').textContent = l; $('#tk-msg').textContent = m; }
  }, 1500);
}
function reintentar() {
  $('#ch-msg').innerHTML = '<span class="spinner-border spinner-border-sm"></span> Reintentando...';
  setTimeout(() => {
    const m = $('#ch-msg'); if (!m) return;
    if (++reint < 3) m.textContent = 'Sigue sin internet. Probá con el WiFi del colegio 📶';
    else { m.textContent = '¡Hay internet! Pero solo para el profe 😎'; reint = 0; }
  }, 2000);
}
function ping() {
  const s = $('#pt-out'); s.innerHTML = 'C:\\&gt; ping 192.168.1.1';
  let i = 0;
  const t = setInterval(() => {
    if (!$('#pt-out')) return clearInterval(t);
    if (++i <= 4) s.innerHTML += '<br>Request timed out.';
    else { clearInterval(t); s.innerHTML += '<br>Perdidos: 4 (100%). Probá con el cable cruzado 🔌'; }
  }, 700);
}
function loginCisco() {
  modal('Cisco Networking Academy', 'Iniciá sesión para usar Packet Tracer.',
    'Iniciar sesión', () => {
      if (++intentosLogin < 3) { aviso('Servidor no responde (error 0xRED)'); setTimeout(loginCisco, 1200); }
      else aviso('Sesión iniciada 🎉 (ahora sí)');
    },
    'Registrarme', () => { aviso('Registro: formulario de 47 pasos...'); setTimeout(loginCisco, 1500); });
}

/* ── Errores en cadena con memes ── */
function errorFalso() {
  const e = document.createElement('section');
  e.className = 'win falso shadow';
  e.style.cssText = `z-index:${++z};left:${Math.max(0, Math.random() * (innerWidth - 290))}px;top:${30 + Math.random() * 90}px`;
  e.innerHTML = `<header class="titlebar"><i class="bi bi-exclamation-triangle-fill text-warning"></i><span class="small">Error crítico</span></header>
    <div class="content p-2"><img class="meme" src="${IMAGENES['m' + (1 + Math.floor(Math.random() * 8))]}">
    <p>${rnd(['Error 404: no se encontraron tus ganas de estudiar', 'Virus detectado: TAREA_PENDIENTE.exe', 'Memoria insuficiente: demasiados memes', 'Aviso: el Cordi te está mirando'])}</p>
    <button class="btn btn-primary btn-sm" onclick="okError(this)">Aceptar</button> <button class="btn btn-secondary btn-sm" onclick="okError(this)">Cancelar</button></div>`;
  $('#desktop').append(e);
}
function okError(b) {
  b.closest('.win').remove();
  if (++errores < 4 && !piedad) { errorFalso(); errorFalso(); }
}
function nuevaCadena() { errores = 0; errorFalso(); }

/* ── Apagar (pantalla azul) y arranque ── */
function apagar() {
  const azul = $('#azul');
  azul.style.display = 'block';
  let seg = 4;
  const t = setInterval(() => {
    seg--;
    $('#cuenta').textContent = seg > 0 ? 'Reiniciando en ' + seg + '...' : 'Buscando el cargador...';
    if (seg < -1) {
      clearInterval(t);
      azul.style.display = 'none';
      Object.values(timers).forEach(clearInterval);
      document.querySelectorAll('.win').forEach(w => w.remove());
      Object.keys(wins).forEach(k => delete wins[k]);
      document.querySelectorAll('#apps .on').forEach(b => b.classList.remove('on'));
      location.reload(); // reinicia de verdad: vuelve a la BIOS para elegir sistema
    }
  }, 1000);
}
function iniciar() {
  let p = 0;
  $('#boot').style.display = 'block';
  const t = setInterval(() => {
    p = Math.min(99, p + Math.random() * 10);
    $('#relleno').style.width = p + '%';
    $('#texto-boot').textContent = p >= 99 ? rnd(['Esperando que el Cordi pase lista...', 'Buscando la llave del aula...', 'Preguntándole a un compañero cómo se prende...', 'Casi listo (lo decimos desde 1998)']) : 'Cargando... ' + Math.floor(p) + '%';
  }, 500);
  setTimeout(() => {
    clearInterval(t);
    $('#boot').style.display = 'none';
    aviso('¡Bienvenido a ESET-OS! Tardó, pero llegó');
    setTimeout(nuevaCadena, 6000);
  }, 7000);
}

/* ── Eventos ── */
const openFrom = e => { const id = e.target.closest('[data-open]')?.dataset.open; if (id) openApp(id); };
$('#taskbar').onclick = openFrom;      // barra de tareas y menú Inicio: un clic
$('#desktop').ondblclick = openFrom;   // escritorio: doble clic

$('#desktop').onclick = e => {
  const t = e.target, btn = t.closest('[data-act]'), act = btn?.dataset.act, win = t.closest('.win');
  if (act === 'min') win.style.display = 'none';
  if (act === 'max') win.classList.toggle('max');
  if (act === 'close') intentarCerrar(btn, win);
  if (t.dataset.key) calc(t.dataset.key);
  if (t.dataset.wall) $('#desktop').style.background = t.dataset.wall === '3' ? `url(${IMAGENES.fondo}) center/cover` : WALLPAPERS[t.dataset.wall];
  if (t.id === 'dark') {
    const tema = () => (document.documentElement.dataset.bsTheme = t.checked ? 'dark' : 'light');
    tema();
    if (!piedad) setTimeout(() => { if (t.isConnected) { t.checked = !t.checked; tema(); aviso('El Cordi revirtió tu cambio de tema 👀'); } }, 2500);
  }
};
$('#desktop').onkeydown = e => {   // terminales de MySQL y JavaScript
  const inp = e.target.closest('.term-in');
  if (e.key !== 'Enter' || !inp) return;
  const t = $('#t-' + inp.dataset.t);
  t.innerHTML += '<br>&gt; ' + inp.value.replace(/</g, '&lt;') + '<br><span style="color:#f66">' + rnd(RESP[inp.dataset.t]) + '</span>';
  inp.value = ''; t.scrollTop = t.scrollHeight;
};

/* ── Armado: íconos, menú Inicio y barra salen de APPS ── */
const entries = Object.entries(APPS);
$('#desktop').innerHTML = entries.map(([id, a]) =>
  `<button class="icon" data-open="${id}"><i class="bi ${a.icon}" style="color:${a.color}"></i><span>${a.title}</span></button>`).join('');
$('#start').innerHTML = entries.map(([id, a]) =>
  `<li><button class="dropdown-item" data-open="${id}"><i class="bi ${a.icon} me-2" style="color:${a.color}"></i>${a.title}</button></li>`).join('') +
  `<li><hr class="dropdown-divider"></li>` +
  [['power', 'Apagar'], ['arrow-repeat', 'Reiniciar'], ['box-arrow-right', 'Cerrar sesión']].map(([i, t]) =>
    `<li><button class="dropdown-item" onclick="apagar()"><i class="bi bi-${i} me-2"></i>${t}</button></li>`).join('');
$('#apps').innerHTML = entries.map(([id, a]) =>
  `<button data-open="${id}" title="${a.title}"><i class="bi ${a.icon}" style="color:${a.color}"></i></button>`).join('');

const tick = () => ($('#clock').textContent = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
tick();
setInterval(tick, 1000);

/* ── Lo más tilteante ── */
// 1) Actualización falsa: llega a 99% y deshace todo
function actualizar() {
  if (piedad) return;
  const u = $('#upd');
  u.style.display = 'flex';
  let p = 0, fase = 0, esperas = 0;
  const t = setInterval(() => {
    if (fase === 0) {
      p += 4;
      if (p >= 99) {
        p = 99; $('#upd-t').textContent = 'Ya casi... (99%)';
        if (++esperas > 8) { fase = 1; $('#upd-t').textContent = 'No se pudo completar. Deshaciendo cambios'; }
      }
    } else {
      p -= 6;
      if (p <= 0) { clearInterval(t); u.style.display = 'none'; aviso('Actualización fallida. Se programó otra 🙃'); setTimeout(actualizar, 90000); }
    }
    $('#upd-b').style.width = Math.max(p, 0) + '%';
  }, 400);
}
setTimeout(actualizar, 75000);

// 2) Los íconos del escritorio cambian de lugar solos
setInterval(() => {
  if (piedad) return;
  document.querySelectorAll('.icon').forEach(i => (i.style.order = Math.floor(Math.random() * 20)));
  aviso('Se reorganizaron tus iconos (de nada)');
}, 35000);

// 3) Cartelito de error cada 6 clics en cualquier lado
document.body.addEventListener('click', () => { if (++clicks % 6 === 0 && !piedad) errorFalso(); });

// 4) Cursor falso que llega tarde (solo con mouse)
if (matchMedia('(pointer: fine)').matches) {
  const cur = $('#cursor');
  let cx = 0, cy = 0, mx = 0, my = 0;
  document.body.classList.add('lag');
  cur.style.display = 'block';
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function seguir() {
    cx += (mx - cx) * .15; cy += (my - cy) * .15;
    cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
    requestAnimationFrame(seguir);
  })();
}

// 5) Modo piedad: los primeros 2 clics no funcionan, el tercero sí
function modoPiedad() {
  if (++piedadClicks === 1) aviso('Pedile permiso al Cordi 🙄');
  else if (piedadClicks === 2) aviso('Falta la firma de la planilla ✍️');
  else {
    piedad = true;
    document.body.classList.remove('lag');
    $('#cursor').style.display = 'none';
    aviso('Modo piedad activado 🙏 (se terminó el tilteo)');
  }
}

// 6) Notificaciones, batería y título de pestaña
const notis = ['Preceptoría: mañana revisan las carpetas', 'El profe de Matemática te dejó en visto', 'Recordatorio: hoy había que traer la escuadra', 'WiFi desconectado', 'Tu compañero te pide la tarea (otra vez)'];
setInterval(() => { if (!piedad) aviso(rnd(notis)); }, 22000);
setTimeout(() => aviso('Batería al 1%: conectá el cargador'), 45000);
let tit = 0;
setInterval(() => { tit = 1 - tit; document.title = tit ? '(No responde) ESET-OS 98' : 'ESET-OS 98 · Edición Tilt'; }, 3000);

iniciar();
