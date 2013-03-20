Liteview[![Build Status](https://secure.travis-ci.org/fishbar/liteview.png)](http://travis-ci.org/fishbar/liteview)
===================

- A NodeJS template engine!
- fast ! 
- type less, do more !
## Installation:

```bash
npm install liteview  # install version 0.1.1 + 
```

## Example:

```js
var view = require('liteview').create();
view.init(tpl_base); // set template base to view
view.debug(true); //if needed, set debug ,view will console.log the debug info
view.render('test.html', {
  name: 'liteview',
  version: 'v x.x.x',
  list:[
    {name:'fish',address:'abc'},
    {name:'cat',address:'def',child:[{item:'apple'},{item:'orange'}]},
    {name:'dog',address:'ghi',array:['a','b','c']}
  ]
});
```

The test.html file:

```html
<html>
  <head></head>
  <body>
    #{set(totalPage = 5)}
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

        #{for(var i=0;i<#var:totalPage;i++)}
          <a href="/page/#{var:i}">page-#{var:i}</a>
        #{end}
      </li>
      #{end}
    </ul>
    #{end}
  </body>
</html>
```
Note: inline script must add ";" when needed!!!

## Features:

* Simple syntax, type less, do more
* Cache template into mem, so run more faster

## Syntax:
* variable define , set up local vars, it's different with replacement
    #{set(a=0)}  equal in javascript: var a = 0;
    #{var:a}
* single replacement
    #{replacement}   #var
* if else
    #{if(#replacement)} #{elseif(#replacement)} #{else} #{end}
* foreach
    #{foreach(#replacement)} #{end}
    replacement in foreach using #{[xxx]} , #[xxx]
    magic var : #{[-]} , #{[_]} , #{[%]}  // array index , array item , array length
* for
    #{for(var n=0;n<#total;n++)}
        page#{var:n}
    #{end}
* const
    #{const:xxx}
* expression
    #{(#a+1)} 
    #{(func(#a+1))}
* literal
    display content without syntax parse
    #{literal} 
    literal output , useful for inline-script in html
    #{literal}
* block
    define a code block
    #{block=test}
      //TODO your html code here , everything can be here
    #{blockend}
    invoke block
    #{block:test}

## API:

* init(base,[const]);  init template base ,constants
* debug(bool); set debug
* reg(name,func); regist functions that called in the tpl
* constant(const); set constants
* preload(tpl); pre-compile the tpl file, and tpl will be cached ,so when cal render, no more compile;
* render(tpl,[data]); return string (usually html code);

## TODO:
Adapter to express connect 
