
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
	}

	componentDidMount(){
		
		// document.querySelector('body').style.backgroundColor = "#333333";
		document.querySelector('body').style.backgroundColor = "#dddddd";

	}

	render(){

		return(

			<div id="maindiv" style={{width: '60em', height: '150em'}}>

			{/*<ReactJson src={sar_tree} collapsed={true} theme="monokai" />*/}

			<Tree data={sar_tree} orientation="vertical" zoom={0.6} translate={{x:400, y:20}}/>
			
			</div>

		);
	}

}

// function Main(props){
//         return (<h2>HI</h2>);
// }

ReactDOM.render(<Main />, document.getElementById('root'));



