let SketchParaboleLagrangian = (containerId) => (p) => {
let w;
let h;
let translation;
let scaling;

let dragging = false;
let UIObjects = [];
let draggedObject = null;

let y1;
let y2;
let traj;
let button_play;
let t_anim = 0;
let dt_anim = 1/30;

let bgColor;
let textColor;

let div_axis_labelx;

let axis;
let t;
let T;
let g = 1;
let R = 8;
let R_hitbox = 15;

p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth;
  h = container.clientHeight;
  translation = [w/2,h/2+50];
  scaling = [1,-1];

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  const themeObserver = new MutationObserver(() => {
    bgColor = getComputedStyle(document.body).backgroundColor;
    textColor = getComputedStyle(document.body).color;
  });
  themeObserver.observe(document.body, { 
    attributes: true, 
    attributeFilter: ['class', 'data-theme', 'style'] 
  });

  p.canvas.oncontextmenu = function(e) {
    e.preventDefault();
    return false;
  };

  div_axis_labelx = p.createDiv();
  div_axis_labelx.parent(container);
  div_axis_labelx.style("font-size", "12px");
  div_axis_labelx.style("transform", "translate(-50%, -50%)");
  div_axis_labelx.style("user-select", "none");
  div_axis_labelx.style("color", textColor);

  axis = new Axes(p,[-125,0],[100,100],p.color(textColor));
  t = linspace(0,1,100);

  y1 = new Draggable(p,[-125,30],[R_hitbox]);
  y2 = new Draggable(p,[100,30],[R_hitbox]);
  y1.handleDrag = p.handleDrag_dir("y");
  y2.handleDrag = p.handleDrag_dir("y");
  y1.show_shadow = p.create_show_shadow_draggable("y");
  y2.show_shadow = p.create_show_shadow_draggable("y");
  y1.show = p.create_show();
  y2.show = p.create_show();

  T = new Draggable(p,[100,0],[R_hitbox]);
  T.handleDrag = p.handleDrag_dir("x");
  T.show_shadow = p.create_show_shadow_draggable("x");
  T.show = function(){
    div_axis_labelx.position(this.position[0]*scaling[0]+translation[0],this.position[1]*scaling[1]+translation[1]);
    div_axis_labelx.style("color", textColor);
    katex.render("T",div_axis_labelx.elt);
  }
  traj = new Draggable(p,[0,0],[0]);
  traj.g = g;
  traj.handleDrag = function(mouseX,mouseY){
    [t_,y_] = axis.pix2co([mouseX,p.min(p.max(mouseY,h/2-translation[1]),translation[1])]);

    // if(this.y1<y_ && y_<this.y2){
    // //   this.g = -2/(t_*(t_-this.T))*(y_-t_/this.T*this.y1-(1-t_/this.T)*this.y2);
    //   this.g = 2/this.T**2*(2*y_-this.y1-this.y2);
    // } else {
    //   this.g = -2/this.T**2*(this.y1+this.y2-2*y_)*(1 + Math.sqrt(1-((this.y1-this.y2)/(this.y1+this.y2-2*y_))**2));
    // }
    this.g = 4/this.T**2*(2*y_-this.y1-this.y2);
  }

  button_play = new Button(p,[axis.pos[0]-125,-25],[15],2);
  // button_play.show = function(){
  //   if(this.val){
  //     p.circle(this.position[0], this.position[1],2*10);
  //     let L = 9;
  //     p.rect(this.position[0]-L/2,this.position[1]-L/2,L,L);
  //   } else {
  //     p.circle(this.position[0], this.position[1],2*10);
  //     let L = 10;
  //     p.triangle(this.position[0]-Math.sqrt(3)/6*L,this.position[1]-L/2,
  //                this.position[0]-Math.sqrt(3)/6*L,this.position[1]+L/2,
  //                this.position[0]+Math.sqrt(3)/3*L,this.position[1]);
  //   }
  // }
  button_play.show = function(){
    offset = this.pressed ? -3 : -2*this.val;
    p.fill(textColor);
    p.circle(this.position[0], this.position[1]-3.5,2*15);
    p.fill(bgColor);
    p.stroke(textColor);
    p.circle(this.position[0], this.position[1] + offset,2*15);
    if(this.val){
      let L = 13;
      p.rect(this.position[0]-L/2,this.position[1]-L/2 + offset,L,L);
    } else {
      let L = 15;
      p.triangle(this.position[0]-Math.sqrt(3)/6*L,this.position[1]-L/2 + offset,
                 this.position[0]-Math.sqrt(3)/6*L,this.position[1]+L/2 + offset,
                 this.position[0]+Math.sqrt(3)/3*L,this.position[1] + offset);
    }
  }

  UIObjects.push(y1,y2,T,traj,button_play);


  div_action = p.createDiv();
  div_action.parent(container);
  div_action.style("font-size", "12px");
  div_action.style("transform", "translate(-50%, -50%)");
  div_action.style("user-select", "none");
  div_action.position(translation[0]+200,translation[1]+25);
  div_action.style("color", textColor);

  div_z = p.createDiv();
  div_z.parent(container);
  div_z.style("font-size", "12px");
  div_z.style("transform", "translate(-50%, -50%)");
  div_z.style("user-select", "none");
  div_z.position(translation[0]+axis.pos[0],translation[1]+axis.pos[1]-110);
  div_z.style("color", textColor);
  katex.render("z",div_z.elt);

  div_z2 = p.createDiv();
  div_z2.parent(container);
  div_z2.style("font-size", "12px");
  div_z2.style("transform", "translate(-50%, -50%)");
  div_z2.style("user-select", "none");
  div_z2.position(translation[0]+axis.pos[0]-150,translation[1]+axis.pos[1]-110);
  div_z2.style("color", textColor);
  katex.render("z",div_z2.elt);
}

p.handleDrag_dir = function(dir){
  if(dir=="y"){
    return function(mouseX,mouseY){
      this.position[1] = p.min(p.max(mouseY,h/2-translation[1]-25),translation[1]-25);
  }} else if(dir=="x"){
    return function(mouseX,mouseY){
      this.position[0] = p.min(p.max(mouseX,25+axis.pos[0]),translation[0]-125);
  }}
}

p.create_show_shadow_draggable = function(dir){
  if(dir=="y"){return function(){
    let l = 10;
    p.fill(bgColor);
    p.stroke(textColor);
    // arrow(p,[this.position[0]-l,this.position[1]],10,5,8,p.PI/2);
    // arrow(p,[this.position[0]+l,this.position[1]],10,5,8,-p.PI/2);
    arrow(p,[this.position[0],this.position[1]-l],10,5,8,p.PI);
    arrow(p,[this.position[0],this.position[1]+l],10,5,8,0);
  }} else if(dir=="x"){return function(){
    let l = 10;
    p.fill(bgColor);
    p.stroke(textColor);
    arrow(p,[this.position[0]-l,this.position[1]],10,5,8,p.PI/2);
    arrow(p,[this.position[0]+l,this.position[1]],10,5,8,-p.PI/2);
    // arrow(p,[this.position[0],this.position[1]-l],10,5,8,p.PI);
    // arrow(p,[this.position[0],this.position[1]+l],10,5,8,0);
  }}
}
p.create_show = function(){
  return function(){
    p.fill(bgColor);
    p.stroke(textColor);
    p.circle(this.position[0],this.position[1],2*R);
  }
}


//////// DRAW ////////

p.draw = function() {

  p.background(bgColor);
  // p.background(200);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);


  let T_time = axis.pix2co(T.position)[0];
  let y1_axis = axis.pix2co(y1.position)[1];
  let y2_axis = axis.pix2co(y2.position)[1];
  traj.T = T_time;
  traj.y1 = y1_axis;
  traj.y2 = y2_axis;
  y2.position[0] = T.position[0];

  t = linspace(0,T_time,100);

  let g_ = traj.g;

  // axis.show_axis([0,T_time],[0,1]);
  p.fill(textColor)
  arrow(p,axis.pos,T.position[0]-axis.pos[0]-10,1,4,-p.PI/2);
  arrow(p,axis.pos,100,1,4,0);
  div_z.style("color", textColor);
  axis.plot(t,t.map(x => p.f(x,g,T_time,y1_axis,y2_axis)));
  axis.plot(t,t.map(x => p.f(x,g_,T_time,y1_axis,y2_axis)));


  y1.show();
  y2.show();
  T.show();
  
  
  
  button_play.show();
  p.fill(textColor);
  p.stroke(textColor);
  arrow(p,[axis.pos[0]-150,0],100,1,4,0);
  div_z2.style("color", textColor);

  let l = 2;
  p.line(axis.pos[0]-125+l,y1.position[1]+l,axis.pos[0]-125-l,y1.position[1]-l);
  p.line(axis.pos[0]-125+l,y1.position[1]-l,axis.pos[0]-125-l,y1.position[1]+l);
  p.line(axis.pos[0]-125+l,y2.position[1]+l,axis.pos[0]-125-l,y2.position[1]-l);
  p.line(axis.pos[0]-125+l,y2.position[1]-l,axis.pos[0]-125-l,y2.position[1]+l);

  p.noFill();
  if(button_play.val){
    if(t_anim<T_time){
      p.show_anim(t_anim,g_,T_time,y1_axis,y2_axis);
      p.show_anim(t_anim,g,T_time,y1_axis,y2_axis);
      t_anim += dt_anim;
    } else {
      t_anim = 0;
      button_play.val = 0;
    }
  } else {
    t_anim = 0;
  }




  S_diff = p.abs(p.compute_action(g_,T_time,y1_axis,y2_axis)-p.compute_action(g,T_time,y1_axis,y2_axis));
  p.rect(200,-15,10,S_diff*40);
  div_action.style("color", textColor);
  katex.render("S="+p.str(p.round(S_diff,3)),div_action.elt);


  traj.isMouseOn = function([mouseX,mouseY],translation,scaling){
    let [x,y] = axis.pix2co([(mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1]]);
    let [a,b,c] = [-1/2*g_,1/2*g_*T_time+(y2_axis-y1_axis)/T_time,y1_axis];
    return (x<0.9*T_time && x>0.1 && p.abs(y-a*x*x-b*x-c)<0.05);
  }
  traj.show_shadow = function(){
    let col = p.color(textColor);
    col.setAlpha(10);
    p.stroke(col);
    p.strokeWeight(5);
    t = linspace(0.1,T_time-0.1,100);
    axis.plot(t,t.map(x => p.f(x,g_,T_time,y1_axis,y2_axis)));
    p.strokeWeight(1);
    p.stroke(textColor);
  }
  

  for(let obj of UIObjects){
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.show_shadow();
    }
  }
}


p.show_anim = function(t_anim,g,T_time,y1_axis,y2_axis){
  let pos = axis.co2pix([t_anim,p.f(t_anim,g,T_time,y1_axis,y2_axis)]);
  p.circle(pos[0],pos[1],5);
  p.drawingContext.setLineDash([10,4]);
  p.line(-250,pos[1],pos[0],pos[1]);
  p.drawingContext.setLineDash([]);
  p.circle(-250,pos[1],5);
}

p.f = function(t,g,T,y1,y2){
  return -1/2*g*t*(t-T) + y1*(1-t/T) + y2*t/T;
}

p.compute_action = function(g_,T,y1,y2){
  return T**3/24*g_*(g_-2*g) + 1/2*((y2-y1)**2/T - g*T*(y1+y2));
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
  if(dragging){
    dragging = false;
  }

  if (draggedObject) {
    draggedObject.handleRelease();
    draggedObject = null;
    return;
  }

}

p.transformMouse = function([mouseX, mouseY], translation, scaling){
    return [(mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1]];
}



}

new p5(SketchParaboleLagrangian("p5-container-parabole-lagrangian"));
