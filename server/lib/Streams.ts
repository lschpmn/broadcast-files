const _ = require('lodash');

export default class Streams {
  onDone: () => void | null;
  private readonly streams: (() => Promise<any>)[][];
  private readonly streamDone: () => void;
  private stopped: boolean = false;
  private _isDone: boolean = false;

  constructor(promises: (() => Promise<any>)[], streamNum: number) {
    const num = Math.min(promises.length, streamNum)
    this.streams = new Array(num).fill(null).map(() => []);
    this.streamDone = _.after(num, () => this.onDone && this.onDone());

    // reversed so I can use .pop() and still be in chronological order
    promises.reverse().forEach((promise, i) => {
      this.streams[i % streamNum].push(promise);
    });

    for (let x = 0; x < this.streams.length;x++) this.updateStream(x);
  }

  pause() {
    this.stopped = true;
  }

  resume() {
    this.stopped = false;
    for (let x = 0; x < this.streams.length;x++) this.updateStream(x);
  }

  get isDone() {
    return this._isDone;
  }

  private updateStream = (streamIndex: number) => {
    const stream = this.streams[streamIndex];

    const top = stream.pop();
    top()
      .finally(() => {
        if (!stream.length) this.streamDone();
        else if (!this.stopped) this.updateStream(streamIndex);
      });
  }
}
