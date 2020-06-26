/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class Observable {
  constructor() {
    Object.defineProperty(this, '__state__', { enumerable: false, writable: true });
  }

  set state(newState) {
    this.__state__ = newState;
  }

  get state() {
    return this.__state__;
  }

  setState(newState) {
    this.__state__ = newState;
    this.onStateChange();
  }

  onStateChange() {

  }
}

export default Observable;
