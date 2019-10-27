
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import {App} from './components/App';
import ReactJson from 'react-json-view';
import Tree from 'react-d3-tree';

// import statuses from './sar_statuses.json';
import sar_tree from './sar_tree.json';


class Main extends Component{

	constructor(props){
		super(props);
		// window.statuses = statuses;
		window.tree = sar_tree;
		this.nodeMouseOver = this.nodeMouseOver.bind(this);
		this.disp;
	}

	componentDidMount(){
		
		// document.querySelector('body').style.backgroundColor = "#333333";
		document.querySelector('body').style.backgroundColor = "#dddddd";
		this.disp = document.querySelector("#readContent");

	}

	nodeMouseOver(event){
		let content = event.status.content;
		// console.log(content);
		this.disp.innerHTML = content;
	}

	render(){

		return(

			<div id="maindiv" >

			{/*<ReactJson src={sar_tree} collapsed={true} theme="monokai" />*/}


			<div className="treeDiv" style={{width: '60em', height: '150em', float: 'left'}}>
			<Tree data={sar_tree} orientation="vertical" zoom={0.6} translate={{x:400, y:20}} onMouseOver={this.nodeMouseOver}/>
			</div>


			<div className="readout" >
			<p id="readContent"></p>
			</div>

			</div>

		);
	}

}

ReactDOM.render(<Main />, document.getElementById('root'));



