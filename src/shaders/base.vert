// Minimal pass-through vertex shader.
// Geometry is provided in clip space (a full-screen triangle or a plane),
// so we just forward position and UVs to the fragment shader.
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
