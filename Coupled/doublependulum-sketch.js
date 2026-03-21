let SketchPendulum = (containerId) => (p) => {
let w;
let h;

let theta = [1,0.5];

let R = 13;
let l_vec = [100,100];
let X1 = [l_vec[0]*p.sin(theta[0]),-l_vec[0]*p.cos(theta[0])];
let X2 = [l_vec[0]*p.sin(theta[0])+l_vec[1]*p.sin(theta[1]),-l_vec[0]*p.cos(theta[0])-l_vec[1]*p.cos(theta[1])];

let bgColor;
let textColor;

let translation;
let scaling = [1,-1];
let div_arr = [];


p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent(containerId);

  w = container.clientWidth;
  h = container.clientHeight;
  translation = [w/2,h/2-80];

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;


  for(let i=0; i<6; i+=1){
  let div = p.createDiv();
  div.parent(container);
  div.style("font-size", "12px");
  div.style("transform", "translate(-50%, -50%)");
  div.style("user-select", "none");
  div.style("color", textColor);
  div_arr.push(div);
  }

  let L = 3*R;

  div_arr[0].position(X1[0]+translation[0],-X1[1]+translation[1]);
  katex.render("m_1",div_arr[0].elt);
  div_arr[1].position(X2[0]+translation[0],-X2[1]+translation[1]);
  katex.render("m_2",div_arr[1].elt);
  div_arr[2].position(L*p.sin(theta[0]/2)+translation[0],L*p.cos(theta[0]/2)+translation[1]);
  katex.render("\\theta_1",div_arr[2].elt);
  div_arr[3].position(L*p.sin(theta[1]/2)+X1[0]+translation[0],L*p.cos(theta[1]/2)-X1[1]+translation[1]);
  katex.render("\\theta_2",div_arr[3].elt);
  div_arr[4].position(X1[0]/2+translation[0]+5,-X1[1]/2+translation[1]-5);
  katex.render("l_1",div_arr[4].elt);
  div_arr[5].position(X1[0]/2+X2[0]/2+translation[0]+5,-X1[1]/2-X2[1]/2+translation[1]-5);
  katex.render("l_2",div_arr[5].elt);
  
}
    
//////// DRAW ////////


p.draw = function() {
  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  // p.background(bgColor);
  p.background(bgColor);
  p.stroke(textColor);
  p.fill(bgColor);
  p.translate(translation[0],translation[1]);
  p.scale(scaling[0],scaling[1]);

  p.arc(0,0,5*R,5*R,-p.PI/2,-p.PI/2+theta[0]);
  p.arc(X1[0],X1[1],5*R,5*R,-p.PI/2,-p.PI/2+theta[1]);
  p.drawingContext.setLineDash([10,5]);
  p.line(0,0,0,0-50);
  p.line(X1[0],X1[1],X1[0],X1[1]-50);

  p.drawingContext.setLineDash([]);

  p.line(0,0,X1[0],X1[1]);
  p.line(X1[0],X1[1],X2[0],X2[1]);
  p.circle(X1[0],X1[1],2*R);
  p.circle(X2[0],X2[1],2*R);

  for(let i=0; i<6; i+=1){
    // div_arr[i].show();
    div_arr[i].style("color", textColor);
  }

}


}

new p5(SketchPendulum("p5-container-doublependulum-sketch"))
