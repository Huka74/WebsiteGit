let pendulumSketch = (p) => {

let L;
let g = -100;
let lambda = 4;
let Theta;
let dt = 1/60;
let X0;
let R = 10;
let theta_plot;
let pos_plot;
let color_plot;

let mouse_in = false;
let strokeWeight_size = 10;

p.setup = function() {
  let container = document.getElementById("p5-container-pendulum"); // Get the div
  let canvas = p.createCanvas(container.clientWidth-50, container.clientHeight-50);
  canvas.parent("p5-container-pendulum"); // Attach canvas inside the div

  L = 100;
  Theta = p.createVector(0,0);
  X0 = p.createVector(p.width/2,p.height/2-100);
  prev_pos = new Array(10).fill(p.createVector(0,0));
  p.fill(255);
  p.stroke(255);
  
  theta_plot = p.linspace(-p.PI,p.PI,50);
  pos_plot = p.createVector(p.width/2,p.height/2+25);

  color_plot = p.color(255,255,255)
  color_plot.setAlpha(128);
}



p.draw = function() {
  p.background(0);
  p.strokeWeight(strokeWeight_size);
  
  X = p.pos(Theta.x);
  p.circle(X.x,X.y, 2*R);
  p.circle(X0.x,X0.y, 2*R);
  p.line(X0.x,X0.y,X.x,X.y);
  if(p.abs(Theta.y)>0.01 || p.abs(Theta.x)>0.01){
    p.update();
  } else{
    Theta.x = 0;
  }


  if(p.is_mouse_in()){
    if(!mouse_in){
      Theta.y += 15;
      // p.scale_all(1.05);
    }
    mouse_in = true;
  }else{
    if(mouse_in){
      // p.scale_all(1/1.05);
    }
    mouse_in = false;
  }

  // p.stroke(color_plot)
  p.stroke(128);
  p.plot(theta_plot,theta_plot.map(x=>p.V(x)),pos_plot,[50,-1])
  p.stroke(255);

  p.circle(50*(p.mod_(Theta.x+p.PI,2*p.PI)-p.PI)+pos_plot.x,-p.V(Theta.x)+pos_plot.y,2*10);
}

p.mod_ = function(x,m){
  return (x+2*m)%m;
}

p.V = function(x){
  return g*p.cos(x);
}

p.plot = function(x,y,pos,size){
  for(let i=0; i<x.length-1; i++){
    p.line(size[0]*x[i]+pos.x,size[1]*y[i]+pos.y,size[0]*x[i+1]+pos.x,size[1]*y[i+1]+pos.y);
  }
}

p.scale_all = function(x){
  L*=x;
  R*=x;
  strokeWeight_size*=x;
}

p.is_mouse_in = function(){
  return (p.mouseX!=0 || p.mouseY!=0) && ((p.mouseX>-25) && (p.mouseX<p.width+25) && (p.mouseY>-25) && (p.mouseY<p.height+25));
}

p.pos = function(theta){
  let X = p.createVector(L*p.sin(theta),L*p.cos(theta));
  return X.copy().add(X0);
}

p.update = function(){
  // prev_pos.push(createVector(mouseX,mouseY));
  // if (prev_pos.length > 10) {
  //   prev_pos.shift();
  // }
  Theta = p.RK4(Theta);
}

p.RK4 = function(Theta){
  let k1 = p.F(Theta);
  let k2 = p.F(Theta.copy().add(k1.copy().mult(dt/2)));
  let k3 = p.F(Theta.copy().add(k2.copy().mult(dt/2)));
  let k4 = p.F(Theta.copy().add(k3.copy().mult(dt)));
  return (Theta.copy()).add((k1.copy()
  .add(k4.copy()
  .add(k2.copy().mult(2)
  .add(k3.copy().mult(2))))).mult(1/6*dt));
}

p.F = function(Theta){
  return p.createVector(Theta.y, g*p.sin(Theta.x)-lambda*Theta.y);
}

p.linspace = function(start, end, num) {
  let step = (end - start) / (num - 1);
  let array = [];
  for (let i = 0; i < num; i++) {
    array.push(start + step * i);
  }
  return array;
}

}

new p5(pendulumSketch)