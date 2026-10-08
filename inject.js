const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace('</script></body></html>', '').trim();

// Remove the old buggy script we just added
const marker = "const _svLineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');";
const idx = content.lastIndexOf(marker);
if (idx > -1) {
  content = content.substring(0, idx).trim();
}

const newScript = `
const _svLineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
_svLineSvg.id = 'screenshot-line-svg';
_svLineSvg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:9; opacity:0; transition:opacity .4s;';
const _svLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
_svLine.setAttribute('stroke', 'rgba(124,196,255,0.8)');
_svLine.setAttribute('stroke-width', '2');
_svLine.setAttribute('stroke-dasharray', '4 3');
_svLineSvg.appendChild(_svLine);
document.getElementById('stage').appendChild(_svLineSvg);

const _sv = document.createElement('div');
_sv.id = 'screenshot-view';
document.getElementById('stage').appendChild(_sv);

const _style = document.createElement('style');
_style.textContent = \`
#screenshot-view {
  position: absolute;
  width: 320px;
  height: 180px;
  border-radius: 12px;
  border: 2px solid rgba(124,196,255,0.7);
  pointer-events: none;
  opacity: 0;
  transition: opacity .4s, transform .4s;
  transform: scale(.95);
  background: #0a0e17;
  box-shadow: 0 8px 32px rgba(0,0,0,.6);
  z-index: 10;
  overflow: hidden;
}
#screenshot-view.show {
  opacity: 1;
  transform: scale(1);
}
#screenshot-view img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (max-width: 820px) {
  #screenshot-view {
    width: 240px;
    height: 135px;
  }
}
\`;
document.head.appendChild(_style);

const _origDetail = detail;
detail = function() {
  _origDetail();
  if (typeof sel !== 'undefined' && sel) {
    _sv.innerHTML = '<img src="screenshots/' + sel.id + '.jpg" onerror="this.parentElement.className=\\'\\'" onload="this.parentElement.className=\\'show\\'">';
  } else {
    _sv.className = '';
  }
};
if (typeof sel !== 'undefined' && sel) detail();

function updateScreenshotFloat() {
  requestAnimationFrame(updateScreenshotFloat);
  if (typeof sel !== 'undefined' && sel && _sv.classList.contains('show')) {
    const c = [-rot[0], -rot[1]];
    const dist = d3.geoDistance([sel.lon, sel.lat], c);
    
    if (dist > 1.5) {
      _sv.style.opacity = '0';
      _svLineSvg.style.opacity = '0';
      return;
    } else {
      _sv.style.opacity = '1';
      _svLineSvg.style.opacity = '1';
    }
    
    const p = proj([sel.lon, sel.lat]);
    const cx = p[0];
    const cy = p[1];
    
    const w = _sv.offsetWidth || 320;
    const h = _sv.offsetHeight || 180;
    const offset = 40;
    
    let left = cx + offset;
    let top = cy - h - offset;
    
    if (left + w > W) left = cx - w - offset;
    if (top < 0) top = cy + offset;
    
    _sv.style.left = left + 'px';
    _sv.style.top = top + 'px';
    
    let cornerX = (left > cx) ? left : left + w;
    let cornerY = (top > cy) ? top : top + h;
    
    _svLine.setAttribute('x1', cx);
    _svLine.setAttribute('y1', cy);
    _svLine.setAttribute('x2', cornerX);
    _svLine.setAttribute('y2', cornerY);
  } else {
    _sv.style.opacity = '0';
    _svLineSvg.style.opacity = '0';
  }
}
requestAnimationFrame(updateScreenshotFloat);
</script></body></html>
`;
fs.writeFileSync('index.html', content + '\n' + newScript);
