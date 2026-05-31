precision highp float;

uniform sampler2D tFrom;
uniform sampler2D tTo;
uniform vec2 uFromSize;
uniform vec2 uToSize;
uniform vec2 uPlaneSize;
uniform float uProgress;   // 0..1, driven by scroll through the section
uniform float uTime;

varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

vec2 coverUv(vec2 uv, vec2 planeSize, vec2 imageSize) {
  vec2 s = planeSize / imageSize;
  float scale = max(s.x, s.y);
  vec2 size = imageSize * scale;
  vec2 offset = (planeSize - size) * 0.5;
  return (uv * planeSize - offset) / size;
}

void main() {
  // an organic dissolve front: noise decides which pixels flip first
  float n = noise(vUv * 4.0) * 0.6 + noise(vUv * 12.0) * 0.4;

  // widen the progress range so the front sweeps fully edge-to-edge
  float p = uProgress * 1.3 - 0.15;
  float edge = 0.18;
  float reveal = smoothstep(p - edge, p + edge, n);

  // push UVs apart near the dissolve front for a liquid "melt" at the boundary
  float boundary = 1.0 - abs(reveal - 0.5) * 2.0; // 1 at the front, 0 away from it
  vec2 push = vec2(0.0, boundary * 0.06);

  vec2 fromUv = coverUv(vUv + push, uPlaneSize, uFromSize);
  vec2 toUv   = coverUv(vUv - push, uPlaneSize, uToSize);

  vec3 from = texture2D(tFrom, fromUv).rgb;
  vec3 to   = texture2D(tTo, toUv).rgb;

  vec3 col = mix(from, to, reveal);

  // bright seam riding the dissolve front
  col += vec3(0.5, 0.7, 1.0) * boundary * 0.15;

  gl_FragColor = vec4(col, 1.0);
}
