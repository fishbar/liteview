/**
 public static class View
     works as view layer(MVC)
     1. compiled template and cached them in RAM, so it's pretty fast
     2. with debug model, reload tpl each call
 API
     View = reuqire('view.js')
     View.init(root,const)
     View.debug(bool)
     View.reg(name,func);
     View.preload(tpl)
     View.render(tpl,data)

 HOW TO USE:
     Global setting:
         var view = require('view.js');
         view.init(root,const);
         view.debug(true);
     controller:
         view.render(tpl,data);
 **/
var Tc = require('./tcompiler'),
    cached = [],
    root,
    debug,
    cst,
    handler = {};
/**
 init view
 @param _root <string> tpl base
 @param _cst <object> const object ,common vars for tpls
 **/
exports.init = function(_root,_cst){
    root = _root;
    cst = _cst;
};
/**
 switch debug model
 @param _debug <bool>
 **/
exports.debug = function(_debug){
    debug = _debug;
};
/**
 regist handlers in tpl
 **/
exports.reg = function(name,func){
    if(arguments.length === 1){ //
        var _hs = arguments[0];
        for(var i in _hs){
            if(handler[i]){
                throw new Exception('view handler already exists : ' + i);
                break;
            }
            handler[i] = _hs[i];
        }
    }else{
        if(handler[name]){
            throw new Exception('view handler already exists : ' + name);
        }else{
            handler[name] = func;
        }
    }
}
/**
 preload tpl
 @param tpl <path> tpl related path,based on tpl root
 @param cst <const> tpl needed const , i.e. language s
 **/
function preload(_tpl){
    var t = Tc.create(_tpl,root,cst,handler,debug);
    if(!debug)cached[_tpl] = t;
    return t;
}
exports.preload = preload;
/**
 render tpl
 @param tpl <path> tpl related path ,based on root
 @param data <object> tpl needed data
 @return <string> rendered tpl
 **/
exports.render = function(_tpl,data){
    var t = cached[_tpl];
    if(!t){
        t = preload(_tpl);
    }
    return t.render(data);
}
