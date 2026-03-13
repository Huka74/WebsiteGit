let dipoleSketch = (p) => {

let r;
let R = 10;
let r_1;
let r_2;
let d = 40;
let N = 20;
let triangle_size = 3;
let mouse_in = false;
let timestep = 0;

p.setup = function () {
    let container = document.getElementById("p5-container-dipole"); // Get the div
    let canvas = p.createCanvas(container.clientWidth-50, container.clientHeight-50);
    canvas.parent("p5-container-dipole"); // Attach canvas inside the div
  

  r_1 = p.createVector(0,-d);
  r_2 = p.createVector(0,d);
  
}

p.draw = function () {
  p.background(0);
  p.fill(255);
  p.translate(p.width/2,p.height/2)
  p.circle(r_1.x,r_1.y,2*R);
  p.circle(r_2.x,r_2.y,2*R);

  p.stroke(255);
  p.strokeWeight(2);


  if(p.is_mouse_in()){
    if(!mouse_in && timestep==0){
      timestep = 50;
    }
    mouse_in = true;
  }else{
    // if(mouse_in){
    // }
    mouse_in = false;
  }

  if(timestep>0){
    timestep -= 1;
    // angle = 2*p.PI*(1-rotate/50);
    // r_1 = p.createVector(d*p.sin(angle+p.PI),d*p.cos(angle+p.PI));
    // r_2 = p.createVector(d*p.sin(angle),d*p.cos(angle));
    d = 40*(1+p.sin(timestep/50*p.PI));
    r_1 = p.createVector(0,-d);
    r_2 = p.createVector(0,d);
  }

  for(let i=0; i<N; i++){
    let drawn = false;
    let h = 5;
    let theta = 2*p.PI/N*i;
    phi = p.atan2(r_1.y-r_2.y,r_1.x-r_2.x)
    let x1 = r_1.copy().add(p.createVector(p.cos(theta),p.sin(theta)).mult(0.1));
    let x2 = r_2.copy().add(p.createVector(p.cos(p.PI-theta+2*phi),p.sin(p.PI-theta+2*phi)).mult(0.1));
    let x1_new;

    j = 0;
    // while(p.dist(x2.x,x2.y,r_1.x,r_1.y)>5 && j<35){
    while(x2.y>-0.1 && j<30){
      j+=1;
      let x2_new = p.step(x2,-h);
      p.line(x2.x,x2.y,x2_new.x,x2_new.y);

      if(!drawn && (p.dist(x2.x,x2.y,r_2.x,r_2.y)>100)){
        drawn = true;
        let angle = p.atan2(x2_new.y-x2.y,x2_new.x-x2.x)+p.PI/2;
        p.draw_triangle(x2,angle,triangle_size);
      }

      x2 = x2_new.copy();
    }
    drawn = false;
    j = 0;
    // while(p.dist(x1.x,x1.y,r_2.x,r_2.y)>1 && j<35){
    while(x1.y<-0.1 && j<30){
      j+=1;
      x1_new = p.step(x1,h);
      p.line(x1.x,x1.y,x1_new.x,x1_new.y);

      if(!drawn && (p.dist(x1.x,x1.y,r_1.x,r_1.y)>100)){
        drawn = true;
        let angle = p.atan2(x1_new.y-x1.y,x1_new.x-x1.x)-p.PI/2;
        p.draw_triangle(x1,angle,triangle_size);
      }

      x1 = x1_new.copy();
    }

    // if(j<30){
    //   let angle = p.atan2(x1_new.y-x1.y,x1_new.x-x1.x)-p.PI/2;
    //   p.draw_triangle(x1,angle,triangle_size);
    // }
    
  }

}

p.draw_triangle = function(pos,angle,l){
  p.translate(pos.x,pos.y)
  p.rotate(angle)
  p.triangle(l,-1.73/2*l,-l,-1.73/2*l,0,1.73/2*l)
  p.rotate(-angle)
  p.translate(-pos.x,-pos.y)
}

p.is_mouse_in = function(){
    return (p.mouseX!=0 || p.mouseY!=0) && ((p.mouseX>-25) && (p.mouseX<p.width+25) && (p.mouseY>-25) && (p.mouseY<p.height+25));
  }

p.RK4 = function(Theta,h){
  let k1 = p.F(Theta);
  let k2 = p.F(Theta.copy().add(k1.copy().mult(h/2)));
  let k3 = p.F(Theta.copy().add(k2.copy().mult(h/2)));
  let k4 = p.F(Theta.copy().add(k3.copy().mult(h)));
  return (Theta.copy()).add((k1.copy()
  .add(k4.copy()
  .add(k2.copy().mult(2)
  .add(k3.copy().mult(2))))).mult(1/6*h));
}

p.step = function(x,h){
  return p.RK4(x,h)
}


p.F = function(r){
  return p.E(r).copy().mult(1/p.abs_(p.E(r).copy()));
}

p.E = function(r){
  return (r.copy().sub(r_1)).mult(1/(p.abs_(r.copy().sub(r_1))**3+0.001)).sub(
         (r.copy().sub(r_2)).mult(1/(p.abs_(r.copy().sub(r_2))**3+0.001)));
}

p.abs_ = function(x){
  return p.sqrt(x.x**2+x.y**2);
}

}

new p5(dipoleSketch);