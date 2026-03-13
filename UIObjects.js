class UIObject{
  constructor(p,position,r_hitbox){
    this.p = p;
    this.position = position;
    this.r_hitbox = r_hitbox;
  }

  isMouseOn([mouseX, mouseY],translation,scaling){
    let pos = [(mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1]];
    if(this.r_hitbox.length==1){
      if(this.p.dist(pos[0],pos[1],this.position[0],this.position[1])<this.r_hitbox[0]){
        return true;
      }
    } else if(this.r_hitbox.length==3){
      let q = [this.p.abs(pos[0] - this.position[0]) - this.r_hitbox[0]/2 + this.r_hitbox[2],
           this.p.abs(pos[1] - this.position[1]) - this.r_hitbox[1]/2 + this.r_hitbox[2]];

      if(this.p.sqrt(this.p.max(q[0],0)**2+this.p.max(q[1],0)**2)+this.p.min(0,this.p.max(q[0],q[1]))<this.r_hitbox[2]){
        return true;
      }
    }
    return false;
  }
}

class Button extends UIObject{
  constructor(p,position,r_hitbox, N_val){
    super(p,position,r_hitbox);
    this.val = 0;
    this.N_val = N_val;
    this.color = p.color(255);
  }

  handlePress(mouseX, mouseY){
    this.val = (this.val+1)%this.N_val
    this.color = this.p.color(128);
  }

  handleRelease(mouseX, mouseY){
    this.color = this.p.color(255);
  }

  handleDrag(mouseX, mouseY){
    return false;
  }

  show(){
    this.p.fill(this.color);
    this.p.stroke(0);
    this.p.circle(this.position[0], this.position[1],2*this.r_hitbox[0]);
  };

  show_shadow(){
    // this.p.fill(this.color_hover)
  }
}

class Draggable extends UIObject{
  constructor(p,position,r_hitbox){
    super(p,position,r_hitbox);
    this.color = p.color(255);
  }

  handlePress(mouseX, mouseY){

  }

  handleRelease(mouseX, mouseY){

  }

  handleDrag(mouseX, mouseY){
    this.position = [mouseX,mouseY];
  }

  show(){
    this.p.fill(this.color);
    this.p.stroke(0);
    this.p.circle(this.position[0], this.position[1],2*this.r_hitbox);
  };

  show_shadow(){
    // this.p.fill(this.color_hover)
  }
}

class ValueSlider extends UIObject{
  constructor(p, position, r_hitbox, val, val_lim,distance, container, name="", precision=1, color=p.color(255,0,0)){
    super(p,position,r_hitbox);
    this.val = val;
    this.val_lim = val_lim;
    this.val_clicked = val;
    this.distance = distance;

    this.pos_mouse_clicked;

    this.container = container;
    this.name = name;
    this.precision = precision;
    this.color = color;
    
    this.shadow_alpha = 0.4;
    this.color_arrow = this.p.color(150,150,150);

    this.divnum = this.p.createDiv();
    this.divnum.parent(this.container);
    this.divnum.style("font-size", "11px");
    this.divnum.position(this.position[0],this.position[1]);
    this.divnum.style("transform", "translate(-50%, -50%)");
    this.divnum.style("user-select", "none");
    this.divnum.style("color", color);

    this.divname = this.p.createDiv();
    this.divname.parent(this.container);
    this.divname.style("font-size", "12px");
    this.divname.position(this.position[0],this.position[1]);
    this.divname.style("transform", "translate(-50%, -50%)");
    this.divname.style("user-select", "none");
    this.divname.style("color", color);

  }

  handlePress(mouseX, mouseY){
    this.pos_mouse_clicked = [mouseX,mouseY];
    this.val_clicked = this.val;
    this.has_been_clicked = true;
  }

  handleRelease(mouseX, mouseY){
    this.has_been_clicked = false;
  }

  handleDrag(mouseX,mouseY){
    this.val = this.p.max(this.val_lim[0],this.p.min(this.val_lim[1],this.val_clicked+(mouseX-this.pos_mouse_clicked[0])/this.distance));
    this.show_arrow(this.position,this.r_hitbox[0]);
    this.p.strokeWeight(1);
  }

  show(mouseX, mouseY, translation=[0,0], scaling=[1,1]){
    if(this.p.dist((mouseX-translation[0])/scaling[0],(mouseY-translation[1])/scaling[1],this.position[0],this.position[1])<this.r_hitbox){
        this.hover_bool = true;
    }else if(!this.has_been_clicked){
        this.hover_bool = false;
    }
    this.divnum.position(translation[0]+scaling[0]*this.position[0],translation[1]+scaling[1]*this.position[1]);
    this.divnum.style("color", this.color);
    katex.render((this.val).toFixed(this.precision),this.divnum.elt);

    if(this.name!=""){
      this.divname.position(translation[0]+scaling[0]*this.position[0]-28,translation[1]+scaling[1]*this.position[1]);
      this.divname.style("color", this.color);
      katex.render(this.name+"=",this.divname.elt);
    }

    if(this.hover_bool){
      this.show_arrow(this.position,this.r_hitbox[0])
      this.p.strokeWeight(1);
    }
  }

  show_shadow(mouseX, mouseY, translation=[0,0], scaling=[1,1]){
    
  }

  show_arrow(pos, radius){
    this.p.strokeWeight(0);
    
    this.p.fill(this.color_arrow);
    this.arrow([pos[0]-radius,pos[1]],8,2,-90,120);
    this.arrow([pos[0]+radius,pos[1]],8,2,90,120);
  }
  
  arrow(pos,L,l,angle,angle_rel, rounded=20){
    this.p.translate(pos[0], pos[1]);
    this.p.rotate(this.p.PI*(angle+angle_rel/2)/180);
  
    this.p.rect(-l/2, -l/2, l, L, rounded);
    this.p.rotate(-this.p.PI*angle_rel/180);
    this.p.rect(-l/2, -l/2, l, L, rounded);
    this.p.rotate(this.p.PI*angle_rel/180);
  
    this.p.rotate(-this.p.PI*(angle+angle_rel/2)/180);
    this.p.translate(-pos[0], -pos[1]);
  }
}

// class ValueSlider extends UIObject{
//   constructor(p,x,r_hitbox,val,val_lim,distance, container, name="", precision=1){
//     super(p,x,r_hitbox);
//     this.val = val;
//     this.val_lim = val_lim;
//     this.val_clicked = val;
//     this.distance = distance;

//     this.container = container;
//     this.name = name;
//     this.precision = precision;
    
//     this.shadow_alpha = 0.4;
//     this.color_arrow = this.p.color(150,150,150);

//     this.divnum = this.p.createDiv();
//     this.divnum.parent(this.container);
//     this.divnum.style("font-size", "11px");
//     this.divnum.position(this.x[0],this.x[1]);
//     this.divnum.style("transform", "translate(-50%, -50%)");
//     this.divnum.style("user-select", "none");
//     this.divnum.style("color", 'rgb(255, 255, 255)');

//     this.divname = this.p.createDiv();
//     this.divname.parent(this.container);
//     this.divname.style("font-size", "12px");
//     this.divname.position(this.x[0],this.x[1]);
//     this.divname.style("transform", "translate(-50%, -50%)");
//     this.divname.style("user-select", "none");
//     this.divname.style("color", 'rgb(255, 255, 255)');
    

//     UIManager.set_hover(true, this);
//     UIManager.set_drag(true, this);
//     UIManager.set_valueslider(true, this);
//   }

//   update_drag([mouseX,mouseY],pos_mouse_clicked){
//     this.val = this.p.max(this.val_lim[0],this.p.min(this.val_lim[1],this.val_clicked+(mouseX-pos_mouse_clicked[0])/this.distance));
//     this.show_arrow(this.x,this.r_hitbox);
//     this.p.strokeWeight(1);
//   }

//   show(translation=[0,0], scaling=[1,1]){
//     this.divnum.position(translation[0]+scaling[0]*this.x[0],translation[1]+scaling[1]*this.x[1]);
//     katex.render(this.p.round(this.val,this.precision).toFixed(this.precision),this.divnum.elt);

//     if(this.name!=""){
//       this.divname.position(translation[0]+scaling[0]*this.x[0]-28,translation[1]+scaling[1]*this.x[1]);
//       katex.render(this.name+"=",this.divname.elt);
//     }

//     if(this.hover_bool){
//       this.show_arrow(this.x,this.r_hitbox)
//       this.p.strokeWeight(1);
//     }
//   }
//   // show_shadow(){
//   //   this.show_arrow(this.x,this.r_hitbox);
//   //   strokeWeight(1);
//   // }
//   show_arrow(pos, radius){
//     this.p.strokeWeight(0);
    
//     this.p.fill(this.color_arrow);
//     this.arrow([pos[0]-radius,pos[1]],8,2,-90,120);
//     this.arrow([pos[0]+radius,pos[1]],8,2,90,120);
//   }
  
//   arrow(pos,L,l,angle,angle_rel, rounded=20){
//     this.p.translate(pos[0], pos[1]);
//     this.p.rotate(this.p.PI*(angle+angle_rel/2)/180);
  
//     this.p.rect(-l/2, -l/2, l, L, rounded);
//     this.p.rotate(-this.p.PI*angle_rel/180);
//     this.p.rect(-l/2, -l/2, l, L, rounded);
//     this.p.rotate(this.p.PI*angle_rel/180);
  
//     this.p.rotate(-this.p.PI*(angle+angle_rel/2)/180);
//     this.p.translate(-pos[0], -pos[1]);
//   }
// }