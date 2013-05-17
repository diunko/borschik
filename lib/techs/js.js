var Tech = require('../tech');

require('./base') // register base tech
var Js = Tech("js", "base", {})

Js.item("include", "base.include", {

    parse: function(content) {

        if (Buffer.isBuffer(content)) content = content.toString('utf8');

        var allIncRe = new RegExp([
            ['/\\*!?', '\\*/'],
            ['[\'"]', '[\'"]']
        ].map(function(i) {
            return ['(?:', i[0], '\\s*borschik:include:(.*?)\\s*', i[1], ')'].join('');
        }).join('|'), 'g'),

            uniqStr = '\00borschik\00',
            _this = this;

        var paths = [];
        var texts = content.replace(allIncRe, function(_, incCommFile, incStrFile, linkPath) {

            if (incCommFile) {
                paths.push({
                    file: _this.pathTo(incFile),
                    type: 'include-comment'
                });
            } else if (incStrFile) {
                paths.push({
                    file: _this.pathTo(incFile),
                    type: 'include'
                });
            } else if (linkPath) {
                paths.push({
                    file: _this.absPathTo(incFile),
                    type: 'link'
                });
            } else {
                paths.push({
                    content: _,
                    type: 'comment'
                })
            }

            return uniqStr;

        })

        texts = texts.split(uniqStr);

        // zip texts and includes
        var ast = [],
            t, i;
        while ((t = texts.shift()) != null) {
            t && ast.push(t);
            (i = includes.shift()) && ast.push(i);
        }

        return ast;

    },

    minimize: function(content) {
        try {
            return require('uglify-js')(content);
        } catch (e) {
            console.log("Error minimizing JS file: ", this.path, "\n", "Is your JS valid?");
            throw (e);
        }

    }
});

Js.item("include-comment", "include", {

    process: function(ast) {
        var result = this.__base(ast);
        commentsWrap(result, this.file);
    }

});

Js.item("comment", {
    process: function(ast) {
        __assert(typeof ast === "string" )
        return ast;
    }

});

Js.item("link", "frozen") {

});

function commentsWrap(content, file) {

    return '/* ' + file + ' begin */\n' + content +
        '\n/* ' + file + ' end */\n';

}
