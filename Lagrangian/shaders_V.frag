precision mediump float;

varying vec2 vTexCoord;

vec3 V2color(float v){
  float x = 2./v;
  // return vec3(x,1.-x,0.);
  vec3 col1 = vec3(26./255., 219./255., 0);
  vec3 col2 = vec3(255./255., 229./255., 0);
  vec3 col3 = vec3(255./255.,0,0);
  if(x<0.5){
    return mix(col3,col2,2.*x);
  } else {
    return mix(col2,col1,(x-0.5)*2.);
  }
}

float f(float r){
  return 1./(r+0.2)/5.;
}

float f_inv(float r){
  return 1./(5.*r)-0.2;
}

float maskValue(vec2 pos){
  float x = pos.x-0.5;
  float y = pos.y-0.5;
  float r = sqrt(x*x+y*y);
  float f_1 = f(1.);
  float f_0 = f(0.);
  float eps = 0.002;
  float m = 0.;

  const float Nc = 10.;
  const float Nr = 12.;

  for(float i=0.; i<Nc; i+=1.){
    float a = f_inv(f_1*i/Nc+(1.-i/Nc)*f_0);
    m += (smoothstep(a-eps,a,r))*(1. - smoothstep(a,a+eps,r));
  }
  

  eps = 0.0005;
  float a = atan(y,x)/3.1415926+1./Nr;
  for(float i=-Nr/2.; i<=Nr/2.; i+=1.){
    float ai = 2.*i/Nr;
    m += (smoothstep(ai-eps/r,ai,a))*(1. - smoothstep(ai,ai+eps/r,a));
  }

  return m;
}

bool mask(vec2 pos){
  float x = pos.x-0.5;
  float y = pos.y-0.5;
  float r = 1./(sqrt(x*x+y*y));
  if(abs(r-floor(r))<0.01){
    return true;
  } else {
    return false;
  }
}

float V(vec2 pos){
  float x = pos.x-0.5;
  float y = pos.y-0.5;
  return 1./sqrt(x*x+y*y);
}

vec3 color(vec2 pos){
  // if(mask(pos)){
  //   return V2color(V(pos));
  // }
  // return vec3(0.,0.,0.);
  float mask = maskValue(pos);
  vec3 circleColor = V2color(V(pos));
  return mix(vec3(1.,1.,1.), circleColor, mask);
}

void main() {
  
  // gl_FragColor = vec4(vTexCoord,0.,1.);
  // gl_FragColor = vec4(V2color(V(vTexCoord)),1.);
  gl_FragColor = vec4(color(vTexCoord),1.);
}