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
uniform vec4 uBox;       // (left, top, right, bottom) in 0..1 coordinates
uniform float uTargetX;  // exact horizontal contact coordinate on the box

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
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p + vec2(17.0, 17.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / max(uRes.y, 1.0);
  float y = 1.0 - uv.y; // 0 at top of hero, 1 at bottom

  // Top rim of the product box
  float boxTop = clamp(uBox.y, 0.35, 0.85);

  // Dynamic beam contact X position (shifted right to leave generous breathing room for the headline)
  float beamX = (uTargetX > 0.0 ? uTargetX : mix(0.640, 0.630, uWide)) + (uMouse.x - 0.5) * 0.010;
  float x = (uv.x - beamX) * aspect;

  // Subtle organic curvature along the beam descent
  x += sin(y * 3.14159) * 0.006;

  // Drop entrance animation
  float reach = clamp(uDrop, 0.0, 1.2);
  float along = 1.0 - smoothstep(reach - 0.04, reach + 0.16, y);

  // Distance relative to the contact rim:
  // dy > 0: above the box (incoming beam)
  // dy = 0: at the contact rim
  // dy < 0: below the contact rim (underglow / backlight behind the box)
  float dy = boxTop - y;

  // ------------------------------------------------------------------------
  // 1. VOLUMETRIC ATMOSPHERIC NEBULA & COSMIC SMOKE CLOUDS
  // ------------------------------------------------------------------------
  vec2 nebulaUv = vec2(x * 1.35 + sin(y * 2.8 + uTime * 0.08) * 0.12, y * 1.7 - uTime * 0.06);
  float nebFbm1 = fbm(nebulaUv * 1.5);
  float nebFbm2 = fbm(nebulaUv * 2.8 + vec2(nebFbm1 * 1.3, uTime * 0.03));
  float nebulaPuff = smoothstep(0.28, 0.78, nebFbm2);
  // Billowy nebula clouds drifting across the upper & mid cosmic atmosphere
  float nebulaMask = exp(-pow(abs(x) / 0.85, 1.6)) * smoothstep(0.04, 0.28, y) * (1.0 - smoothstep(boxTop - 0.10, boxTop + 0.08, y));
  float nebula = nebulaPuff * nebulaMask * 0.55;

  // ------------------------------------------------------------------------
  // 2. MAJESTIC VOLUMETRIC BEAM COLUMN (Laser pillar with trumpet flare)
  // ------------------------------------------------------------------------
  float flareHeight = 0.26;
  float flareProg = clamp(1.0 - max(0.0, dy) / flareHeight, 0.0, 1.0);
  float flareCurve = pow(flareProg, 3.5);

  // Symmetrical beam width profiles: slender laser pillar above, refined trumpet flare
  float coreWidth  = mix(0.006, 0.032, flareCurve);
  float spineWidth = mix(0.016, 0.088, flareCurve);
  float haloWidth  = mix(0.040, 0.170, flareCurve);
  float auraWidth  = mix(0.085, 0.290, flareCurve);

  // Continuous radial intensity profiles
  float core       = exp(-pow(x / coreWidth, 2.0));
  float cyanSpine  = exp(-pow(x / spineWidth, 2.0));
  float halo       = exp(-pow(abs(x) / haloWidth, 1.8));
  float aura       = exp(-pow(abs(x) / auraWidth, 1.8));

  // ------------------------------------------------------------------------
  // 3. ORGANIC DOWNWARD PLASMA STREAM & LIVING SILK FILAMENTS
  // ------------------------------------------------------------------------
  float flowSpeed = uTime * 1.3;
  float stream = fbm(vec2(x * 16.0, y * 4.2 - flowSpeed));
  float plasma = mix(0.82, 1.28, stream);

  // Symmetric, flowing silk light ribbons hugging both flanks of the beam
  float wave1 = sin(abs(x) * 32.0 - y * 12.0 + uTime * 2.2);
  float wave2 = cos(abs(x) * 48.0 - y * 18.0 + uTime * 3.0);
  float silk = exp(-pow(abs(x) / (haloWidth * 1.15), 2.0)) * (0.65 + 0.25 * wave1 + 0.10 * wave2) * flareCurve;

  // Box rim containment mask: smoothly rolls off at window edges to eliminate any leakage past corners
  float rimMask = smoothstep(uBox.x - 0.002, uBox.x + 0.018, uv.x) * smoothstep(uBox.z + 0.002, uBox.z - 0.016, uv.x);

  // ------------------------------------------------------------------------
  // 4. DISTINCT FIBER-OPTIC CAUSTIC FILAMENTS (Diverging along the flare)
  // ------------------------------------------------------------------------
  float rayNormX = x / max(spineWidth * 1.35, 0.005);
  float rayCoord1 = rayNormX * 15.0;
  float rayCoord2 = rayNormX * 24.0;
  float rayWarp = sin(y * 14.0 - uTime * 2.2) * 0.4;
  float f1 = pow(0.5 + 0.5 * cos(rayCoord1 + rayWarp), 7.0);
  float f2 = pow(0.5 + 0.5 * sin(rayCoord2 - uTime * 1.6), 8.0);
  float causticFilaments = (f1 * 0.65 + f2 * 0.45) * exp(-pow(abs(x) / (haloWidth * 1.15), 2.0)) * flareCurve * (0.25 + 0.75 * rimMask);

  // ------------------------------------------------------------------------
  // 5. PHOTONIC CONTACT CREST & ILLUMINATED RIM (Strictly bounded to card top)
  // ------------------------------------------------------------------------
  float distToRim = abs(dy);
  float rimSpan = exp(-pow(x / 0.18, 2.0));

  // Incandescent contact focal point (contained within box bounds)
  float contactHot = exp(-pow(distToRim / 0.006, 2.0)) * rimSpan * rimMask;

  // Warm amber / copper contact seam (contained within box bounds)
  float amberSeam = exp(-pow(distToRim / 0.0025, 2.0)) * rimSpan * 0.92 * rimMask;

  // Soft atmospheric contact bloom
  vec2 bloomP = vec2(x / 0.22, dy / 0.10);
  float bloom = exp(-dot(bloomP, bloomP)) * (0.15 + 0.85 * rimMask);

  // ------------------------------------------------------------------------
  // 6. SEAMLESS VERTICAL CONTINUITY (No knife-edge cutoff, zero side bleed)
  // ------------------------------------------------------------------------
  float depthBelow = max(0.0, -dy);
  float underglow = exp(-pow(depthBelow / 0.15, 2.0));

  // Horizontal containment: checks if pixel is horizontally outside the window shell
  float outsideBox = smoothstep(uBox.z - 0.008, uBox.z + 0.008, uv.x) + smoothstep(uBox.x + 0.008, uBox.x - 0.008, uv.x);
  outsideBox = clamp(outsideBox, 0.0, 1.0);

  // Seamless vertical envelope: stops any flare skirt or underglow from leaking past corners into open air
  float verticalEnvelope = (y <= boxTop)
      ? (1.0 - outsideBox * smoothstep(boxTop - 0.04, boxTop, y) * 0.95)
      : underglow * (1.0 - outsideBox);

  // ------------------------------------------------------------------------
  // 7. AMBIENT DOT-MATRIX / HALFTONE FIELD (Signature tech grid)
  // ------------------------------------------------------------------------
  vec2 dotGrid = gl_FragCoord.xy / 8.5;
  vec2 dotFract = fract(dotGrid) - 0.5;
  float dotDist = length(dotFract);
  float dotShape = 1.0 - smoothstep(0.08, 0.24, dotDist);
  // Subtle ambient illumination from the beam aura and nebula across the sky
  float ambientIllum = exp(-pow(abs(x) / 0.95, 1.5)) * smoothstep(0.02, 0.28, y);
  float dotMatrix = dotShape * (ambientIllum * 0.22 + nebula * 0.35 + halo * 0.25);

  // ------------------------------------------------------------------------
  // 8. HIGH-CONTRAST PHOTONIC PALETTE
  // ------------------------------------------------------------------------
  vec3 colIndigo = vec3(0.18, 0.22, 0.88);  // Deep celestial indigo
  vec3 colCyan   = vec3(0.10, 0.78, 1.00);  // Electric neon cyan
  vec3 colViolet = vec3(0.56, 0.32, 0.96);  // Radiant silk violet
  vec3 colWhite  = vec3(1.00, 1.00, 1.00);  // Pure incandescent white
  vec3 colAmber  = vec3(1.00, 0.64, 0.22);  // Warm copper/amber contact seam
  vec3 colNebula = vec3(0.22, 0.26, 0.94);  // Cosmic atmospheric nebula

  vec3 colorOut = vec3(0.0);
  // Volumetric nebula & ambient halftone grid
  colorOut += colNebula * (nebula * 0.90);
  colorOut += colCyan   * (dotMatrix * 0.85);
  // Atmospheric aura, silk & caustic filaments
  colorOut += colIndigo * (aura * 0.40 * plasma);
  colorOut += colViolet * (halo * 0.60 * plasma + silk * 0.65 + causticFilaments * 0.70);
  // Electric core spine & caustic filaments
  colorOut += colCyan   * (cyanSpine * 0.90 * plasma + causticFilaments * 0.65);
  // Incandescent core & contact crest
  colorOut += colWhite  * (core * 1.65 * plasma + contactHot * 1.55 + bloom * 0.60);
  // Warm contact highlight seam
  colorOut += colAmber  * (amberSeam * 0.88);

  // Alpha composition
  float alpha = core * 1.00
              + cyanSpine * 0.85
              + halo * 0.55
              + aura * 0.35
              + silk * 0.50
              + causticFilaments * 0.75
              + nebula * 0.65
              + dotMatrix * 0.45
              + contactHot * 0.95
              + amberSeam * 0.75
              + bloom * 0.50;

  alpha = clamp(alpha * along * verticalEnvelope, 0.0, 1.0);
  colorOut = clamp(colorOut, 0.0, 1.0);

  // Premultiplied alpha output for WebGL
  gl_FragColor = vec4(colorOut * alpha, alpha);
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

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
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
    const uBox = gl.getUniformLocation(program, 'uBox');
    const uTargetX = gl.getUniformLocation(program, 'uTargetX');

    gl.uniform3f(uColor, 79 / 255, 90 / 255, 245 / 255);

    const state = { drop: 0, mx: 0.64, my: 0.2 };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateBoxAndTarget = () => {
      const host = wrap.parentElement || wrap;
      const frame = host.querySelector('.product-window-shell') || host.querySelector('.product-window') || host.querySelector('.product-frame');
      const inbox = host.querySelector('.product-inbox');
      const wrapRect = wrap.getBoundingClientRect();

      if (frame && wrapRect.width > 0 && wrapRect.height > 0) {
        const boxRect = frame.getBoundingClientRect();
        const bLeft = (boxRect.left - wrapRect.left) / wrapRect.width;
        const bTop = (boxRect.top - wrapRect.top) / wrapRect.height;
        const bRight = (boxRect.right - wrapRect.left) / wrapRect.width;
        const bBottom = (boxRect.bottom - wrapRect.top) / wrapRect.height;

        let targetX = bLeft + (bRight - bLeft) * 0.68;
        if (inbox && inbox.offsetParent !== null) {
          const inboxRect = inbox.getBoundingClientRect();
          if (inboxRect.width > 0) {
            // Shift into the Intelligence panel for balanced right alignment and clear headline breathing room
            targetX = (inboxRect.left - wrapRect.left + inboxRect.width * 0.32) / wrapRect.width;
          }
        } else if (bRight > bLeft) {
          targetX = (bLeft + bRight) * 0.58;
        }

        // Keep target comfortably within frame boundaries
        if (bRight > bLeft) {
          targetX = Math.max(bLeft + (bRight - bLeft) * 0.35, Math.min(bRight - (bRight - bLeft) * 0.12, targetX));
        }

        gl.uniform4f(uBox, bLeft, bTop, bRight, bBottom);
        gl.uniform1f(uTargetX, targetX);
      } else {
        gl.uniform4f(uBox, 0.12, 0.58, 0.88, 0.95);
        gl.uniform1f(uTargetX, 0.66);
      }
    };

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
      updateBoxAndTarget();
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
      updateBoxAndTarget();
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

