##liteview
a NodeJS template engine!

example:
    var view = require('liteview');
    view.init(tpl_base); // set template base to view
    view.debug(true); //if needed, set debug ,view will console.log the debug info
    view.render('test.html',{
        name:'liteview',
        version:'v x.x.x'
    });

features:
    * simple syntax,type less , do more;
    * cache template into mem, so run more faster;
api:
    * init(base);  init template base
    * debug(bool); set debug
    * handler(name,func); regist functions that called in the tpl
    * tpl(tpl); pre-compile the tpl file, and tpl will be cached ,so when cal render, no more compile;
    * render(tpl,data); return string (usually  html code);

... to be contine
    next update ,template run in browser
