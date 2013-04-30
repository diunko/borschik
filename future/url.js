

var Base = Tech("base",{
  __init:function(opt){
    this.opt = opt},
})

Base.item("point",{
  __init:function(args){
    //something
  },
  process:function(ast){
    var items = ast.map(function(e){
      if(typeof e === "string"){
        return e}
      var P = this._reg[e.type]
      if(!P){
        throw new Error("item type not registered:",e)}
      var item = this.__registry[e.type](e)
      return item.process()},this)
    return items.join("")},
  
  absPathTo:function(path){
    // prepend {this.path} to {path}, if {path} is not already absolute
    // (thiS.path)  (path)    (this.path/path)
    //  /a/b/c/A + d/e/f/B => /a/b/c/d
    //  /a/b/c/A + /d/e/f/B => /d/e/f/B
    return U.pathToUnix(
      PATH.resolve(PATH.dirname(this.path),path))},
  relPathFrom:function(path,selfpath){
    // returns relative path from A to B
    // specifically, from {path} to {this.path}
    // {path}    {thiS.path}  {from path to thiS}
    // /a/b/c/A + /a/b/e/B => ../../e/B
    var selfpath = selfpath || this.path
    return U.pathToUnix(
      PATH.relative(PATH.dirname(path),this.path))}
})

Base.item("link","point",{
  process:function(ast){
    // given parent path as {ast},
    // returN path from parent to thiS link
    __assert(typeof ast === "string")
    return this.relPathFrom(ast)
  }
})

Base.item("frozen","link",{
  process:function(ast){
    return this.freeze(ast)
  },
  freeze:function(url){
    var url = this.path
    var i = url.indexOf("?")
    var postUrl = ""
    if(-1 < i){
      url = url.slice(0,i)
      portUrl = url.slice(i)}
    if(this.tech.opts.freeze && this.isFreezable(url)){
      url = FREEZE.processPath(url)}
    var resolved = FREEZE.resolveUrl2(url)
    if(resolved === url){
      url = this.relPathFrom(path,url)}
    else{
      url = resolved}
    url += postUrl
    return JSON.stringify(url)},
  isFreezable:function(url){
    return FREEZE.isFreezableUrl(url)}
})


Base.item("include","point",{
  child:function(type,path){
    var c = this.tech.createItem(type,path)
    //do something with cache
    return c},
  parse:function(content){
    return [content]},
  process:function(ast){
    return ast.join("")},
  minimize:function(content){
    return content},
  read:function(path){
    var path = this.processPath()
    this.content = fs.readFileSync(path,"utf8")
    return this},
  write:function(outpath){
    fs.writeFileSync(outpath,this.content,"utf8")},
  processPath:function(path){
    return path}
})


var Css = Tech("css","base",{
  
})

Css.item("linkUrl","base.frozen",{
  process:function(ast){
    return "url("+this.__base(ast)+")"}
})

Css.item("linkSrc","base.frozen",{
  process:function(ast){
    return "src="+this.__base(ast)}
})


var stringRe = "(?:(?:'[^'\\r\\n]*')|(?:\"[^\"\\r\\n]*\"))",
var urlRe = "(?:(?:url\\(\\s*" + stringRe + "\\s*\\))|(?:url\\(\\s*[^\\s\\r\\n'\"]*\\s*\\)))",
var srcRe = "(?:src\\s*=\\s*[^,\)]+)",
var commentRe = '(?:/\\*[^*]*\\*+(?:[^/][^*]*\\*+)*/)',
var importRe = '(?:\\@import\\s+(' + urlRe + '|' + stringRe + '))',
var allRe = new RegExp(commentRe + '|' + importRe + '|' + urlRe + '|' + srcRe, 'g'),
var urlStringRx = new RegExp('^' + urlRe + '$'),
var srcStringRx = new RegExp('^' + srcRe + '$');


Css.item("include","base.include",{
  parse:function(content){
    var m, found = [];

    if (Buffer.isBuffer(content)) content = content.toString('utf8');

    while (m = allRe.exec(content)) {
      if (m[0].lastIndexOf('/*', 0) === 0) {
        // skip comment
      } else if (m[0].charAt(0) === '@') {
        // @import
        var url = parseUrl(m[1]);
        if (isIncludeProcessable(url)) found.push({
          type: 'include',
          url: url,
          range: [m.index, allRe.lastIndex]
        });
      } else if (urlStringRx.test(m[0])) {
        // url(...)
        var url = parseUrl(m[0]);
        if (U.isLinkProcessable(url)) found.push({
          type: 'linkUrl',
          url: url,
          range: [m.index, allRe.lastIndex - 1]
        });
      } else if (srcStringRx.test(m[0])) {
        // src=... 
        var src = parseSrc(m[0]);
        if (U.isLinkProcessable(src)) found.push({
          type: 'linkSrc',
          url: src,
          range: [m.index, allRe.lastIndex - 1]
        });
      } else {
        throw new Error('Failed to match: ' + m[0]);
      }
    }

    var lastIdx = 0
    var ast = []
    found.forEach(function(item){
      if(item.range[0] < lastIdx){
        throw new Error("Index out of range")}
      if(lastIdx < item.range[0]){
        ast.push(content.slice(lastInd,item.range[0]))}
      ast.push(item)
      lastIdx = item.range[1]+1})
    if(lastIdx < content.length){
      ast.push(content.slice(lastIdx))}
    return ast
  },

  process:function(ast){
    var result = this.__base(ast)
    if(this.tech.opts.comments){
      return ["/* "+this.path+" begin */",
        result,
        "/* "+this.path+" end */"].join("\n")}
    else{
      return result}
  },
  
  processPath:function(path){
    return path.replace(/^(.*?)(\?|$)/,"$1")
  }
})


function isIncludeProcessable(url) {
   return !isAbsoluteUrl(url);
}

function isAbsoluteUrl(url) {
    return /^\w+:/.test(url);
}

function parseUrl(url) {
    if (url.lastIndexOf('url(', 0) === 0) url = url.replace(/^url\(\s*/, '').replace(/\s*\)$/, '');

    if (url.charAt(0) === '\'' || url.charAt(0) === '"') url = url.substr(1, url.length - 2);

    return url;
}

function parseSrc(src) {
    src = src.replace(/^src\s*=\s*/, '').replace(/\s*\)$/, '');

    if (src.charAt(0) === '\'' || src.charAt(0) === '"') src = src.substr(1, src.length - 2);

    return src;
}



var Js = Tech("js","base",{
  
})


Js.item("")




