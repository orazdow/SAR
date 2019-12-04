
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Tree from 'react-d3-tree';
import sar_tree from './sar_tree.json';
import Reader from './reader.js';

{{/*
	All Possible Pathways story viewer
	Narritive by Max Razdow and Jaime Zigelbaum, site by Ollie Razdow
	In collaboration with ThoughtWorks Arts, SnarkArts and SingularityNet
*/}}

function Headersection(props){ 
	return (
		<div style={{'padding' : '20px', 'paddingTop': '10px', 'paddingBottom' : '0px', 'paddingRight' : '80px', 'fontSize' : '0.96em'}}>
			<p style={{'margin' : '5px', 'paddingBottom' : '8px'}}>
				All Possible Pathways  &nbsp;-&nbsp; An emergent story by <a href="http://razdow.org/" target="_blank">Max Razdow</a>&nbsp;
				and <a href="http://jamiezigelbaum.com/" target="_blank">Jamie Zigelbaum</a>. 
				Viewer by <a href="http://orazdow.github.io/" target="_blank">Ollie Razdow</a> 
				<hr></hr>In collaboration with <a href="https://thoughtworksarts.io/newsletters/democratization-ai-blockchain-residency-awarded-max-razdow-ollie-razdow-jamie-zigelbaum/" target="_blank">ThoughtWorks Arts</a> 
				&nbsp;<a href="https://snark.art/" target="_blank">SnarkArts</a> and&nbsp;
				<a href="https://singularitynet.io/" target="_blank">SingularityNet</a>
				<hr style={{'marginBottom': '0px'}}></hr>
			</p>
		</div>
	);
}

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
			<div style={{'paddingLeft': '25px'}}>

			<p style={{'width':'100%', 'marginTop' : '0px', 'marginBottom' : '8px', 'fontSize' : '0.92em'}}>
			click to select, use arrow keys to navigate selection</p>
			<label>
			<input
				type="checkbox"
				checked={this.state.checked}
				onChange={this.onClick_traverse}
				style={{'marginLeft' : '2px'}}
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
					this.changeNode(this.selected, true);
					break;

					case 37 : //left
					e.preventDefault();
					if(len > 1){
						this.selected = this.selected.children[0];
					}
					this.changeNode(this.selected, true);
					break;

					case 39 : //right
					e.preventDefault();
					if(len > 1){
						this.selected = this.selected.children[len-1];
					}
					this.changeNode(this.selected, true);
					break;

					case 38 : // up
					e.preventDefault();
					if(this.selected.parent){
						this.selected = this.selected.parent;
					}
					this.changeNode(this.selected, true);
					break;
				}

			}
		}, true);

	}

	traverseCb(checked){
		this.traverse = checked;
		if(!checked){
			this.reader.cancelRead(); 
		}else if(this.reader.speechmode){
			this.reader.tts.stopped = false;
		}
	}

	speechCb(checked){
		console.log(this);
		this.reader.setSpeech(checked);
	}

	nodeMouseOver(event){
		this.disp.innerHTML = event.status.content_text;
		this.idlabel.innerHTML = label(event.status);
		this.linklabel.href = event.status.url;
		this.linklabel.innerHTML = "link";
		this.img.src = event.status.has_media ? event.status.media_attachments[0].url : "";
	}

	nodeMouseOut(event){
		if(this.selected){
			this.disp.innerHTML = this.selected.status.content_text;
			this.idlabel.innerHTML = label(this.selected.status);
			this.linklabel.href = this.selected.status.url;
			this.img.src = this.selected.status.has_media ? this.selected.status.media_attachments[0].url : "";
		}
	}

	nodeMouseClick(event){
		console.log(event);
		this.changeNode(event, true);
	}

	changeNode(event, init){
		this.selected = event;
		this.rect.setAttributeNS(null, 'x', this.selected.x-25);
		this.rect.setAttributeNS(null, 'y', this.selected.y-25);
		this.rect.setAttributeNS(null, 'stroke-opacity', '1');
		this.disp.innerHTML = this.selected.status.content_text;
		this.idlabel.innerHTML = label(this.selected.status);
		this.linklabel.href = this.selected.status.url;
		this.img.src = this.selected.status.has_media ? this.selected.status.media_attachments[0].url : "";
		if(init)
		if(this.traverse){
			this.reader.initRead(this.selected);
		}else if(this.reader.speechmode){
			this.reader.speakOnce(this.selected);
		}	
	}

	render(){

		return(

			<div id="maindiv" style={{'display' : 'inline-block'}}>

			<div className="treeDiv" style={{width: '55em', height: '83vh', float: 'left' }}>

			<Headersection/>

			<Ctl traverseCb={this.traverseCb} speechCb={this.speechCb}/>

			<Tree data={sar_tree} 
				orientation="vertical" 
				collapsible={false}
				zoom={0.44} 
				translate={{x:370, y:20}} 
				// pathFunc="straight"
				onMouseOver={this.nodeMouseOver}
				onMouseOut={this.nodeMouseOut}
				onClick={this.nodeMouseClick}
			/>
			</div>


			<div className="readout" style={{ 'width' : '520px', 'float' : 'right', 'paddingLeft' : '3vw'}}>
			<p id="readContent" style={{'width':'100%', 'padding': '5px', 'marginTop' : '5px', 'paddingLeft': '10px', 'fontWeight':'bold', 'lineHeight': '1.3'}}></p>
			<pre id="idlabel" style={{'padding': '5px', 'paddingLeft': '10px', 'margin' : '0px'}}></pre>
			<a id="linklabel" target="_blank" href="#" style={{'padding': '5px', 'paddingLeft': '10px'}}></a>
			<img id="t_image" src="" style={{'maxWidth': '650px', 'height':'auto', 'padding' : '10px'}}></img>
			</div>
			</div>

		);
	}

}

ReactDOM.render(<Main />, document.getElementById('root'));



