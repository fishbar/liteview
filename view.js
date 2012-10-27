/**
 public static class View
     works as view layer(MVC)
     1. compiled template and cached them in RAM, so it's pretty fast
     2. with debug model, reload tpl each call
 API
     View = reuqire('view.js')
     View.init(root,constant)
     View.debug(bool)
     View.reg(name,func);
     View.preload(tpl)
     View.render(tpl,data)

 HOW TO USE:
     Global setting:
         var view = require('view.js');
         view.init(root,constant);
         view.debug(true);
     controller:
         view.render(tpl,data);
 **/
var Tc = require('./tcompiler'),
    cached = [],
    root,
    debug,
    compress = true;
    cst = {},
    handler = {};
/**
 init view
 @param _root <string> tpl base
 @param _cst <object> constant object ,common vars for tpls
 **/
exports.init = function(_root,_cst){
    root = _root;
    cst = _cst ? _cst : {};
};
/**
 switch debug model
 @param _debug <bool>
 **/
exports.debug = function(_debug){
    debug = _debug;
};

exports.compress = function(bool){
    compress = bool;
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
};
/**
  set constant 
  **/
exports.constant = function( _cst ){
  for(var i in _cst){
    cst[i] = _cst[i];
  }
};
/**
 preload tpl
 @param tpl <path> tpl related path,based on tpl root
 **/
function preload(_tpl){
    var t = Tc.create(_tpl,root,cst,handler,compress,debug);
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

// pre regist functions
exports.reg('encodeHTML',function(str){
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/"/g,'&#034;').replace(/\'/g,'&#039;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
});
exports.reg('decodeHTML',function(str){
    if(!str) return '';
    return str.replace(/&amp;/g,'&').replace(/&#034;/g,'"').replace(/&#039;/g,'\'').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
});