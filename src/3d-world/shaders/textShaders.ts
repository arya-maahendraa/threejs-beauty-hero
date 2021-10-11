const vertex = `
attribute float size;
attribute vec3 customColor;
varying vec3 vColor;


void main() {
   vColor = customColor;
   vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
   gl_PointSize = size * (10. / -mvPosition.z);
   gl_Position = projectionMatrix * mvPosition;
}
`;

const fragment = `
uniform vec3 color;
uniform sampler2D texture1;
varying vec3 vColor;

void main() {
   gl_FragColor = vec4( color * vColor, 1.0 );
   gl_FragColor = gl_FragColor * texture2D( texture1, gl_PointCoord );
}
`;

export { vertex, fragment };
