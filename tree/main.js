let tree;

function setup(){
	createCanvas(500, 400);
	//noLoop();
	background(92);
	tree = new Tree(500,250,100,null);
	// tree.test();
	// tree.show();
	// tree.showLeaves();
	frameRate(10);
}

function draw(){ 
	tree.grow();
}
