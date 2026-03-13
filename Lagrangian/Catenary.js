let SketchCatenary = (containerId) => (p) => {
let w;
let h;
let translation;
let scaling = [1,-1];

let dragging = false;
let UIObjects = [];
let draggedObject = null;

let anchor1;
let anchor2;
let R = 5;
let L_slider;
let N = 24;
let L = 150;
let X = [];
let X_prev = [];
let V = [];
let dt = 0.1;
let A = [0,-10/5];



p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth
  h = container.clientHeight
  translation = [w/2,h/2+100];

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  p.canvas.oncontextmenu = function(e) {
    e.preventDefault();
    return false;
  };

  let X1 = [-100,100];
  let X2 = [100,100];
  let dx = X2[0]-X1[0];
  p.f = function(x){
    return 50*(x-X1[0])*(x-X2[0])/(X2[0]-X1[0])**2 + 1/(X2[0]-X1[0])*((x-X1[0])*X2[1]-(x-X2[0])*X1[1]);
  }

  anchor1 = new Draggable(p,X1,[2*R]);
  anchor2 = new Draggable(p,X2,[2*R]);
  anchor1.handleDrag = p.handleDrag_f(anchor2);
  anchor2.handleDrag = p.handleDrag_f(anchor1);
  anchor1.show = p.create_show_anchor();
  anchor2.show = p.create_show_anchor();
  anchor1.show_shadow = p.create_show_shadow_draggable();
  anchor2.show_shadow = p.create_show_shadow_draggable();
  L_slider = new ValueSlider(p,[0,250],[15],300,[100,500],1/5,container,"L",0,p.color(33, 150, 243));

  for(let i=1; i<=N; i++){
    X.push([dx*i/(N+1),p.f(dx*i/(N+1))]);
    X_prev.push([dx*i/(N+1),p.f(dx*i/(N+1))]);
    V.push([0,0]);
  }


  UIObjects.push(anchor1,anchor2,L_slider);

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

p.create_show_anchor = function(){
  return function(){
    p.fill(bgColor);
    p.color(textColor);
    p.circle(this.position[0],this.position[1],2*R);
  }
}

p.handleDrag_f = function(obj){
  return function(mouseX,mouseY){
    let mousePos = p.transformMouse([p.min(p.max(p.mouseX,20),w-20), p.min(p.max(p.mouseY,20),h-20)], translation, scaling);
    let d = math.subtract(mousePos,obj.position);
    let d_ = p.dist(0,0,d[0],d[1]);
    let a = p.atan2(d[1],d[0]);
    this.position = math.add(obj.position,[p.min(d_,L*0.999)*math.cos(a),p.min(d_,L*0.999)*math.sin(a)]);
  }
}


//////// DRAW ////////

p.draw = function() {
  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  p.background(bgColor);
  // p.background(240);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);

  p.fill(bgColor);
  p.stroke(textColor);

  L_slider.show(p.mouseX,p.mouseY,translation,scaling);
  L = L_slider.val;

  
  p.show_line(p.compute_exact_catenary(anchor1.position, anchor2.position, L));
  

  // p.fill(p.color(33, 150, 243));
  p.noFill();
  for(let i=0; i<5; i++){
    p.update(anchor1.position,anchor2.position);
  }
  p.show(X);


  p.fill(bgColor);
  anchor1.show();
  anchor2.show();


  // p.scale(scaling[0],scaling[1]);
  // p.text(p.length_(X,anchor1.position,anchor2.position),0,0);
  // p.scale(scaling[0],scaling[1]);


  for(let obj of UIObjects){
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.show_shadow();
    }
  }
}

p.g = function(a, anchor1_pos, anchor2_pos,L){
  return 2*a*math.sinh(p.abs(anchor1_pos[0]-anchor2_pos[0])/(2*a)) - math.sqrt(L**2-(anchor1_pos[1]-anchor2_pos[1])**2);    
}
p.g_prime = function(a, anchor1_pos, anchor2_pos,L){
  return 2*math.sinh(p.abs(anchor1_pos[0]-anchor2_pos[0])/(2*a)) - p.abs(anchor1_pos[0]-anchor2_pos[0])/a*math.cosh(p.abs(anchor1_pos[0]-anchor2_pos[0])/(2*a));
}

p.compute_params_exact_catenary = function(anchor1_pos, anchor2_pos, L){
  let a = 1;
  for(let i=0; i<1000; i++){
    a -= p.g(a, anchor1_pos, anchor2_pos, L)/p.g_prime(a, anchor1_pos, anchor2_pos, L);
  }
  let c = -math.sign(anchor1_pos[0]-anchor2_pos[0])*math.atanh((anchor2_pos[1]-anchor1_pos[1])/L) - (anchor1_pos[0]+anchor2_pos[0])/(2*a);
  let l = anchor1_pos[1]/a - math.cosh(anchor1_pos[0]/a+c);

  // p.scale(scaling[0],scaling[1]);
  // p.text(a,0,50);
  // p.text(c,0,75);
  // p.text(l,0,100);
  // p.scale(scaling[0],scaling[1]);

  return [a,c,l];
}

p.compute_exact_catenary = function(anchor1_pos, anchor2_pos, L){
  let x = linspace(p.min(anchor1_pos[0],anchor2_pos[0]),p.max(anchor1_pos[0],anchor2_pos[0]),100);
  let params = p.compute_params_exact_catenary(anchor1_pos, anchor2_pos, L);
  let y = x.map(x_ => p.f_catenary(x_,params));
  return [x,y];
}

p.f_catenary = function(x,params){
  return params[0]*(math.cosh(x/params[0]+params[1]) + params[2]);
}

p.show_line = function([x,y]){
  // console.log(y[0])
  let n = x.length;
  for(let i=0; i<n-1; i++){
    p.line(x[i],y[i],x[i+1],y[i+1]);
  }
}

p.update = function(anchor1_pos,anchor2_pos){
  for(let i=0; i<N; i++){
    let vel = math.multiply(math.subtract(X[i], X_prev[i]),0.99);
    X_prev[i] = X[i].slice();
    X[i] = math.add(X[i], math.add(vel, math.multiply(A, dt * dt)));
  }

  for(let i=0; i<10; i++){
    p.update_constraint(anchor1_pos,anchor2_pos,L/(N+1)/2,0);
    p.update_constraint(anchor1_pos,anchor2_pos,L/(N+1)/2,1);
  }
  
}

p.update_constraint = function(anchor1_pos,anchor2_pos,L,forward_pass){
  if(forward_pass){
    X[0] = p.move1(anchor1_pos,X[0],L);
    for(let i=0; i<N-1; i++){
      [X[i],X[i+1]] = p.move2(X[i],X[i+1],L);
    }
    X[N-1] = p.move1(anchor2_pos,X[N-1],L);
  } else {
    X[N-1] = p.move1(anchor2_pos,X[N-1],L);
    for(let i=N-1; i>0; i-=1){
      [X[i],X[i-1]] = p.move2(X[i],X[i-1],L);
    }
    X[0] = p.move1(anchor1_pos,X[0],L);
  }
}

p.length_ = function(arr,anchor1_pos,anchor2_pos){
  let S = p.dist(arr[0][0],arr[0][1],anchor1_pos[0],anchor1_pos[1]);
  for(let i=0; i<N-1; i++){
    S += p.dist(arr[i][0],arr[i][1],arr[i+1][0],arr[i+1][1]);
  }
  S += p.dist(arr[N-1][0],arr[N-1][1],anchor2_pos[0],anchor2_pos[1]);
  return S;
}

p.move1 = function(X0,X,L){
  let D = math.subtract(X,X0);
  let d = p.dist(0,0,D[0],D[1]);
  return math.subtract(X,math.multiply(D,(1-2*L/d)));
}

p.move2 = function(X1,X2,L){
  let D = math.subtract(X2,X1);
  let d = p.dist(0,0,D[0],D[1]);
  X1 = math.subtract(X1,math.multiply(D,-(1/2-L/d)));
  X2 = math.subtract(X2,math.multiply(D,1/2-L/d));
  return [X1,X2];
}


// p.show = function(arr){
//   p.line(anchor1.position[0],anchor1.position[1],arr[0][0],arr[0][1]);
//   for(let i=0; i<N-1; i++){
//     p.line(arr[i][0],arr[i][1],arr[i+1][0],arr[i+1][1]);
//   }
//   p.line(anchor2.position[0],anchor2.position[1],arr[N-1][0],arr[N-1][1]);

//   for(let i=0; i<N; i++){
//     p.circle(arr[i][0],arr[i][1],2*3);
//   }
// }

p.show = function(arr){
  let l = 3;
  for(let i=0; i<N-1; i+=2){
    let dc = p.dist(arr[i+1][0],arr[i+1][1],arr[i][0],arr[i][1]);
    let thetac = p.atan2((arr[i+1][1]-arr[i][1]),(arr[i+1][0]-arr[i][0]));
    p.translate(arr[i][0],arr[i][1]);
    p.rotate(thetac);
    p.rect(-l/2,-2,dc+l,4,5);
    p.rotate(-thetac);
    p.translate(-arr[i][0],-arr[i][1]);
  }

  p.line(anchor1.position[0],anchor1.position[1],arr[0][0],arr[0][1]);
  for(let i=1; i<N-1; i+=2){
    let dc = p.dist(arr[i+1][0],arr[i+1][1],arr[i][0],arr[i][1]);
    let thetac = p.atan2((arr[i+1][1]-arr[i][1]),(arr[i+1][0]-arr[i][0]));
    p.translate(arr[i][0],arr[i][1]);
    p.rotate(thetac);
    p.line(0,0,dc,0);
    p.rotate(-thetac);
    p.translate(-arr[i][0],-arr[i][1]);
  }
  p.line(anchor2.position[0],anchor2.position[1],arr[N-1][0],arr[N-1][1]);
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

new p5(SketchCatenary("p5-container-catenary"));


// p.update = function(){
//   N = theta.length;
//   let x = theta_dot.concat(theta);
//   x = p.RG4(x);
//   theta_dot = x.slice(0,N);
//   theta = x.slice(N,2*N);
//   // plot.push(theta[0]);
//   // theta = math.add(theta, Array(N).fill(0.1));
// }

// p.theta2X = function(theta){
//   N = theta.length;
//   let x = Array.from({ length: N }, () => Array(2).fill(0));

//   x[0] = math.add(X0,[l_vec[0]*math.sin(theta[0]),l_vec[0]*math.cos(theta[0])]);
//   for(let j=1; j<N; ++j){
//     x[j][0] = x[j-1][0]+l_vec[j]*math.sin(theta[j]);
//     x[j][1] = x[j-1][1]+l_vec[j]*math.cos(theta[j]);
//   }
//   return x;
// }

// p.M = function(j,k, m_vec){
//   N = m_vec.length;
//   S = 0;
//   for(let i=p.max(j,k); i<N; ++i){
//      S += m_vec[i];
//   }
//   return S;
// }

// p.create_mat_fix = function(theta, theta_dot, l_vec, m_vec){
//   N = theta.length;
//   let A = Array.from({ length: N }, () => Array(N).fill(0));
//   let B = Array.from({ length: N }, () => Array(N).fill(0));
//   let C = Array.from({ length: N }, () => Array(N).fill(0));
//   let b = Array(N).fill(0);

//   let J = Array.from({ length: 2 }, () => Array(N).fill(0));
//   let J_ = Array.from({ length: 2 }, () => Array(N).fill(0));

//   for(let k=0; k<N; ++k){
//      for(let j=0; j<N; ++j){
//       A[j][k] = l_vec[k]*math.cos(theta[k]-theta[j])*p.M(j,k, m_vec);
//       B[j][k] = l_vec[k]*math.sin(theta[k]-theta[j])*p.M(j,k, m_vec);
//       C[j][k] = -lambda*l_vec[k]*math.cos(theta[k]-theta[j])*(N+1-p.max(j,k));
//      }
//      b[k] = g*p.M(k,0, m_vec)*math.sin(theta[k]);

//     J[0][k] = l_vec[k]*math.cos(theta[k]);
//     J[1][k] = l_vec[k]*math.sin(theta[k]);
//     J_[1][k] = -l_vec[k]*math.cos(theta[k]);
//     J_[0][k] = l_vec[k]*math.sin(theta[k]);
//     }
//     A_ = math.multiply(J,math.inv(A),math.transpose(J));
//     // console.log(math.det(A))

//     mu = math.multiply(math.inv(A_),math.add(
//       math.multiply(-1,J,math.inv(A),
//       math.add(math.multiply(C,theta_dot),math.multiply(B,math.dotMultiply(theta_dot,theta_dot)),b)),
//       math.multiply(J_,math.dotMultiply(theta_dot,theta_dot))) );

//   return [A,B,C,b,math.multiply(math.transpose(J),mu)];
// }

// p.F_fix = function(x){
//   N = x.length/2;
//   theta_dot = x.slice(0,N);
//   theta = x.slice(N,2*N);

//   [A,B,C,b,Jmu] = p.create_mat_fix(theta,theta_dot,l_vec,m_vec);

//   theta_dotdot = math.multiply(math.inv(A),
//   math.add(math.multiply(C,theta_dot),math.multiply(B,math.dotMultiply(theta_dot,theta_dot)),b,Jmu));
//   // console.log(theta_dotdot)
//   return theta_dotdot.concat(theta_dot);
// }


// p.RG4 = function(x){
//   let k1 = p.F_fix(x);
//   let k2 = p.F_fix(math.add(x,math.multiply(k1,dt/2)));
//   let k3 = p.F_fix(math.add(x,math.multiply(k2,dt/2)));
//   let k4 = p.F_fix(math.add(x,math.multiply(k3,dt)));
//   return math.add(x,math.multiply(math.add(k1,math.multiply(math.add(k2,k3),2),k4),dt/6));
// }