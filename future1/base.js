

var Base = Tech("base",{

  parse: function (content){
    var lastIndex = 0, ast = []
    while(m = this.Re.exec(content)){
      var idx = m.indexOf(m[0],1)
      if(!~idx){
        throw new Error("Failed to match: "+m[0])
      }
      var Item = items[idx](m[0],m.index,Re.lastIndex-1)
      if(m.index !== lastIndex){
        ast.push(["text",content.slice(lastIndex,m.index)])
      }
      ast.push(Item)
      lastIndex = Re.lastIndex
    }
    return ast
  }
  
})


Base.defItem("item",{
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







