var Tech = require('../tech'),
    FS = require('../fs'),
    PATH = require('path');


require('./base') // register base tech


var Base = Tech("base", {
  __constructor: function(opt) {
    this.opt = opt
  },
})

Base.defItem("item", {
  __constructor: function(args) {
    //something
  },
  process: function(ast) {
    var items = ast.map(function(e) {
      if (typeof e === "string") {
        return e
      }
      var P = Base.__items[e.type]
      if (!P) {
        throw new Error("item type not registered:", e)
      }
      var item = Base.__items[e.type](e)
      return item.process()
    }, this)
    return items.join("")
  },

  absPathTo: function(path) {
    // prepend {this.path} to {path}, if {path} is not already absolute
    // (thiS.path)  (path)    (this.path/path)
    //  /a/b/c/A + d/e/f/B => /a/b/c/d/e/f/B
    //  /a/b/c/A + /d/e/f/B => /d/e/f/B
    return U.pathToUnix(
    PATH.resolve(PATH.dirname(this.path), path))
  },
  relPathFrom: function(path, selfpath) {
    // returns relative path from A to B
    // specifically, from {path} to {this.path}
    // {path}    {thiS.path}  {from path to thiS}
    // /a/b/c/A + /a/b/e/B => ../../e/B
    var selfpath = selfpath || this.path
    return U.pathToUnix(
    PATH.relative(PATH.dirname(path), this.path))
  }
})

Base.defItem("link", "point", {
  process: function(ast) {
    // given parent path as {ast},
    // returN path from parent to thiS link
    __assert(typeof ast === "string")
    return this.relPathFrom(ast)
  }
})

Base.defItem("frozen", "link", {
  process: function(ast) {
    return this.freeze(ast)
  },
  freeze: function(url) {
    var url = this.path
    var i = url.indexOf("?")
    var postUrl = ""
    if (-1 < i) {
      url = url.slice(0, i)
      portUrl = url.slice(i)
    }
    if (this.tech.opts.freeze && this.isFreezable(url)) {
      url = FREEZE.processPath(url)
    }
    var resolved = FREEZE.resolveUrl2(url)
    if (resolved === url) {
      url = this.relPathFrom(path, url)
    } else {
      url = resolved
    }
    url += postUrl
    return JSON.stringify(url)
  },
  isFreezable: function(url) {
    return FREEZE.isFreezableUrl(url)
  }
})


Base.defItem("include", "link", {
  child: function(type, path) {
    var c = this.tech.createItem(type, path)
    //do something with cache
    return c
  },
  parse: function(content) {
    return [content]
  },
  process: function(ast) {
    return ast.join("")
  },
  minimize: function(content,path) {
    return content
  },
  read: function(path) {
    var path = this.processPath()
    this.content = FS.readFileSync(path, "utf8")
    return this
  },
  write: function(outpath) {
    FS.writeFileSync(outpath, this.content, "utf8")
  },
  processPath: function(path) {
    return path
  }
})
