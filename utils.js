// 
// ^           /\      /\
// L (x) =====/  \    /  \    /===== (y)
// |              \  /    \  /
// v               \/      \/
//            <-------N-------><l_ext>(proportional)
// 


spring = function(p,x,y,L,l_ext,N,e, proportional=false){
  p.strokeWeight(e);
  v = math.subtract(y,x);
  p.translate(x[0],x[1]);
  p.rotate(math.atan2(v[1],v[0]));
  let D = p.dist(x[0],x[1],y[0],y[1]);
  if(proportional){
    l_ext = D*l_ext;
  }
  
  let d = (D-2*l_ext)/(4*N);

  p.line(0,0,l_ext,0);
  p.line(l_ext,0,l_ext+d,L);
  for(let i=1; i<=4*(N-1); i+=4){
    p.line(l_ext+d*i,-L*(-1)**i, l_ext+d*(i+2),L*(-1)**i);
    p.line(l_ext+d*(i+2),L*(-1)**i, l_ext+d*(i+4),-L*(-1)**i);
  }
  p.line(l_ext+d*(4*N-3),L, l_ext+d*(4*N-1),-L);
  p.line(D-l_ext-d,-L,D-l_ext,0);
  p.line(D-l_ext,0,D,0);
  
  p.rotate(-math.atan2(v[1],v[0]));
  p.translate(-x[0],-x[1]);
  p.strokeWeight(1);
}



//                 
//                         |\
// ^ |=====================| \
// | |                        \
// h |                        /
// v |=====================| /
//                        b|/
//                 
//   <---------L-------->

arrow = function(p,pos,L,h,b,alpha){
  L -= p.sqrt(3)/2*b;
  p.translate(pos[0],pos[1]);
  p.rotate(alpha);
  p.rect(-h/2,0,h,L);
  p.triangle(-b/2,L,b/2,+L,0,p.sqrt(3)/2*b+L);

  p.strokeWeight(0);
  p.rect(-h/2+1/2,L-1,h-1,2);
  p.strokeWeight(1);

  p.rotate(-alpha);
  p.translate(-pos[0],-pos[1]);
}

linspace = function(start, end, num) {
  let step = (end - start) / (num - 1);
  let array = [];
  
  for (let i = 0; i < num; i++) {
    array.push(start + step * i);
  }
  return array;
}

gradientLine = function(p, x1, y1, x2, y2, c, steps = 100) {
  for (let i=0; i<steps; i++) {
    let t1 = i/steps;
    let t2 = (i+1)/steps;

    let xa = p.lerp(x1, x2, t1);
    let ya = p.lerp(y1, y2, t1);
    let xb = p.lerp(x1, x2, t2);
    let yb = p.lerp(y1, y2, t2);

    let col = c(t1);
    p.stroke(col);
    p.line(xa, ya, xb, yb);
  }
}

// transformMouse = function(mx, my) {
// return {
//     x: (mx - w/2),
//     y: -(my - h/2) };
// }

class Axes{
  constructor(p,x,[dx,dy],color){
    this.p = p;
    this.pos = x;
    this.step = [dx,dy];
    this.color = color;
  }

  co2pix(x){
    return math.add(this.pos,[this.step[0]*x[0],this.step[1]*x[1]]);
  }
  pix2co(x){
    return [(x[0]-this.pos[0])/this.step[0],(x[1]-this.pos[1])/this.step[1]];
  }

  plot(x,y){
    // this.p.strokeWeight(1);
    // this.p.stroke(this.color);
    if(x.lenght==y.lenght){
      let [x_old, y_old] = this.co2pix([x[0],y[0]])
      for(let i=1; i<x.length; ++i){
        let [x_,y_] = this.co2pix([x[i],y[i]]);
        this.p.line(x_old,y_old,x_,y_);
        [x_old, y_old] = [x_,y_];
      }

    }else{
      console.log("x and y size must be the same")
    }
  }

  show_axis([xmin,xmax],[ymin,ymax]){
    // this.p.strokeWeight(1);
    this.p.stroke(this.color);
    let xmax_ = this.co2pix([xmax,0]);
    let xmin_ = this.co2pix([xmin,0]);
    let ymax_ = this.co2pix([0,ymax]);
    let ymin_ = this.co2pix([0,ymin]);

    this.p.line(xmin_[0],xmin_[1],xmax_[0],xmax_[1]);
    this.p.line(ymin_[0],ymin_[1],ymax_[0],ymax_[1]);
  }

}

// isMouseOnObj = function(p,[mouseX,mouseY],translation,scaling,position,r_hitbox){
//   if(r_hitbox.length==1){
//       if(p.dist((p.mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1],position[0],position[1])<r_hitbox[0]){
//         return true;
//       }
//     } else if(r_hitbox.length==3){
//       q = [p.abs((mouseX-translation[0])/scaling[0] - position[0]) - r_hitbox[0]/2 + r_hitbox[2],
//            p.abs((mouseY-translation[1])/scaling[1] - position[1]) - r_hitbox[1]/2 + r_hitbox[2]];

//       if(p.sqrt(p.max(q[0],0)**2+p.max(q[1],0)**2)+p.min(0,p.max(q[0],q[1]))<r_hitbox[2]){
//         return true;
//       }
//     }
//     return false;
// }