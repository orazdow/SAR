var ww = 400;
var hh = 400;
var dd = 10;

class Branch{

	constructor(parent, dir){
		if(!parent){
			this.pos = createVector(ww/2, hh);
			this.dir = createVector(0, -1);
		}else{
			this.dir = dir.copy();	
			this.dir.normalize();
			//this.dir.rotate(0.2);
			this.pos = parent.pos.copy();
			this.pos.add(this.dir.mult(dd));
		}
		this.copydir = this.dir.copy();
		this.child = null;
		this.parent = null;
		this.grow = false;
	}

	next(dir){
		let b = new Branch(this, dir ? dir : this.dir.copy());
		this.child = b;
		b.parent = this;
		return b;
	}

	resetDir(){
		this.dir = (this.copydir.copy());
	}
}

class Tree{

	constructor(lbox_w, lbox_h, lnum, fillfunc){

		this.leaves = [];
		this.branches = [];
		this.mindist = 10;
		this.maxdist = 100;
		this.root = new Branch();
		this.branches.push(this.root);

		for(var i = 0; i < lnum; i++){
			let x, y;
			if(fillfunc != undefined){
				let o =fillfunc(lbox_w, lbox_h);
				x = o.x; y = o.y;
			}else{
				x = Math.round(Math.random()*lbox_w);
				y = Math.round(Math.random()*lbox_h);
			}
			this.leaves[i] = createVector(x, y);
		}

	}

	grow(){

		let found = false;
		let branch = this.root;
		for(var i = this.leaves.length-1; i >= 0; i--){
	
			let record = 10000;


			for(var j = this.branches.length-1; j >= 0; j--){
				let d = this.leaves[i].dist(this.branches[j].pos);
				if(d < record){
					record = d;
					branch = this.branches[j];
				}
			}
			if(record < this.mindist){
				found = true;
				this.leaves.splice(i, 1);
				break;

			}else if(record < this.maxdist){
				found = true;
				branch.grow = true;
				let dir = p5.Vector.sub(this.leaves[i], branch.pos).normalize();
				branch.dir.add(dir);


			}else{
				// found = false;
			}


		}
		if(!found){
			//this.root = branch.next();
			this.branches.push(branch.next());
		}else{
			for(var i = this.branches.length - 1; i >= 0; i--){
				if(this.branches[i].grow){
					this.branches[i].dir.normalize();

					let next = this.branches[i].next();
					//this.branches[i].resetDir();
					this.branches[i].grow = false;
					this.branches.push(next);
				}
			}
		}

		this.display();

	}

	follow(){
		if(this.branches.length > 3000){
			console.log('lim');
			return;
		}
		let dir = null;
		for(var i = this.branches.length-1; i >= 0; i--){
				dir = null;

			for(var j = 0; j < this.leaves.length; j++){

				if(!this.branches[i].branched && this.leaves[j].dist(this.branches[i].pos) < this.maxdist){
					if(this.leaves[j].dist(this.branches[i].pos) > this.mindist){
						dir = p5.Vector.sub(this.leaves[j], this.branches[i].pos).normalize();
						this.branches[i].dir.add(dir);
						//break;
					}else{
						this.leaves.splice(j, 1);
					}
				}

			}
			if(dir){
				this.branches[i].dir.normalize();
				let next = this.branches[i].next();
				this.branches[i].resetDir();
				this.branches.push(next);
				dir = null;
				break; /////
			}else{
				this.branches.push(this.branches[i].next());
				break;
			}

		}

		this.display();
	}

	display(){
		console.log(this.branches.length);
		background(90);
		this.show();
		this.showLeaves();
	}

	show(){
		stroke(0);
		for(var i = this.branches.length - 1; i >= 1; i--) {
			line(this.branches[i].pos.x, this.branches[i].pos.y, this.branches[i].parent.pos.x, this.branches[i].parent.pos.y);
		}
	}

	showLeaves(){
		noStroke();
		for(var i = 0; i < this.leaves.length; i++){
			ellipse(this.leaves[i].x, this.leaves[i].y, 5, 5);
		}
	}



}



