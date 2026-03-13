let SketchCycloid = (containerId) => (p) => {
let w;
let h;
let translation;
let scaling = [1,-1];

let t = 0;
let dt = 0.1;
let wait = 0;
let wait_timer = 0;

let R = 35;
let v = 20;
let x0 = -100;

p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth
  h = container.clientHeight
  translation = [w/2,h/2+50];


  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

//   p.canvas.oncontextmenu = function(e) {
//     e.preventDefault();
//     return false;
//   };

}


//////// DRAW ////////



p.draw = function() {
  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  p.background(bgColor);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);
  p.stroke(textColor);
  p.fill(bgColor);

  if(!wait){
  if(t>(2*p.PI*R/v)){
    wait = true;
  } else {
    t += dt;
  }
  } else {
    wait_timer += dt;
    if(wait_timer>5){
        t -= (2*p.PI*R/v);
        wait = 0;
        wait_timer = 0;
    }
  }

  pos = [x0+v*t,R];
  p.line(x0,0,x0+2*R*p.PI,0);

  p.circle(pos[0],pos[1],2*R);
  for(let i=0; i<8; i+=1){
    p.line(pos[0]+2*p.cos(t*v/R+i/8*2*p.PI),pos[1]-2*p.sin(t*v/R+i/8*2*p.PI),pos[0]+(R-5)*p.cos(t*v/R+i/8*2*p.PI),pos[1]-(R-5)*p.sin(t*v/R+i/8*2*p.PI));
  }

  p.show_cycloid(t*v/R);
  p.circle(pos[0]+R*p.cos(t*v/R+p.PI/2),pos[1]-R*p.sin(t*v/R+p.PI/2),2*5);
  

}

p.show_cycloid = function(t){
  point0 = p.cycloid(0);
  for(let i=0; i<p.round(t/dt); i+=1){
    point1 = p.cycloid(i*dt);
    p.line(point0[0],point0[1],point1[0],point1[1]);
    point0 = point1;
  }
}

p.cycloid = function(t){
  return [x0+R*(t-p.sin(t)),R*(1-p.cos(t))];
}


}

new p5(SketchCycloid("p5-container-cycloid"));
