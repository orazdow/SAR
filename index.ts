import Main from "components/main";
import React from "react";
import ReactDOM from "react-dom";
import sar_tree from "sar_tree.json";

/*
  All Possible Pathways story viewer
  Narritive by Max Razdow and Jaime Zigelbaum, site by Ollie Razdow
  In collaboration with ThoughtWorks Arts, SnarkArts and SingularityNet
*/

window.addEventListener("DOMContentLoaded", (e: Event) => {
  document.body.style.backgroundColor = "#dedcd5";
  ReactDOM.render(React.createElement(Main, {data: sar_tree}), document.getElementById("root"));
});
