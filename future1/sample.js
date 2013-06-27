


function x2s(x){return x.toString().slice(1,-1)}

var stringRe = "(?:(?:'[^'\\r\\n]*')|(?:\"[^\"\\r\\n]*\"))",
var urlRe = "(?:(?:url\\(\\s*" + stringRe + "\\s*\\))|(?:url\\(\\s*[^\\s\\r\\n'\"]*\\s*\\)))",



Css.defItem("linkUrl","link",{
  parse: function(m){
    __assert(m.lastIndexOf("url(", 0) === 0)
    m = m.replace(/^url\(\s*|\s*\)$/, "")
    if (m[0] === "'" || m[0] === "\"") {
      m = m.slice(1,-1)
    }
    return this.url = m
  },
  process:function(){
    
  }
},{

  Re:urlRe
})

Css.defItem("linkSrc",{
  parse: function(m){
    m = m.replace(/^src\s*=\s*|\s*\)$/, '')
    if(m[0] === "'" || m[0] === "\""){
      m = m.slice(1,-1)
    }
    return this.url = m
  },
  process:function(){
    
  }
},{
  Re:"(?:src\\s*=\\s*[^,\)]+)"
})

Css.defItem("include","Base.include",{
  parse: function(m){
    m = m.replace(/^@import\s+/,"")
    __assert(m.lastIndexOf("url(", 0) === 0)
    m = m.replace(/^url\(\s*|\s*\)$/, "")
    if (m[0] === "'" || m[0] === "\"") {
      m = m.slice(1,-1)
    }
    return this.url = m
  },

},{
  Re:"(?:\\@import\\s+(?:" + urlRe + "|" + stringRe + "))"
})


Css.defItem("comment",{
  parse: function(m){
    return this.content = m
  }
},{
  Re:"(?:/\\*[^*]*\\*+(?:[^/][^*]*\\*+)*/)"
})



