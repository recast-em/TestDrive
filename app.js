const workspace = document.getElementById('workspace');
const connectionsSvg = document.getElementById('connections');
const addBtn = document.getElementById('add');

let entities = 0;
const connections = [];
let dragObj = null;
let dragOffset = {x:0, y:0};
let linkLine = null;
let linkStart = null;

addBtn.addEventListener('click', () => {
  createEntity(60 + entities*20, 60 + entities*20);
});

function createEntity(x, y) {
  entities++;
  const el = document.createElement('div');
  el.className = 'entity';
  el.style.left = x + 'px';
  el.style.top = y + 'px';

  el.innerHTML = `<div class="title">Entität ${entities}</div>`;

  const types = ['event','data','file'];
  types.forEach((type, i) => {
    const top = 30 + i*25;
    const input = document.createElement('div');
    input.className = `connector input ${type}`;
    input.style.top = top + 'px';
    input.dataset.type = type;
    input.dataset.mode = 'input';
    el.appendChild(input);

    const output = document.createElement('div');
    output.className = `connector output ${type}`;
    output.style.top = top + 'px';
    output.dataset.type = type;
    output.dataset.mode = 'output';
    el.appendChild(output);

    [input, output].forEach(conn => {
      conn.addEventListener('mousedown', startLink);
    });
  });

  el.addEventListener('mousedown', startDrag);

  workspace.appendChild(el);
}

function startDrag(e) {
  if (e.target.classList.contains('connector')) return;
  dragObj = e.currentTarget;
  const rect = dragObj.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);
}

function doDrag(e) {
  if (!dragObj) return;
  dragObj.style.left = (e.pageX - dragOffset.x) + 'px';
  dragObj.style.top = (e.pageY - dragOffset.y) + 'px';
  updateConnections();
}

function stopDrag() {
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', stopDrag);
  dragObj = null;
}

function startLink(e) {
  e.stopPropagation();
  linkStart = e.target;
  const p = center(linkStart);
  linkLine = createLine(p.x, p.y, p.x, p.y);
  document.addEventListener('mousemove', drawTempLink);
  document.addEventListener('mouseup', finishLink);
}

function drawTempLink(e) {
  if (!linkLine) return;
  setLine(linkLine, null, null, e.pageX, e.pageY);
}

function finishLink(e) {
  document.removeEventListener('mousemove', drawTempLink);
  document.removeEventListener('mouseup', finishLink);
  const target = e.target;
  if (target.classList && target.classList.contains('connector') &&
      target.dataset.mode !== linkStart.dataset.mode &&
      target.dataset.type === linkStart.dataset.type) {
    const start = center(linkStart);
    const end = center(target);
    setLine(linkLine, start.x, start.y, end.x, end.y);
    connections.push({line: linkLine, from: linkStart, to: target});
  } else {
    connectionsSvg.removeChild(linkLine);
  }
  linkLine = null;
  linkStart = null;
}

function updateConnections() {
  connections.forEach(c => {
    const s = center(c.from);
    const t = center(c.to);
    setLine(c.line, s.x, s.y, t.x, t.y);
  });
}

function createLine(x1, y1, x2, y2) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  setLine(line, x1, y1, x2, y2);
  line.setAttribute('stroke', '#000');
  line.setAttribute('stroke-width', '2');
  connectionsSvg.appendChild(line);
  return line;
}

function setLine(line, x1, y1, x2, y2) {
  if (x1 !== null) line.setAttribute('x1', x1);
  if (y1 !== null) line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
}

function center(el) {
  const r = el.getBoundingClientRect();
  return {x: r.left + r.width/2 + window.scrollX, y: r.top + r.height/2 + window.scrollY};
}

// create initial entity
createEntity(80,80);
createEntity(300,180);
