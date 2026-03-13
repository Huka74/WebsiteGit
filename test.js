let Sketch = (containerId) => (p) => {

let w;
let h;

let b;
let d;
let dd;
let UIObjects;
let draggedObject = null;

let bgColor;
let textColor;

p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth
  h = container.clientHeight



  b = new Button(p,[0,0],10,3);
  d = new Draggable(p,[50,0],10);
  dd = new ValueSlider(p,position=[100,0],r_hitbox=[10],val=1,val_lim=[0,5],distance=50, container=container, name="k", precision=1);

  UIObjects = [b,d,dd];
}



p.draw = function() {
  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;
  p.fill(bgColor)
  p.stroke(textColor)

  p.background(bgColor);
  p.translate(w/2,h/2);
  p.scale(1, -1);

  p.circle(50,50,50);
  spring(p,[50,50],d.position,5,0.1,4,1);
  arrow(p,[50,50],50,2,4,1);


  b.show();
  d.show();
  dd.show(p.mouseX,p.mouseY,[w/2,h/2],[1,-1]);

  p.text(b.val,0,0);

}



p.mousePressed = function() {
    let mousePos = p.transformMouse(p.mouseX, p.mouseY);

    // Find what was clicked (stop at first hit)
    for(let obj of UIObjects) {
        if(p.dist(mousePos.x, mousePos.y, obj.position[0], obj.position[1])<obj.r_hitbox){
            obj.handlePress(mousePos.x, mousePos.y)
            draggedObject = obj;
            break; // Only one object handles the click
        }
    }
}

p.mouseDragged = function() {
    let mousePos = p.transformMouse(p.mouseX, p.mouseY);
    
    if (draggedObject){
        draggedObject.handleDrag(mousePos.x, mousePos.y);
        return;
    }

    return false;
}

p.mouseReleased = function() {
    if (draggedObject) {
      draggedObject.handleRelease();
      draggedObject = null; // Clear the dragged object
      return;
    }

    for(let obj of UIObjects) {
        obj.handleRelease();
    }
}

p.transformMouse = function(mx, my) {
    return {
        x: (mx - w/2),
        y: -(my - h/2) };
}

}

new p5(Sketch("p5-container"))
new p5(Sketch("p5-container2"))