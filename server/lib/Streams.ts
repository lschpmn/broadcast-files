import { after } from 'lodash';

export default class Streams {
  private readonly streamNum: number;
  private readonly onDone: () => void | null;
  private stack: (() => Promise<any>)[];
  private _isRunning: boolean;
  private _isDone: boolean = false;

  constructor(promises: (() => Promise<any>)[], streamNum: number, done?: () => void) {
    this.stack = promises.toReversed();
    this.streamNum = streamNum;
    this.resume();

    this.onDone = after(streamNum, () => {
      this._isDone = true;
      this._isRunning = false;
      done && done();
    });
  }

  pause() {
    this._isRunning = false;
  }

  resume() {
    this._isRunning = true;

    for (let x = 0;x < this.streamNum;x++) this.recursivelyCallPromises();
  }

  get isDone() {
    return this._isDone;
  }

  get isRunning() {
    return this._isRunning;
  }

  private recursivelyCallPromises() {
    if (this._isRunning) {
      const promise = this.stack.pop();

      if (promise) promise().finally(this.recursivelyCallPromises);
      else this.onDone();
    }
  }
}
