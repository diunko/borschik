// var INHERIT = require('inherit'),
//     base = require('../tech'),
//     FS = require('../fs'),
//     PATH = require('path');

//FS.existsSync

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

        var includes = [];
        var texts = content.replace(allIncRe, function(_, incCommFile, incStrFile) {

            var incFile = incCommFile || incStrFile;
            includes.push({
                file: _this.pathTo(incFile),
                type: incStrFile ? 'include-string' : 'include-comment'
            });

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

function commentsWrap(content, file) {

    return '/* ' + file + ' begin */\n' + content +
        '\n/* ' + file + ' end */\n';

}
