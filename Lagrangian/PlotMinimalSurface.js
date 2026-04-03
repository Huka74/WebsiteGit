let SketchBubblePlot = (containerId) => (p) => {
let bgColor;
let textColor;
let w;
let h;

let axis;
let x;
let fs = [];
let lambda;
let N;

let div = [];

p.setup = function() {
  let container = document.getElementById(containerId);
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight, p.WEBGL);
  canvas.parent(containerId);
  p.setAttributes('antialias', true);

  w = container.clientWidth;
  h = container.clientHeight;

  bgColor = getComputedStyle(document.body).backgroundColor;
  textColor = getComputedStyle(document.body).color;

  const themeObserver = new MutationObserver(() => {
    bgColor = getComputedStyle(document.body).backgroundColor;
    textColor = getComputedStyle(document.body).color;
    // axis.color = p.color(textColor);
    // p.show_plot();
    p.show_axis();
    p.show_legend();
  });
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'style']
  });


  x = linspace(0.01,3,100);
  lambda = linspace(0.5,2.5,7);
  N = lambda.length;
  for(let i=0; i<N; i+=1){
    fs.push(x.map(x => p.f(x,lambda[i])));
  }
  


  axis = new Axes(p,[-50,0],[100,-100],p.color(textColor));

  for(let i=0; i<N; i+=1){
    let div_temp = p.createDiv();
    div_temp.parent(container);
    div_temp.style("font-size", "12px");
    div_temp.style("transform", "translate(-50%, -50%)");
    div_temp.style("user-select", "none");
    div_temp.position(w*0.05+50,h*0.05 + 15*i);

    div.push(div_temp);
  }

  p.show_axis();
  p.show_plot();
  p.show_legend();

};

p.show_axis = function(){
  p.stroke(textColor);
  arrow(p,[-w/2+25,0],w-50,1,4,-p.PI/2);
  arrow(p,[-50,h/2-25],h-50,1,4,p.PI);
}

p.show_plot = function(){
  for(let i=0; i<N; i+=1){
    p.stroke(p.lerpColor(p.color(0, 187, 255),p.color(240, 0, 255),i/(N-1)));
    axis.plot(x,fs[i]);
  }
}

p.show_legend = function(){
  for(let i=0; i<N; i+=1){
    p.stroke(p.lerpColor(p.color(0, 187, 255),p.color(240, 0, 255),i/(N-1)));
    p.line(-w/2 + w*0.05, -h/2 + h*0.05 + 15*i,-w/2 + w*0.05 + 15, -h/2 + h*0.05 + 15*i);
    div[i].style("color", textColor);
    katex.render("\\lambda="+p.str(lambda[i].toFixed(2)),div[i].elt);
  }
}

// p.draw = function() {
//   p.background(bgColor);
//   p.stroke(textColor);
//   p.scale([1,-1]);
// };

p.f = function(x,lambda){
    return 1/x*Math.cosh(x)-lambda;
}

}

new p5(SketchBubblePlot("p5-container-BubblePlot"));