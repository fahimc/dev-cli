#!/usr/bin/env node
var Main = {
	commandIndex:2,
	command:{
		init:require('./src/command/init.js'),
		install:require('./src/command/install.js')
	},
	init: function () {
		this.checkCommand();
	},
	checkCommand:function(){

		if (process.argv.length > this.commandIndex) {
			var cmd = process.argv[this.commandIndex];
			if(this.command[cmd]){
				this.command[cmd](process.argv);
			}
		}
	}
};
Main.init();

