import Sizes from './Utils/Sizes.js';

export default class Experience {
  constructor ( canvas ) {
    window.experience = this;
    this.canvas = canvas;
    this.sizes = new Sizes();
  }


}