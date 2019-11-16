
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import ReactJson from 'react-json-view';
// import statuses from './sar_statuses.json';
import Tree from 'react-d3-tree';
import sar_tree from './sar_tree.json';
import Reader from './reader.js';


class Ctl extends Component{

	constructor(props){
		super(props);
		this.state = { checked : false, speech : false };
		this.onClick_traverse = this.onClick_traverse.bind(this);
		this.onClick_speech = this.onClick_speech.bind(this);
	}

	onClick_traverse(event){
		this.props.traverseCb(!this.state.checked);
		this.setState({checked : !this.state.checked});
	}

	onClick_speech(event){
		this.props.speechCb(!this.state.speech);
		this.setState({speech : !this.state.speech});
	}

	render(){
		return(
			<div style={{'paddingLeft': '20px'}}>

			<p style={{'width':'100%'}}>click to select, use arrow keys to navigate selection</p>
			<label>
			<input
			    type="checkbox"
			    checked={this.state.checked}
			    onChange={this.onClick_traverse}
			/>
			traverse
			</label>
			<label>
			<input
			    type="checkbox"
			    checked={this.state.speech}
			    onChange={this.onClick_speech}
			/>
			speech
			</label>
			</div>
		);
	}

}

function label(status){
	return "author: "+status.account.username+"\ntime: "+status.datestr+"\nid: "+status.id;
}

class Main extends Component{

	constructor(props){
		super(props);
		// window.statuses = statuses;
		window.tree = sar_tree;
		window.dfs = (node)=>{
			let i = 1;
			for(let n of node.children){
				i += dfs(n);
			}
			return i;
		}
		this.nodeMouseOver = this.nodeMouseOver.bind(this);
		this.nodeMouseClick = this.nodeMouseClick.bind(this);
		this.nodeMouseOut = this.nodeMouseOut.bind(this);
		this.selected = null;
		this.reader = new Reader(this);
		this.traverseCb = this.traverseCb.bind(this);
		this.speechCb = this.speechCb.bind(this);
		this.traverse = false;
	}

	componentDidMount(){	
		// document.querySelector('body').style.backgroundColor = "#333333";
		document.querySelector('body').style.backgroundColor = "#dedcd5";
		this.disp = document.querySelector("#readContent");
		this.idlabel = document.querySelector("#idlabel");
		this.linklabel = document.querySelector("#linklabel");
		this.img = document.querySelector("#t_image")
		let svg = document.querySelector(".rd3t-tree-container svg g");
        this.rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.rect.setAttributeNS(null, 'x', -25);
        this.rect.setAttributeNS(null, 'y', -25);
        this.rect.setAttributeNS(null, 'height', '50');
        this.rect.setAttributeNS(null, 'width', '50');
        this.rect.setAttributeNS(null, 'fill', '#FF0000');
        this.rect.setAttributeNS(null, 'stroke', '#FF0000');
        this.rect.setAttributeNS(null, 'fill-opacity', '0.0');
        this.rect.setAttributeNS(null, 'stroke-opacity', '0.0');
        svg.appendChild(this.rect);

		document.addEventListener('keydown',(e)=>{

			if(this.selected){
				let len = this.selected.children ? this.selected.children.length : 0;
				console.log
				switch(e.keyCode){
					case 40 : //down
					e.preventDefault();
					if(len === 1){
						this.selected = this.selected.children[0];
					}else if(len === 2){
						this.selected = this.selected.children[0];
					}else if(len > 2){
						this.selected = this.selected.children[len-2];
					}
					break;
					case 37 : //left
					e.preventDefault();
					if(len > 1){
						this.selected = this.selected.children[0];
					}
					break;
					case 39 : //right
					e.preventDefault();
					if(len > 1){
						this.selected = this.selected.children[len-1];
					}
					break;
					case 38 : // up
					e.preventDefault();
					if(this.selected.parent){
						this.selected = this.selected.parent;
					}
					break;
				}
		        this.rect.setAttributeNS(null, 'x', this.selected.x-25);
		        this.rect.setAttributeNS(null, 'y', this.selected.y-25);
		        this.rect.setAttributeNS(null, 'stroke-opacity', '1');
		        this.disp.innerHTML = this.selected.status.content_fulltext;
        		this.idlabel.innerHTML = label(this.selected.status);
				this.linklabel.href = this.selected.status.url;
				this.img.src = this.selected.status.has_media ? this.selected.status.media_attachments[0].url : "";
		    	if(this.traverse){
		    		this.reader.initRead(this.selected);
		    	}else if(this.reader.speechmode){
		    		this.reader.speakOnce(this.selected);
		    	}

			}
		}, true);

	}

	traverseCb(checked){
		this.traverse = checked;
		if(!checked){
			this.reader.cancelRead();
		}
	}

	speechCb(checked){
		console.log(this);
		this.reader.setSpeech(checked);
	}

	nodeMouseOver(event){
		this.disp.innerHTML = event.status.content_fulltext;
		this.idlabel.innerHTML = label(event.status);
		this.linklabel.href = event.status.url;
		this.linklabel.innerHTML = "link";
    	this.img.src = event.status.has_media ? event.status.media_attachments[0].url : "";
	}

	nodeMouseOut(event){
		if(this.selected){
			this.disp.innerHTML = this.selected.status.content_fulltext;
			this.idlabel.innerHTML = label(this.selected.status);
			this.linklabel.href = this.selected.status.url;
	    	this.img.src = this.selected.status.has_media ? this.selected.status.media_attachments[0].url : "";
		}
	}

	nodeMouseClick(event){
		console.log(event);
		this.selected = event;
        this.rect.setAttributeNS(null, 'x', event.x-25);
        this.rect.setAttributeNS(null, 'y', event.y-25);
        this.rect.setAttributeNS(null, 'stroke-opacity', '1');
    	this.img.src = event.status.has_media ? event.status.media_attachments[0].url : "";
    	if(this.traverse){
    		this.reader.initRead(event);
    	}else if(this.reader.speechmode){
    		this.reader.speakOnce(event);
    	}
	}

	changeNode(event){
		this.selected = event;
        this.rect.setAttributeNS(null, 'x', this.selected.x-25);
        this.rect.setAttributeNS(null, 'y', this.selected.y-25);
        this.rect.setAttributeNS(null, 'stroke-opacity', '1');
        this.disp.innerHTML = this.selected.status.content_fulltext;
		this.idlabel.innerHTML = label(this.selected.status);
		this.linklabel.href = this.selected.status.url;
		this.img.src = this.selected.status.has_media ? this.selected.status.media_attachments[0].url : "";		
	}

	render(){

		return(

			<div id="maindiv" style={{'display' : 'inline-block'}}>

			{/*<ReactJson src={sar_tree} collapsed={true} theme="monokai" />*/}

			<div className="treeDiv" style={{width: '60em', height: '150em', float: 'left'}}>

			<Ctl traverseCb={this.traverseCb} speechCb={this.speechCb}/>

			<Tree data={sar_tree} 
				orientation="vertical" 
				collapsible={false}
				zoom={0.49} 
				translate={{x:360, y:20}} 
				// pathFunc="straight"
				onMouseOver={this.nodeMouseOver}
				onMouseOut={this.nodeMouseOut}
				onClick={this.nodeMouseClick}
			/>
			</div>


			<div className="readout" style={{ 'width' : '520px', 'float' : 'right'}}>
			<p id="readContent" style={{'width':'100%', 'padding': '5px', 'paddingLeft': '10px', 'fontWeight':'bold', 'lineHeight': '1.3'}}></p>
			<pre id="idlabel" style={{'padding': '5px', 'paddingLeft': '10px', 'margin' : '0px'}}></pre>
			<a id="linklabel" target="_blank" href="#" style={{'padding': '5px', 'paddingLeft': '10px'}}></a>
			<img id="t_image" src="" style={{'maxWidth': '650px', 'height':'auto', 'padding' : '10px'}}></img>
			</div>
			</div>

		);
	}

}

ReactDOM.render(<Main />, document.getElementById('root'));



