#version 300 es
precision highp float;
precision highp int ;

in float red ;
out vec4 outColor;

in vec4 ocolor ;
void main() {
  outColor = ocolor ;
}
