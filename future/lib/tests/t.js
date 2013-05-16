var Tech = require('./tech');
var inherit = require("inherit")

var A = Tech("a", {
    __constructor: function() {
        console.log('here is A')
    }
})

A.defItem("a-first", {
    __constructor: function() {
        console.log('Here is a-first');
    },
    chpok: function() {
        console.log(' chpok a ')
    }
})

var B = Tech("b", "a", {
    __constructor: function() {
        console.log('Here is b ');
        this.__base();

    }
})

B.defItem("b-first", "a.a-first", {
    chpok: function() {
        console.log(' chpok b ');
        this.__base();
    }
})

var C = inherit({
    __constructor:function(){
        console.log("new C")
    }
})


var a = new A();

//var c = new C();

var b = new B();

var i0 = B.item("b-first");
i0.chpok();
