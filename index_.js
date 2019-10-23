
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import {App} from './components/App';
// import Tree from 'react-tree-graph';

import statuses from './sar_statuses.json';



class Main extends Component{

	constructor(props){
		super(props);
		window.statuses = statuses;
	}

	componentDidMount(){
		
		document.querySelector('body').style.backgroundColor = "#333333";

	}

	render(){

		return(

			<div id="maindiv">

			{/*<Tree data={statuses} height={900} width={600}/>*/}

			{/*<ReactJson src={statuses} collapsed={true} theme="monokai" />*/}

			</div>

		);
	}

}

// function Main(props){
//         return (<h2>HI</h2>);
// }

ReactDOM.render(<Main />, document.getElementById('root'));



