var chai = require('chai');
var should = chai.should();
var StoryTeller = require('../storyteller');
var TattleTeller = require('../tattle-teller');
var Emitter = require('extended-emitter');
var fs = require('fs');

var fieldConfig = {
    archive : 'file',
    author : 'author',
    title : 'title',
    copyright : function(info){
        var copyYears = info.key.match( /\d{4}(?:-\d{4})?/ )[0];
        info.value = {notice : info.value.replace(/-/g, '').trim()}
        info.value.dates = copyYears;
        return 'copyright';
    }
};

var extractor = new StoryTeller.Extractor({
    fields : fieldConfig
});

var storyIsValid = function(story, extended){
    should.exist(story);
    should.exist(story.file);
    should.exist(story.author);
    should.exist(story.title);
    should.exist(story.body);
    if(extended) extended.forEach(function(name){
        should.exist(story[name]);
    });

}

StoryTeller.request = require('request')

describe('story-teller', function(){
    describe('parses stories', function(){
        it('raw text', function(done){
            fs.readFile(__dirname+'/a.txt', function(err, data){
                should.not.exist(err);
                extractor.extract(data.toString(), function(err, data){
                    should.not.exist(err);
                    done();
                })
            });
        });

        it('another text format', function(done){
            fs.readFile(__dirname+'/b.txt', function(err, data){
                should.not.exist(err);
                extractor.extract(data.toString(), function(err, data){
                    should.not.exist(err);
                    done();
                })
            });
        });
    });

    describe('analyzes stories', function(){
        it('raw text', function(done){
            var storyteller = new StoryTeller({
                extract: { fields : fieldConfig },
                file: __dirname+'/b.txt'
            });
            storyteller.perform('show', function(){
                done();
            });
        });
    });

    describe('tells stories', function(){
        it('raw text', function(done){
            this.timeout(20000);
            var storyteller = new StoryTeller({
                extract: { fields : fieldConfig },
                actions : { test : new TattleTeller({word : function(){
                    //console.log('word!')
                }}) },
                file: __dirname+'/b.txt'
            });
            storyteller.perform('test', function(){
                done();
            });
        });
    });

    describe('tells composite stories', function(){
        it('raw text', function(done){
            this.timeout(40000);
            var aCount = 0;
            var bCount = 0;
            var storyteller = new StoryTeller({
                extract: { fields : fieldConfig },
                debug: console.log,
                actions : { test :
                    new StoryTeller.MultiTeller([
                        new TattleTeller({word : function(){
                            aCount++;
                        }}),
                        new TattleTeller({word : function(){
                            bCount++;
                        }})
                    ])
                },
                file: __dirname+'/b.txt'
            });
            storyteller.perform('test', function(err, story){
                if(err || !story) throw (err || new Error('No story generated!'));
                storyIsValid(story);
                aCount.should.equal(bCount);
                done();
            });
        });
    });

});
