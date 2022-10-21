import ObjectExample from "./modules/ObjectExample";

export default class Main {
    
	constructor() {
		this.init();
	}

	init() {
		ObjectExample.init();
	}

}

const main = new Main();