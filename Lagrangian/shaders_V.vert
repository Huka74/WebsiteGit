
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main(){
    vTexCoord = aTexCoord;
    vec4 position = vec4(aPosition,1.);
    position.xy = position.xy*2. - 1.;
    // position.xy = position.xy*vec2(2.,-2.)-vec2(1.,-1.);

    gl_Position = position;
}
