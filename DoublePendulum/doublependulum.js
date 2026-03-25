let SketchDoublePendulum = (containerId) => (p) => {
let w = 600;
let h = 600;

let dt = 0.5;

let X0 = [0,0];
let N = 2;
let theta = [-2,-2];
let theta_dot = [0,0];
let X;

let R = 10;
let l_vec = [100,100];
let m_vec = [1,1];
let g = 1;
let w1 = -1/2*g*(1/l_vec[0]+1/l_vec[1])*(1+m_vec[1]/m_vec[0])*(1 - math.sqrt(1-4*m_vec[0]/(m_vec[0]+m_vec[1])*l_vec[0]*l_vec[1]/(l_vec[0]+l_vec[1])**2));
let v1 = [g+w1*l_vec[1],-w1*l_vec[0]];
let w2 = -1/2*g*(1/l_vec[0]+1/l_vec[1])*(1+m_vec[1]/m_vec[0])*(1 + math.sqrt(1-4*m_vec[0]/(m_vec[0]+m_vec[1])*l_vec[0]*l_vec[1]/(l_vec[0]+l_vec[1])**2));
let v2 = [g+w2*l_vec[1],-w2*l_vec[0]];
let eps1 = 0.5;
let eps2 = 0.09;
let lambda = 0;

let button1;
let button2;
let w_button = 40;
let h_button = 20;
let r_button = 3;

let M1;
let M2;

let draggingM1 = false;
let draggingM2 = false;
let UIObjects;
let draggedObject = null;


let bgColor;
let textColor;
let show_button;

let translation = [w/2-40,h/2-200];
let scaling = [1,-1];



p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  show_button = container.dataset.show !== undefined ? parseFloat(container.dataset.show) : 1;

  w = container.clientWidth
  h = container.clientHeight

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;
  
  X = p.theta2X(theta);

  // Draggables

  M1 = new Draggable(p,X[0],[25]);
  M2 = new Draggable(p,X[1],[25]);
  M1.color = p.color(bgColor);
  M2.color = p.color(bgColor);
  M1.theta_history = [];

  M1.handleDrag = function(mouseX,mouseY){
    draggingM1 = true;
    button1.val = 0;
    button2.val = 0;

    let a = p.atan2(mouseX,mouseY);
    theta[0] = a;

    M1.position = [l_vec[0]*math.cos(p.PI/2-a),l_vec[0]*math.sin(p.PI/2-a)];
    let v = math.subtract(M2.position,M1.position);
    theta[1] = math.atan2(v[0],v[1]);
  };
  M1.handleRelease = function(){
    theta_dot[0] = 0;
    draggingM1 = false;
  };
  M1.show_shadow = function(){
    this.color = p.lerpColor(this.color, p.color(0), 0.1);
  };
  M1.show = function(){
    p.showMasses(this);
  };
  

  M2.handleDrag = function(mouseX,mouseY){
    draggingM2 = true;
    button1.val = 0;
    button2.val = 0;
    
    theta_dot = [0,0];
    // Distance from origin to mouse
    let d = p.dist(mouseX, mouseY, X0[0], X0[1]);
    let a = p.atan2(mouseY, mouseX);
    
    // Clamp total distance
    let max_d = l_vec[0] + l_vec[1];
    if(d > max_d) d = max_d;
    
    // Position where we want M2 to be
    let target = [d * math.cos(a), d * math.sin(a)];
    
    // Solve inverse kinematics using law of cosines
    let alpha = math.acos((l_vec[0]**2 + l_vec[1]**2 - d**2) / (2*l_vec[0]*l_vec[1]));
    let beta = math.acos((l_vec[0]**2 - l_vec[1]**2 + d**2) / (2*l_vec[0]*d));
    
    // Angle from origin to target
    let target_angle = p.PI/2 - p.atan2(target[1], target[0]);
    
    // theta[0]: angle of first link from vertical
    theta[0] =  target_angle - beta;
    
    // Vector from M1 to M2
    theta[1] = p.PI-alpha+theta[0];
    
    // Update visual positions
    M1.position = [l_vec[0]*math.sin(theta[0]), l_vec[0]*math.cos(theta[0])];;
    M2.position = target;
  };
  M2.handleRelease = function(){
    theta_dot = [0,0];
    draggingM2 = false;
  };
  M2.show_shadow = function(){
    this.color = p.lerpColor(this.color, p.color(0), 0.1);
  };
  M2.show = function(){
    p.showMasses(this);
  };

  // Buttons

  button1 = new Button(p,[100-25,-50],[w_button,h_button,r_button],2);
  button2 = new Button(p,[100+25,-50],[w_button,h_button,r_button],2);


  button1.show = function() {
    p.showButton(this, {
      arrows: [
        { xOffset: 10, angle: p.PI/2 },
        { xOffset: -10, angle: -p.PI/2 }
      ]
    });
  };
  button1.show_shadow = function() {
    this.hover = true
  }
  button1.handlePress = function(){
    if(!button1.val){
      button1.val = 1;
      button2.val = 0;
    }
    theta = [-p.PI+v1[0]*eps1,-p.PI+v1[1]*eps1];
    theta_dot = [0,0];
  }


  button2.show = function() {
    p.showButton(this, {
      arrows: [
        { xOffset: 2, angle: -p.PI/2 },
        { xOffset: -10, angle: -p.PI/2 }
      ]
    });
  };
  button2.show_shadow = function() {
    this.hover = true
  }
  button2.handlePress = function(){
    if(!button2.val){
      button1.val = 0;
      button2.val = 1;
    }
    theta = [-p.PI+v2[0]*eps2,-p.PI+v2[1]*eps2];
    theta_dot = [0,0];
  }

  

  // UIObjects array
  if(show_button){
    UIObjects = [button1, button2, M1, M2];
  } else {
    UIObjects = [M1, M2];
  }

  // console.log(w1,w2,g/l_vec[0]*(2-p.sqrt(2)),g/l_vec[0]*(2+p.sqrt(2)))
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

}

p.showMasses = function(mass){
  p.fill(mass.color);
  p.stroke(textColor);
  p.circle(mass.position[0],mass.position[1],2*R);
}





//////// DRAW ////////


p.draw = function() {
  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  // p.background(bgColor);
  p.background(220);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);




  if(!draggingM2){
    p.update(draggingM1 ? p.F_solo : p.F);
  }
  X = p.theta2X(theta);

  if(N>=1){
      p.line(X0[0], X0[1], X[0][0], X[0][1]);
    //   p.circle(X[0][0], X[0][1], R);  
  }
  for(let i=0; i<N-1; ++i){
    p.line(X[i][0], X[i][1], X[i+1][0], X[i+1][1]);
    // p.circle(X[i+1][0], X[i+1][1], R);
    // p.circle(X[i][0], X[i][1], R);
  }
//   p.circle(X0[0], X0[1], R);

 
  M1.position = X[0];
  M2.position = X[1];

  if(!show_button){
    p.arc(X0[0],X0[1],5*R,5*R,-p.PI/2,p.PI/2-theta[0]);
    p.arc(M1.position[0], M1.position[1],5*R,5*R,-p.PI/2,p.PI/2-theta[1]);
  }

  M1.show();
  M2.show();
  M1.color = p.color(bgColor);
  M2.color = p.color(bgColor);

  if(show_button){
  button1.color = p.color(bgColor);
  button2.color = p.color(bgColor);

  button1.show();
  button2.show();

  button1.hover = false;
  button2.hover = false;
  }


  for(let obj of UIObjects){
    if(obj.isMouseOn([p.mouseX,p.mouseY],translation,scaling)){
      obj.show_shadow();
    }
  }

}

p.update = function(F){
  let N = theta.length;
  let x = theta_dot.concat(theta);
  x = p.RG4(x,F);
  theta_dot = x.slice(0,N);
  theta = x.slice(N,2*N);
//   theta_dot[1] = x[1]
//   theta[1] = x[3]
  // plot.push(theta[0]);
  // theta = math.add(theta, Array(N).fill(0.1));
}

p.RG4 = function(x,F){
  let k1 = F(x);
  let k2 = F(math.add(x,math.multiply(k1,dt/2)));
  let k3 = F(math.add(x,math.multiply(k2,dt/2)));
  let k4 = F(math.add(x,math.multiply(k3,dt)));
  return math.add(x,math.multiply(math.add(k1,math.multiply(math.add(k2,k3),2),k4),dt/6));
}

p.theta2X = function(theta){
  N = theta.length;
  let x = Array.from({ length: N }, () => Array(2).fill(0));

  x[0] = math.add(X0,[l_vec[0]*math.sin(theta[0]),l_vec[0]*math.cos(theta[0])]);
  for(let j=1; j<N; ++j){
    x[j][0] = x[j-1][0]+l_vec[j]*math.sin(theta[j]);
    x[j][1] = x[j-1][1]+l_vec[j]*math.cos(theta[j]);
  }
  return x;
}

function M(j,k, m_vec){
  N = m_vec.length;
  S = 0;
  for(let i=p.max(j,k); i<N; ++i){
     S += m_vec[i];
  }
  return S;
}

p.create_mat = function(theta, l_vec, m_vec){
  let N = theta.length;
  let A = Array.from({ length: N }, () => Array(N).fill(0));
  let B = Array.from({ length: N }, () => Array(N).fill(0));
  let C = Array.from({ length: N }, () => Array(N).fill(0));
  let b = Array(N).fill(0);

  for(let k=0; k<N; ++k){
     for(let j=0; j<N; ++j){
      A[j][k] = l_vec[k]*math.cos(theta[k]-theta[j])*M(j,k, m_vec);
      B[j][k] = l_vec[k]*math.sin(theta[k]-theta[j])*M(j,k, m_vec);
      C[j][k] = -lambda*l_vec[k]*math.cos(theta[k]-theta[j])*(N+1-p.max(j,k));
     }
     b[k] = g*M(k,0, m_vec)*math.sin(theta[k]);
  }

  return [A,B,C,b];
}

p.F = function(x){
  N = x.length/2;
  theta_dot = x.slice(0,N);
  theta = x.slice(N,2*N);

  [A,B,C,b] = p.create_mat(theta,l_vec,m_vec);

  theta_dotdot = math.multiply(math.inv(A),
  math.add(math.multiply(C,theta_dot),(math.multiply(B,math.dotMultiply(theta_dot,theta_dot))),b));

  return theta_dotdot.concat(theta_dot);
}

p.create_mat_fix = function(theta, theta_dot, l_vec, m_vec){
  N = theta.length;
  let A = Array.from({ length: N }, () => Array(N).fill(0));
  let B = Array.from({ length: N }, () => Array(N).fill(0));
  let C = Array.from({ length: N }, () => Array(N).fill(0));
  let b = Array(N).fill(0);

  let J = Array.from({ length: 2 }, () => Array(N).fill(0));
  let J_ = Array.from({ length: 2 }, () => Array(N).fill(0));

  for(let k=0; k<N; ++k){
     for(let j=0; j<N; ++j){
      A[j][k] = l_vec[k]*math.cos(theta[k]-theta[j])*M(j,k, m_vec);
      B[j][k] = l_vec[k]*math.sin(theta[k]-theta[j])*M(j,k, m_vec);
      C[j][k] = -lambda*l_vec[k]*math.cos(theta[k]-theta[j])*(N+1-p.max(j,k));
     }
     b[k] = g*M(k,0, m_vec)*math.sin(theta[k]);

    J[0][k] = l_vec[k]*math.cos(theta[k]);
    J[1][k] = l_vec[k]*math.sin(theta[k]);
    J_[1][k] = -l_vec[k]*math.cos(theta[k]);
    J_[0][k] = l_vec[k]*math.sin(theta[k]);
    }
    A_ = math.multiply(J,math.inv(A),math.transpose(J));

    mu = math.multiply(math.inv(A_),math.add(
      math.multiply(-1,J,math.inv(A),
      math.add(math.multiply(C,theta_dot),math.multiply(B,math.dotMultiply(theta_dot,theta_dot)),b)),
      math.multiply(J_,math.dotMultiply(theta_dot,theta_dot))) );

  return [A,B,C,b,math.multiply(math.transpose(J),mu)];
}

p.F_fix = function(x){
  N = x.length/2;
  theta_dot = x.slice(0,N);
  theta = x.slice(N,2*N);

  [A,B,C,b,Jmu] = p.create_mat_fix(theta,theta_dot,l_vec,m_vec);

  theta_dotdot = math.multiply(math.inv(A),
  math.add(math.multiply(C,theta_dot),math.multiply(B,math.dotMultiply(theta_dot,theta_dot)),b,Jmu));

  return theta_dotdot.concat(theta_dot);
}

p.F_solo = function(x){
  N = x.length/2;
  theta_dot = x.slice(0,N);
  theta = x.slice(N,2*N);

//   let v = [l_vec[0]*theta_dot[0]*math.cos(theta[0]),l_vec[0]*theta_dot[0]*math.sin(theta[0])];
//   let a = [l_vec[0]*(theta_dotdot[0]*math.cos(theta[0])-theta_dot[0]**2*math.sin(theta[0])),
//            l_vec[0]*(theta_dotdot[0]*math.sin(theta[0])+theta_dot[0]**2*math.cos(theta[0]))]

//   theta_dotdot = [0,-1/l_vec[1]*( math.cos(theta[1])*(a[0]+theta_dot[1]*v[1])+math.sin(theta[1])*(a[1]-theta_dot[0]*v[0]) ) + g/l_vec[1]*math.sin(theta[1])];
  theta_dotdot = [0, g/l_vec[1]*math.sin(theta[1])];
//   console.log(theta_dotdot)

  return theta_dotdot.concat([0,theta_dot[1]]);
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

    // return false;
}

p.mouseReleased = function() {

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

new p5(SketchDoublePendulum("p5-container-doublependulum"))
// new p5(SketchPendulum("p5-container-doublependulum-sketch"))
