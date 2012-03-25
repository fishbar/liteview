/**
 * @author fishbar
 * 
 * @overview
 *     支持以下语法
 *     == 变量==
 * #{var}
 *  ==常量==
 * #{const:XXX} #const:XXX
 * ==条件语句==
 *     #{if(#var>#var)} #{elseif(xxx)}  #{else} #{end}    if else 条件语句
 *     ==表达式==
 * #{(func(#var))}        全局函数调用
 * #{(#var+1)} 表达式
 * ==循环语句== 
 * #{foreach(#name)}
 * #{foreach(#[name])}
 * #{[var]} 指向当前层的repeat对象
 * #{[$n]} 第n层遍历的索引数,n=0开始
 * #{[$_n]} 第n层对象
 * #{[_]} Array Item
 * #{[-]} Array Index
 * #{[%]} Array length
 *     @example: 
 *         var $_0 = obj;
 *         for(var $0=0;$0<$_0.length;$0++){
 *             var $_1 = $_0[$0].user;
 *             for(var $1=0;$1<$_1.length;$1++){
 *                 $_1[name]
 *                 $_0[$0].id
 *             }
 *         }
 *        == 
 *         #{foreach(#obj)}
 *             #{foreach(#[user])}
 *                 #{[name]}
 *                 #{[$_0.$0.id]}
 *             #end
 *         #end
 * 
 * @exsample
 * 
 *     var tpl = '<div>#{title}<p>#{floor(#price)}</p>#{if(#desc)}<p>#{desc}</p>#{endif}</div>';
 *     var tt = new Lite.Template(tpl);
 *     alert(tt.replace({title:"test",price:1.023}));
 * 
 * 注意： repeat() 数字索引的数组时，#{-}接受数组索引 #{_}数组item本身 #{%} 数组长度
 * 
 * TODO:
 *     对于表达式中的引号存在问题,需要处理
 */

var fs = require('fs');
var path = require('path');
/** 解析模板string **/
function parseTpl(tplobj,tpl,merge){
    var head = merge ? "t.push('" :"var t=[];t.push('";
    var foot = merge ? "');" : "');return t.join('');";
    var stack = tplobj.stack; 
    //去除引号干扰
    tpl = tpl.replace(/(\"|\'|\\)/g,'\\$1');
    //去除没用的空tab
    tpl = tpl.replace(/\s*(\t|\n|\r)+\s*/g,'');
    //语法解析
    tpl = tpl.replace(/#\{(.*?)\}/g,function($0,$1,$2){
        return replace_cb(tplobj,stack,$0,$1,$2);
    });
    // 头和尾
    tpl = head + tpl + foot;
    // 去除空节点
    return tpl.replace(/t\.push\(''\);/g,'').replace(/\);t\.push\(/g,',');
}

function replace_cb(tplobj,stack,$0,$1,$2){
    var res=["');"],exp,pop,_len;
    var flag_repeat = tplobj.flag_repeat;
    if(!$1){
        return '';
    }else if( $1.indexOf('include(')===0 ){
        //TODO include file process
        //for node tpl engine
        var f = $1.substr(8,$1.length-9);
        res.push(tplobj._fetch(f,true));
    }else if($1 === 'end'){
        res.push("}") ;
        pop = stack.pop();
        if(!pop){
            tplobj.error('unexpect #{end}')
        }else if(pop.type == 'foreach'){
            tplobj.flag_repeat --;
        }
    }else if($1 === 'else' ){
        res.push("}else{") ;
    }else if($1.indexOf('if(') === 0){
        res.push("if("+common_exp_replace($1.substr(3,$1.length-4),flag_repeat)+"){");
        stack.push({type:'if'});
    }else if($1.indexOf('elseif(') === 0){
        res.push("}else if("+common_exp_replace($1.substr(7,$1.length-8),flag_repeat)+"){");
    }else if($1.indexOf('(') === 0){
        $1 = $1.substr(1,$1.length-2);
        $1 = $1.replace(/^(\w+)\(/,function($_0,$_1){
            return '(h.'+$_1+' ? h.'+$_1+':' + $_1 + ')(';
        });
        res.push("t.push("+common_exp_replace($1,flag_repeat)+");");
    }else if($1.indexOf('for(')){
      stack.push({type:'for'});
      exp = $1.substr(4,$1.length - 5);
      res.push('for('+common_exp_replace(exp,flag_repeat)+'){');
    }else if($1.indexOf('foreach(') === 0){
        var tmp;
        exp = $1.substr(8,$1.length-9);
        if(exp.indexOf('#[') == 0){
            //嵌套循环
            tmp = exp.substr(2,exp.length - 3);
            res.push("var $_"+flag_repeat+"=$__"+(flag_repeat-1)+"."+tmp);
        }else{
            tmp = exp.substr(1,exp.length - 1);
            res.push("var $_"+flag_repeat+"=d."+tmp);
        }
        _len = '$$'+flag_repeat;
        res.push(",$__",flag_repeat,";for(var $",flag_repeat,'=0,',_len,'=$_',flag_repeat,'?','$_',flag_repeat,".length:0;$",flag_repeat," < ",_len,";$",flag_repeat,"++){");
        res.push("$__",flag_repeat,"=$_",flag_repeat,'[$',flag_repeat,'];');
        stack.push({type:'foreach'});
        tplobj.flag_repeat++;
    }else if($1.indexOf('[') ===0){
        tmp = $1.substr(1,$1.length - 2);
        if(flag_repeat == 0){
            tplobj.error('vars in top level do not need #{[vars]},just #{vars}');
        }else if(tmp === '_'){ // [_] Array Item
            res.push("t.push($_"+(flag_repeat-1)+"[$"+(flag_repeat-1)+"]);");
        }else if(tmp === '-'){ //[-] Array Index
            res.push("t.push($"+(flag_repeat-1)+");");
        }else if(tmp === '%'){ // [%] Array Length
            res.push("t.push($$"+(flag_repeat-1)+");");
        }else if(tmp.indexOf('$') === 0){ // [$_0].0
            res.push("t.push("+tmp.replace(/\.(\$\d+)/g,'[$1]')+");");
        }else{
            res.push("t.push($__"+(flag_repeat-1)+"."+tmp+");");
        }
    }else{
        res.push("t.push("+common_syntax($1)+");");
    }
    res.push("t.push('");
    return res.join('');
}
function common_exp_replace(str,flag_repeat){
    str = str.replace(/\\(\"|\')/g,'$1');
    var res = [];
    var flag_str = '';
    var offset_st = 0 , offset_end = 0;
    for(var i=0 , len = str.length;i<len;i++){
        if(str[i] == '"' || str[i] == "'"){
            if(i>0 && str[i-1] == '\\')    // 非 string 的边界
                continue;
            else if(flag_str == str[i]){
                res.push(str.substr(offset_st,i-offset_st+1));
                flag_str = '';
            }else{
                if(offset_st != i)
                    res.push(common_inline_syntax(str.substr(offset_st,i-offset_st),flag_repeat));
                flag_str = str[i];
            }
            offset_st = i;
        }
    }
    if(flag_str!==''){
        throw new Error('[TPL ERROR]condition expression:'+str);
        return null;
    }
    
    if(offset_st != len-1)
        res.push(common_inline_syntax(str.substr(offset_st),flag_repeat));
    return res.join('');
}
/** 变量,index,对象本身，数组长度 */
function common_inline_syntax(str,flag_repeat){
    return str.replace(/#const:(\w+)/g,'ext.$1')
        .replace(/#_/g,"d")
        .replace(/#-/g,'_index')
        .replace(/#%/g,'_len')
        .replace(/#(\w+)/g,"d['$1']")
        .replace(/#\[([%\-\.\w\$]+)\]/g,function($0,$1){
	        return foreach_inline_syntax(flag_repeat,$0,$1);
	    });
}
function common_syntax(str){

    switch(str){
        case '-':
            str = '_index';break;
        case '%':
            str = '_len';break;
        case '_':
            str = 'd';break;
        default:
            if(str.indexOf('const:') === 0)    // const
                str = str.replace(/const:(\w+)/g,'ext.$1');
            else    //var
                str = str.replace(/([\w\.]+)/g,"d.$1");
    }
    return str;
}
function foreach_inline_syntax(flag_repeat,$0,$1){
    var res,tmp = $0,type=$1;
    switch(type){
        case '-':
            res = "$"+(flag_repeat-1);break;
        case '%':
            res = "$$"+(flag_repeat-1);break;
        case '_':
            res = "$_"+(flag_repeat-1)+"[$"+(flag_repeat-1)+"]";break;
        default:
            res = "$__"+(flag_repeat-1)+"."+type;
    }
    return res;
}


function Template(tpl,root,cst,handler,debug){
    this._const = cst
    this._debug = debug;
    this._root = root;
    // handlers for field process
    this._h = handler ? handler : {};
    this.flag_repeat = 0;
    this.stack = [];
    this._tmp = this._fetch(tpl);
};

Template.prototype={
    _fetch:function(tpl,bool){
        var f = path.join(this._root,tpl);
        var _tpl = '';
        try{
            _tpl = fs.readFileSync(f,'utf8');
        }catch(e){
            this.error('include tpl error:'+tpl);
        }
        return this._compile(_tpl,bool);
    },
    /** 
     compile file 
     @param tpl <string>
     @param isInclude <bool> 
     **/
    _compile:function(tpl,isInclude){
        tpl = parseTpl(this,tpl,isInclude);
        if(this._debug && !isInclude) console.log(tpl);
        if(isInclude) return tpl;
        if(this.stack.length){
            this.error('unclosed token : '+this.stack.pop().type);
        }else{
            try{
                return new Function('d','_index','_len','ext','h',tpl);
            }catch(e){
                tpl = tpl.replace(/(;|\{|\})/g,'$1\n');
                tpl = tpl.replace(/for\(.*\n.*\n/g,function(str){
                    return str.replace(/\n/g,'');
                })
                this.error('[TPL ERROR]\nfunction(d,_index,_len,ext,h){\n'+tpl+'}');
                return function(){}
            }
        }
    },
    render:function(data,i,len){
        return this._tmp(data,i,len,this._const,this._h);
    },
    /* 传入普通数组 N_Array */
    repeat:function(data){
        var len = data.length;
        var str=[];
        for(var i = 0; i < len; i++){
            str.push(this.render(data[i],i,len,this._const,this._h));
        }
        return str.join("");
    },
    /** 注册处理函数 **/
    reg:function(name,func){
        this._h[name] = func;
    },
    error:function(msg){
    	throw new Error('[TPL]:'+msg);
    }
}

exports.create = function(tpl,root,cst,handler,debug){
    return new Template(tpl,root,cst,handler,debug);
}
