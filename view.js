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
var Tc = require('./tcompiler');

exports.create = function () {
  var cached = [],
    root,
    debug,
    compress = true,
    cst = {},
    handler = {},
    view = {};

  /**
   * init view
   * @param  {String} _root tpl root path
   * @param  {Object} _cst  constant
   */
  view.init = function(_root,_cst){
      root = _root;
      cst = _cst ? _cst : {};
  };
  /**
   * set debug
   * @param  {bool} _debug if debug
   */
  view.debug = function(_debug){
      debug = _debug;
  };
  /**
   * set if output compress the white-space
   * @param  {bool} bool [description]
   */
  view.compress = function(bool){
      compress = bool;
  };
  /**
   * register function for view
   * @param  {String} name function name called in tpl
   * @param  {Function} func
   */
  view.reg = function(name,func){
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
   * set constant for view
   * @param  {object} _cst 
   */
  view.constant = function( _cst ){
    for(var i in _cst){
      cst[i] = _cst[i];
    }
  };
  /**
   * compile tpl
   * @param  {String} _tpl tplname , relative path
   */
  function preload(_tpl){
    var t = Tc.create(_tpl,root,cst,handler,compress,debug);
    if(!debug)cached[_tpl] = t;
    return t;
  };
  view.preload = preload;
  /**
   * render the tpl
   * @param  {String} _tpl tpl relative path
   * @param  {Object} data [description]
   */
  view.render = function(_tpl,data){
    var t = cached[_tpl];
    if(!t){
        t = preload(_tpl);
    }
    return t.render(data);
  }

  view.reg('encodeHTML',encodeHTML);
  view.reg('decodeHTML',decodeHTML);

  return view;
};

// pre regist functions
function encodeHTML(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/"/g,'&#034;').replace(/\'/g,'&#039;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function decodeHTML(str) {
    if(!str) return '';
    return str.replace(/&amp;/g,'&').replace(/&#034;/g,'"').replace(/&#039;/g,'\'').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}