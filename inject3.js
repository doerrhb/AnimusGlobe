const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace('</script></body></html>', '').trim();

// Remove the old injected script
const marker = "const _svLineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');";
const idx = content.lastIndexOf(marker);
if (idx > -1) {
  content = content.substring(0, idx).trim();
}

const newScript = `
const _svLineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
_svLineSvg.id = 'screenshot-line-svg';
_svLineSvg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:9; opacity:0; transition:opacity .2s;';

const _svLineTop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
_svLineTop.setAttribute('stroke', 'rgba(124,196,255,0.8)');
_svLineTop.setAttribute('stroke-width', '2');
_svLineTop.setAttribute('stroke-dasharray', '4 3');
_svLineSvg.appendChild(_svLineTop);

const _svLineBot = document.createElementNS('http://www.w3.org/2000/svg', 'line');
_svLineBot.setAttribute('stroke', 'rgba(124,196,255,0.8)');
_svLineBot.setAttribute('stroke-width', '2');
_svLineBot.setAttribute('stroke-dasharray', '4 3');
_svLineSvg.appendChild(_svLineBot);

document.getElementById('stage').appendChild(_svLineSvg);

const _sv = document.createElement('div');
_sv.id = 'screenshot-view';
document.getElementById('stage').appendChild(_sv);

const _dv = document.createElement('div');
_dv.id = 'data-view';
_dv.innerHTML = '<div style="opacity:0.8; letter-spacing:0.1em; text-transform:uppercase; font-size:12px; margin-bottom:8px; color:#8590a8;">Location Data</div><div style="font-size:16px;">Generic Game Details</div>';
document.getElementById('stage').appendChild(_dv);

const _style = document.createElement('style');
_style.textContent = \`
#screenshot-view, #data-view {
  position: absolute;
  left: 50%;
  max-width: calc(100% - 48px);
  border-radius: 12px;
  border: 2px solid rgba(124,196,255,0.7);
  pointer-events: none;
  opacity: 0;
  transition: opacity .4s, transform .4s;
  background: #0a0e17;
  box-shadow: 0 12px 40px rgba(0,0,0,.6);
  z-index: 10;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
#screenshot-view {
  top: 24px;
  transform: translateX(-50%) translateY(-10px);
  max-height: calc(33.33% - 36px);
  width: max-content;
  height: max-content;
}
#data-view {
  bottom: 24px;
  transform: translateX(-50%) translateY(10px);
  max-height: calc(33.33% - 36px);
  color: #e9edf6;
  text-align: center;
  padding: 16px 24px;
  width: max-content;
  height: max-content;
}
#screenshot-view.show, #data-view.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
#screenshot-view.faded, #data-view.faded, #screenshot-line-svg.faded {
  opacity: 0 !important;
  transition: opacity .2s;
}
#screenshot-view img {
  display: block;
  max-width: 100%;
  max-height: calc(33.33vh - 36px);
  width: auto;
  height: auto;
  object-fit: contain;
}
\`;
document.head.appendChild(_style);

const _origDetail = detail;
detail = function() {
  _origDetail();
  if (typeof sel !== 'undefined' && sel) {
    _sv.innerHTML = '<img src="screenshots/' + sel.id + '.jpg" onerror="this.parentElement.className=\\'\\'\" onload="this.parentElement.className=\\'show\\'; document.getElementById(\\'data-view\\').className=\\'show\\'">';
  } else {
    _sv.className = '';
    _dv.className = '';
  }
};
if (typeof sel !== 'undefined' && sel) detail();

function updateScreenshotFloat() {
  requestAnimationFrame(updateScreenshotFloat);
  
  const isMoving = (typeof fly !== 'undefined' && fly) || (typeof drag !== 'undefined' && drag);
  
  if (typeof sel !== 'undefined' && sel && _sv.classList.contains('show')) {
    const c = [-rot[0], -rot[1]];
    const dist = d3.geoDistance([sel.lon, sel.lat], c);
    
    if (dist > 1.5 || isMoving) {
      _sv.classList.add('faded');
      _dv.classList.add('faded');
      _svLineSvg.classList.add('faded');
      return;
    } else {
      _sv.classList.remove('faded');
      _dv.classList.remove('faded');
      _svLineSvg.classList.remove('faded');
    }
    
    const p = proj([sel.lon, sel.lat]);
    const cx = p[0];
    const cy = p[1];
    
    const stageRect = document.getElementById('stage').getBoundingClientRect();
    const topBoxRect = _sv.getBoundingClientRect();
    const botBoxRect = _dv.getBoundingClientRect();
    
    const topBoxBottomY = topBoxRect.bottom - stageRect.top;
    const topBoxCenterX = topBoxRect.left - stageRect.left + topBoxRect.width / 2;
    
    _svLineTop.setAttribute('x1', cx);
    _svLineTop.setAttribute('y1', cy);
    _svLineTop.setAttribute('x2', topBoxCenterX);
    _svLineTop.setAttribute('y2', topBoxBottomY);
    
    const botBoxTopY = botBoxRect.top - stageRect.top;
    const botBoxCenterX = botBoxRect.left - stageRect.left + botBoxRect.width / 2;
    
    _svLineBot.setAttribute('x1', cx);
    _svLineBot.setAttribute('y1', cy);
    _svLineBot.setAttribute('x2', botBoxCenterX);
    _svLineBot.setAttribute('y2', botBoxTopY);
    
  } else {
    _sv.classList.add('faded');
    _dv.classList.add('faded');
    _svLineSvg.classList.add('faded');
  }
}
requestAnimationFrame(updateScreenshotFloat);
</script></body></html>
`;
fs.writeFileSync('index.html', content + '\n' + newScript);
