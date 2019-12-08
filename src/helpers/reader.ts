
export class Tts {

  stopped: boolean;
  private isinit: boolean;
  private parent: Reader;
  private output?: GainNode;
  private msg?: SpeechSynthesisUtterance;

  constructor(parent: Reader) {
    this.isinit = false;
    this.parent = parent;
    this.stopped = true;
  }

  initAudio() {
    if (!this.isinit) {
      const context = new AudioContext();
      this.output = context.createGain();
      this.output!.connect(context.destination);
      this.output!.gain.value = 0.5;
      this.msg = new SpeechSynthesisUtterance();
      this.msg.onend = this.endHandler.bind(this);
      this.isinit = true;
    }
  }

  endHandler() {
    if (!this.stopped) {
    this.parent.continue_speech();
    }
  }

  speak(node: any) {
    if (!this.isinit) {
      this.initAudio();
    }
    this.msg!.text = node.status.content_tts;
    window.speechSynthesis.speak(this.msg!);
  }

}

interface TreeNodeManager {
  changeNode(data: any): void;
}

interface TreeNode {
  children?: TreeNode[];
}

export class Reader {
  speechmode: boolean;
  tts: Tts;
  private currentNode: TreeNode | null;
  private timeoutID: number;
  private delay: number;
  private parent: TreeNodeManager;

  constructor(parent: TreeNodeManager) {
    // this.action = this.action_speak;

    this.parent = parent;
    this.delay = 1500;
    this.timeoutID = 0;
    this.tts = new Tts(this);
    this.currentNode = null;
    this.speechmode = false;
  }

  read(node: TreeNode) {
    this.parent.changeNode(node);
    this.action_wait(node, (next: TreeNode | null) => {

      if (next !== null) {
        this.read(next);
      }

    });
  }

  setSpeech(checked: boolean) {
    this.speechmode = checked;
    if (!this.speechmode) { this.cancelRead(); }
  }

  speak(node: TreeNode) {
    this.parent.changeNode(node);
    this.currentNode = node;
    this.tts.stopped = false;
    this.tts.speak(node);
  }

  speakOnce(node: TreeNode) {
    this.cancelRead();
    this.currentNode = node;
    this.tts.speak(node);
  }

  continue_speech() {
    if (!this.tts.stopped) {
      const node = this.choose_random(this.currentNode!);
      if (node) {
        this.speak(node);
      }
    }
  }

  initRead(node: TreeNode) {
    this.cancelRead();
    if (this.speechmode) {
      this.speak(node);
    } else {
      this.read(node);
    }
  }

  cancelRead() {
    window.clearTimeout(this.timeoutID);
    this.tts.stopped = true;
    window.speechSynthesis.cancel();
  }

  action_wait(node: TreeNode, cb: (next: TreeNode | null) => void) {
    this.timeoutID = window.setTimeout(() => {
      cb(this.choose_random(node));
    }, this.delay);
  }

  choose_random(node: TreeNode) {
    if (node.children && node.children.length) {
      if (node.children.length === 1) {
        return node.children[0];
      }

      return node.children[Math.round(Math.random() * (node.children.length - 1))]!;
    }
    return null;
  }

}
