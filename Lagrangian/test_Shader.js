let SketchLagrangianV = (containerId) => (p) => {
let myShader;

p.preload = function() {
  myShader = p.loadShader('shaders_V.vert', 'shaders_V.frag');
}

p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight, p.WEBGL);
  canvas.parent(containerId);
  p.shader(myShader);
}

p.draw = function(){
    p.background(250);
    p.translate(300,300);
    p.scale(1,-1);
    p.shader(myShader);
    p.rect(0, 0, p.width, p.height);
}

}


new p5(SketchLagrangianV("p5-container-test"));
