const container = document.getElementById('container');
const SIZE = Math.min(container.clientWidth, 800);
const canvas = document.getElementById('c');
canvas.width = SIZE;
canvas.height = SIZE;
const gl = canvas.getContext('webgl2');
if (!gl) { alert('WebGL2 not supported'); }

// Shaders

const VERT_SRC = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Shared physics functions injected into both sim shaders
const PHYSICS_GLSL = `
const float G  = 9.81;
const float M1 = 1.0;
const float M2 = 1.0;
const float L1 = 1.0;
const float L2 = 1.0;

vec4 deriv(vec4 s) {
  float th1 = s.x, w1 = s.y, th2 = s.z, w2 = s.w;
  float dth = th2 - th1;
  float cos_dth = cos(dth);
  float sin_dth = sin(dth);
  float M  = M1 + M2;

  float alpha1 = L2/L1*M2/M * cos_dth;
  float alpha2 = L1/L2 * cos_dth;
  float f1 = L2/L1*M2/M * sin_dth*w2*w2 - G/L1 * sin(th1);
  float f2 = -L1/L2 * sin_dth*w1*w1     - G/L2 * sin(th2);
  float det = 1.0 - alpha1*alpha2;

  float dw1 = (f1 - alpha1*f2)/det;
  float dw2 = (-alpha2*f1 + f2)/det;

  return vec4(w1, dw1, w2, dw2);
}

vec4 rk4(vec4 s, float dt) {
  vec4 k1 = deriv(s);
  vec4 k2 = deriv(s + 0.5*dt*k1);
  vec4 k3 = deriv(s + 0.5*dt*k2);
  vec4 k4 = deriv(s +     dt*k3);
  return s + (dt/6.0)*(k1 + 2.0*k2 + 2.0*k3 + k4);
}
`;

// Renorm shader: advances main + perturbed pendulums, renormalizes, accumulates log-stretch
const RENORM_SRC = `#version 300 es
precision highp float;
in vec2 v_uv;
layout(location = 0) out vec4 outMain;
layout(location = 1) out vec4 outPerturb;
layout(location = 2) out vec4 outLyap;

uniform sampler2D u_main;
uniform sampler2D u_perturb;
uniform sampler2D u_lyap;
uniform int u_steps;
uniform float u_dt;
uniform float u_eps;

${PHYSICS_GLSL}

void main() {
  vec4 s  = texture(u_main,    v_uv);
  vec4 sp = texture(u_perturb, v_uv);
  vec4 ly = texture(u_lyap,    v_uv); // ly.x = accumulated log-stretch, ly.y = step count

  for (int i = 0; i < u_steps; i++) {
    s  = rk4(s,  u_dt);
    sp = rk4(sp, u_dt);

    vec4 diff = sp - s;
    float dist = length(diff);
    // if (dist > 0.0) {
      ly.x = log(dist / u_eps/ly.y);       // accumulate log-stretch
      // ly.x = dist;
      ly.y += 1.0;
      // sp = s + diff * (u_eps / dist);  // renormalize back to epsilon
    // }
  }

  outMain    = s;
  outPerturb = sp;
  outLyap    = ly;
}`;

const DISP_SRC = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_state;
uniform sampler2D u_lyap;
uniform int u_colorMode;

const float PI  = 3.14159265359;
const float TAU = 6.28318530718;

vec3 hsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(1,2,3)/3.0)*6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

void main() {
  vec4  s  = texture(u_state, v_uv);
  float th1 = s.x, w1 = s.y, th2 = s.z, w2 = s.w;

  vec3 col;

  if (u_colorMode == 0) {
    float hue = mod(th2, TAU) / TAU;
    col = hsv2rgb(vec3(hue, 0.85, 1.0));

  } else if (u_colorMode == 1) {
    float G = 9.81;
    float E = w1*w1 + 0.5*w2*w2 + w1*w2*cos(th2-th1) - G*(2.0*cos(th1) + cos(th2));
    float norm = clamp((E + 4.0*G) / (8.0*G), 0.0, 1.0);
    col = hsv2rgb(vec3(norm*0.75, 0.9, 1.0));

  } else if (u_colorMode == 2) {
    float speed = clamp(abs(w2) / 15.0, 0.0, 1.0);
    col = hsv2rgb(vec3(0.6 - speed*0.6, 0.9, speed));

  } else if (u_colorMode == 3) {
    float q = floor(mod(th2, TAU) / (PI*0.5));
    col = hsv2rgb(vec3(q/4.0, 0.8, 1.0));

  } else if (u_colorMode == 4) {
    col = abs(s.z/(3.0*PI))*vec3(0., 0., 117./255.) + (1.-abs(s.z/(3.0*PI)))*vec3(0.,1.,115./255.);

  } else {
    // Mode 5: Lyapunov exponent — blue = stable, red = chaotic
    vec4 ly = texture(u_lyap, v_uv);
    // float lambda = ly.y > 0.0 ? ly.x / ly.y : 0.0;
    // float t = clamp(log(ly.x) / 1.0, -1.0, 1.0);

    // float t = smoothstep(-10.,10.,ly.x);
    
    // if (ly.x >= 5.) {
    //   col = vec3(1.,0.,0.);
    // }else if (ly.x >= 0.) {
    //   col = vec3(0.,1.,0.);
    // }else if (ly.x >= -15.) {
    //   col = vec3(0.,0.,1.);
    // }

    float t = (ly.x+6.)/(9.+6.);
    // float t = smoothstep(-6.,9.,ly.x);

    if (t >= 0.5) {
      col = mix(vec3(0.,1.,115./255.),vec3(0., 0., 117./255.),2.*(t-0.5));
    } else {
      col = mix(vec3(0., 120./255., 40./255.),vec3(0.,1.,115./255.),2.*t);
      // col = mix(vec3(0., 50./255., 20./255.),vec3(0.,1.,115./255.),2.*t);
    }

    // if (t >= 0.95) {
    //   col = mix(vec3(0., 0., 117./255.),vec3(135./255.,0.,135./255.),(t-0.95)/0.05);
    // } else {
    //   col = mix(vec3(0.,1.,115./255.),vec3(0., 0., 117./255.),2.*t);
    // }

    // vec3 a = vec3(0.938, 0.328, 0.718);
    // vec3 b = vec3(0.659, 0.438, 0.328);
    // vec3 c = vec3(0.388, 0.388, 0.296);
    // vec3 d = vec3(2.538, 2.478, 0.168);
    // vec3 a = vec3(0.650, 0.500, 0.310);
    // vec3 b = vec3(-0.650, 0.500, 0.600);
    // vec3 c = vec3(0.333, 0.278, 0.278);
    // vec3 d = vec3(0.660, 0.000, 0.667);
    // col = a + b*cos( 6.283185*(c*t+d) );
  }

  outColor = vec4(col, 1.0);
}`;

// GL helpers

function makeShader(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s));
  return s;
}

function makeProgram(vert, frag) {
  const p = gl.createProgram();
  gl.attachShader(p, makeShader(gl.VERTEX_SHADER, vert));
  gl.attachShader(p, makeShader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p));
  return p;
}

function makeTexture(data) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, SIZE, SIZE, 0,
                gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function makeFBO(tex) {
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  if (tex) {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  }
  return fbo;
}

function makeMRTFBO(t0, t1, t2) {
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t0, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, t1, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, t2, 0);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);
  return fbo;
}

// Init

if (!gl.getExtension('EXT_color_buffer_float'))
  alert('EXT_color_buffer_float not supported — try Chrome/Firefox on desktop');

const renormProg = makeProgram(VERT_SRC, RENORM_SRC);
const dispProg   = makeProgram(VERT_SRC, DISP_SRC);

const EPS = 1e-6;

let zoomTh1Min = -Math.PI;
let zoomTh1Max = Math.PI;
let zoomTh2Min = -Math.PI;
let zoomTh2Max = Math.PI;

const quadBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
gl.bufferData(gl.ARRAY_BUFFER,
  new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

function bindQuad(prog) {
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

function buildInitialState() {
  const data = new Float32Array(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      data[i+0] = zoomTh1Min + (x / (SIZE-1)) * (zoomTh1Max - zoomTh1Min);
      data[i+1] = 0;
      data[i+2] = zoomTh2Min + (y / (SIZE-1)) * (zoomTh2Max - zoomTh2Min);
      data[i+3] = 0;
    }
  }
  return data;
}

function buildPerturbState() {
  const data = buildInitialState();
  // Offset th1 by EPS for every pixel
  for (let p = 0; p < SIZE * SIZE; p++) data[p*4] += EPS;
  return data;
}

// Texture/FBO pairs
let texA, texB;           // main pendulum ping-pong
let texP1, texP2;         // perturbed pendulum ping-pong
let texL1, texL2;         // lyapunov accumulator ping-pong
let fboMRT_A, fboMRT_B;   // MRT FBOs
let readTex, readPerturb, readLyap, writeMRT;

function initBuffers() {
  // Clean up old textures
  [texA, texB, texP1, texP2, texL1, texL2].forEach(t => { if (t) gl.deleteTexture(t); });
  [fboMRT_A, fboMRT_B].forEach(f => { if (f) gl.deleteFramebuffer(f); });

  texA  = makeTexture(buildInitialState());
  texB  = makeTexture(null);
  texP1 = makeTexture(buildPerturbState());
  texP2 = makeTexture(null);
  texL1 = makeTexture(new Float32Array(SIZE * SIZE * 4)); // zeros
  texL2 = makeTexture(null);

  fboMRT_A = makeMRTFBO(texA,  texP1, texL1);
  fboMRT_B = makeMRTFBO(texB,  texP2, texL2);

  readTex     = texA;
  readPerturb = texP1;
  readLyap    = texL1;
  writeMRT    = fboMRT_B;
}

initBuffers();

// Zoom

let zoomMode = false;
let justZoomed = false;
let dragStart = null;
const zoomRectEl = document.getElementById('zoomRect');
const zoomBtn = document.getElementById('zoomBtn');
const resetZoomBtn = document.getElementById('resetZoomBtn');

zoomBtn.addEventListener('click', () => {
  zoomMode = !zoomMode;
  zoomBtn.style.borderColor = zoomMode ? '#2196F3' : '';
  zoomBtn.style.color = zoomMode ? '#2196F3' : '';
  canvas.style.cursor = zoomMode ? 'crosshair' : 'default';
});

resetZoomBtn.addEventListener('click', () => {
  zoomTh1Min = -Math.PI;
  zoomTh1Max = Math.PI;
  zoomTh2Min = -Math.PI;
  zoomTh2Max = Math.PI;
  resetZoomBtn.style.display = 'none';
  initBuffers();
  simTime = 0;
});

function canvasUV(e) {
  const rect = canvas.getBoundingClientRect();
  const rawPx = e.clientX - rect.left;
  const rawPy = e.clientY - rect.top;
  const px = Math.max(0, Math.min(rect.width,  rawPx));
  const py = Math.max(0, Math.min(rect.height, rawPy));
  return {
    u: px / rect.width,
    v: py / rect.height,
    px,
    py,
  };
}

canvas.addEventListener('mousedown', (e) => {
  if (!zoomMode) return;
  e.preventDefault();
  const { u, v, px, py } = canvasUV(e);
  dragStart = { u, v, px, py };
  zoomRectEl.style.display = 'block';
  zoomRectEl.style.left   = px + 'px';
  zoomRectEl.style.top    = py + 'px';
  zoomRectEl.style.width  = '0px';
  zoomRectEl.style.height = '0px';
});

document.addEventListener('mousemove', (e) => {
  if (!zoomMode || !dragStart) return;
  e.preventDefault();
  const { px, py } = canvasUV(e);
  const x0 = Math.min(dragStart.px, px);
  const y0 = Math.min(dragStart.py, py);
  zoomRectEl.style.left   = x0 + 'px';
  zoomRectEl.style.top    = y0 + 'px';
  zoomRectEl.style.width  = Math.abs(px - dragStart.px) + 'px';
  zoomRectEl.style.height = Math.abs(py - dragStart.py) + 'px';
});

document.addEventListener('mouseup', (e) => {
  if (!dragStart) return;
  if (!zoomMode) { dragStart = null; return; }
  e.preventDefault();
  const { u: u1, v: v1 } = canvasUV(e);
  const u0 = dragStart.u, v0 = dragStart.v;
  zoomRectEl.style.display = 'none';
  dragStart = null;

  const du = Math.abs(u1 - u0), dv = Math.abs(v1 - v0);
  if (du < 0.01 || dv < 0.01) return;

  const th1Range = zoomTh1Max - zoomTh1Min;
  const th2Range = zoomTh2Max - zoomTh2Min;
  const newTh1Min = zoomTh1Min + Math.min(u0, u1) * th1Range;
  const newTh1Max = zoomTh1Min + Math.max(u0, u1) * th1Range;
  const newTh2Max = zoomTh2Max - Math.min(v0, v1) * th2Range;
  const newTh2Min = zoomTh2Max - Math.max(v0, v1) * th2Range;

  zoomTh1Min = newTh1Min; zoomTh1Max = newTh1Max;
  zoomTh2Min = newTh2Min; zoomTh2Max = newTh2Max;

  resetZoomBtn.style.display = '';
  initBuffers();
  simTime = 0;

  zoomMode = false;
  zoomBtn.style.borderColor = '';
  zoomBtn.style.color = '';
  canvas.style.cursor = 'default';

  justZoomed = true;
  setTimeout(() => { justZoomed = false; }, 0);
});

// Zoom on touch screen

function touchUV(e) {
  const touch = e.touches[0] ?? e.changedTouches[0];
  return canvasUV({ clientX: touch.clientX, clientY: touch.clientY });
}

canvas.addEventListener('touchstart', (e) => {
  if (!zoomMode) return;
  e.preventDefault();
  const { u, v, px, py } = touchUV(e);
  dragStart = { u, v, px, py };
  zoomRectEl.style.display = 'block';
  zoomRectEl.style.left   = px + 'px';
  zoomRectEl.style.top    = py + 'px';
  zoomRectEl.style.width  = '0px';
  zoomRectEl.style.height = '0px';
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!zoomMode || !dragStart) return;
  e.preventDefault();
  const { px, py } = touchUV(e);
  const x0 = Math.min(dragStart.px, px);
  const y0 = Math.min(dragStart.py, py);
  zoomRectEl.style.left   = x0 + 'px';
  zoomRectEl.style.top    = y0 + 'px';
  zoomRectEl.style.width  = Math.abs(px - dragStart.px) + 'px';
  zoomRectEl.style.height = Math.abs(py - dragStart.py) + 'px';
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  if (!zoomMode || !dragStart) return;
  e.preventDefault();
  const { u: u1, v: v1 } = touchUV(e);
  const u0 = dragStart.u, v0 = dragStart.v;
  zoomRectEl.style.display = 'none';
  dragStart = null;

  const du = Math.abs(u1 - u0), dv = Math.abs(v1 - v0);
  if (du < 0.01 || dv < 0.01) return;

  const th1Range = zoomTh1Max - zoomTh1Min;
  const th2Range = zoomTh2Max - zoomTh2Min;
  const newTh1Min = zoomTh1Min + Math.min(u0, u1) * th1Range;
  const newTh1Max = zoomTh1Min + Math.max(u0, u1) * th1Range;
  const newTh2Max = zoomTh2Max - Math.min(v0, v1) * th2Range;
  const newTh2Min = zoomTh2Max - Math.max(v0, v1) * th2Range;

  zoomTh1Min = newTh1Min; zoomTh1Max = newTh1Max;
  zoomTh2Min = newTh2Min; zoomTh2Max = newTh2Max;

  resetZoomBtn.style.display = '';
  initBuffers();
  simTime = 0;

  zoomMode = false;
  zoomBtn.style.borderColor = '';
  zoomBtn.style.color = '';
  canvas.style.cursor = 'default';
}, { passive: false });

// Render

let simTime = 0;
const DT = 0.005;

function simStep(steps) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, writeMRT);
  gl.viewport(0, 0, SIZE, SIZE);
  gl.useProgram(renormProg);
  bindQuad(renormProg);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, readTex);
  gl.uniform1i(gl.getUniformLocation(renormProg, 'u_main'), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, readPerturb);
  gl.uniform1i(gl.getUniformLocation(renormProg, 'u_perturb'), 1);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, readLyap);
  gl.uniform1i(gl.getUniformLocation(renormProg, 'u_lyap'), 2);

  gl.uniform1f(gl.getUniformLocation(renormProg, 'u_dt'),    DT);
  gl.uniform1i(gl.getUniformLocation(renormProg, 'u_steps'), steps);
  gl.uniform1f(gl.getUniformLocation(renormProg, 'u_eps'),   EPS);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Swap all read/write pointers
  if (writeMRT === fboMRT_B) {
    readTex = texB; readPerturb = texP2; readLyap = texL2;
    writeMRT = fboMRT_A;
  } else {
    readTex = texA; readPerturb = texP1; readLyap = texL1;
    writeMRT = fboMRT_B;
  }
}

function display() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, SIZE, SIZE);
  gl.useProgram(dispProg);
  bindQuad(dispProg);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, readTex);
  gl.uniform1i(gl.getUniformLocation(dispProg, 'u_state'), 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, readLyap);
  gl.uniform1i(gl.getUniformLocation(dispProg, 'u_lyap'), 1);

  const cm = parseInt(document.getElementById('colormode').value);
  gl.uniform1i(gl.getUniformLocation(dispProg, 'u_colorMode'), cm);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Loop

const timerEl = document.getElementById('timer');
const speedEl = 5;

document.getElementById('resetBtn').addEventListener('click', () => {
  initBuffers();
  simTime = 0;
});

function frame() {
  const steps = parseInt(speedEl);
  simStep(steps);
  simTime += steps * DT;
  display();
  timerEl.textContent = `t = ${simTime.toFixed(2)}`;
  requestAnimationFrame(frame);
}

MathJax.startup.promise.then(() => {
  requestAnimationFrame(frame);
});


// INSPECTOR: single-pendulum CPU simulation shown on click

const inspector  = document.getElementById('inspector');
const pendCanvas = document.getElementById('pendCanvas');
const pendInfo   = document.getElementById('pendInfo');
const ctx        = pendCanvas.getContext('2d');
const W = pendCanvas.width, H = pendCanvas.height;

const DPR = window.devicePixelRatio || 1;
const W_CSS = 200, H_CSS = 200;
pendCanvas.width  = W_CSS * DPR;
pendCanvas.height = H_CSS * DPR;
pendCanvas.style.width  = W_CSS + 'px';
pendCanvas.style.height = H_CSS + 'px';
ctx.scale(DPR, DPR);
ctx.lineJoin = 'round';
ctx.lineCap  = 'round';

let inspectorRAF   = null;
let inspectorState = null;


function derivCPU([th1, w1, th2, w2]) {
  const dth = th2 - th1;
  const M1 = 1, M2 = 1, M = M1+M2, G = 9.81, L1 = 1, L2 = 1;
  const cos_dth = Math.cos(dth);
  const sin_dth = Math.sin(dth);
  const alpha1 = L2/L1*M2/M * cos_dth;
  const alpha2 = L1/L2 * cos_dth;
  const f1 = L2/L1*M2/M * sin_dth*w2*w2 - G/L1 * Math.sin(th1);
  const f2 = -L1/L2 * sin_dth*w1*w1     - G/L2 * Math.sin(th2);
  const det = 1 - alpha1*alpha2;
  return [w1, (f1 - alpha1*f2)/det, w2, (-alpha2*f1 + f2)/det];
}

function rk4CPU(s, dt) {
  const add = (a, b, f) => a.map((v,i) => v + f*b[i]);
  const k1 = derivCPU(s);
  const k2 = derivCPU(add(s, k1, 0.5*dt));
  const k3 = derivCPU(add(s, k2, 0.5*dt));
  const k4 = derivCPU(add(s, k3, dt));
  return s.map((v,i) => v + (dt/6)*(k1[i] + 2*k2[i] + 2*k3[i] + k4[i]));
}

const TRAIL_LEN = 300;
let trail = [];

function pendulumXY(state) {
  const [th1,,th2] = state;
  const scale = W * 0.22;
  const cx = W/2, cy = H/2;
  const x1 = cx + scale * Math.sin(th1);
  const y1 = cy + scale * Math.cos(th1);
  const x2 = x1 + scale * Math.sin(th2);
  const y2 = y1 + scale * Math.cos(th2);
  return { cx, cy, x1, y1, x2, y2 };
}

function drawPendulum(state) {
  const { cx, cy, x1, y1, x2, y2 } = pendulumXY(state);
  trail.push([x2, y2]);
  if (trail.length > TRAIL_LEN) trail.shift();

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

  if (trail.length > 1) {
    for (let i = 1; i < trail.length; i++) {
      const t = i / trail.length;
      ctx.strokeStyle = `rgba(33,150,243,${t * 0.8})`;
      ctx.lineWidth = t * 1.2;
      ctx.beginPath();
      ctx.moveTo(trail[i-1][0], trail[i-1][1]);
      ctx.lineTo(trail[i][0],   trail[i][1]);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.fillStyle = '#888';
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#aaa';
  ctx.beginPath(); ctx.arc(x1, y1, 4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgb(33, 150, 243)';
  ctx.beginPath(); ctx.arc(x2, y2, 5, 0, Math.PI*2); ctx.fill();
}

function openInspector(th1_0, th2_0, mouseX, mouseY) {
  if (inspectorRAF !== null) cancelAnimationFrame(inspectorRAF);
  trail = [];
  inspectorState = [th1_0, 0, th2_0, 0];

  pendInfo.innerHTML =
    `<b>\\(\\theta_{10} = ${th1_0.toFixed(8)} \\)<br>` +
    `<b>\\(\\theta_{20} = ${th2_0.toFixed(8)} \\)<br>`;

  MathJax.typesetPromise([pendInfo]);
  inspector.classList.add('visible');
  const panelW = inspector.offsetWidth;
  const panelH = inspector.offsetHeight;

  const containerRect = container.getBoundingClientRect();
  const cx = mouseX - (containerRect.left + window.scrollX);
  const cy = mouseY - (containerRect.top  + window.scrollY);

  let px = cx;
  let py = cy - panelH;
  if (px + panelW > containerRect.width) px = cx - panelW;
  if (py < 0)                            py = cy;

  inspector.style.left = px + 'px';
  inspector.style.top  = py + 'px';

  const DT_INSP = 0.01;
  const STEPS_PER_FRAME = 3;
  function inspFrame() {
    for (let i = 0; i < STEPS_PER_FRAME; i++)
      inspectorState = rk4CPU(inspectorState, DT_INSP);
    drawPendulum(inspectorState);
    inspectorRAF = requestAnimationFrame(inspFrame);
  }
  inspectorRAF = requestAnimationFrame(inspFrame);
}

document.getElementById('closeBtn').addEventListener('click', () => {
  inspector.classList.remove('visible');
  if (inspectorRAF !== null) { cancelAnimationFrame(inspectorRAF); inspectorRAF = null; }
});

canvas.addEventListener('click', (e) => {
  if (zoomMode || justZoomed) return;
  const rect = canvas.getBoundingClientRect();
  const u = (e.clientX - rect.left) / rect.width;
  const v = (e.clientY - rect.top)  / rect.height;

  const th1_0 = zoomTh1Min + u * (zoomTh1Max - zoomTh1Min);
  const th2_0 = zoomTh2Max - v * (zoomTh2Max - zoomTh2Min);

  openInspector(th1_0, th2_0, e.pageX, e.pageY);
});