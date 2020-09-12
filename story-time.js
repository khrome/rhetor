var StoryTeller = require('./storyteller.js');
var personalities = { };
var Story = {
    options : {
        archive : 'file',
        author : 'author',
        title : 'title',
        copyright : function(info){
            var copyYears = info.key.match( /\d{4}(?:-\d{4})?/ )[0];
            info.value = {notice : info.value.replace(/-/g, '').trim()}
            info.value.dates = copyYears;
            return 'copyright';
        }
    },
    personality : function(name, teller){
        if(name && teller){
            personalities[name] = teller;
        }
    },
    tell : function(text, type, callback){
        if(text.indexOf("\n") !== -1){ //multi-line
            doTell(text, callback);
        }else{ //single line
            var storyteller = new StoryTeller({
                extract: { fields : Story.options },
                actions : { test : personalities[type] },
                file: text
            });
            storyteller.initializeContext(global, 'test', function(){
                storyteller.perform('test', function(err, story){
                    if(callback) callback(err, story);
                });
            });
        }
    },
    request : require('request')
}

if(global.Rhetor){
    global.Rhetor.story = function(){
        return Story;
    }
}else{
    global.Story = Story;
}
