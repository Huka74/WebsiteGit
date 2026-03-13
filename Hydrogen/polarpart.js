let polarpart = (p) => {


let Nterms = 50;
let l_slider;
let l = 0;
let pos = [175,200];
let scale = [20,-50];
// let offset;
let div_text = [];
let axes;
let x;

let bgColor;
let textColor;

p.setup = function() {
  let container = document.getElementById("p5-container-polar"); // Get the div
  let canvas = p.createCanvas(container.clientWidth, container.clientHeight);
  canvas.parent("p5-container-polar");

  l_slider = document.getElementById('polar-slider');
  l_slider.addEventListener('input', (e) => {
    l = parseFloat(e.target.value);
  });

  const label = document.getElementById('slider-label');

   function updateLabel() {
        const value = parseFloat(l_slider.value).toFixed(1);
        katex.render('l = ' + value, label);
    }

    updateLabel(); // Initial render
    l_slider.addEventListener('input', updateLabel);

    for(let i=0; i<20; ++i){
        div_text.push(p.createDiv());
        div_text[i].style("font-size", "12px");
        div_text[i].style("transform", "translate(-50%, -50%)");
        div_text[i].parent(container);
        // div_text[i].style("position", "relative");
        // div_text[i].style("top", "20px");
        div_text[i].style("user-select", "none");
        div_text[i].style("color", textColor);

        katex.render("a_{"+p.str(i+1)+"}",div_text[i].elt);
        div_text[i].position(pos[0]+(i+1/2)*scale[0],pos[1]+10);
        div_text[i].show();
    }

    axes = new Axes(p, [75,200], [50,25]);
    x = p.linspace(-1.2,1.2,100);
}

p.draw = function() {
    bgColor = getComputedStyle(document.body).backgroundColor;
    textColor = getComputedStyle(document.body).color;
    axes.color = textColor;

    p.background(bgColor);

    a_even = p.sequence(Nterms,p.abs(1-l%2),0,l,0,lambda=0.25);
    a_odd =  p.sequence(Nterms,0,1-p.abs(1-l%2)  ,l,0,lambda=0.25);

    p.fill(bgColor)
    p.plot(a_even);
    p.fill(p.color(120,220,0))
    p.plot(a_odd);


    p.stroke(textColor);
    axes.plot(x, x.map(x => p.func(x, a_even, a_odd)));
    // axes.show_axis([-2,2],[-1,1], textColor);

    p.fill(bgColor)
    p.arrow([75,200],50,1,2,-p.PI/2);
    p.arrow([75,200],50,1,2,p.PI);
    p.line(75,200,25,200)

}

// p.mousePressed = function(){
//   console.log(a_even,a_odd)
// }

p.func = function(x, a_even, a_odd){
    let res = 0;
    // console.log(a_even)
    for(let i=0; i<a_even.length; i++){
        res += (a_even[i]+a_odd[i])*x**i
    }
    return -res;
}

p.transform = function(x){
    return p.pow(p.abs(x),1/3);
}

p.plot = function(arr){
    for(let i=0; i<arr.length; i++){
        p.rect(pos[0]+i*scale[0],pos[1],scale[0],p.transform(arr[i])*scale[1]);
    }
}

p.sequence = function(N,a0,a1,l,m,lambda){
    let a = [a0,a1];
    let Max = 1;

    for(let i=2; i<N; ++i){
        anew = a[i-2]*((i-2)*(i-1+2*m)+m*(m+1)-l*(l+1))/(i*(i-1));
        if(Max<p.abs(anew)){
            Max = p.abs(anew);
        }
        a.push(anew);
    }
    for(let i=0; i<N; ++i){
        a[i] = a[i]/Max;
    }
    return a;
}

p.arrow = function(pos,L,h,b,alpha){
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

p.linspace = function(start, end, num) {
  let step = (end - start) / (num - 1);
  let array = [];
  for (let i = 0; i < num; i++) {
    array.push(start + step * i);
  }
  return array;
}
}

new p5(polarpart)