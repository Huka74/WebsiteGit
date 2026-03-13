let SketchBrachistochrone = (containerId) => (p) => {
let w;
let h;
let translation;
let scaling = [1,-1];

let UIObjects = [];
let draggedObject = null;

let Pstart;
let Pend;
let Xstart = [-50*p.PI,150];
let Xend = [50*p.PI,-50];
let P = [];
let R = 5;
let R_hitbox = 15;

let dt = 0.1;
let t = 0;
let g = 10;
let cumT;

let n_test_particle = 5;
let n_trajectories = 5;
let arr_n_trajectories = Array(n_trajectories).fill(null);
let cumT_n_trajectories = Array(n_trajectories).fill(null);
let T_n_trajectories = Array(n_trajectories).fill(null);

let cachedParams = null;
let lastPstart = null;
let lastPend = null;
let old_ind_scene = null;


p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth
  h = container.clientHeight
  translation = [w/2,h/2+50];


  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  p.canvas.oncontextmenu = function(e) {
    e.preventDefault();
    return false;
  };

  Pstart = new Draggable(p,Xstart,[R_hitbox]);
  Pstart.show = function(){
    p.circle(this.position[0],this.position[1],2*R);
  }
  Pstart.handleDrag = function(x,y){
    this.position = [p.min(p.max(-translation[0]+20,x),translation[0]-20),p.max(translation[1]-h+20,p.min(translation[1]-70,p.max(Pend.position[1],y)))];
  }
  Pstart.show_shadow = p.create_show_shadow_draggable();
  Pend = new Draggable(p,Xend,[R_hitbox]);
  Pend.show = function(){
    p.circle(this.position[0],this.position[1],2*R);
  }
  Pend.handleDrag = function(x,y){
    this.position = [p.min(p.max(-translation[0]+20,x),translation[0]-20),p.max(translation[1]-h+20,p.min(translation[1]-70,p.min(Pstart.position[1],y)))];
  }
  Pend.show_shadow = p.create_show_shadow_draggable();

  P.push(Pend,Pstart);

  button_play = new Button(p,[150,270],[15],2);
  button_play.show = function(){
    offset = this.pressed ? -3 : -2*this.val;
    p.fill(textColor);
    p.circle(this.position[0], this.position[1]-3.5,2*15);
    p.fill(bgColor);
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
  button_play.handlePress = function(mouseX, mouseY){
    this.val = (this.val+1)%this.N_val;
    this.pressed = true;
  }
  button_play.handleRelease = function(mouseX, mouseY){
    this.pressed = false;
  }

  button_scene = [new Button(p,[-75,270],r_hitbox=[50,30,5],max_val=2),
                  new Button(p,[0,270],r_hitbox=[50,30,5],max_val=2),
                  new Button(p,[75,270],r_hitbox=[50,30,5],max_val=2)];

  const extraDrawFns = [
    function(position,r){ p.show_spline(p.getSplinePoints([position,[position[0]+15, position[1]-2],[position[0]+2, position[1]-12],[position[0]+p.PI*r, position[1]-2*r]]))},
    function(position,r){ p.line(position[0],position[1],position[0]+p.PI*r, position[1]-2*r);
                          p.line(position[0],position[1],position[0], position[1]-2*r);
                          p.line(position[0],position[1]-2*r,position[0]+p.PI*r, position[1]-2*r);
    },
    function(position,r){ let w_arr = linspace(0,7,4);
                          for(w_ of w_arr){
                            w_ = p.sqrt(w_);
                            p.circle(position[0]+r*(w_-p.sin(w_)),position[1]-r*(1-p.cos(w_)),2*2);
                          }   
    },
  ];
  
  for(let [i, button] of button_scene.entries()){
    button.show = function(){
      p.fill(textColor)
      p.rect(this.position[0]-this.r_hitbox[0]/2,this.position[1]-this.r_hitbox[1]/2-4, this.r_hitbox[0], this.r_hitbox[1], this.r_hitbox[2]);
      p.fill(bgColor);
      offset = this.pressed ? -3*this.pressed : -2*this.val;
      p.rect(this.position[0]-this.r_hitbox[0]/2,this.position[1]-this.r_hitbox[1]/2+offset, this.r_hitbox[0], this.r_hitbox[1], this.r_hitbox[2]);
      let origin_bra = math.subtract(this.position,[12,-8-offset]);
      p.stroke(255,0,0);
      p.show_brachistochrone_icon(origin_bra,8);
      p.stroke(textColor);
      extraDrawFns[i](origin_bra,8);
    }
    button.handlePress = function(mouseX, mouseY){
      for(let button2 of button_scene){
        if(button2!=this){
          button2.val = 0;
        }
      }
      this.val = (this.val+1)%this.N_val
      this.pressed = 1
    }
    button.handleRelease = function(mouseX, mouseY){
      this.pressed = 0
    }
  }
  // button_scene[0].show = function(){
    
  // }

  UIObjects = P.concat([Pstart, Pend, button_play],button_scene);

}

p.create_handleDrag_freepath = function(){
  return function(x,y){
    this.position = [p.min(p.max(-translation[0]+20,x),translation[0]-20),p.max(translation[1]-h+20,p.min(translation[1]-70,p.min(Pstart.position[1]-20,y)))];
  }
}

p.create_show_shadow_draggable = function(){
  return function(){
    let l = 10;
    p.fill(p.lerpColor(p.color(bgColor),p.color(textColor),0.1));
    p.stroke(p.lerpColor(p.color(bgColor),p.color(textColor),0.5));
    arrow(p,[this.position[0]-l,this.position[1]],10,5,8,p.PI/2);
    arrow(p,[this.position[0]+l,this.position[1]],10,5,8,-p.PI/2);
    arrow(p,[this.position[0],this.position[1]-l],10,5,8,p.PI);
    arrow(p,[this.position[0],this.position[1]+l],10,5,8,0);
  }
}

p.show_brachistochrone_icon = function(x0,r){
  let w_ = linspace(0,p.PI,20);
  let x = w_.map(w_ => x0[0]+r*(w_-p.sin(w_)));
  let y = w_.map(w_ => x0[1]-r*(1-p.cos(w_)));
  p.show_line([x,y]);
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


  // Scene
  ind_scene = 0;
  while(ind_scene<button_scene.length && !(button_scene[ind_scene].val)){
    ind_scene += 1;
  }

  // Show end points
  Pstart.show();
  Pend.show();

  // Show button_play
  button_play.show();
  for(let button of button_scene){
    button.show();
  }

  // If scene 0, show trajectory and compute time
  if(ind_scene==0){
    X = p.P_to_X(P);
    trajectory = p.getSplinePoints(X);
    p.show_spline(trajectory);
    for(let p of P){
      p.show();
    }
    cumT = p.compute_v_tcum(trajectory);

    // and show add point
    let mousePos = p.transformMouse([p.mouseX,p.mouseY],translation,scaling);
    p.circle(p.min(translation[0]-20,p.max(translation[0]-w+20,mousePos[0])),p.min(translation[1]-20,p.max(translation[1]-h+20,p.min(mousePos[1],Pstart.position[1]-20))), 2*R);
  }

  // If end points moved, update curve parameters
  let posChanged = !lastPstart || !lastPend ||
  lastPstart[0] !== Pstart.position[0] || lastPstart[1] !== Pstart.position[1] ||
  lastPend[0] !== Pend.position[0]     || lastPend[1] !== Pend.position[1];

  if(posChanged || !cachedParams){
    cachedParams = p.compute_curve_params(Pstart.position, Pend.position);
    lastPstart = [...Pstart.position];
    lastPend   = [...Pend.position];

    if(ind_scene==1){
      p.update_n_trajectories();
    }
  }
  let params = cachedParams;

  if(old_ind_scene!=ind_scene && ind_scene==1){
    p.update_n_trajectories();
  }
  
  // If scene 1, show curves
  if(ind_scene==1){
    for(let i=0; i<n_trajectories; i+=1){
      p.stroke(p.lerpColor(p.color(0, 187, 255),p.color(240, 0, 255),i/(n_trajectories-1)));
      p.show_spline(arr_n_trajectories[i]);
    }
  }
  



  // Show brachistochrone
  theta = linspace(0,params[1],100);
  dx = Pend.position[0] - Pstart.position[0];
  dy = Pend.position[1] - Pstart.position[1];
  const points = theta.map(x => p.curve([params[0],x], Pstart.position));
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  p.stroke(255,0,0);
  p.show_line([xs,ys]);
  p.stroke(textColor);


  const T = p.abs(params[1]*math.sqrt(params[0]/g));

  // If scene change, reset animation
  if(old_ind_scene!=ind_scene && button_play.val==1){
    button_play.val = 0;
    t = 0;
  }
  old_ind_scene = ind_scene;

  // Animation
  if(button_play.val){
    t += dt;
    // Particle on brachistochrone
    if(t<T){
      let pos_c = p.curve([params[0],-math.sign(Pend.position[0]-Pstart.position[0])*math.sqrt(g/params[0])*t],Pstart.position); 
      p.circle(pos_c[0],pos_c[1],2*5);
    } else if(ind_scene==3) {
      t = 0;
      button_play.val = 0;
    }

    
    if(ind_scene==0){
      // Custom trajctory if ind_scene==1
      if(t<cumT[cumT.length-1]){
        let lbound = 0;
        let hbound = cumT.length;
        let mid;
        let time_step = 0;

        // while (time_step<cumT.length-1 && t>cumT[time_step+1]) {
        //   time_step++;
        // }
        while((hbound-lbound)!=1){
          mid = math.floor((lbound+hbound)/2);
          if(t<cumT[mid]){
            hbound = mid;
          } else {
            lbound = mid;
          }
        }
        time_step = mid;

        t_test = cumT[time_step];
        
        inter = (t-t_test)/(cumT[time_step+1]-cumT[time_step]);
        x = trajectory[time_step][0] + inter * (trajectory[time_step+1][0] - trajectory[time_step][0]);
        y = trajectory[time_step][1] + inter * (trajectory[time_step+1][1] - trajectory[time_step][1]);
        p.circle(x,y,2*5);
      } else {
        t = 0;
        button_play.val = 0;
      }
    } else if(ind_scene==1){
      // Set trajectories for ind_scene==2
      if(t<p.max(T_n_trajectories)){
      for(let i=0; i<n_trajectories; i+=1){
        
        if(t<T_n_trajectories[i]){
        let time_step = 0;
        while(time_step<cumT_n_trajectories[i].length-2 && t>cumT_n_trajectories[i][time_step+1]){
          time_step++;
        }
        t_test = cumT_n_trajectories[i][time_step];
        
        inter = (t-t_test)/(cumT_n_trajectories[i][time_step+1]-cumT_n_trajectories[i][time_step]);
        x = arr_n_trajectories[i][time_step][0] + inter * (arr_n_trajectories[i][time_step+1][0] - arr_n_trajectories[i][time_step][0]);
        y = arr_n_trajectories[i][time_step][1] + inter * (arr_n_trajectories[i][time_step+1][1] - arr_n_trajectories[i][time_step][1]);
        p.stroke(p.lerpColor(p.color(0, 187, 255),p.color(240, 0, 255),i/(n_trajectories-1)));
        p.circle(x,y,2*5);
        }
      }
      } else {
        t = 0;
        button_play.val = 0;
      }

    } else if(ind_scene==2){
      // Tautochrone property
      if(t>p.max(p.PI,-params[1])*math.sqrt(params[0]/g)){
        t = 0;
        button_play.val = 0;
      }
    }
  } else {
    t = 0;
  }

  // Show starting test particules even at t=0
  p.stroke(textColor);
  if(ind_scene==2){
    for(let i=1; i<=n_test_particle; i++){
      let w0 = p.PI*p.sqrt(i/(n_test_particle+1));
      let cond = (p.PI<math.sqrt(g/params[0])*t);
      let pos_c = p.curve([params[0],-2*p.PI*cond - (1-2*cond)*math.acos((1+math.cos(w0))/2*math.cos(math.sqrt(g/params[0])*t) - (1-math.cos(w0))/2)],
                    Pstart.position);

      p.circle(pos_c[0],pos_c[1],2*5);
    }
    let pos_min = p.curve([params[0],-p.PI],Pstart.position);
    p.line(pos_min[0],pos_min[1]+2,pos_min[0],pos_min[1]-2);
    p.line(pos_min[0]+2,pos_min[1],pos_min[0]-2,pos_min[1]);
  }



  for(let obj of UIObjects){
    if(obj === draggedObject || obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.show_shadow();
    }
  }
}




p.update_n_trajectories = function(){
  // let a = linspace(0.15,1,n_trajectories);
  let a = [0.15,0.35,0.5,0.85,1];
  for(let i=0; i<n_trajectories; i+=1){
    let x_mid_point = (Pend.position[0]-Pstart.position[0])*(1/2)**(1/a[i]) + Pstart.position[0];
    let x = linspace(x_mid_point,Pend.position[0],100);
    let y = linspace(Pstart.position[1],p.traj_a(x_mid_point, a[i], Pstart.position, Pend.position)-0.1,100);
    let traj = p.concat(y.map((yi, idi) => [p.inv_traj_a(yi, a[i], Pstart.position, Pend.position), yi]),x.map((xi, idi) => [xi, p.traj_a(xi, a[i], Pstart.position, Pend.position)]))
    arr_n_trajectories[i] = traj;
    cumT_n_trajectories[i] = p.compute_v_tcum(arr_n_trajectories[i]);
    T_n_trajectories[i] = cumT_n_trajectories[i][cumT_n_trajectories[i].length-1]
  }
  // dx = p.abs(Pend.position[0]-Pstart.position[0]);
  // dy = p.abs(Pend.position[1]-Pstart.position[1]);
  // console.log(T_n_trajectories[0],p.sqrt(2*dy/g)*(1+dx/dy/2))
  // console.log(T_n_trajectories[4],p.sqrt(2*dy/g)*p.sqrt(1+(dx/dy)**2))
}

p.traj_a = function(x,a,xstart,xend){
  return xstart[1]+(xend[1]-xstart[1]) * (1-(1-((x-xstart[0])/(xend[0]-xstart[0]))**a)**(1/a));
}

p.inv_traj_a = function(y,a,xstart,xend){
  return xstart[0]+(xend[0]-xstart[0]) * ((1-(1-(y-xstart[1])/(xend[1]-xstart[1]))**a)**(1/a));
}

p.curve = function([r,th],[x,y]){
  return [x-r*(th-p.sin(th)), y-r*(1-p.cos(th))];
}

p.f = function(th,c){
  return c-(th-p.sin(th))/(1-p.cos(th));
}
p.df = function(th,c){
  return -1+p.sin(th)*(th-p.sin(th))/(1-p.cos(th))**2;
}

p.Newton = function([r,th],[dx,dy]){
  c = dx/dy
  for(let i=0; i<100; ++i){
    th -= p.f(th,c)/p.df(th,c);
    th = th%(2*p.PI);
  }
  r = dy/(p.cos(th)-1);
  return [r,th];
}

p.compute_curve_params = function(X0,X1){
  let dx = X1[0]-X0[0];
  let dy = X1[1]-X0[1];
  if(dy==0){
    return [p.abs(dx)/(2*p.PI), -math.sign(dx)*2*p.PI];
  } else {
    let x0 = [1,1];
    params = p.Newton(x0,[dx,dy]);
    err = [dx+params[0]*(params[1]-p.sin(params[1])),dy+params[0]*(1-p.cos(params[1]))];

    let i=0;
    while(p.abs(err[0]+err[1])>1 && i<100){
      x0[0] += 0.1;
      x0[1] += 0.1;
      params = p.Newton(x0,[dx,dy]);
      err = [dx+params[0]*(params[1]-p.sin(params[1])),dy+params[0]*(1-p.cos(params[1]))];
      i+=1;
    }
    // console.log(i,p.abs(err[0]+err[1]))
    return params;
  }
}

p.compute_v_tcum = function(trajectory){
  v_arr = [];
  cumT = [];
  t_test = 0;
  for(let i=0; i<trajectory.length; i+=1){
    let val = trajectory[i][1]<trajectory[0][1] ? math.sqrt(2*g*(trajectory[0][1]-trajectory[i][1])) : 1;
    v_arr.push(val);
  }
  for(let i=0; i<trajectory.length-1; i+=1){
    L_i = p.dist(trajectory[i+1][0],trajectory[i+1][1],trajectory[i][0],trajectory[i][1]);
    t_test += L_i/((v_arr[i]+v_arr[i+1])/2);
    cumT.push(t_test);
  }
  return cumT
}


p.show_line = function([x,y]){
  let n = x.length;
  for(let i=0; i<n-1; i++){
    p.line(x[i],y[i],x[i+1],y[i+1]);
  }
}

p.show_spline = function(splinePoints){
    pos_old = splinePoints[0];
    for(let i=1; i<splinePoints.length; i+=1){
        pos_new = splinePoints[i]
        p.line(pos_old[0],pos_old[1], pos_new[0],pos_new[1]);
        pos_old = pos_new;
        // p.circle(pos_old[0],pos_old[1],5)
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

p.P_to_X = function(P){
  let X = [P[1].position];
  for(let i=2; i<P.length; i+=1){
    X.push(P[i].position);
  }
  X.push(P[0].position)
  Xstart = X[0];
  Xend = X[X.length-1];
  return X;
}

p.RK4 = function(x,F){
  let k1 = F(x);
  let k2 = F(math.add(x,math.multiply(k1,dt/2)));
  let k3 = F(math.add(x,math.multiply(k2,dt/2)));
  let k4 = F(math.add(x,math.multiply(k3,dt)));
  return math.add(x,math.multiply(math.add(k1,math.multiply(math.add(k2,k3),2),k4),dt/6));
}

p.modify_points = function(mousePos){
  if (p.mouseButton === p.LEFT){
    draggable = new Draggable(p,[p.min(translation[0]-20,p.max(translation[0]-w+20,mousePos[0])),p.min(translation[1]-20,p.max(translation[1]-h+20,p.min(mousePos[1],Pstart.position[1]-20)))],[R_hitbox]);
    draggable.show = function(){
      p.circle(this.position[0],this.position[1],2*R);
    }
    draggable.handleDrag = p.create_handleDrag_freepath();
    draggable.show_shadow = p.create_show_shadow_draggable();
    P.push(draggable);
    UIObjects.push(draggable);

  } else if (p.mouseButton === p.RIGHT && P.length>2) {
    P.pop();
    UIObjects.pop();
  }
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
  
  MouseInCanvas = (p.mouseX<w) && (p.mouseX>0) && (p.mouseY<h) && (p.mouseY>0);
  if(button_scene[0].val && MouseInCanvas){
    p.modify_points(mousePos);
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

p.transformMouse = function([mouseX, mouseY], translation, scaling){
    return [(mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1]];
}



}

new p5(SketchBrachistochrone("p5-container-brachistochrone"));
