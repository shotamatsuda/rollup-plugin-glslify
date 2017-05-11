uniform mat4 modelViewProjectionMatrix;
attribute vec3 position;

#pragma glslify: transform = require('./transform.glsl')

void main() {
  gl_Position = modelViewProjectionMatrix * vec4(trasform(position), 1.0);
}
