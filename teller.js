var Emitter = require('extended-emitter');
var asynk = require('async');

//todo: MultiTeller interface that allows bonding tellers

var Teller = function(opts){
    var ob = this;
    this.options = opts || {};
    var e = new Emitter();
    this.emitter = e;
    (e).onto(this);
    return this;
}
Teller.prototype.setupEvents = function(){
    var ob = this;
    var events = this.eventConfiguration(this);
    Object.keys(events).forEach(function(eventName){
        ob.on(eventName, events[eventName]);
    });
}
Teller.prototype.tell = function(story, callback, manuallyFlush){
    if(!story) throw new Error('No Story Passed!')
    var flushes = {};
    var flushable = function(type, fn){
        if(!flushes[type]) flushes[type] = [];
        flushes[type].push(fn);
    };
    var flush = function(type){
        setTimeout(function(){
            if(!flushes[type]){
                return;
            }
            var fns = flushes[type];
            flushes[type] = [];
            fns.forEach(function(fn){
                try{
                    fn();
                }catch(ex){
                    console.log(ex)
                }
            });
        }, 0);
    };
    var ob = this;
    var run = function(){
        asynk.eachOfSeries(story.chapters, function(chapter, chapterIndex, done){
            var chapterInfo = {
                'title' : 'Chapter '+chapterIndex,
                story : story,
                data: chapter
            }
            ob.emit('chapter-start', chapterInfo);
            ob.once('chapter-stop', function(){
                manuallyFlush?flushable('chapter', function(){ done() }):done();
            });
            asynk.eachOfSeries(chapter.paragraphs, function(paragraph, paragraphIndex, done){
                var paragraphInfo = {
                    'title' : chapterIndex+':'+paragraphIndex,
                    story : story,
                    chapter : chapter,
                    data: paragraph
                }
                ob.emit('paragraph-start', paragraphInfo);
                ob.once('paragraph-stop', function(){
                    manuallyFlush?flushable('paragraph', function(){ done() }):done();
                });
                asynk.eachOfSeries(paragraph.sentences, function(sentence, sentenceIndex, done){
                    var sentenceInfo = {
                        'title' : chapterIndex+':'+paragraphIndex+':'+sentenceIndex,
                        story : story,
                        chapter : chapter,
                        paragraph : paragraph,
                        data: sentence
                    }
                    ob.emit('sentence-start', sentenceInfo);
                    ob.once('sentence-stop', function(){
                        manuallyFlush?flushable('sentence', function(){ done() }):done();
                    });
                    var words = sentence.split(' '); //todo: remove non-letter chars
                    asynk.eachOfSeries(words, function(word, wordIndex, done){
                        var wordInfo = {
                            'title' : chapterIndex+':'+paragraphIndex+':'+sentenceIndex+':'+wordIndex,
                            story : story,
                            chapter : chapter,
                            paragraph : paragraph,
                            sentence : sentence,
                            data : word
                        }
                        ob.emit('word-start', wordInfo);
                        ob.once('word-stop', function(){
                            manuallyFlush?flushable('word', function(){ done() }):done();
                        });
                    }, function(){
                        ob.emit('sentence-stop', sentenceInfo);
                    });
                }, function(){
                    ob.emit('paragraph-stop', paragraphInfo);
                });
            }, function(){
                ob.emit('chapter-stop', chapterInfo);
            });
        }, function(){
            ob.emit('story-stop', story);
        });
        ob.once('story-stop', function(data){
            callback(undefined, data);
        });
    }
    setTimeout(function(){
        run();
    }, 0);//detatch
    return manuallyFlush?flush:undefined;
}
Teller.prototype.eventConfiguration = function(){
    throw new Error('.eventConfiguration() must be implemented');
}
Teller.prototype.initializeContext = function(){
    throw new Error('.initializeContext() must be implemented');
}
Teller.prototype.cleanupContext = function(){
    throw new Error('.cleanupContext() must be implemented');
}

var makeMergedCopyAndExtendify = function(ext, supr, cls){
    var copy = supr || function(){};
    //var copy = function(){ return orig.apply(this, arguments) };
    Object.keys(cls.prototype).forEach(function(key){
        copy.prototype[key] = cls.prototype[key];
    });
    Object.keys(ext).forEach(function(key){
        copy.prototype[key] = ext[key];
    });
    copy.extend = function(ext, supr){
        return makeMergedCopyAndExtendify(ext, supr, copy);
    };
    return copy;
}

Teller.extend = function(cls, cns){
    var cons = cns || function(){
        Teller.apply(this, arguments);
        this.setupEvents();
    };
    return makeMergedCopyAndExtendify(cls, cons, Teller);
};
module.exports = Teller;
