import React, { PropsWithChildren, ReactElement } from "react";

export default function HeaderSection(props: PropsWithChildren<{}>): ReactElement {
  return <div style={{padding : '20px', paddingTop: '10px', paddingBottom : '0px', paddingRight : '80px', fontSize : '0.96em'}}>
    <p style={{margin : '5px', paddingBottom : '8px'}}>
      All Possible Pathways &nbsp;-&nbsp; An emergent story by
      <a href="http://razdow.org/" target="_blank">Max Razdow</a> and <a href="http://jamiezigelbaum.com/" target="_blank">Jamie Zigelbaum</a>.
      Viewer by <a href="http://orazdow.github.io/" target="_blank">Ollie Razdow</a>

      <hr/>
      In collaboration with
      <a href="https://thoughtworksarts.io/newsletters/democratization-ai-blockchain-residency-awarded-max-razdow-ollie-razdow-jamie-zigelbaum/" target="_blank">ThoughtWorks Arts</a>,
      <a href="https://snark.art/" target="_blank">SnarkArts</a>, and <a href="https://singularitynet.io/" target="_blank">SingularityNet</a>
      <hr style={{marginBottom: '0px'}}/>
    </p>
  </div>;
}
