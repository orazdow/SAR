
let dx, dy, dz;
let dt = 0.006; 

// let x = -0.72, y = -0.64, z = 0.1, t = 0;
let x = 0.1, y = 0.1, z = 0.1, t = 0;
//let num = 100000;
let num = 50;
let section = 0;
let rt = 0.06;

// rossler
// let a = 0.2, b = 0.2, c = 7;

// lorentz
// let a =10, b = 8/3, c = 28;

// duffing
let a = 0.1, b = 0.35, c = 1.4;  // let a = 0.24, b = 0.88, c = 1.7; 

let tau = 2*Math.PI;

let poincare = false;
let rad, nnum, gamma, delta;
let bkgd = 150;

function setup(){
	let body = document.querySelector('body');
	body.style.backgroundColor = "#505050";
	let cdiv = document.createElement('div');
	cdiv.style.width = "100%";
	body.appendChild(cdiv)
	let canv = createCanvas(800, 700);
	cdiv.appendChild(canv.elt);
	let chkdiv = document.createElement('div');
	chkdiv.style.backgroundColor = "#ababab";
	chkdiv.style.width = "10vw";
	body.appendChild(chkdiv);
	let nnum = document.createTextNode("iterations: 50");
	chkdiv.appendChild(nnum);
	chkdiv.appendChild(document.createElement('br'));
	let aslider = document.createElement('input');
	aslider.type = "range";
	aslider.min = "0.07";
	aslider.max = "0.24";
	aslider.step = "0.01";
	aslider.value = "0.1"
	chkdiv.appendChild(aslider);
	aslider.oninput = (event)=>{
		a = +event.srcElement.value;
		delta.data = "damping: "+a;
	}
	delta = document.createTextNode("damping: "+a);
	chkdiv.appendChild(delta);
	chkdiv.appendChild(document.createElement('br'));

	let bslider = document.createElement('input');
	bslider.type = "range";
	bslider.min = "0.23";
	bslider.max = "0.78";
	bslider.step = "0.01";
	bslider.value = "0.35"
	chkdiv.appendChild(bslider);
	chkdiv.appendChild(document.createElement('br'));

	bslider.oninput = (event)=>{
		b = +event.srcElement.value;
		gamma.data = "force: "+b;
	}
	gamma = document.createTextNode("force: "+b);
	chkdiv.appendChild(gamma);
	chkdiv.appendChild(document.createElement('br'));
		chkdiv.appendChild(document.createElement('br'));

	let check = document.createElement('input');
	check.type="checkbox";
	chkdiv.appendChild(check);
	let m = document.createTextNode("poincare section");
	chkdiv.appendChild(m);
	check.onclick = (event)=>{
		poincare = event.srcElement.checked;
		if(poincare){
			num = 400000;
		    nnum.data = "iterations: 400000";
		}else{
			num = 50;
			nnum.data = "iterations: 50";
			background(bkgd);
		}
	}
	let slider = document.createElement('input');
	slider.type = "range";
	slider.min = "-0.22";
	slider.max = "0.22";
	slider.step = "0.02";
	slider.value = "0.02"
	chkdiv.appendChild(slider);
	slider.oninput = (event)=>{
		rt = +event.srcElement.value;
	}
	chkdiv.appendChild(document.createElement('br'));
	rad = document.createTextNode("");
	chkdiv.appendChild(rad)

	background(bkgd);
	//noLoop()
	fill(0);
	tau = tau/c;
}
let n = 0;
function draw(){ 
	
	if(poincare){
		background(bkgd);
		rot(rt);
		rad.data = (""+section).substr(0,4)+" rad";
		console.log(n);
	}else{
		fill(bkgd, 16);
		rect(0 ,0 , width, height);
	}

	n = 0;
	for(var i = 0; i < num; i++){

		// rossler
		// dx = -y -z;
		// dy = x + a*y;
		// dz = b + z*(x - c);

		// lorentz
		// dx = a*(y - x);
		// dy = x*(c - z) - y;
		// dz = x*y - b*z;

		// duffing
		dx = y;
		dy = x - x*x*x - a*y + b*Math.cos(c*t);

		x += dx*dt;
		y += dy*dt;
		z += dz*dt;
		t += dt;

		let px = x*150 + 350;
		let py = (y)*150 + 300;
		let pz = (1-z)*100 + 400;

		// let m = map(mouseY, height, 0, 0, 1);
		// let pv = py*m + pz*(1-m);

		// let px = 200+(x+1)*100;
		// let py = 200+(-y)*100;

		if(poincare){
			if(Math.abs((c*t)-section) < 0.004){
				rect(px, py, 2, 2);	n++;		
			}
		}
		else{
			point(px, py); 
		}
		
		if(c*t >= 2*PI) 
			t -= tau;

	}

}

function rot(n){
	section += n;
	if(section >= 2*PI){
		section -= 2*PI;
	}else if(section <= 0){
		section += 2*PI;
	}
}
