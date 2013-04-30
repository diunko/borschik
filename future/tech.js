
var inherit = require("inherit")

var Tech = {
  this.__items:{},
  this.__techs:{},
  decl:function(name, parent, _instance, _static){
    if(typeof parent !== "string"){
      // {parent} is optional, so shift arguments:
      _static = _instance
      _instance = parent
      parent = undefined
    }
    return derive(name,parent,this.__techs,_instance,_static)
  },
  item:function(name,parent,_instance,_static){
    if(typeof parent !== "string"){
      // {parent} is optional, so shift arguments:
      _static = _instance
      _instance = parent
      parent = undefined
    }
    return derive(name,parent,this.__items,_instance,_static)
  }
}

function derive(name,parent,registry,_instance,_static){
  var P = parent && registry[parent] || {}
  _static.__name = name
  var I = inherit(P, _instance, _static)
  return registry[name] = I
}


