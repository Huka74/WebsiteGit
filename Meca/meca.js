let mecaSketch = (containerId) => (p) => {
let w;
let h;
let translation;
let scaling = [1,-1];

const L = 50;
let l = 100;
let d = 60;
let k = 1;
const m = 1;
let g = 0;
const lambd = 1;

// const dt = 1/60;
const dt_sim = 1/60;
const R_mass = 8;
const R_hitbox = 25;

let theta = p.PI;
let X_mass = [0,0];
let vtheta = 0;
let pos_save = [];

let valuesliders = [];
let A;
const N_graph = 100;
let x_plot;
let theta_;

let divg;

let UIObjects = [];
let draggedObject = null;


p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth
  h = container.clientHeight
  translation = [w/2,h/2-15];
  
  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  let pos_sliders = [-150,75];
  // let pos_sliders = [0,0];

  valuesliders = [new ValueSlider(p,pos=[pos_sliders[0],pos_sliders[1]],r_hitbox=[R_hitbox],val=d,val_lim=[50,150],distance=2, container, name="d", precision=0),
  new ValueSlider(p,pos=[pos_sliders[0],pos_sliders[1]+40],r_hitbox=[R_hitbox],val=l,val_lim=[0,175],distance=0.5, container, name="l", precision=0),
  new ValueSlider(p,pos=[pos_sliders[0],pos_sliders[1]+40*2],r_hitbox=[R_hitbox],val=g,val_lim=[0,100],distance=1, container, name="g", precision=0),
  new ValueSlider(p,pos=[pos_sliders[0],pos_sliders[1]+40*3],r_hitbox=[R_hitbox],val=k,val_lim=[0,10],distance=10, container, name="k")];

  A = new Axes(p,[0,-150],[30,1/50], p.color(255));

  show_equi_button = new Button(p,[150,0],r_hitbox=[15],max_val=3)

  mass1 = new Draggable(p,[0,0],[2*R_mass]);
  mass2 = new Draggable(p,[0,0],[2*R_mass]);

  divg = p.createDiv();
  // divg = document.createElement("div");
  // divg = p.createP();
  divg.parent(container);
  divg.style("font-size", "12px");
  // divg.style("position", "absolute");
  // divg.style("position", "relative");
  divg.style("transform", "translate(-50%, -50%)");
  divg.style("user-select", "none");
  divg.style("color", textColor);
  katex.render("\\vec{g}",divg.elt);


  mass1.handleRelease = p.handleRelease_velocity();
  mass1.show = p.show_mass();
  mass2.handleRelease = p.handleRelease_velocity();
  mass2.show = p.show_mass();


  UIObjects = valuesliders.concat([show_equi_button,mass1,mass2]);

  x_plot = linspace(-p.PI*3/2, p.PI*3/2, N_graph);
}

p.show_mass = function(){
  return function(mouseX,mouseY, translation, scaling){
    color = p.color(255)
    if(this.p.dist((mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1],this.position[0],this.position[1])<this.r_hitbox){
      color = p.lerpColor(color,p.color(0),0.3);
    }
    p.fill(color)
    p.circle(this.position[0], this.position[1], 2*R_mass)
  }
}

p.handleRelease_velocity = function(){
  return function(){
  let v = (pos_save[pos_save.length-1]-pos_save[0]+2*math.PI)%(2*math.pi);
  if(v>math.PI){
    v = v-2*math.PI;
  }
  vtheta = (v)/(2*dt_sim);
  // console.log(pos_save)
  }
}



p.draw = function() {

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  p.background(bgColor);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);

  p.noFill();
  p.strokeWeight(1);
  p.stroke(textColor);
  p.circle(0,0,2*L);
  p.fill(textColor);

  // System
  X_attach = [0,L+d];
  p.circle(X_attach[0],X_attach[1],5);
  p.circle(0,0,5);

  X_mass = [L*p.cos(theta-p.PI/2),L*p.sin(theta-p.PI/2)];
  spring(p,X_mass,X_attach,10,15,5,p.log((1.718281828)*k+1));
  p.line(X_mass[0],X_mass[1],0,0);
  // p.circle(X_mass[0],X_mass[1],2*R_mass);
  mass1.position = X_mass;
  mass1.show(p.mouseX,p.mouseY, translation, scaling);
  

  if(draggedObject==mass1 || draggedObject==mass2){
    if(draggedObject==mass1){
      pos_mouse_transformed = p.transformMouse([p.mouseX, p.mouseY], translation, scaling)
      theta = math.atan2(pos_mouse_transformed[0],-pos_mouse_transformed[1]);
    }
    else if(draggedObject==mass2){
      let L_perio = p.PI*30;
      theta_[0] = ((p.mouseX-translation[0]+L_perio)%(2*L_perio)+2*L_perio)%(2*L_perio)-L_perio;
      // console.log(theta_[0]/L_perio)
      theta = A.pix2co(theta_)[0]
    }
    pos_save.push(theta);
    if (pos_save.length > 2) {
      pos_save.shift();
    }

  } else{
    p.update();
  }

  // g
  if(g!=0){
    arrow(p,[150,100],50*g/100,4*g/100,10*g/100,p.PI);
  divg.position(150+w/2-12,h/2-(100-25*g/100)-15);
  divg.style("color", textColor);
  divg.show();
  } else{
    divg.hide();
  }

  // Hover
  // let alpha = 0.1;
  // pos_mouse_transformed = p.transformMouse([p.mouseX, p.mouseY], translation, scaling)
  // if(p.dist(pos_mouse_transformed[0],pos_mouse_transformed[1],X_mass[0],X_mass[1])<1.4*R_mass){
  //   alpha = 0.8;
  // }
  // col = p.color(255,255,255)
  // col.setAlpha(alpha*255);
  // p.fill(col);
  // p.strokeWeight(0);
  // p.circle(X_mass[0],X_mass[1],2*1.4*R_mass);


  // Plot
  p.stroke(textColor);
  p.strokeWeight(1);
  A.plot(x_plot, x_plot.map(p.V));
  A.show_axis([-p.PI*3/2,-p.PI*3/2],[0,50]);

  theta_ = A.co2pix([theta,p.V(theta)]);
  // p.circle(theta_[0],theta_[1],10);
  p.stroke(textColor);
  mass2.position = theta_;
  mass2.show(p.mouseX,p.mouseY, translation, scaling);


  // Equi
  show_equi_button.show()
  if(show_equi_button.val==1){
    p.show_equi(p.compute_equi())
  }else if(show_equi_button.val==2){
    p.show_potential_color()
  }


  // Sliders
  for(let valueslider of valuesliders){
    valueslider.show(p.mouseX,p.mouseY, translation, scaling);
    valueslider.color = textColor;
  }

  d = valuesliders[0].val;
  l = valuesliders[1].val;
  g = valuesliders[2].val;
  k = valuesliders[3].val;
  
  for(let obj of UIObjects){
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.show_shadow();
    }
  }
  
}


p.show_potential_color = function(){
  let V_arr = x_plot.map(x => p.V(x))
  let max_arr = Math.max(...V_arr);
  let min_arr = Math.min(...V_arr);
  let show_constant = false;
  if((max_arr-min_arr)<1e-5){
    show_constant = true;
  }
  // console.log(V_arr)
  p.strokeWeight(1)
  p.stroke(p.color_grad(0));
  for(let i=0; i<N_graph-1; ++i){
    if(!show_constant){
      p.stroke(p.color_grad((V_arr[i]-min_arr)/(max_arr-min_arr)));
    }
    p.line(L*p.cos(x_plot[i]-p.PI/2),L*p.sin(x_plot[i]-p.PI/2),L*p.cos(x_plot[(i+1)%N_graph]-p.PI/2),L*p.sin(x_plot[(i+1)%N_graph]-p.PI/2))
    p.line(30*x_plot[i],-150,30*x_plot[i+1],-150);
  }
}

p.color_grad = function(x){
  // return p.color(255*x,255*(1-x),0);
  return p.lerpColor(p.color(0,255,115),p.color(0,0,117),x);
}

p.show_equi = function(arr){
  p.strokeWeight(3);
  if(arr.length!=0){
  for(let angle of arr){
    // p.stroke(255*(1-angle[1]),255*angle[1],0);
    p.stroke(p.color_grad(1-angle[1]));
    p.line(L*p.cos(angle[0])*0.95,L*p.sin(angle[0])*0.95,L*p.cos(angle[0])*1.05,L*p.sin(angle[0])*1.05)

    pos = A.co2pix([angle[0]+p.PI/2,0]);
    p.line(pos[0],pos[1]-5,pos[0],pos[1]+5);
  }
  // p.stroke(255*(1-arr[1][1]),255*arr[1][1],0);
  p.stroke(p.color_grad(1-arr[1][1]));
  pos = A.co2pix([-p.PI,0]);
  p.line(pos[0],pos[1]-5,pos[0],pos[1]+5);

  p.stroke(255)}
}

p.compute_equi = function(){
  if((l==0 && k*(L+d)-m*g==0) || (k==0 && g==0)){
    return [];
  }
  let theta_equi = (l*k*(L+d)/(k*(L+d)-m*g))**2/(2*L*(L+d))-L/(2*(L+d))-(L+d)/(2*L);
  if(p.abs(theta_equi)>1){
    return [[-p.PI/2,theta_equi>1],[p.PI/2,theta_equi<-1]];
  } else {
    return [[-p.PI/2,theta_equi>1],[p.PI/2,theta_equi<-1],[p.acos(theta_equi)-p.PI/2,1], [-p.acos(theta_equi)-p.PI/2,1]];
  }
}

p.V = function(theta){
		return -m*g*L*p.cos(theta)+1/2*k*(p.sqrt(L**2+(L+d)**2+2*L*(L+d)*p.cos(theta))-l)**2;
}


// p.mousePressed = function(){
//   UIManager.handle_mousePressed(p.mouseX,p.mouseY,[w/2,h/2],[1,-1]);
//   // console.log(UIManager.ind_dragging)
//   // console.log(UIManager.drag_arr)
//   if(p.dist(p.mouseX-w/2,h/2-p.mouseY,X_mass[0],X_mass[1])<1.4*R_mass){
//     is_dragging = 1;
//   }
//   if(p.dist(p.mouseX-w/2,h/2-p.mouseY,theta_[0],theta_[1])<1.4*R_mass){
//     is_dragging = 2;
//   }
// }

// p.mouseReleased = function() {
//   UIManager.handle_mouseReleased();
//   if(is_dragging){
//     // console.log(pos_save)
//     let v = (pos_save[pos_save.length-1]-pos_save[0]+2*math.PI)%(2*math.pi);
//     if(v>math.PI){
//       v = v-2*math.PI;
//     }
//     // console.log(v);
//     vtheta = (v)/(5*dt_sim);
//     is_dragging = 0;
//   }
// }


p.F = function(theta){
	// return [theta[1], -L/m*sin(theta[0])*(m*g-2*k*(L+d)*(sqrt(L**2+(L+d)**2+2*L*(L+d)*cos(theta[0])) - l)) - lambd*theta[1]];
  return [theta[1], p.sin(theta[0])*(-g + k/m*(L+d)*(1 - l/p.sqrt(L**2+(L+d)**2+2*L*(L+d)*p.cos(theta[0])))) - lambd*theta[1]];
}

p.RK4 = function(x){
  k1 = p.F(x);
	k2 = p.F(math.add(x,math.multiply(k1,dt_sim/2)));
	k3 = p.F(math.add(x,math.multiply(k2,dt_sim/2)));
	k4 = p.F(math.add(x,math.multiply(k3,dt_sim)));
	return math.add(x, math.multiply(math.add(k1,math.add(math.multiply(k2,2),math.add(math.multiply(k3,2),k4))),dt_sim/6));
}

p.update = function(){
  [theta,vtheta] = p.RK4([theta, vtheta]);
  theta = ((theta+2*p.PI)%(2*p.PI) + p.PI)%(2*p.PI)-p.PI; // -3PI%2PI = -PI !
}

p.mousePressed = function(){
  let mousePos = p.transformMouse([p.mouseX, p.mouseY], translation, scaling);

  for(let obj of UIObjects) {
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.handlePress(mousePos[0], mousePos[1]);
      draggedObject = obj;
      return false;
    }
  }

  // return false;
}

p.mouseDragged = function(){
  let mousePos = p.transformMouse([p.mouseX, p.mouseY], translation, scaling);

  if(draggedObject){
    draggedObject.handleDrag(mousePos[0], mousePos[1]);
  }

  // return false;
}

p.mouseReleased = function(){
  if (draggedObject) {
    draggedObject.handleRelease();
    draggedObject = null;
    return;
  }

}

p.touchStarted = function(){
  let touch = p.touches[0];
  if(!touch) return false;
  
  let mousePos = p.transformMouse([touch.x, touch.y], translation, scaling);

  for(let obj of UIObjects) {
    if(obj.isMouseOn([touch.x, touch.y], translation, scaling)){
      obj.handlePress(mousePos[0], mousePos[1]);
      draggedObject = obj;
      return false; // prevents scroll AND stops loop
    }
  }
  return false; // always prevent default scroll/zoom
}

p.touchMoved = function(){
  let touch = p.touches[0];
  if(!touch) return false;

  let mousePos = p.transformMouse([touch.x, touch.y], translation, scaling);

  if(draggedObject){
    draggedObject.handleDrag(mousePos[0], mousePos[1]);
  }
  return false; // critical — prevents page scroll while dragging
}

p.touchEnded = function(){
  if(draggedObject){
    draggedObject.handleRelease();
    draggedObject = null;
  }
  return false;
}

p.transformMouse = function([mouseX, mouseY], translation, scaling){
    return [(mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1]];
}

}

new p5(mecaSketch("p5-container-meca"))