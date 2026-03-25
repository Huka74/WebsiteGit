import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { MarchingCubes } from 'MarchingCubes';

// === Scene setup ===

const container = document.getElementById('threejs-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  45,
  container.offsetWidth / container.offsetHeight,
  0.1,
  100
);
camera.position.set(0, 0, 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Lighting ===
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 0.8);
directional.position.set(1, 1, 1);
scene.add(directional);

// === Define your scalar field ===
let n = 1;
let l = 0;
let m = 0;

function f(n, l, m, x, y, z) {
  // const n = 4;
  // const l = 1;
  // const m = 0;

  let a = 50;
  x *= a;
  y *= a;
  z *= a;

  const r = Math.sqrt(x*x+y*y+z*z);
  const t = Math.acos(z/r);
  const p = Math.atan2(y,x);
  
  return phi(r,t,p,n,l,m);
}

function phi(r,theta,phi,n,l,m){
  return Math.exp(-r/2)*Math.pow(r,l)*Laguerre(r,2*l+1,n-l-1)*Y(theta,phi,l,m);
}

function Laguerre(x,alpha,lambda){
  let a = 1;
  let P = 1;
  for(let i=1; i<=lambda; i++){
    a = -a*(lambda-i+1)/(i*(alpha+i));
    P += a*Math.pow(x,i);
  }
  return P;
}
// function Laguerre(x,alpha,lambda){
//   let Lold = 1;
//   let Lnew = 1+alpha-x;
//   let Ltemp;
//   for(let k=0; k<lambda; ++k){
//     Ltemp = Lnew;
//     Lnew = ((2*k+1+alpha-x)*Lnew-(k+alpha)*Lold)/(k+1);
//     Lold = Ltemp;
//   }
//   return Lnew;
// }

function Legendre(x,l,m){
  let P = Math.pow(-1,m)*Math.pow(2,l)*Math.pow((1-x*x),m/2);
  let S = 0;
  for(let k=m; k<=l; k++){
    S += nCk(l,k)*nCk((l+k-1)/2,l)*fact(k)/fact(k-m)*Math.pow(x,k-m);
  }
  return S*P;
}


function nCk(n,k){
  // return fact(n)/(fact(k)*fact(n-k));
  let S = 1;
  for(let i=0; i<k; ++i){
    S *= (n-i);
  }
  return S/fact(k);
}

function fact(n){
  let P = 1;
  for(let i=2; i<=n; ++i){
    P *= i;
  }
  return P;
}

function Y(theta,phi,l,m){
  return Legendre(Math.cos(theta),l,Math.abs(m))*Math.cos(m*phi+Math.PI/2*(1-Math.sign(m))/2);
}

// === Marching Cubes setup ===
const resolution = 75;
// const resolution = 150;
const material = new THREE.MeshStandardMaterial({
  color: 0x156289,
  metalness: 0.2,
  roughness: 0.6,
  transparent: true,
  opacity: 0.7
});

// const mc = new MarchingCubes(resolution, material, true, true, 100000);
// mc.scale.set(1, 1, 1);
// scene.add(mc)

const matPos = new THREE.MeshStandardMaterial({
  color: 0x1e90ff, // blue for f > 0
  transparent: true,
  // roughness: 0.5,
  depthWrite: false,
  opacity: 0.6
});

const matNeg = new THREE.MeshStandardMaterial({
  color: 0xff4040, // red for f < 0
  transparent: true,
  // roughness: 0.5,
  depthWrite: false,
  opacity: 0.6
});

// const matPos = new THREE.MeshPhysicalMaterial({
//   color: 0x1e90ff,
//   transparent: true,
//   opacity: 0.6,
//   roughness: 1,
//   metalness: 0.,
//   clearcoat: 1.0,
//   clearcoatRoughness: 1,
//   depthWrite: false,
//   side: THREE.DoubleSide
// });

// const matNeg = new THREE.MeshPhysicalMaterial({
//   color: 0xff4040,
//   transparent: true,
//   opacity: 0.6,
//   roughness: 0.5,
//   metalness: 0.,
//   clearcoat: 1.0,
//   clearcoatRoughness: 0.5,
//   depthWrite: false,
//   side: THREE.DoubleSide
// });


const mcPos = new MarchingCubes(resolution, matPos, true, true, 100000);
scene.add(mcPos);
const mcNeg = new MarchingCubes(resolution, matNeg, true, true, 100000);
scene.add(mcNeg);

// mcPos.scale.set(1/50, 1/50, 1/50);
// mcNeg.scale.set(1/50, 1/50, 1/50);

function updateMarchingCubes() {
// === Fill scalar field ===
const size = resolution;
for (let k = 0; k < size; k++) {
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = (i / size - 0.5) * 2; // map to [-1,1]
      const y = (j / size - 0.5) * 2;
      const z = (k / size - 0.5) * 2;
      const value = f(n, l, m, x, y, z);
      // mc.field[i + j * size + k * size * size] = value * value; // use |f|^2
      mcPos.field[i + j * size + k * size * size] = value > 0 ? value * value : 0;
      mcNeg.field[i + j * size + k * size * size] = value < 0 ? value * value : 0;
    }
  }
}

}



let threshold = 1/(1000*(l+1));
mcPos.isolation = threshold;
mcNeg.isolation = threshold;

// === Choose threshold ===
// const threshold = 1; // adjust this to control size
// mc.isolation = threshold;

// === Handle resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const threshold_slider = document.getElementById('threshold-slider');
const threshold_label = document.getElementById('threshold-label');

const n_slider = document.getElementById('n-slider');
const n_label = document.getElementById('n-label');

const l_slider = document.getElementById('l-slider');
const l_label = document.getElementById('l-label');

const m_slider = document.getElementById('m-slider');
const m_label = document.getElementById('m-label');

let timeout;
threshold_slider.addEventListener('input', (e) => {
  // Update threshold and label
  threshold = (parseFloat(e.target.value))/100;
  threshold_label.textContent = `Threshold: ${(100*threshold).toFixed(2)}`;
  mcPos.isolation = threshold;
  mcNeg.isolation = threshold;

  clearTimeout(timeout);
  timeout = setTimeout(() => updateMarchingCubes(), 50);
});


n_slider.addEventListener('input', (e) => {
  // Update n and label
  n = parseInt(e.target.value);
  n_label.textContent = `n: ${n.toFixed(0)}`;

  // Update max of l
  l_slider.max = n-1;

  // Update l if l>n-1
  if(l>n-1){
    l = n-1;
    l_label.textContent = `l: ${l.toFixed(0)}`;
    if(Math.abs(m)>l){
      m_slider.max = l;
      m_slider.min = -l;
      m = Math.sign(m)*l;
      m_label.textContent = `m: ${m.toFixed(0)}`;
    }
  }

  clearTimeout(timeout);
  timeout = setTimeout(() => updateMarchingCubes(), 50);
});


l_slider.addEventListener('input', (e) => {
  // Update l and label
  l = parseInt(e.target.value);
  l_label.textContent = `l: ${l.toFixed(0)}`;

  m_slider.max = l;
  m_slider.min = -l;
  if(Math.abs(m)>l){
    m = Math.sign(m)*l;
    m_label.textContent = `m: ${m.toFixed(0)}`;
  }

  clearTimeout(timeout);
  timeout = setTimeout(() => updateMarchingCubes(), 50);
});

m_slider.addEventListener('input', (e) => {
  // Update l and label
  m = parseInt(e.target.value);
  m_label.textContent = `m: ${m.toFixed(0)}`;

  clearTimeout(timeout);
  timeout = setTimeout(() => updateMarchingCubes(), 50);
});

updateMarchingCubes();

// === Render loop ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
