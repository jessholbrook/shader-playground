precision highp float;

uniform sampler2D tMap;     // the image
uniform vec2 uImageSize;    // natural pixel size of the image (for cover-fit)
uniform vec2 uPlaneSize;    // size of the plane in pixels (the DOM box)
uniform float uTime;
uniform vec2 uMouse;        // mouse in 0..1 over the plane (y up)
uniform float uHover;       // 0..1 eased hover state
uniform float uScrollVel;   // signed scroll velocity, roughly -1..1

varying vec2 vUv;

// cheap 2D value noise
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

// object-fit: cover — keep the image's aspect ratio inside the plane
vec2 coverUv(vec2 uv, vec2 planeSize, vec2 imageSize) {
  vec2 s = planeSize / imageSize;
  float scale = max(s.x, s.y);
  vec2 size = imageSize * scale;
  vec2 offset = (planeSize - size) * 0.5;
  return (uv * planeSize - offset) / size;
}

void main() {
  vec2 uv = coverUv(vUv, uPlaneSize, uImageSize);

  // distance from mouse drives a localized ripple lens
  vec2 toMouse = uv - uMouse;
  float d = length(toMouse);
  float ripple = sin(d * 28.0 - uTime * 3.0) * exp(-d * 6.0);

  // flowing noise displacement, energized by hover + scroll velocity
  float n = noise(uv * 6.0 + uTime * 0.15);
  float energy = uHover * 0.5 + abs(uScrollVel) * 0.5;
  vec2 displace = vec2(
    ripple * 0.03 * uHover,
    n * 0.02 * energy
  );
  displace += normalize(toMouse + 1e-4) * ripple * 0.02 * uHover;

  vec2 duv = uv + displace;

  // chromatic aberration scaled by how much we're distorting
  float ca = (length(displace) + abs(uScrollVel) * 0.01) * 1.5;
  vec2 dir = normalize(toMouse + 1e-4);
  float r = texture2D(tMap, duv + dir * ca).r;
  float g = texture2D(tMap, duv).g;
  float b = texture2D(tMap, duv - dir * ca).b;

  vec3 col = vec3(r, g, b);

  // subtle highlight along the ripple crest
  col += vec3(0.4, 0.7, 1.0) * ripple * uHover * 0.25;

  // fade out where uv leaves the image (avoids edge smearing)
  vec2 edge = step(0.0, duv) * step(0.0, 1.0 - duv);
  float mask = edge.x * edge.y;
  gl_FragColor = vec4(col, mask);
}
