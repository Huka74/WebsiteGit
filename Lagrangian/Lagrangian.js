let SketchLagrangian = (containerId) => (p) => {
let w = 600;
let h = 600;

let dragging = false;
let UIObjects = [];
let draggedObject = null;

let bgColor;
let textColor;


let Xstart = [-250,0];
// let Xstart = [0,150];
let Xend = [150,0];
let X = [];
let m = 1;

let dt = 10;

let D = [];
let R = 8;
let R_hitbox = 15;

let time;
let toggle_traj;
let div_action;


p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth
  h = container.clientHeight

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;


  p.canvas.oncontextmenu = function(e) {
    e.preventDefault();
    return false;
  };

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

  let Dstart = new Draggable(p,Xstart,[R_hitbox]);
  let Dend = new Draggable(p,Xend,[R_hitbox]);
  D.push(Dend);
  D.push(Dstart);
  D[1].handleDrag = p.handleDrag_half("L");
  D[0].handleDrag = p.handleDrag_half("R");
  D[1].show = p.create_show();
  D[0].show = p.create_show();
  D[1].show_shadow = p.create_show_shadow_draggable();
  D[0].show_shadow = p.create_show_shadow_draggable();

  time = new ValueSlider(p,[-200,275],[25],5000,[1000,10000],1/50,container,"\\Delta t",0,p.color(textColor), fontsize=12, delta_x=16);

  toggle_traj = new Button(p,[0,275],r_hitbox=[40,25,5],max_val=2);
  toggle_traj.show = function(){
    p.fill(textColor)
    p.rect(this.position[0]-this.r_hitbox[0]/2,this.position[1]-this.r_hitbox[1]/2-4, this.r_hitbox[0], this.r_hitbox[1], this.r_hitbox[2]);
    p.fill(bgColor);
    offset = this.pressed ? -3*this.pressed : -2*this.val;
    p.rect(this.position[0]-this.r_hitbox[0]/2,this.position[1]-this.r_hitbox[1]/2+offset, this.r_hitbox[0], this.r_hitbox[1], this.r_hitbox[2]);

    p.arc(this.position[0],this.position[1]-5+offset,25,25,p.PI/2-1.1 ,p.PI/2+1.1);
    p.arc(this.position[0],this.position[1]+5+offset,25,25,-p.PI/2-1.1,-p.PI/2+1.1);
    p.circle(this.position[0],this.position[1]+offset,5);
    p.strokeWeight(2);
    if(this.val==0){
      p.line(this.position[0]+10,this.position[1]+offset+10,
             this.position[0]-10,this.position[1]+offset-10);
    }
    p.strokeWeight(1);
  }
  toggle_traj.handlePress = function(mouseX, mouseY){
    this.val = (this.val+1)%this.N_val
    this.pressed = 1
  }
  toggle_traj.handleRelease = function(mouseX, mouseY){
    this.pressed = 0
  }

  UIObjects.push(Dend,Dstart,time,toggle_traj);

  div_action = p.createDiv();
  div_action.parent(container);
  div_action.style("font-size", "12px");
  div_action.style("transform", "translate(-50%, -50%)");
  div_action.style("user-select", "none");
  div_action.style("color", textColor);
  div_action.position(translation[0]+scaling[0]*200,translation[1]+scaling[1]*275);

}

p.handleDrag_half = function(side){
  if(side=="R"){
    return function(mouseX,mouseY){
      this.position = [p.min(p.max(mouseX,0),w/2-R),p.min(p.max(mouseY,-h/2+R),h/2-R)];
    }
  } else if(side=="L"){
    return function(mouseX,mouseY){
      this.position = [p.min(p.max(mouseX,-w/2+R),0),p.min(p.max(mouseY,-h/2+R),h/2-R)];
    }
  }
}

p.create_handle_drag = function(){
  return function(mouseX,mouseY){
      this.position = [p.min(p.max(mouseX,-w/2+R),w/2-R),p.min(p.max(mouseY,-h/2+R),h/2-R)];
    }
}
p.create_show_shadow_draggable = function(){
  return function(){
    let l = 10;
    // p.fill(p.lerpColor(p.color(bgColor),p.color(textColor),0.05));
    // p.stroke(p.lerpColor(p.color(textColor),p.color(bgColor),0.7));
    p.fill(bgColor);
    p.stroke(textColor);
    arrow(p,[this.position[0]-l,this.position[1]],10,5,8,p.PI/2);
    arrow(p,[this.position[0]+l,this.position[1]],10,5,8,-p.PI/2);
    arrow(p,[this.position[0],this.position[1]-l],10,5,8,p.PI);
    arrow(p,[this.position[0],this.position[1]+l],10,5,8,0);
  }
}
p.create_show = function(){
  return function(){
    p.fill(bgColor);
    p.stroke(textColor);
    p.circle(this.position[0],this.position[1],2*R);
  }
}




//////// DRAW ////////

let translation = [w/2,h/2];
let scaling = [1,-1];

p.draw = function() {
  p.background(bgColor);
  // p.background(240);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);


  p.show_contour();

  p.fill(textColor);
  p.stroke(textColor);

  toggle_traj.show();

  X = p.D_to_X(D);
  trajectory = p.getSplinePoints(X);
  p.show_spline(trajectory);


  p.circle(0,0,5);
  // p.show_spline(p.compute_traj_full());
  if(toggle_traj.val==0){
    p.compute_traj_full(time.val);
  }
  // p.scale(1,-1);
  // p.text(p.round(p.compute_action(trajectory,null,T=time.val),2),0,0);
  // p.scale(1,-1);
  let S = p.round(p.compute_action(trajectory,null,T=time.val),2);
  div_action.style("color", textColor);
  katex.render("S="+p.str(S),div_action.elt);

  time.color = textColor;
  time.show(p.mouseX,p.mouseY,translation,scaling);

  for(let d of D){
    d.show();
  }

  for(let obj of UIObjects){
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.show_shadow();
    }
  }
}




p.f = function(r){
  return 1/(r+0.2)/5;
}
p.f_inv = function(r){
  return 1/(5*r)-0.2;
}


p.show_contour = function(){
  let Nc = 10;
  let r;

  for(let i=0; i<8; i+=1){
    r = p.f_inv(p.f(1)*(Nc-1)/Nc+(1.-(Nc-1)/Nc)*p.f(0));
    gradientLine(p,0,0,1.5/2*w*r*math.cos(2*p.PI*i/8),1.5/2*w*r*math.sin(2*p.PI*i/8),p.col);
  }
  
  p.noFill();
  for(let i=0; i<Nc; i+=1){
    r = p.f_inv(p.f(1)*i/Nc+(1.-i/Nc)*p.f(0));
    p.stroke(p.col(r));
    p.circle(0,0,2*r*w*1.5/2);
  }
}

p.col = function(t){
  let c1 = p.color(255,0,0);
  let c2 = p.color(255,230,0);
  let c3 = p.color(25,220,0);
  c1.setAlpha(255*0.5);
  c2.setAlpha(255*0.5);
  c3.setAlpha(255*0.5);
  let a = 0.3;
  if(t<a){
    return p.lerpColor(c1,c2,t/a);
  } else {
    return p.lerpColor(c2,c3,(t-a)/a);
  }
}


p.compute_ep = function(r1,theta1,r2,theta2,theta0){
  let e = (r1-r2)/(r2*math.cos(theta2-theta0)-r1*math.cos(theta1-theta0));
  let P = r1*(1+e*math.cos(theta1-theta0));
  return [e,P];
}

p.compute_traj = function(theta1,theta2,params){
  let theta_arr = linspace(theta1,theta2,100);
  let traj = [];
  for(let theta of theta_arr){
    let r = p.r_conic(theta,params);
    traj.push([r*math.cos(theta),r*math.sin(theta)]);
  }
  return traj;
}




p.compute_traj_full = function(T){
  let r1 = p.dist(Xstart[0],Xstart[1],0,0);
  let theta1 = p.atan2(Xstart[1],Xstart[0]);
  let r2 = p.dist(Xend[0],Xend[1],0,0);
  let theta2 = p.atan2(Xend[1],Xend[0]);

  let theta0_arr = linspace(0,p.PI,1000);

  let diffs = [Infinity,Infinity];
  let times = [Infinity,Infinity];
  let theta0_mins = [0,0];
  let T_short = Infinity;
  let T_long = Infinity;

  for(let theta0 of theta0_arr){

  let params = p.compute_ep(r1,theta1,r2,theta2,theta0).concat([theta0]);
  
  let e = params[0];
  if(p.abs(e)<1){
    T_short = p.compute_transfer_time_elliptic(params,0);
    T_long = p.compute_transfer_time_elliptic(params,2*p.PI);
  } else if(p.abs(e)>1){
    if(e>0){
      T_short = p.compute_transfer_time_hyper(params);
    }else if(e<0){
      T_long = p.compute_transfer_time_hyper([-params[0],params[1],params[2]+p.PI]);
    }
  }
  

  let diff_long = (T_long==T_long) ? p.abs(p.abs(T_long)-T) : Infinity;
  let diff_short = (T_short==T_short) ? p.abs(-(T_short)-T) : Infinity;

  let time = [T_long,T_short];
  let diff = [diff_long,diff_short]

  for (let i=0; i<2; i+=1) { 
    let val = diff[i];
    if (val < diffs[i]){
      diffs[i] = val;
      theta0_mins[i] = theta0;
      times[i] = time[i];
    }
  }

  }


  for (let i=0; i<2; i+=1){
  // p.stroke(p.color(255*i,255*(1-i),0));
  let theta0 = theta0_mins[i];

  let params = p.compute_ep(r1,theta1,r2,theta2,theta0).concat([theta0]);
  
  let e = params[0];
  let theta1_ = p.mod(theta1,2*p.PI);
  let theta2_ = p.mod(theta2,2*p.PI);
  if(i==0 && theta2_<theta1_){theta1_-=2*p.PI}
  if(i==1 && theta1_<theta2_){theta2_-=2*p.PI}

  traj = 1-i ? p.compute_traj(theta1_,theta2_,params) : p.compute_traj(theta1_,theta2_,params);
  
  // p.line(0,0,100*math.cos(theta0),100*math.sin(theta0));
  // p.stroke(p.color(255,0,0));
  // p.show_spline(traj_short);
  // p.stroke(p.color(0,255,0));
  // p.show_spline(traj_long);
  // p.stroke(0)

  p.show_spline(traj);
  // let S = p.compute_action(traj,-1/(2*params[1])*(1-params[0]**2),null);

  let T_long;
  let T_short;
  if(p.abs(e)<1){
    T_short = p.compute_transfer_time_elliptic(params,0);
    T_long = p.compute_transfer_time_elliptic(params,2*p.PI);
  } else if(p.abs(e)>1){
    if(e>0){
      T_short = p.compute_transfer_time_hyper(params);
    }else if(e<0){
      T_long = p.compute_transfer_time_hyper([-params[0],params[1],params[2]+p.PI]);
    }
  }

  // p.scale(1,-1);
  // // p.text(math.sign(dtheta),50,-100+50*i);
  // p.text(p.round(p.compute_transfer_time_int(traj,-1/(2*params[1])*(1-params[0]**2))),-50,-100+50*i);
  // p.text(p.round(T_short),-150,-100+50*i);
  // p.text(p.round(T_long),-100,-100+50*i);
  // // p.text(p.round(params[0],2),0,-100+50*i);
  // p.text(p.round(S,2),0,-100+50*i);
  // p.text(p.round(-1/(2*params[1])*(1-params[0]**2),7),50,-100+50*i);
  // p.scale(1,-1);
  }

  // return p.compute_traj(0,2*p.PI,params)

  if(draggedObject){
    draggedObject.show_shadow();
  }
}

p.mod = function(a,m){
  return math.mod(math.mod(a,m)+m,m);
}


p.compute_transfer_time_elliptic = function(params,del=0){
  let e = params[0];
  let P = params[1];
  let theta0 = params[2];
  let theta1 = p.atan2(Xstart[1],Xstart[0]);
  let theta2 = p.atan2(Xend[1],Xend[0]);
  let E1 = 2*math.atan(math.sqrt((1-e)/(1+e))*math.tan((theta1-theta0)/2));
  let E2 = 2*math.atan(math.sqrt((1-e)/(1+e))*math.tan((theta2-theta0)/2));
  let a = P/(1-e**2);
  return p.sqrt(a*a*a)*(del+(E2-E1-e*(math.sin(E2)-math.sin(E1))));
}

p.compute_transfer_time_hyper = function(params){
  let e = params[0];
  let P = params[1];
  let theta0 = params[2];
  let theta1 = p.atan2(Xstart[1],Xstart[0]);
  let theta2 = p.atan2(Xend[1],Xend[0]);
  let E1 = 2*math.atanh(math.sqrt((e-1)/(1+e))*math.tan((theta1-theta0)/2));
  let E2 = 2*math.atanh(math.sqrt((e-1)/(1+e))*math.tan((theta2-theta0)/2));
  let a = P/(1-e**2);
  return p.sqrt(-a*a*a)*(-E2+E1+e*(math.sinh(E2)-math.sinh(E1)));
}



p.r_conic = function(theta,params){
  let e = params[0];
  let P = params[1];
  let theta0 = params[2];
  return P/(1+e*math.cos(theta-theta0));
}



p.RK4 = function(x,F){
  let k1 = F(x);
  let k2 = F(math.add(x,math.multiply(k1,dt/2)));
  let k3 = F(math.add(x,math.multiply(k2,dt/2)));
  let k4 = F(math.add(x,math.multiply(k3,dt)));
  return math.add(x,math.multiply(math.add(k1,math.multiply(math.add(k2,k3),2),k4),dt/6));
}


p.exact_action = function(){
  return m/2*p.dist(Xend[0],Xend[1],Xstart[0],Xstart[1])**2;
}

p.compute_transfer_time_int = function(trajectory,E,power=1){
  let T = 0;
  let v_old = math.sqrt(p.velocity2(trajectory[0],E));
  for(let i=1; i<trajectory.length; i+=1){
    v_new = math.sqrt(p.velocity2(trajectory[i],E));
    T += p.dist(trajectory[i-1][0],trajectory[i-1][1],trajectory[i][0],trajectory[i][1])
         * 2/(math.pow(v_new,power)+math.pow(v_old,power));
    v_old = v_new;
  }
  return T;
}

p.compute_E = function(trajectory,T){
  let E_min = p.min(trajectory.map(p.V));
  // let E_arr = linspace(E_min, 0.1,1000);
  // let diff_min = Infinity;
  // let E_transfert;
  // let time = 0;

  // for(let E of E_arr){
  //   let t = p.compute_transfer_time_int(trajectory,E)
  //   let diff = (t==t) ? p.abs(p.abs(t)-T): Infinity;
  //   if(diff<diff_min){
  //     E_transfert = E;
  //     diff_min = diff;
  //     time = t;
  //   }
  // }

  // E_min = -0.1;
  E_max = 2;
  while(p.abs(E_max-E_min)>0.0001){
    let E = (E_min+E_max)/2;
    // console.log("New")
    let t = p.compute_transfer_time_int(trajectory,E)
    // console.log("min:",E_min,"max:",E_max,"E:",E,"t:",t);
    // let diff = (t==t) ? p.abs(p.abs(t)-T): Infinity;
    if(t<T){
      E_max = E;
    } else {
      E_min = E;
    }
  }

  // p.scale(1,-1);
  // p.text(math.round(time,0),50,50);
  // p.text(E_min,150,50);
  // p.text(E_transfert,150,100);
  // p.text((E_max),150,125);
  // p.scale(1,-1);
  
  return E_max;
}

p.compute_action = function(trajectory,E=null,T=null){

  if(E==null){
    if(T==null){throw new Error("Either T or E has to be defined");}
    E = p.compute_E(trajectory,T);
  }

  S = 0;
  let v_old = math.sqrt(p.velocity2(trajectory[0],E));
  for(let i=1; i<trajectory.length; i+=1){
    v_new = math.sqrt(p.velocity2(trajectory[i],E));
    ds = p.dist(trajectory[i-1][0],trajectory[i-1][1],trajectory[i][0],trajectory[i][1])
         *2/(v_new+v_old);
    S += ds*(1/2*m*(v_new**2+v_old**2)/2 - p.V(trajectory[i]));
    v_old = v_new;
  }
  return S;
}

p.velocity2 = function(x,E){
  return 2/m*(E-p.V(x));
}

p.V = function(x){
  return -1/p.dist(x[0],x[1],0,0);
}

p.D_to_X = function(D){
    let X = [D[1].position];
    for(let i=2; i<D.length; i+=1){
        X.push(D[i].position);
    }
    X.push(D[0].position)
    Xstart = X[0];
    Xend = X[X.length-1];
    return X;
}


p.show_dots = function(arr){
  for(let i of arr){
    p.circle(i[0],i[1],5);
  }
}


p.show_spline = function(splinePoints){
    pos_old = splinePoints[0];
    for(let i=1; i<splinePoints.length; i+=1){
        pos_new = splinePoints[i]
        p.line(pos_old[0],pos_old[1], pos_new[0],pos_new[1]);
        pos_old = pos_new;
    }
}

p.getSplinePoints = function(points, resolution = 50) {
  if (points.length < 2) return points;
  
  let splinePoints = [];
  
  // For each segment between control points
  for (let i=0; i<points.length-1; i++) {
    // Get the 4 control points for this segment
    let p0 = points[Math.max(0, i-1)];
    let p1 = points[i];
    let p2 = points[i + 1];
    let p3 = points[Math.min(points.length-1, i+2)];
    
    // Generate interpolated points along this segment
    for (let t=0; t<1; t+=1/resolution) {
      let x = p.catmullRom(p0[0], p1[0], p2[0], p3[0], t);
      let y = p.catmullRom(p0[1], p1[1], p2[1], p3[1], t);
      splinePoints.push([x,y]);
    }
  }
  
  // Add the last point
  splinePoints.push(points[points.length - 1]);
  
  return splinePoints;
}

// Catmull-Rom interpolation
p.catmullRom = function(p0, p1, p2, p3, t) {
  let t2 = t * t;
  let t3 = t2 * t;
  
  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

p.modify_points = function(mousePos){
  if (p.mouseButton === p.LEFT){
    draggable = new Draggable(p,mousePos,[R_hitbox]);
    draggable.show = p.create_show();
    draggable.show_shadow = p.create_show_shadow_draggable();
    draggable.handleDrag = p.create_handle_drag();
    D.push(draggable);
    UIObjects.push(draggable);

  } else if (p.mouseButton === p.RIGHT && D.length>2) {
    D.pop();
    UIObjects.pop();
  }
}

p.mousePressed = function(){
  let mousePos = p.transformMouse([p.mouseX, p.mouseY], translation, scaling);

  for(let obj of UIObjects) {
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.handlePress(mousePos[0], mousePos[1])
      draggedObject = obj;
      return false;
    }
  }
  
  in_canvas = (p.mouseX>0) && (p.mouseX<w) && (p.mouseY>0) && (p.mouseX<h);
  if(in_canvas){
    p.modify_points(mousePos);
  }

  return false;
}

p.mouseDragged = function(){
  let mousePos = p.transformMouse([p.mouseX, p.mouseY], translation, scaling);

  if(draggedObject){
    draggedObject.handleDrag(mousePos[0], mousePos[1]);
  }

  let ind = D.indexOf(draggedObject);
  if(!(ind==null || ind==-1)){
    X[1+ind] = draggedObject.position;
  }

  return false;
}

p.mouseReleased = function(){
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
    return [(mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1]];
}



}

new p5(SketchLagrangian("p5-container-lagrangian"))
