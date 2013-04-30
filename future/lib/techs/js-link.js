var JsLink = Tech("js-link", base);

const uniqStr = '\00borschik\00';
const allIncRe = /\/\/.*|\/\*[\s\S]*?\*\/|borschik\.link\(['"]([^@][^"']+?)['"]\)/g;

JsLink.item("link", "frozen", {

    __constructor: function() {
        // path
    },

    minimize: function(content) {
        // no minimize for this tech
        return content;
    },

    parse: function(content) {

        var includes = [];
        var _this = this;

        var text = Buffer.isBuffer(content) ? content.toString('utf-8') : content;

        var texts = text.replace(allIncRe, function(_, include) {
            if (include) {
                includes.push({
                    url: _this.absPathTo(include),
                    type: 'link'
                });
            } else {
                includes.push({
                    content: _,
                    type: 'comment'
                });
            }

            return uniqStr;

        }).split(uniqStr);

        // zip texts and includes
        var ast = [],
            t, i;

        while ((t = texts.shift()) != null) {
            t && ast.push(t);
            (i = includes.shift()) && ast.push(i);
        }

        return ast;

    },
})

JsLink.item("comment", {
    process: function(ast) {
        __assert(typeof ast === "string" )
        return ast;
    }

})
