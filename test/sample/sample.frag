uniform sampler2D diffuse;
varying vec2 uv;

void main() {
  gl_FragColor = texture2D(diffuse, uv);
}
