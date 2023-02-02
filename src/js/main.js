import ObjectExample from './modules/ObjectExample'

// Debug helper
const debug = true

if (!debug) {
  console.log = function () {}
}

export default class Main {
  constructor() {
    this.init()
  }

  init() {
    ObjectExample.init()
  }
}

const main = new Main()
