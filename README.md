##liteview

a NodeJS template engine!

example:

    var view = require('liteview');
    view.init(tpl_base); // set template base to view
    view.debug(true); //if needed, set debug ,view will console.log the debug info
    view.render('test.html',{
        name:'liteview',
        version:'v x.x.x',
        list:[
            {name:'fish',address:'abc'},
            {name:'cat',address:'def',child:[{item:'apple'},{item:'orange'}]},
            {name:'dog',address:'ghi',array:['a','b','c']},
        ]
    });
    
    ============== tpl  test.html =============
    <html>
        <head></head>
        <body>
            #{if(#list)}
            <ul>
                #{foreach(#list)}
                <li>
                    #{[-]} : #{[name]} - #{[address]}
                    #{foreach(#[child])}
                        <span>#{[item]}</span>
                    #{end}
                    #{foreach(#[array])}
                        <i>#{[_]}</i>
                    #{end}
                </li>
                #{end}
            </ul>
            #{end}
        </body>
    </html>

features:

    * simple syntax,type less , do more;
    * cache template into mem, so run more faster;

syntax:
    
    * variable
        #{var}   #var
    * if else
        #{if(#var)} #{elseif(#var1)} #{else} #{end}
    * foreach
        #{foreach(#var)} #{end}
        variable in foreach using #{[xxx]} , #[xxx]
        magic var : #{[-]} , #{[_]} , #{[%]}  // array index , array item , array length
    * expression
        #{(#a+1)} 
        #{(func(#a+1))}
api:

    * init(base);  init template base
    * debug(bool); set debug
    * handler(name,func); regist functions that called in the tpl
    * tpl(tpl); pre-compile the tpl file, and tpl will be cached ,so when cal render, no more compile;
    * render(tpl,data); return string (usually  html code);

... to be contine
    
    next update ,template run in browser
