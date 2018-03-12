var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var request = require('request');
if (process.cwd().indexOf('dev-cli') >= 0) return;
const simpleGit = require('simple-git')(process.cwd());
var ncp = require('ncp').ncp;
const { exec } = require('child_process');

var Command = {
  CONFIG: "https://gist.githubusercontent.com/fahimc/8ddd9c2741d436758be61423713510d8/raw",
  GIST_LINK: "https://gist.github.com/fahimc/8ddd9c2741d436758be61423713510d8",
  GITHUB_LINK: "https://github.com/fahimc/dev-cli",
  Logger: require('../logger.js'),
  argsLength: 3,
  name: null,
  module:null,
  config: null,
  init: function(args) {
    this.getTask(args);
  },
  getTask: function(args) {
    if (args.length - 1 == this.argsLength) {
      var arg = args[this.argsLength];
      this.name = arg;
      this.Logger.ok('starting to install ' + this.name +  ' boilerplate');
      this.getConfig();
    }else{
    	this.Logger.warn('please supply the boilerplate you wish to install. Check out the readme:\n'+ this.GITHUB_LINK);
    }
  },
  getConfig: function() {
  	this.Logger.warn('getting module file','');
    request(Command.CONFIG, this.onRequest.bind(this));
  },
  onRequest: function(error, response, body) {
    if (error) {
    	console.error('error:', error); // Print the error if one occurred
    	return;
    }
    this.Logger.ok('module file obtained');
    this.config = JSON.parse(body);
    this.getRepo();
  },
  getRepo: function() {
    var module = this.config.modules[this.name];
    if (module) {
      this.module = module;
      this.Logger.warn('cloning repo','','');  
      simpleGit.clone(module.repoLink, null, this.onGitCloneComplete.bind(this));
    } else {
      this.Logger.warn('cannot find this module. Please check the following file to see the available modules: \nhttps://gist.github.com/fahimc/8ddd9c2741d436758be61423713510d8');
    }

  },
  onGitCloneComplete: function() {
    this.Logger.ok('clone complete');
    var folderName = this.module.repoLink.substr(this.module.repoLink.lastIndexOf('/') + 1).replace('.git','');
    this.deleteFolderRecursive(folderName + '/.git');
    this.install();
  },
  install: function() {
    var module = this.config.modules[this.name];
    if (module.install) {
      this.Logger.warn('running install command...','');
      var spawn = exec(module.install, { cwd: process.cwd() }, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
      });
      spawn.on('close', (code) => {
         this.Logger.ok('done!');
      });
    }else{
    	this.Logger.ok('done!');
    }
  },
  deleteFolderRecursive: function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index) {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          Command.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

}

module.exports = Command.init.bind(Command);