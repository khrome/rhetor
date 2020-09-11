var Teller = require('./teller');
var Emitter = require('extended-emitter');
var Plex = require('auto-plex');
var asynk = require('async');

var MultiTeller = Teller.extend({
    eventConfiguration : function(context){
        throw new Error('this should never be called');
    },
    getTellers : function(context){
        throw new Error('this should never be called');
    },
    initializeContext : function(context, cb){
        var ob = this;
        asynk.each(ob.tellers, function(teller, done){
            teller.initializeContext(context, done)
        }, function(){
            cb();
        });
    },
    cleanupContext : function(context, cb){
        var ob = this;
        asynk.each(ob.tellers, function(teller, done){
            teller.cleanupContext(context, done)
        }, function(){
            cb();
        });
    },
    tell : function(story, callback){
        if(!this.tellers){
            this.tellers = this.getTellers();
            this.multi.plexed = this.tellers;
        }
        var error;
        var left = this.tellers.length;
        var flushers = [];
        var ob = this;
        var binding = function(type){
            var bound = ob.on(type+'-stop', function(){
                flushers.forEach(function(flush){
                    flush(type);
                });
            });
            return bound;
        }
        var chapterBinding = binding('chapter');
        var paragraphBinding = binding('paragraph');
        var sentenceBinding = binding('sentence');
        var wordBinding = binding('word');
        var ob = this;
        this.once('story-stop', function(){
            ob.off('chapter-stop', chapterBinding);
            ob.off('paragraph-stop', paragraphBinding);
            ob.off('sentence-stop', sentenceBinding);
            ob.off('word-stop', wordBinding);
        });
        this.tellers.forEach(function(teller){
            var flush = teller.tell(story, function(err, story){
                if(error) return; // we already returned an error
                error = error || err;
                left--;
                if(left === 0 || error) callback(error, story);
            }, true);
            flushers.push(flush);
        });
    }
}, function(tellers){
    Teller.apply(this, arguments);
    if(tellers) this.tellers = tellers;
    var multi = Plex({
        bubbleup : [[
            'emitter', [
                'story-start',
                'story-stop',
                'chapter-start',
                'chapter-stop',
                'paragraph-start',
                'paragraph-stop',
                'sentence-start',
                'sentence-stop',
                'word-start',
                'word-stop',
            ]
        ]],
        emitter: this.emitter
    });
    this.multi = multi;
    this.tellers.forEach(function(teller){
        multi.plex(teller);
    })
});
module.exports = MultiTeller;
