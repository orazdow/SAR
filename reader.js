
class Tts{

	constructor(parent){
		this.context;
		this.output;
		this.msg;
		this.voices;
		this.isinit = false;
		this.parent = parent;
		this.stopped = true;
		window.tts = this;
	}

	initAudio(){
		if(!this.isinit){
			this.context = new AudioContext();
			this.output = this.context.createGain();
			this.output.connect(this.context.destination);
			this.output.gain.value = 0.5;
			this.msg = new SpeechSynthesisUtterance();
			this.msg.onend = this.endHandler;
			this.isinit = true;
		}
	}

	endHandler(event){
		if(!this.stopped)
		window.tts.parent.continue_speach();
	}

	speak(node){
		if(!this.isinit){
			this.initAudio();
		}		
		this.msg.text = node.status.content_tts;
		window.speechSynthesis.speak(this.msg);
	}

}

class Reader{


	constructor(parent){
		this.action = this.action_speak;
		this.choose = this.choose_random;
		this.parent = parent;
		this.delay = 1500;
		this.timeoutID = 0;
		this.tts = new Tts(this);
		this.currentNode = null;
		this.speechmode = false;
	}


	read(node){
		this.parent.changeNode(node);
		this.action_wait(node, (next)=>{
		
			if(next != null) 			
				this.read(next);		
			
		});
	}

	setSpeech(checked){
		this.speechmode = checked;
		if(!this.speechmode) this.cancelRead();
	}

	speak(node){
		this.parent.changeNode(node);
		this.currentNode = node;
		this.tts.stopped = false;
		this.tts.speak(node);
	}

	speakOnce(node){
		this.cancelRead();
		this.tts.speak(node);
	}

	continue_speach(){
		if(!this.tts.stopped){
			let node = this.choose(this.currentNode);
			if(node){
				this.speak(node);
			}
		}
	}

	initRead(node){
		this.cancelRead();
		if(this.speechmode){
			this.speak(node);
		}else{
			this.read(node);
		}
	}

	cancelRead(){
		window.clearTimeout(this.timeoutID);
		this.tts.stopped = true;
		window.speechSynthesis.cancel();
	}

	action_wait(node, cb){
		this.timeoutID = window.setTimeout(()=>{
			cb(this.choose(node));
		}, this.delay);
	}

	choose_random(node){
		let len = node.children ? node.children.length : 0;
		if(len == 0) return null;
		if(len == 1) return node.children[0];
		else{ 
			return node.children[Math.round(Math.random()*(len-1))];
		}
	}

}

export default Reader;