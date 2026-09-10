import React, { useRef } from 'react';
import { gsap, useGSAP } from '../gsapSetup';

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uDrop;
uniform vec2 uMouse;
uniform vec3 uColor;
uniform float uWide;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.123);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 17.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / max(uRes.y, 1.0);
  float y = 1.0 - uv.y;
  float beamX = mix(0.68, 0.62, uWide) + (uMouse.x - 0.5) * 0.025;
  float x = (uv.x - beamX) * aspect;
  x += (0.52 - uv.y) * 0.008;

  float reach = clamp(uDrop, 0.0, 1.2);
  float along = 1.0 - smoothstep(reach - 0.05, reach + 0.18, y);

  float basinY = mix(0.56, 0.60, uWide);
  float t = clamp(y / max(basinY, 0.001), 0.0, 1.4);
  float flare = pow(smoothstep(0.36, 1.02, t), 2.55);

  float shaftW = mix(0.002, 0.012, smoothstep(0.0, 0.92, t));
  float volumeW = mix(0.014, 0.62, flare);
  float cloudW = mix(0.09, 1.05, pow(flare, 0.72));

  float needle = exp(-pow(x / 0.0021, 2.0));
  float halo = exp(-pow(x / 0.012, 2.0));
  float shaft = exp(-pow(x / shaftW, 2.0));
  float volume = exp(-pow(abs(x) / max(volumeW, 0.001), 1.28));
  float side = exp(-pow(abs(x) / max(cloudW, 0.001), 1.08));

  float flow = fbm(vec2(x * 14.0, y * 5.4 - uTime * 0.48));
  float smoke = fbm(vec2(uv.x * 1.9 - uTime * 0.03, uv.y * 1.35 + uTime * 0.018));
  float wisps = fbm(vec2(x * 5.5 + 4.0, y * 2.6 - uTime * 0.18));

  float rightBias = smoothstep(-0.12, 0.28, x);
  float clouds = pow(smoke, 1.35) * side * (0.4 + 0.9 * rightBias);
  clouds *= smoothstep(0.04, 0.38, y) * (1.0 - smoothstep(0.78, 1.08, y));
  clouds *= 0.5 + 0.5 * wisps;

  float godray = volume * (0.4 + 0.6 * flow);
  godray *= 0.22 + 0.95 * flare;

  vec2 bloomP = vec2(x / mix(0.28, 0.52, uWide), (y - basinY) / 0.16);
  float bloom = exp(-dot(bloomP, bloomP));
  bloom *= smoothstep(0.3, 0.82, reach);
  float spill = exp(-pow(abs(x) / 0.34, 1.45)) * exp(-pow((y - basinY) * 4.4, 2.0));
  spill *= smoothstep(0.35, 0.88, reach);

  float wrap = exp(-pow((x - mix(0.16, 0.22, uWide)) / 0.05, 2.0));
  wrap *= smoothstep(basinY - 0.04, basinY + 0.02, y) * (1.0 - smoothstep(basinY + 0.38, basinY + 0.55, y));
  wrap *= smoothstep(0.4, 0.9, reach);

  float core = (needle * 1.85 + halo * 0.55 + shaft * 0.9) * (1.0 + flare * 1.15);

  vec3 indigo = uColor;
  vec3 sky = vec3(0.38, 0.52, 1.0);
  vec3 white = vec3(1.0);

  float body = (godray * 1.35 + clouds * 1.15) * along;
  float hot = (core * 1.35 + bloom * 1.7 + spill * 1.05 + wrap * 0.85) * along;

  vec3 col = indigo * (body * 0.85) + sky * (body * 0.7 + spill * 0.45 * along) + white * hot;
  float alpha = body * 0.88 + hot * 0.98 + clouds * 0.55 * along;
  alpha = clamp(alpha, 0.0, 1.0);
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

export default function HeroAtmosphere() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'program link failed');
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uDrop = gl.getUniformLocation(program, 'uDrop');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uColor = gl.getUniformLocation(program, 'uColor');
    const uWide = gl.getUniformLocation(program, 'uWide');
    gl.uniform3f(uColor, 79 / 255, 90 / 255, 245 / 255);

    const state = { drop: 0, mx: 0.64, my: 0.2 };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uWide, width >= 900 ? 1.0 : 0.0);
    };

    resize();
    window.addEventListener('resize', resize);

    const startedAt = performance.now();
    const dropMs = reduce ? 0 : 2600;
    const easeDrop = gsap.parseEase('power3.inOut');
    const host = wrap.parentElement || wrap;
    const mxTo = gsap.quickTo(state, 'mx', { duration: 0.7, ease: 'power3.out' });
    const myTo = gsap.quickTo(state, 'my', { duration: 0.7, ease: 'power3.out' });

    const onMove = (event) => {
      const rect = wrap.getBoundingClientRect();
      mxTo((event.clientX - rect.left) / Math.max(rect.width, 1));
      myTo((event.clientY - rect.top) / Math.max(rect.height, 1));
    };
    host.addEventListener('pointermove', onMove);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const draw = () => {
      const t = dropMs === 0 ? 1 : Math.min(1, (performance.now() - startedAt) / dropMs);
      state.drop = easeDrop(t);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, performance.now() * 0.001);
      gl.uniform1f(uDrop, state.drop);
      gl.uniform2f(uMouse, state.mx, state.my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    gsap.ticker.add(draw);

    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener('resize', resize);
      host.removeEventListener('pointermove', onMove);
    };
  }, { scope: wrapRef });

  return (
    <div ref={wrapRef} className="hero-atmosphere" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
