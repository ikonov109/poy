const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9fbcd4, 0.02);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const light = new THREE.DirectionalLight(0xffffff, 0.9);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x888888));

const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x228833 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Procedural texture helpers
function makeSausageTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // base gradient (casing)
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, '#7b1010');
  g.addColorStop(0.5, '#c33a3a');
  g.addColorStop(1, '#7a0d0d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // light sheen
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,200,160,0.06)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 60 + 20;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.25, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // speckles
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.18})`;
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 1.2);
  tex.anisotropy = maxAniso;
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

function makeSausageBump() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 800; i++) {
    const g = ctx.createRadialGradient(Math.random() * size, Math.random() * size, 0, Math.random() * size, Math.random() * size, Math.random() * 8 + 2);
    const v = Math.random() * 60 + 100;
    g.addColorStop(0, `rgba(${v},${v},${v},0.14)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 8 + 2, 0, Math.PI * 2);
    ctx.fill();
  }
  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(4, 1.2);
  bump.anisotropy = maxAniso;
  bump.encoding = THREE.LinearEncoding;
  bump.minFilter = THREE.LinearMipmapLinearFilter;
  bump.magFilter = THREE.LinearFilter;
  bump.generateMipmaps = true;
  bump.needsUpdate = true;
  return bump;
}

function makeCatTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  // base fur color (warm tabby tone)
  ctx.fillStyle = '#d0ad81';
  ctx.fillRect(0, 0, size, size);

  // add directional fur strokes (more concentrated vertically to imitate fur flow)
  ctx.lineCap = 'round';
  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = Math.random() * 14 + 4;
    // fur direction slightly vertical with random tilt
    const angle = (Math.random() - 0.5) * 0.6 + (Math.random() < 0.5 ? -0.2 : 0.2);
    const shadeBase = 40 + Math.random() * 60;
    const r = Math.min(220, shadeBase + Math.random() * 30);
    const g = Math.min(180, shadeBase + Math.random() * 10);
    const b = Math.min(140, shadeBase - Math.random() * 40);
    ctx.strokeStyle = `rgba(${r},${g},${b},${Math.random() * 0.12 + 0.04})`;
    ctx.lineWidth = Math.random() * 1.4 + 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * len * 0.6, y + Math.cos(angle) * len);
    ctx.stroke();
  }

  // add subtle tabby stripes
  ctx.fillStyle = 'rgba(80,50,30,0.12)';
  for (let i = 0; i < 60; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const w = Math.random() * 220 + 80;
    const h = Math.random() * 40 + 20;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((Math.random() - 0.5) * 0.6);
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // draw a simple face on the texture center (so box head shows eyes/nose)
  const faceX = size * 0.5;
  const faceY = size * 0.45;
  const faceW = size * 0.36;
  const faceH = size * 0.36;

  // ears (darker triangles)
  ctx.fillStyle = 'rgba(80,50,30,0.28)';
  ctx.beginPath();
  ctx.moveTo(faceX - faceW * 0.4, faceY - faceH * 0.6);
  ctx.lineTo(faceX - faceW * 0.15, faceY - faceH * 0.15);
  ctx.lineTo(faceX - faceW * 0.7, faceY - faceH * 0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(faceX + faceW * 0.4, faceY - faceH * 0.6);
  ctx.lineTo(faceX + faceW * 0.15, faceY - faceH * 0.15);
  ctx.lineTo(faceX + faceW * 0.7, faceY - faceH * 0.2);
  ctx.fill();

  // eyes
  const eyeW = faceW * 0.14;
  const eyeH = faceH * 0.18;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(faceX - faceW * 0.16, faceY - faceH * 0.04, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(faceX + faceW * 0.16, faceY - faceH * 0.04, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();
  // pupils
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath(); ctx.ellipse(faceX - faceW * 0.16, faceY - faceH * 0.04, eyeW * 0.35, eyeH * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(faceX + faceW * 0.16, faceY - faceH * 0.04, eyeW * 0.35, eyeH * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  // small highlights
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillRect(faceX - faceW * 0.175, faceY - faceH * 0.06, 6, 6);
  ctx.fillRect(faceX + faceW * 0.145, faceY - faceH * 0.06, 6, 6);

  // nose
  ctx.fillStyle = '#e08888';
  ctx.beginPath();
  ctx.moveTo(faceX, faceY + faceH * 0.03);
  ctx.lineTo(faceX - 12, faceY + faceH * 0.08);
  ctx.lineTo(faceX + 12, faceY + faceH * 0.08);
  ctx.closePath();
  ctx.fill();

  // whiskers
  ctx.strokeStyle = 'rgba(240,240,240,0.8)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const yOff = faceY + faceH * 0.08 + i * 6;
    ctx.beginPath();
    ctx.moveTo(faceX - 6, yOff);
    ctx.quadraticCurveTo(faceX - faceW * 0.2, yOff - 6, faceX - faceW * 0.45, yOff - 2 - i * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(faceX + 6, yOff);
    ctx.quadraticCurveTo(faceX + faceW * 0.2, yOff - 6, faceX + faceW * 0.45, yOff - 2 - i * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = maxAniso;
  tex.encoding = THREE.sRGBEncoding;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

function makeCatEmissive() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size, size);
  // eyes area white to emit
  const cx = size * 0.5;
  const cy = size * 0.45;
  const eyeW = size * 0.14;
  const eyeH = size * 0.16;
  ctx.fillStyle = 'rgb(255,230,160)';
  ctx.beginPath(); ctx.ellipse(cx - size * 0.16, cy - size * 0.04, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + size * 0.16, cy - size * 0.04, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function makeCatFaceTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, size, size);

  // centered big face
  const faceX = size * 0.5;
  const faceY = size * 0.5;
  const faceW = size * 0.78;
  const faceH = size * 0.78;

  ctx.fillStyle = '#d0ad81';
  ctx.beginPath(); ctx.ellipse(faceX, faceY, faceW * 0.5, faceH * 0.5, 0, 0, Math.PI * 2); ctx.fill();

  // eyes
  const eyeW = faceW * 0.14;
  const eyeH = faceH * 0.16;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(faceX - faceW * 0.16, faceY - faceH * 0.04, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(faceX + faceW * 0.16, faceY - faceH * 0.04, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath(); ctx.ellipse(faceX - faceW * 0.16, faceY - faceH * 0.04, eyeW * 0.35, eyeH * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(faceX + faceW * 0.16, faceY - faceH * 0.04, eyeW * 0.35, eyeH * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillRect(faceX - faceW * 0.175, faceY - faceH * 0.06, 8, 8);
  ctx.fillRect(faceX + faceW * 0.145, faceY - faceH * 0.06, 8, 8);

  // nose
  ctx.fillStyle = '#e08888';
  ctx.beginPath();
  ctx.moveTo(faceX, faceY + faceH * 0.03);
  ctx.lineTo(faceX - 18, faceY + faceH * 0.08);
  ctx.lineTo(faceX + 18, faceY + faceH * 0.08);
  ctx.closePath();
  ctx.fill();

  // whiskers
  ctx.strokeStyle = 'rgba(240,240,240,0.9)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const yOff = faceY + faceH * 0.08 + i * 10;
    ctx.beginPath();
    ctx.moveTo(faceX - 8, yOff);
    ctx.quadraticCurveTo(faceX - faceW * 0.22, yOff - 8, faceX - faceW * 0.46, yOff - 6 - i * 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(faceX + 8, yOff);
    ctx.quadraticCurveTo(faceX + faceW * 0.22, yOff - 8, faceX + faceW * 0.46, yOff - 6 - i * 4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = maxAniso;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function makeCatBump() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  // create subtle grayscale bump to simulate fur direction
  ctx.fillStyle = '#7f7f7f';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = Math.random() * 8 + 2;
    ctx.lineWidth = Math.random() * 1.4 + 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 1.2, y + len);
    ctx.stroke();
  }
  // add a bit of darker contour near center face region
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.45, size * 0.22, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);
  bump.needsUpdate = true;
  bump.anisotropy = maxAniso;
  bump.encoding = THREE.LinearEncoding;
  bump.minFilter = THREE.LinearMipmapLinearFilter;
  bump.magFilter = THREE.LinearFilter;
  bump.generateMipmaps = true;
  return bump;
}

// create procedural textures and materials
const sausageMap = makeSausageTexture();
const sausageBump = makeSausageBump();
const catMap = makeCatTexture();
const catBump = makeCatBump();

const catEmissive = makeCatEmissive();
const catFaceMap = makeCatFaceTexture();

// Body material (uses repeating fur texture)
catMap.repeat.set(1.0, 1.2);
const playerBodyMat = new THREE.MeshStandardMaterial({ map: catMap, bumpMap: catBump, bumpScale: 0.05, roughness: 0.92, metalness: 0.02 });
// Head material: uses face texture so face is centered on head UVs
const playerHeadMat = new THREE.MeshStandardMaterial({ map: catFaceMap, emissiveMap: catEmissive, emissive: 0x222222, emissiveIntensity: 0.9, roughness: 0.7 });

// Player as group (body + head) for better texture mapping
const playerGroup = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.4), playerBodyMat);
body.position.y = 0.3;
playerGroup.add(body);
const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), playerHeadMat);
head.position.y = 0.9;
playerGroup.add(head);
playerGroup.name = 'player';
scene.add(playerGroup);
const player = playerGroup;

// Sausage material: align texture so stripes run along the cylinder axis
sausageMap.center.set(0.5, 0.5);
sausageMap.rotation = Math.PI / 2;
const sausageMat = new THREE.MeshStandardMaterial({ map: sausageMap, bumpMap: sausageBump, bumpScale: 0.12, roughness: 0.5, metalness: 0.02 });
const sausage = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 24, 1, true), sausageMat);
sausage.rotation.z = Math.PI / 2;
sausage.position.set(8, 0.25, 0);
scene.add(sausage);

// NPC as group (body + head) to match player mapping
const npcGroup = new THREE.Group();
const npcBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.4), new THREE.MeshStandardMaterial({ map: catMap, bumpMap: catBump, bumpScale: 0.05, roughness: 0.92 }));
npcBody.position.y = 0.3;
npcGroup.add(npcBody);
const npcHead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), new THREE.MeshStandardMaterial({ map: catFaceMap, emissiveMap: catEmissive, emissive: 0x222222, emissiveIntensity: 0.8, roughness: 0.7 }));
npcHead.position.y = 0.9;
npcGroup.add(npcHead);
npcGroup.position.set(-20, 0, -20);
npcGroup.visible = false;
scene.add(npcGroup);
const npcCat = npcGroup;

const safeZone = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
safeZone.position.set(-18, 1.2, -18);
scene.add(safeZone);

camera.position.set(0, 5, -7);

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

let gameOver = false;
let victory = false;
let startTime = performance.now();

const hudMessage = document.getElementById('message');
const restartBtn = document.getElementById('restart');
restartBtn.addEventListener('click', () => location.reload());

function updatePlayer(dt) {
  const speed = 5;
  const dir = new THREE.Vector3();
  if (keys['w'] || keys['arrowup']) dir.z -= 1;
  if (keys['s'] || keys['arrowdown']) dir.z += 1;
  if (keys['a'] || keys['arrowleft']) dir.x -= 1;
  if (keys['d'] || keys['arrowright']) dir.x += 1;
  if (dir.lengthSq() > 0) {
    dir.normalize();
    player.position.x += dir.x * speed * dt;
    player.position.z += dir.z * speed * dt;
    const angle = Math.atan2(dir.x, dir.z);
    player.rotation.y = angle;
  }
}

function updateSausage(dt) {
  const target = player.position.clone();
  const dir = target.sub(sausage.position);
  const dist = dir.length();
  if (dist > 0.2) {
    dir.normalize();
    const chaseSpeed = THREE.MathUtils.lerp(1.2, 4.0, Math.min(1, (performance.now() - startTime) / 20000));
    sausage.position.add(dir.multiplyScalar(chaseSpeed * dt));
  }
}

function updateNpc(dt) {
  if (!npcCat.visible) return;
  const dir = sausage.position.clone().sub(npcCat.position);
  const dist = dir.length();
  if (dist > 0.3) {
    dir.normalize();
    npcCat.position.add(dir.multiplyScalar(3 * dt));
  } else {
    scene.remove(sausage);
    npcCat.visible = false;
    victory = true;
    showMessage('Поздравляем! Другой кот съел колбасу.');
  }
}

function showMessage(text) {
  hudMessage.textContent = text;
  hudMessage.classList.remove('hidden');
  restartBtn.classList.remove('hidden');
}

function animate() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - (animate._last || now)) / 1000);
  animate._last = now;
  if (!gameOver && !victory) {
    updatePlayer(dt);
    updateSausage(dt);
    const d = player.position.distanceTo(sausage.position);
    if (d < 0.9) {
      gameOver = true;
      showMessage('Пойман! Колбаса тебя догнала.');
    }
    if (player.position.distanceTo(safeZone.position) < 1.5) {
      triggerNpcArrival();
    }
    if ((now - startTime) / 1000 > 55) {
      triggerNpcArrival();
    }
  }
  updateNpc(dt);
  camera.position.lerp(new THREE.Vector3(player.position.x, player.position.y + 4.5, player.position.z - 7), 0.1);
  camera.lookAt(player.position.x, player.position.y + 0.8, player.position.z);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function triggerNpcArrival() {
  if (npcCat.visible) return;
  npcCat.position.set(player.position.x - 6, 0.3, player.position.z - 6);
  npcCat.visible = true;
  showMessage('Прибыл другой кот! Он съедает колбасу...');
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
