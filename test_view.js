var view = require('./view');
var expect = require('expect.js');
view.init(__dirname+'/test/');
view.handler({
    numfix:function(num){
        return num > 9 ? num : '0'+num;
    }
})
view.debug(true);
describe('LiteTemplate',function(){    
    it('file_include',function(){
       var res =  view.render('test.html',{
            title:'test',
            name:'fish',
            list:[
                {name:'fish'}
            ],
            head:[
                {name:'cat'}
            ]
        });
        expect(res).to.be('<title>test</title><li id="n_0">cat</li><div>fish</div><ul><li id="n_0">fish</li></ul>');
    });

    it('repeat_syntax',function(){
        var res = view.render('repeat.html',{
            list:[
                {name:'fish'},
                {name:'cat'},
                {name:'snoopy'}
            ]
        });
        expect(res).to.be('<ul><li>3-0-fish</li><li>3-1-cat</li><li>3-2-snoopy</li></ul>');
    });
    
    it('variable not exist',function(){
        var res = view.render('repeat.html',{
           list:[
                {value:1}
           ] 
        });
        expect(res).to.be('<ul><li>1-0-</li></ul>');
    });

    it('using custom handler',function(){
        var res = view.render('expression.html',{
            list:[
                {num:1},
                {num:12}
            ],
            total:2
        });
        expect(res).to.be('<li>01</li>2<li>12</li>133');
    });
    it('complex scene',function(){
      var res = view.render('complex.html',{
        list:[
            {name:'fish',child:[{name:'cat'}]},
            {name:'test',com:true},
            {name:'a'}
        ]
      });  
      expect(res).to.be('<li>fish<ul><li>cat</li></ul></li><li>test<span>hasCom</span></li><li>a<i>nothing</i></li>');
    });
});
