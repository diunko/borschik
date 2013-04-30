var Css = Tech("css", "base", {})

Css.item("linkUrl", "base.frozen", {
  process: function(ast) {
    return "url(" + this.__base(ast) + ")"
  }
})

Css.item("linkSrc", "base.frozen", {
  process: function(ast) {
    return "src=" + this.__base(ast)
  }
})


var stringRe = "(?:(?:'[^'\\r\\n]*')|(?:\"[^\"\\r\\n]*\"))",
var urlRe = "(?:(?:url\\(\\s*" + stringRe + "\\s*\\))|(?:url\\(\\s*[^\\s\\r\\n'\"]*\\s*\\)))",
var srcRe = "(?:src\\s*=\\s*[^,\)]+)",
var commentRe = '(?:/\\*[^*]*\\*+(?:[^/][^*]*\\*+)*/)',
var importRe = '(?:\\@import\\s+(' + urlRe + '|' + stringRe + '))',
var allRe = new RegExp(commentRe + '|' + importRe + '|' + urlRe + '|' + srcRe, 'g'),
var urlStringRx = new RegExp('^' + urlRe + '$'),
var srcStringRx = new RegExp('^' + srcRe + '$');


Css.item("include", "base.include", {
  __constructor: function() {
    // read file
  }

  parse: function(content) {
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
    found.forEach(function(item) {
      if (item.range[0] < lastIdx) {
        throw new Error("Index out of range")
      }
      if (lastIdx < item.range[0]) {
        ast.push(content.slice(lastInd, item.range[0]))
      }
      ast.push(item)
      lastIdx = item.range[1] + 1
    })
    if (lastIdx < content.length) {
      ast.push(content.slice(lastIdx))
    }
    return ast
  },

  process: function(ast) {
    var result = this.__base(ast)
    if (this.tech.opts.comments) {
      return ["/* " + this.path + " begin */",
      result,
        "/* " + this.path + " end */"].join("\n")
    } else {
      return result
    }
  },

  processPath: function(path) {
    return path.replace(/^(.*?)(\?|$)/, "$1")
  },

  minimize: function(content) {
    //csso
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
