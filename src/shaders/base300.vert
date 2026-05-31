#version 300 es
// GLSL ES 3.0 pass-through vertex shader, for fragment shaders that need
// WebGL2 features (round(), dynamic float loops, etc.).
in vec2 uv;
in vec2 position;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
