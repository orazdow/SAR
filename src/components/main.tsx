import Controls from "components/controls";
import HeaderSection from "components/header_section";
import {Reader} from "helpers/reader";
import React, {Component} from "react";
import Tree from "react-d3-tree";

interface Properties {
  data: any;
}

export default class Main extends Component<Properties> {
  private selected: any;
  private reader: Reader;
  private traverse: boolean;
  private disp: Element | null = null;
  private idlabel: Element | null = null;
  private linklabel: HTMLAnchorElement | null = null;
  private img: HTMLImageElement | null = null;
  private rect: SVGElement | null = null;

  constructor(props: Readonly<Properties>) {
    super(props);

    this.nodeMouseOver = this.nodeMouseOver.bind(this);
    this.nodeMouseClick = this.nodeMouseClick.bind(this);
    this.nodeMouseOut = this.nodeMouseOut.bind(this);
    this.selected = null;
    this.reader = new Reader(this);
    this.traverseCb = this.traverseCb.bind(this);
    this.speechCb = this.speechCb.bind(this);
    this.traverse = false;
  }

  componentDidMount() {
    this.disp = document.querySelector("#readContent");
    this.idlabel = document.querySelector("#idlabel");
    this.linklabel = document.querySelector("#linklabel") as HTMLAnchorElement;
    this.img = document.querySelector("#t_image") as HTMLImageElement;
    const svg = document.querySelector(".rd3t-tree-container svg g")!;
    this.rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.rect.setAttributeNS(null, 'x', "-25");
    this.rect.setAttributeNS(null, 'y', "-25");
    this.rect.setAttributeNS(null, 'height', '50');
    this.rect.setAttributeNS(null, 'width', '50');
    this.rect.setAttributeNS(null, 'fill', '#FF0000');
    this.rect.setAttributeNS(null, 'stroke', '#FF0000');
    this.rect.setAttributeNS(null, 'fill-opacity', '0.0');
    this.rect.setAttributeNS(null, 'stroke-opacity', '0.0');
    svg.appendChild(this.rect);

    document.addEventListener('keydown', (e) => {

      if (this.selected) {
        const len = this.selected!.children ? this.selected!.children!.length : 0;
        switch (e.keyCode) {
          case 40 : //down
          e.preventDefault();
          if (len === 1) {
            this.selected = this.selected!.children![0];
          } else if (len === 2) {
            this.selected = this.selected!.children![0];
          } else if (len > 2) {
            this.selected = this.selected!.children![len - 2];
          }
          this.changeNode(this.selected!, true);
          break;

          case 37 : //left
          e.preventDefault();
          if (len > 1) {
            this.selected = this.selected!.children![0];
          }
          this.changeNode(this.selected!, true);
          break;

          case 39 : //right
          e.preventDefault();
          if (len > 1) {
            this.selected = this.selected!.children![len - 1];
          }
          this.changeNode(this.selected!, true);
          break;

          case 38 : // up
          e.preventDefault();
          if (this.selected.parent) {
            this.selected = this.selected!.parent;
          }
          this.changeNode(this.selected!, true);
          break;
        }

      }
    }, true);

  }

  traverseCb(checked: boolean) {
    this.traverse = checked;
    if (!checked) {
      this.reader.cancelRead();
    } else if (this.reader.speechmode) {
      this.reader.tts.stopped = false;
    }
  }

  speechCb(checked: boolean) {
    this.reader.setSpeech(checked);
  }

  nodeMouseOver(data: any) {
    this.disp!.innerHTML = data.status.content_text;
    this.idlabel!.innerHTML = this.label(data.status);
    this.linklabel!.href = data.status.url;
    this.linklabel!.innerHTML = "link";
    this.img!.src = data.status.has_media ? data.status.media_attachments[0].url : "";
  }

  nodeMouseOut(data: any) {
    if (this.selected) {
      this.disp!.innerHTML = this.selected.status.content_text;
      this.idlabel!.innerHTML = this.label(this.selected.status);
      this.linklabel!.href = this.selected.status.url;
      this.img!.src = this.selected.status.has_media ? this.selected.status.media_attachments[0].url : "";
    }
  }

  nodeMouseClick(data: any) {
    this.changeNode(data, true);
  }

  changeNode(data: any, init?: boolean) {
    this.selected = data;
    this.rect!.setAttributeNS(null, 'x', (this.selected.x - 25) + "");
    this.rect!.setAttributeNS(null, 'y', (this.selected.y - 25) + "");
    this.rect!.setAttributeNS(null, 'stroke-opacity', '1');
    this.disp!.innerHTML = this.selected.status.content_text;
    this.idlabel!.innerHTML = this.label(this.selected.status);
    this.linklabel!.href = this.selected.status.url;
    this.img!.src = this.selected.status.has_media ? this.selected.status.media_attachments[0].url : "";
    if (init) {
    if (this.traverse) {
      this.reader.initRead(this.selected);
    } else if (this.reader.speechmode) {
      this.reader.speakOnce(this.selected);
    }
    }
  }

  render() {

    return(

      <div id="maindiv" style={{display : 'inline-block'}}>

      <div className="treeDiv" style={{width: '55em', height: '83vh', float: 'left' }}>

      <HeaderSection/>

      <Controls traverseCb={this.traverseCb} speechCb={this.speechCb}/>

      <Tree data={this.props.data}
        orientation="vertical"
        collapsible={false}
        zoom={0.44}
        translate={{x: 370, y: 20}}
        // pathFunc="straight"
        onMouseOver={(node, ev) => this.nodeMouseOver(node)}
        onMouseOut={(node, ev) => this.nodeMouseOut(node)}
        onClick={this.nodeMouseClick}
      />
      </div>

      <div className="readout" style={{ width : '520px', float : 'right', paddingLeft : '3vw'}}>
      <p id="readContent" style={{width: '100%', padding: '5px', marginTop : '5px', paddingLeft: '10px', fontWeight: 'bold', lineHeight: '1.3'}}></p>
      <pre id="idlabel" style={{padding: '5px', paddingLeft: '10px', margin : '0px'}}></pre>
      <a id="linklabel" target="_blank" href="#" style={{padding: '5px', paddingLeft: '10px'}}></a>
      <img id="t_image" src="" style={{maxWidth: '650px', height: 'auto', padding : '10px'}}></img>
      </div>
      </div>

    );
  }

  private label(status: any) {
    return "author: " + status.account.username + "\ntime: " + status.datestr + "\nid: " + status.id;
  }
}
