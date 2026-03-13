let coord = (containerId) => (p) => {
let w;
let h;
let translation;
let scaling = [0.9,-0.9];
let r0 = 50;
let r;
let R = 200;
let R10 = 10;
let R20 = 20;
let R1;
let R2;
let X0 = [-220,-220];
let theta = 0;
let dtheta = 0.02;

let div_text = [];
let div_text_button = [];

let bgColor;
let textColor;


let mass_ratio;

let dragging = false;
let UIObjects = [];
let draggedObject = null;
let coord_button;


p.setup = function() {
  let container = document.getElementById(containerId); // Get the div
  canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);
  // canvasElt = canvas.elt;
  

  w = container.clientWidth;
  h = container.clientHeight;
  translation = [w/2,h/2-15];

  ratio = w/600;
  r0 *= ratio;
  r = r0;
  R *= ratio;
  R10 *= ratio;
  R1 = R10;
  R20 *= ratio;
  R2 = R20;
  X0[0] *= ratio;
  X0[1] *= ratio;

  mass_ratio = document.getElementById('mass-slider');
  mass_ratio.addEventListener('input', (e) => {
    m = parseFloat(e.target.value);
    R2 = R20*(1+m);
    R1 = R10/(1+m);
    r = (r0+R)/(1+(R2/R1)**2);
  });

  for(let i=0; i<2; ++i){
    div_text_button[i] = p.createDiv();
    div_text_button[i].parent(container)
    div_text_button[i].style("font-size", "12px");
    div_text_button[i].style("transform", "translate(-50%, -50%)");
    div_text_button[i].style("user-select", "none");
    div_text_button[i].style("color", textColor);
  }
  katex.render("r_e, r_p",div_text_button[0].elt);
  katex.render("r, R",div_text_button[1].elt);

  coord_button = new Button(p,[w/2,0],r_hitbox=[50,30,5],max_val=2);
  coord_button.show = function(){
    p.fill(textColor)
    // p.circle(this.position[0], this.position[1]-4, 2*this.r_hitbox)
    p.rect(this.position[0]-this.r_hitbox[0]/2,this.position[1]-this.r_hitbox[1]/2-4, this.r_hitbox[0], this.r_hitbox[1], this.r_hitbox[2]);
    p.fill(bgColor);
    offset = this.pressed ? -3*this.pressed : -2*this.val;
    // p.circle(this.position[0], this.position[1]+offset, 2*this.r_hitbox)
    p.rect(this.position[0]-this.r_hitbox[0]/2,this.position[1]-this.r_hitbox[1]/2+offset, this.r_hitbox[0], this.r_hitbox[1], this.r_hitbox[2]);

    for(let i=0; i<2; ++i){
      div_text_button[i].position(translation[0]+scaling[0]*coord_button.position[0],
                                  translation[1]+scaling[1]*(coord_button.position[1]+offset));
    }
    if(this.val){
      div_text_button[1].show();
      div_text_button[0].hide();
    } else {
      div_text_button[0].show();
      div_text_button[1].hide();
    }
  }
  coord_button.handlePress = function(mouseX, mouseY){
    this.val = (this.val+1)%this.N_val
    this.pressed = 1
  }
  coord_button.handleRelease = function(mouseX, mouseY){
    this.pressed = 0
  }


  for(let i=0; i<4; ++i){
      div_text.push(p.createDiv());
      div_text[i].parent(container)
      div_text[i].style("font-size", "12px");
      // div_text[i].style("transform", "translate(-50%, -50%)");
      // div_text[i].style("position", "fixed");
      div_text[i].style("user-select", "none");
      div_text[i].style("color", textColor);
    }

    katex.render("r_e",div_text[0].elt);
    katex.render("r_p",div_text[1].elt);
    katex.render("R",div_text[2].elt);
    katex.render("r",div_text[3].elt);

    UIObjects = [coord_button]
}


p.draw = function() {

  // rect = canvasElt.getBoundingClientRect();

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  p.background(bgColor);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);

  p.noFill();
  p.strokeWeight(1);
  p.stroke(textColor);

  X1 = [R*Math.cos(theta),R*Math.sin(theta)];
  X2 = [-r*Math.cos(theta),-r*Math.sin(theta)];

  p.fill(textColor)
  p.circle(X1[0],X1[1],2*R1);
  p.circle(X2[0],X2[1],2*R2);

  theta += dtheta;

  p.noFill();
  p.circle(0,0,2*R);
  p.circle(0,0,2*r);
  p.line(-5,-5,5,5);
  p.line(5,-5,-5,5);

  coord_button.show();


  p.fill(bgColor);
  p.stroke(textColor);
  if(!coord_button.val){
    arrow(p,X0,Math.sqrt((X1[0]-X0[0])**2+(X1[1]-X0[1])**2),3,10,Math.atan2(X1[1]-X0[1],X1[0]-X0[0])-Math.PI/2);
    arrow(p,X0,Math.sqrt((X2[0]-X0[0])**2+(X2[1]-X0[1])**2),3,10,Math.atan2(X2[1]-X0[1],X2[0]-X0[0])-Math.PI/2);

    div_text[0].position(translation[0]+scaling[0]*(X0[0]/2+R/2*Math.cos(theta)),translation[1]+scaling[1]*(X0[1]/2+R/2*Math.sin(theta)));
    div_text[0].show();
    div_text[1].position(translation[0]+scaling[0]*(X0[0]/2-r/2*Math.cos(theta)),translation[1]+scaling[1]*(X0[1]/2-r/2*Math.sin(theta)));
    div_text[1].show();
    div_text[2].hide();
    div_text[3].hide();

  } else {
    arrow(p,X0,Math.sqrt(X0[0]**2+X0[1]**2),3,10,Math.atan2(-X0[1],-X0[0])-Math.PI/2);
    arrow(p,X2,Math.sqrt((X2[0]-X1[0])**2+(X2[1]-X1[1])**2),3,10,Math.atan2(X1[1]-X2[1],X1[0]-X2[0])-Math.PI/2);
    div_text[2].position(translation[0]+scaling[0]*X0[0]/2,translation[1]+scaling[1]*X0[1]/2);
    div_text[2].show();
    div_text[3].position(translation[0]+scaling[0]*(X2[0]+X1[0])/2,translation[1]+scaling[1]*(X2[1]+X1[1])/2);
    div_text[3].show();
    div_text[0].hide();
    div_text[1].hide();
  }
  
  p.fill(textColor);
  arrow(p,X0,35,1,5,0);
  arrow(p,X0,35,1,5,-Math.PI/2);
  p.circle(X0[0],X0[1],2);

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

new p5(coord("p5-container-coord"))