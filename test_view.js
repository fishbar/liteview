var jsc = require('jscoverage');
require = jsc.require(module);
var Tc = require('./tcompiler', true);
var view = require('./view', true).create();
var expect = require('expect.js');
process.on('exit', function () {
  jsc.coverage();
});
view.init(__dirname + '/test/');
view.constant({
  root: 'const:abc'
});
view.reg({
  numfix: function (num) {
    return num > 9 ? num : '0' + num;
  },
  test : {
    a : function () {
      return this;
    },
    b : function () {
      return this;
    }
  }
});
view.debug(false);
describe('LiteTemplate', function () {
  it('inline script with regexp, #{set()} , #{for(var i=0;i<#xxx;i++)}', function () {
    var res = view.render('script.html', {});
    expect(res.indexOf('\\w')).to.not.be(-1);
  });
  it('#{if(regexp)}', function () {
    var res = view.render('regexp.html', {tt: "cc.js"});
    expect(res).to.be('regok');
  });
  it('#{set()},#{for()}', function () {
    var res = view.render('for.html');
    expect(res).to.be('012345');
  });
  it('file_include', function () {
    var res =  view.render('test.html', {
      title: 'test',
      name: 'fish',
      list: [
        {name: 'fish'}
      ],
      head: [
        {name: 'cat'}
      ]
    });
    expect(res).to.be('<title>test</title><li id="n_0">cat</li><script type="text/javascript">fish</script><div>fish</div><ul><li id="n_0">fish</li></ul>');
  });
  it('repeat_syntax', function () {
    var res = view.render('repeat.html', {
      list: [
        {name: 'fish'},
        {name: 'cat'},
        {name: 'snoopy'}
      ]
    });
    expect(res).to.be('<ul><li>3-0-fish</li>a<li>3-1-cat</li>a<li>3-2-snoopy</li>a</ul>');
  });
  it('variable not exist', function () {
    var res = view.render('repeat.html', {
      list: [
        {value: 1}
      ]
    });
    expect(res).to.be('<ul><li>1-0-</li></ul>');
  });
  it('using custom handler', function () {
    var res = view.render('expression.html', {
      list: [
        {num: 1},
        {num: 12}
      ],
      total: 2
    });
    expect(res).to.be('<li>01</li>2<li>12</li>133');
  });
  it('complex scene',function(){
    var res = view.render('complex.html',{
    list:[
      {name:'fish',child:[{name:'cat'}],array:[5,4]},
      {name:'test',com:true},
      {name:'a'}
    ]
    });  
    expect(res).to.be('<li>fish<ul><li>cat</li></ul><i>5</i><i>4</i></li><li>test<span>hasCom</span></li><li>a<i>nothing</i></li>');
  });
  it('test const, encodeHTML,decodeHTML',function(){
    var res = view.render('constant.html',{
      name : '<abc>',
      nameEncoded : '&amp;abc&gt;&lt;'
    });
    expect(res).to.match(/true/);
    expect(res).to.match(/const:abc/);
    expect(res).to.match(/&lt;abc&gt;/);
    expect(res).to.match(/&abc></);
  });
});
