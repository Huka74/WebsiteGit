let mecaSketch = (containerId) => (p) => {
let w = 600;
let h = 600;

let t = 0;
let dt = 0.05;

let m1 = 1;
let m2 = 1;
let L0 = 1;
let L1 = 1;
let L2 = 1;
let k0 = 1;
let k1 = 0.5;
let k2 = 1;

let d = 1/2*((k0+k1)/m1 - (k1+k2)/m2);
let s = 1/2*((k0+k1)/m1 + (k1+k2)/m2);
let r = math.sqrt(d**2 + k1**2/(m1*m2));

let x10 = d-r;
let x20 = -k1/m1;
// let x10 = 0;
// let x20 = 0;
let v10 = 0;
let v20 = 0;
let Q10 = (d-r)*x10 - k1/m2*x20;
let V10 = (d-r)*v10 - k1/m2*v20;
let Q20 = (d+r)*x10 - k1/m2*x20;
let V20 = (d+r)*v10 - k1/m2*v20;

p.compute_initial_cond = function(x10,x20,v10=0,v20=0){
  x10 = x10 - L0;
  x20 = x20 - L0 - L1;
  Q10 = (d-r)*x10 - k1/m2*x20;
  V10 = (d-r)*v10 - k1/m2*v20;
  Q20 = (d+r)*x10 - k1/m2*x20;
  V20 = (d+r)*v10 - k1/m2*v20;
}


let w1 = math.sqrt(-(-s + r))
let w2 = math.sqrt(-(-s - r))

p.Q1 = function(x){
    return Q10*math.cos(w1*x)+V10/w1*math.sin(w1*x);
}
p.Q2 = function(x){
    return Q20*math.cos(w2*x)+V20/w2*math.sin(w2*x);
}
p.x1 = function(x){
    return L0+(p.Q2(x)-p.Q1(x))/(2*r);
}
p.x2 = function(x){
    return L0+L1+m2/k1*( -(p.Q1(x)+p.Q2(x))/2 + (p.Q2(x)-p.Q1(x))/2*d/r );
}

p.co2pi = function(x){
  return 100*x-100;
}

p.pi2co = function(x){
  return (x+100)/100;
}

let L_spring = 10;
// let L_spring_ext = 0.1;
let L_spring_ext = 5;
let N_spring = 5;
let stroke_spring = 1;

let h_wall = 50;

let M1;
let M2;
let w_mass = 40;
let h_mass = 30;
let R = w_mass/2;

let button1;
let button2;
let w_button = 40;
let h_button = 20;
let r_button = 3;

let dragging = false;
let UIObjects;
let draggedObject = null;

let axis;
let div_axis_label1;
let div_axis_label2;
let div_mass_label1;
let div_mass_label2;

let bgColor;
let textColor;
let show;



p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  show = container.dataset.show !== undefined ? parseFloat(container.dataset.show) : 1;

  w = container.clientWidth
  h = container.clientHeight

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  // Draggables

  M1 = new Draggable(p,[p.co2pi(L0),0],[25]);
  M2 = new Draggable(p,[p.co2pi(L0+L1),0],[25]);
  M1.color = p.color(bgColor);
  M2.color = p.color(bgColor);

  M1.handleDrag = function(mouseX,mouseY){
    dragging = true;
    button1.val = 0;
    button2.val = 0;
    M1.position[0] = p.min(p.max(mouseX,p.co2pi(L0/3)),p.co2pi(L0+L1/3));
    t = 0;
    p.compute_initial_cond(p.pi2co(M1.position[0]),p.pi2co(M2.position[0]));
  };
  M1.handleRelease = function(){
    p.compute_initial_cond(p.pi2co(this.position[0]),p.pi2co(M2.position[0])); 
  };
  M1.show_shadow = function(){
    this.color = p.lerpColor(this.color, p.color(0), 0.1);
  };
  M1.show = function(){
    p.showMasses(this);
  };
  

  M2.handleDrag = function(mouseX,mouseY){
    dragging = true;
    button1.val = 0;
    button2.val = 0;
    M2.position[0] = p.min(p.max(mouseX,p.co2pi(L0+2*L1/3)),p.co2pi(L0+L1+2*L2/3));
    t = 0;
    p.compute_initial_cond(p.pi2co(M1.position[0]),p.pi2co(M2.position[0]));
  };
  M2.handleRelease = function(){
    p.compute_initial_cond(p.pi2co(M1.position[0]),p.pi2co(this.position[0]));
  };
  M2.show_shadow = function(){
    this.color = p.lerpColor(this.color, p.color(0), 0.1);
  };
  M2.show = function(){
    p.showMasses(this);
  };
  

  // Buttons

  button1 = new Button(p,[p.co2pi((L0+L1+L2)/2)-25,50],[w_button,h_button,r_button],2);
  button2 = new Button(p,[p.co2pi((L0+L1+L2)/2)+25,50],[w_button,h_button,r_button],2);


  button1.show = function() {
    p.showButton(this, {
      arrows: [
        { xOffset: 10, angle: p.PI/2 },
        { xOffset: -10, angle: -p.PI/2 }
      ]
    });
  };
  button1.show_shadow = p.createShowShadowB();
  button1.handlePress = function(){
    if(!button1.val){
      button1.val = 1;
      button2.val = 0;
      t = 0;
      p.compute_initial_cond((d+r)/2+L0,-k1/m2/2+L0+L1);
    }
  }


  button2.show = function() {
    p.showButton(this, {
      arrows: [
        { xOffset: 2, angle: -p.PI/2 },
        { xOffset: -10, angle: -p.PI/2 }
      ]
    });
  };
  button2.show_shadow = p.createShowShadowB();
  button2.handlePress = function(){
    if(!button2.val){
      button1.val = 0;
      button2.val = 1;
      t = 0;
      p.compute_initial_cond(d-r+L0,-k1/m2+L0+L1);
    }
  }

  

  // UIObjects array
  
  if(show){
    UIObjects = [button1, button2, M1, M2];
  } else{
    UIObjects = [M1, M2];
  }

  // Axes for plot

  axis = new Axes(p,[p.co2pi((L0+L1+L2)/2),-200],[100,100],p.color(0));

  // Other initial condition for trim
  if(!show){
    x20 += 0.4;
    p.compute_initial_cond(L0+x10,L0+L1+x20);
  }


  // Axis label and Masses label
  if(show){
    div_axis_label1 = p.createDiv();
    div_axis_label1.parent(container);
    div_axis_label1.style("font-size", "12px");
    div_axis_label1.style("transform", "translate(-50%, -50%)");
    div_axis_label1.style("user-select", "none");
    div_axis_label1.style("color", 'rgb(0, 0, 0)');

    div_axis_label2 = p.createDiv();
    div_axis_label2.parent(container);
    div_axis_label2.style("font-size", "12px");
    div_axis_label2.style("transform", "translate(-50%, -50%)");
    div_axis_label2.style("user-select", "none");
    div_axis_label2.style("color", 'rgb(0, 0, 0)');
  }  
    div_mass_label1 = p.createDiv();
    div_mass_label1.parent(container);
    div_mass_label1.style("font-size", "12px");
    div_mass_label1.style("transform", "translate(-50%, -50%)");
    div_mass_label1.style("user-select", "none");
    div_mass_label1.style("color", 'rgb(0, 0, 0)');

    div_mass_label2 = p.createDiv();
    div_mass_label2.parent(container);
    div_mass_label2.style("font-size", "12px");
    div_mass_label2.style("transform", "translate(-50%, -50%)");
    div_mass_label2.style("user-select", "none");
    div_mass_label2.style("color", 'rgb(0, 0, 0)');
  

  // Color theme
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

}


p.createShowShadowB = function() {
  return function() {
    // let offset = this.val*2;
    // let c = p.color(0);
    // c.setAlpha(32);
    // p.fill(c);
    // p.strokeWeight(0);
    // p.circle(this.position[0],this.position[1]-offset,2*this.r_hitbox);
    // p.rect(this.position[0]-w_button/2,this.position[1]-offset-h_button/2,w_button,h_button,r_button);
    // console.log(";")

    // this.color = this.val ? p.lerpColor(this.color, p.color(0), 0.3) : this.color;
    this.hover = true
  }
}

p.showButton = function(button, config) {
  const { arrows } = config;
  
  const buttonOffset = button.val*2;

  // Shadow
  p.fill(0);
  p.stroke(0);
  p.rect(button.position[0] - w_button/2, button.position[1] - h_button/2 - 4, w_button, h_button, r_button);

  // Button fill
  // console.log(bgColor.r)
  p.fill(button.val || button.hover ? p.lerpColor(button.color, p.color(0), 0.1) : button.color);
  p.stroke(textColor);
  p.rect(button.position[0] - w_button/2, button.position[1] - h_button/2 - buttonOffset, w_button, h_button, r_button);

  // Arrows
  p.fill(textColor);
  p.stroke(textColor);
  arrows.forEach(({ xOffset, angle }) => {
    arrow(p, [button.position[0] + xOffset, button.position[1] - buttonOffset], 8, 1, 4, angle);
  });
}

p.showMasses = function(mass){
    p.fill(mass.color);
    p.stroke(textColor);
    // p.circle(this.position[0],this.position[1],2*R);
    p.rect(mass.position[0]-w_mass/2,mass.position[1]-h_mass/2,w_mass,h_mass,0);
  }




//////// DRAW ////////

let translation = [w/2-40,h/2-200];
let scaling = [1,-1];

p.draw = function() {

  p.background(bgColor);
  // p.background(220);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);


  if(!dragging){
    t += dt;
    M1.position = [p.co2pi(p.x1(t)),0];
    M2.position = [p.co2pi(p.x2(t)),0];
  }

  p.stroke(textColor);
  p.strokeWeight(1);
  p.fill(textColor);
  
  
  p.line(p.co2pi(0),h_wall,p.co2pi(0),-h_wall);
  p.line(p.co2pi(L0+L1+L2),h_wall,p.co2pi(L0+L1+L2),-h_wall);

  let wall_x = 10;
  let wall_dx = 20;
  p.line(p.co2pi(0)-wall_x,h_wall,p.co2pi(0)-wall_x-wall_dx,1/2*h_wall);
  p.line(p.co2pi(0)-wall_x,1/2*h_wall,p.co2pi(0)-wall_x-wall_dx,0);
  p.line(p.co2pi(0)-wall_x,0,p.co2pi(0)-wall_x-wall_dx,-1/2*h_wall);
  p.line(p.co2pi(0)-wall_x,-1/2*h_wall,p.co2pi(0)-wall_x-wall_dx,-h_wall);

  p.line(p.co2pi(L0+L1+L2)+wall_x,1/2*h_wall,p.co2pi(L0+L1+L2)+wall_x+wall_dx,h_wall);
  p.line(p.co2pi(L0+L1+L2)+wall_x,0,p.co2pi(L0+L1+L2)+wall_x+wall_dx,1/2*h_wall);
  p.line(p.co2pi(L0+L1+L2)+wall_x,-1/2*h_wall,p.co2pi(L0+L1+L2)+wall_x+wall_dx,0);
  p.line(p.co2pi(L0+L1+L2)+wall_x,-h_wall,p.co2pi(L0+L1+L2)+wall_x+wall_dx,-1/2*h_wall);
  

  spring(p,[M1.position[0]+R,M1.position[1]],[M2.position[0]-R,M2.position[1]],L_spring,L_spring_ext,N_spring,stroke_spring);
  spring(p,[M1.position[0]-R,M1.position[1]],[p.co2pi(0),0],L_spring,L_spring_ext,N_spring,stroke_spring);
  spring(p,[p.co2pi(L0+L1+L2),0],[M2.position[0]+R,M2.position[1]],L_spring,L_spring_ext,N_spring,stroke_spring);

  M1.show(p.mouseX, p.mouseY);
  M2.show(p.mouseX, p.mouseY);
  M1.color = p.color(bgColor);
  M2.color = p.color(bgColor);

  div_mass_label1.position(translation[0]+scaling[0]*M1.position[0],translation[1]+scaling[1]*M1.position[1]);
  div_mass_label1.style("color", textColor);
  katex.render("m_1",div_mass_label1.elt);
  div_mass_label2.position(translation[0]+scaling[0]*M2.position[0],translation[1]+scaling[1]*M2.position[1]);
  div_mass_label2.style("color", textColor);
  katex.render("m_2",div_mass_label2.elt);

  if(show){

  button1.color = p.color(bgColor);
  button2.color = p.color(bgColor);

  button1.show();
  button2.show();

  button1.hover = false;
  button2.hover = false;

  // axis.show_axis([0,1],[0,1]);
  
  let axis_length = 180;
  arrow(p,[axis.pos[0]-axis_length/2,axis.pos[1]],axis_length,1,6,-p.PI/2);
  arrow(p,[axis.pos[0],axis.pos[1]-axis_length/2],axis_length,1,6,0);

  div_axis_label1.position(translation[0]+scaling[0]*axis.pos[0]+axis_length/2+10,translation[1]+scaling[1]*axis.pos[1]);
  katex.render("x_1",div_axis_label1.elt);
  div_axis_label2.position(translation[0]+scaling[0]*axis.pos[0],translation[1]+scaling[1]*axis.pos[1]-axis_length/2-10);
  katex.render("x_2",div_axis_label2.elt);



  // for(let i=0; i<p.floor(t/dt); i+=5){
  //   let co = axis.co2pix([p.x1(i*dt)-L0,p.x2(i*dt)-L1-L0]);
  //   p.circle(co[0],co[1],5);
  // }
  // let co_ = axis.co2pix([p.x1(t)-L0,p.x2(t)-L1-L0]);
  let co_ = axis.co2pix([p.pi2co(M1.position[0])-L0,p.pi2co(M2.position[0])-L0-L1]);
  
  p.circle(co_[0],co_[1],5);


  
  
  p.stroke(p.color(0,225,0));

  p.noFill();

  let A1 = p.sqrt(Q10**2+(V10/w1)**2);
  let phi1 = -p.atan(V10/(w1*Q10)) + (1-Q10/p.abs(Q10))/2*p.PI || 0;
  let A2 = p.sqrt(Q20**2+(V20/w2)**2);
  let phi2 = -p.atan(V20/(w2*Q20)) + (1-Q20/p.abs(Q20))/2*p.PI || 0;


  // console.log(A1,phi1)
  pos_harm1 = [0,-150];

  p.circle(pos_harm1[0]+axis.pos[0],pos_harm1[1]+axis.pos[1],2*axis.co2pix([A1/(2*r),0])[0]-2*axis.pos[0]);
  // p.arrow([pos_harm1[0]+axis.pos[0],pos_harm1[1]+axis.pos[1]],axis.co2pix([A1/(2*r),0])[0]-axis.pos[0],1,4,-w1*t-phi1+p.PI/2);

  co = axis.co2pix([-(A1*p.cos(w1*t+phi1))/(2*r),(A1*p.sin(w1*t+phi1))/(2*r)])
  p.circle(pos_harm1[0]+co[0],pos_harm1[1]+co[1],5);
  p.circle(pos_harm1[0]+co[0],pos_harm1[1]+co[1],2*axis.co2pix([A2/(2*r),0])[0]-2*axis.pos[0]);
  // p.arrow([pos_harm1[0]+co[0],pos_harm1[1]+co[1]],axis.co2pix([A2/(2*r),0])[0]-axis.pos[0],1,4,-w2*t-phi2-p.PI/2);

  co = axis.co2pix([-(A1*p.cos(w1*t+phi1)-A2*p.cos(w2*t+phi2))/(2*r),(A1*p.sin(w1*t+phi1)-A2*p.sin(w2*t+phi2))/(2*r)])
  p.circle(pos_harm1[0]+co[0],pos_harm1[1]+co[1],5);
  p.line(pos_harm1[0]+co[0],pos_harm1[1]+co[1],co_[0],co_[1])

  p.stroke(p.color(255,0,0));

  pos_harm2 = [-150,0];
  dphi = p.PI/2;

  p.circle(pos_harm2[0]+axis.pos[0],pos_harm2[1]+axis.pos[1],2*axis.co2pix([A1*p.abs(-m2/k1*(d+r)/(2*r)),0])[0]-2*axis.pos[0]);
  co = axis.co2pix([(A1*p.cos(w1*t+phi1+dphi))*(-m2/k1*(d+r)/(2*r)),(A1*p.sin(w1*t+phi1+dphi))*(-m2/k1*(d+r)/(2*r))])
  p.circle(pos_harm2[0]+co[0],pos_harm2[1]+co[1],5);
  p.circle(pos_harm2[0]+co[0],pos_harm2[1]+co[1],2*axis.co2pix([A2*p.abs(m2/k1*(d-r)/(2*r)),0])[0]-2*axis.pos[0]);
  co = axis.co2pix([(A1*p.cos(w1*t+phi1+dphi))*(-m2/k1*(d+r)/(2*r))+(A2*p.cos(w2*t+phi2+dphi))*(m2/k1*(d-r)/(2*r)),(A1*p.sin(w1*t+phi1+dphi))*(-m2/k1*(d+r)/(2*r))+(A2*p.sin(w2*t+phi2+dphi))*(m2/k1*(d-r)/(2*r))])
  p.circle(pos_harm2[0]+co[0],pos_harm2[1]+co[1],5);

  // p.setLineDash([3,3])
  p.line(co_[0],co_[1],pos_harm2[0]+co[0],pos_harm2[1]+co[1]);
  // p.drawingContext.setLineDash([]);

  // let a1 = (A1+A2)/(2*r);
  // let a2 = A1*p.abs(-m2/k1*(d+r)/(2*r))+A2*p.abs(m2/k1*(d-r)/(2*r));
  // let c1 = axis.co2pix([a1,a2]);
  // let c2 = axis.co2pix([-a1,a2]);
  // let c3 = axis.co2pix([a1,-a2]);
  // let c4 = axis.co2pix([-a1,-a2]);
  // p.circle(c1[0],c1[1],5);
  // p.circle(c2[0],c2[1],5);
  // p.circle(c3[0],c3[1],5);
  // p.circle(c4[0],c4[1],5);

  }

  for(let obj of UIObjects){
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.show_shadow();
    }
  }

}



p.mousePressed = function() {
  // console.log(p.mouseX, p.mouseY)

    let mousePos = p.transformMouse([p.mouseX, p.mouseY], translation, scaling);

    for(let obj of UIObjects) {
      if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
          obj.handlePress(mousePos.x, mousePos.y)
          draggedObject = obj;
          break; // Only one object handles the click
      }
    }
}

p.mouseDragged = function() {
    let mousePos = p.transformMouse([p.mouseX, p.mouseY], translation, scaling);
    
    if (draggedObject){
        draggedObject.handleDrag(mousePos.x, mousePos.y);
        return;
    }

    return false;
}

p.mouseReleased = function() {
  if(dragging){
    t = 0;
    dragging = false;
  }

    if (draggedObject) {
      draggedObject.handleRelease();
      draggedObject = null; // Clear the dragged object
      return;
    }

    // for(let obj of UIObjects) {
    //     obj.handleRelease();
    // }
}

p.transformMouse = function([mouseX, mouseY], translation, scaling){
    return {
        x: (mouseX-translation[0])/scaling[0],
        y: (mouseY-translation[1])/scaling[1] };
}


}

new p5(mecaSketch("p5-container-meca-coupled"))
new p5(mecaSketch("p5-container-meca-coupled-trim"))
