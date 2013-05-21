var INHERIT = require('inherit');
var dbg = 1;

function Tech(name, base, def) {

    dbg && console.log('tech  ', arguments);

    var r = Tech.__registry;

    if (typeof base !== "string") {
        var B = Tech;
        def = base;
        dbg && console.log('base != string')
    } else {
        // no base
        var B = r[base];
    }

    var T = INHERIT(B, def)
    r[name] = T;

    T._name = name;

    var items = {
        __proto__: B.__items
    };

    T.__items = items;

    return T;

}

Tech.defItem = function(name, base, def) {

    dbg && console.log('item  ', arguments);
    var T = this;

    if (typeof base !== "string") {
        def = base;
        var B = function() {};
    } else {
        var B = T.__items[base];
        if (!B) {
            throw new Error('base item not defined: ' + base)
        }
    }


    var I = INHERIT(B, def);

    I._type = name
    I.prototype.__cls = I
    I.prototype.__tech = T
  
    T.__items[name] = I;
    T.__items[T._name + '.' + name] = I;

}

Tech.item = function(name, args) {

    var c = this.__items[name];
    var item = new c(args);

    return item;
}

Tech.__registry = {};
module.exports = Tech;
