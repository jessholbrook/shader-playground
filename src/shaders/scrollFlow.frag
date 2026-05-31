precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;      // total scroll progress, 0..1 down the page
uniform float uScrollVel;   // signed scroll velocity, roughly -1..1
uniform vec2 uMouse;        // 0..1

varying vec2 vUv;

// --- fractal value noise -------------------------------------------------
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  // aspect-correct coordinates centered at 0
  vec2 uv = (vUv - 0.5);
  uv.x *= uResolution.x / uResolution.y;

  // scroll warps and pushes the field; velocity adds turbulence
  float t = uTime * 0.08 + uScroll * 2.5;
  vec2 q = uv * 2.0;
  q += vec2(fbm(q + t), fbm(q - t)) * (0.6 + abs(uScrollVel) * 1.2);

  // mouse gently pulls the flow
  q += (uMouse - 0.5) * 0.4;

  float f = fbm(q + uScroll * 3.0);

  // palette shifts as you scroll down the page
  vec3 a = vec3(0.05, 0.06, 0.12);
  vec3 b = vec3(0.20, 0.45, 0.95);
  vec3 c = vec3(0.95, 0.35, 0.55);
  vec3 col = mix(a, b, smoothstep(0.2, 0.7, f));
  col = mix(col, c, smoothstep(0.55, 0.95, f) * (0.3 + uScroll * 0.7));

  // velocity flashes brighter streaks
  col += abs(uScrollVel) * 0.15 * vec3(0.6, 0.8, 1.0);

  // vignette
  col *= 1.0 - 0.4 * dot(uv, uv);

  gl_FragColor = vec4(col, 1.0);
}
