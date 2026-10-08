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
  padding: 16px 24px;
  width: max-content;
  height: max-content;
  overflow-y: auto;
  pointer-events: auto; /* allow scrolling if needed */
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
#data-view ul {
  margin: 0;
  padding-left: 18px;
}
#data-view li {
  margin-bottom: 6px;
}
#data-view li:last-child {
  margin-bottom: 0;
}
\`;
document.head.appendChild(_style);

const gameFacts = {
  ac1: "<ul><li>Introduced the core parkour and social stealth mechanics that defined the entire series.</li><li>First use of the iconic hidden blade and Eagle Vision for gathering intelligence on targets.</li></ul>",
  ac2: "<ul><li>Massively expanded the economy system, allowing players to invest in and upgrade their own villa (Monteriggioni).</li><li>Introduced dual hidden blades, swimming, and various inventions crafted by Leonardo da Vinci.</li></ul>",
  bro: "<ul><li>First game to feature a chain-kill mechanic for rapid, fluid combat encounters.</li><li>Introduced the ability to recruit citizens and call upon a brotherhood of NPC assassins in battle.</li><li>First entry to feature competitive multiplayer.</li></ul>",
  rev: "<ul><li>Added the hookblade for much faster climbing and zipline traversal.</li><li>Featured a tower-defense minigame to protect Assassin dens.</li><li>Introduced the crafting of custom bombs with various tactical effects.</li></ul>",
  ac3: "<ul><li>Pioneered the series' acclaimed naval combat and ship exploration mechanics.</li><li>Introduced tree-running, wilderness hunting, and tools like the rope dart.</li><li>Included a dynamic seasonal weather system impacting traversal.</li></ul>",
  lib: "<ul><li>Features a unique Persona system allowing the protagonist to swap between Assassin, Lady, and Slave outfits, each with distinct stealth benefits and restrictions.</li><li>Originally launched as a PlayStation Vita exclusive before receiving HD ports.</li></ul>",
  bf: "<ul><li>Expanded naval gameplay into a massive open-world pirate experience.</li><li>Players can seamlessly board enemy ships, hunt sea life with harpoons, and dive for underwater wrecks.</li></ul>",
  rog: "<ul><li>First game where the player fully experiences the story from the perspective of an Assassin-turned-Templar.</li><li>Features frozen environments where swimming damages the player and icebergs can be shattered for tactical naval advantages.</li></ul>",
  uni: "<ul><li>Completely revamped the parkour system with dedicated 'parkour up' and 'parkour down' mechanics for incredibly fluid building traversal.</li><li>First to feature 4-player cooperative multiplayer missions.</li><li>Showcased a stunningly dense, 1:1 scale recreation of a major city.</li></ul>",
  syn: "<ul><li>Introduced dual playable protagonists (twins) that can be swapped dynamically during free roam.</li><li>Added the rope launcher for rapid ziplining across the unusually wide streets of the era.</li><li>Featured horse-drawn carriages for chaotic chases and mobile hiding spots.</li></ul>",
  ori: "<ul><li>Marked the series' dramatic shift into an action-RPG format, abandoning counter-kills for hit-box based combat, skill trees, and loot tiers.</li><li>Replaced the traditional minimap with a compass and a playable eagle companion for aerial scouting.</li></ul>",
  ody: "<ul><li>First game to offer a choice between male and female protagonists at the start of the game.</li><li>Introduced branching dialogue options leading to multiple possible endings.</li><li>Featured massive, large-scale conquest battles resembling classic warfare.</li></ul>",
  val: "<ul><li>Blended stealth and RPG mechanics with Viking raids and settlement building.</li><li>Replaced traditional map-cluttering side quests with organic 'World Events'.</li><li>Introduced a visceral dual-wielding system for almost any weapon combination (even dual shields!).</li></ul>",
  mir: "<ul><li>A deliberate return to the series' roots, stripping back RPG elements in favor of classic social stealth, tools, and parkour.</li><li>Introduced the 'Assassin\\'s Focus' ability to mark and execute multiple targets in a rapid sequence.</li></ul>",
  sha: "<ul><li>Set in the highly requested Feudal Japan era.</li><li>Features dual protagonists with radically opposed playstyles: a stealth-focused shinobi and a combat-heavy samurai.</li><li>Introduces a dynamic light and shadow system affecting stealth visibility.</li></ul>",
  res: "<ul><li>A highly anticipated modern remake of the beloved pirate classic.</li><li>Expected to feature modernized combat and traversal mechanics while retaining the iconic naval warfare of the original.</li></ul>",
  chn: "<ul><li>Shifts the traditional open world into a vibrant 2.5D side-scrolling stealth platformer.</li><li>Features a unique art style heavily inspired by traditional 16th-century Chinese brush paintings.</li></ul>",
  ind: "<ul><li>A colorful 2.5D platformer utilizing unique Sikh weaponry like the chakram.</li><li>Art style mimics 19th-century British colonial journalism mixed with incredibly vivid colors.</li></ul>",
  rus: "<ul><li>A 2.5D platformer set in the modern era, incorporating firearms and sniper rifles into the gameplay loop.</li><li>Heavily utilizes a striking propaganda-poster art style characterized by stark reds, blacks, and greys.</li></ul>",
  nex: "<ul><li>The first fully immersive Virtual Reality entry in the franchise.</li><li>Allows players to literally perform the Leap of Faith and physicalize parkour and combat as three iconic past assassins.</li></ul>",
  forli: "<ul><li>An expansion featuring intense defensive battles protecting a fortified city.</li><li>Allows players to use Leonardo\\'s flying machine over the Romagna wetlands at will.</li></ul>",
  bonf: "<ul><li>Grants a new traversal move (the spring-jump) for wider gaps.</li><li>Involves a tactical campaign to dismantle lieutenants across a district without alerting guards.</li></ul>",
  dav: "<ul><li>A story expansion focusing on solving complex artistic and mathematical puzzles left by Leonardo da Vinci.</li><li>Introduced the Hermeticists as a brand new enemy faction.</li></ul>",
  lost: "<ul><li>A puzzle-platformer experience told entirely in the first-person perspective inside the Animus.</li><li>Focuses on placing blocks and lasers to navigate abstract geometry and uncover lore.</li></ul>",
  tyr: "<ul><li>Explores a wildly different alternate history timeline.</li><li>Grants the player supernatural animal powers (like the Cloak of the Wolf and Flight of the Eagle) rather than traditional gear.</li></ul>"
};

const _origDetail = detail;
detail = function() {
  _origDetail();
  if (typeof sel !== 'undefined' && sel) {
    _sv.innerHTML = '<img src="screenshots/' + sel.id + '.jpg" onerror="this.parentElement.className=\\'\\'\" onload="this.parentElement.className=\\'show\\'; document.getElementById(\\'data-view\\').className=\\'show\\'">';
    
    const facts = gameFacts[sel.id] || '<ul><li>Experience the Animus in a brand new location and era.</li></ul>';
    _dv.innerHTML = '<div style="opacity:0.6; letter-spacing:0.1em; text-transform:uppercase; font-size:11px; margin-bottom:10px; color:#8590a8; text-align:center;">Points of Interest</div><div style="font-size:13.5px; text-align:left; line-height: 1.5; color:#c3cbdc;">' + facts + '</div>';
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
