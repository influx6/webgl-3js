
varying float vElevation;

uniform float uColorOffset;
uniform float uColorMultiplier;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

void main(){
    // vec3 color = mix(uDepthColor, uSurfaceColor, vElevation);t
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    gl_FragColor = vec4(color, 1.0);
}
