var request ;//= require('request');
var fs = require('fs');
var sw = require('stopword');

var performer = function(actions, context){
    return function(action, callback){
        if(!actions[action]){
            return callback(new Error('action not found: '+action));
        }
        return actions[action].apply(this, [context, callback]);
    }
};

var stopwords = [
    "My", "I", "However", "In", "If", "This", "At", "About", "We", "He", "The",
    "She", "A", "Anyway", "During", "Well", "When", "It", "That", "Then",
    "What", "Besides", "Later", "Would", "Finally", "After", "According",
    "Fortunately", "But", "As", "Again", "Even", "All", "There", "Do", "You",
    "Of", "Was", "Maybe", "Based", "Some", "Each", "Here", "On", "With",
    "Whatever", 'to', 'and', 'have', 'yes', 'no', 'not', 'didn'
].map(function(s){ return s.toLowerCase() });

var suffixes = [
    'ing', 'ly', 'tion'
];

var StoryTeller = function(opts){
    var ob = this;
    var jobs = [];
    this.options = opts || {};
    this.actions = this.options.actions || {};
    Object.keys(this.actions).forEach(function(actionName){
        var action = ob.actions[actionName];
        if(action.eventConfiguration && action.tell){//a teller, convert to fn;
            ob.actions[actionName] = function(context, callback){
                action.tell.apply(action, [ob.data, function(err, story){
                    callback(err, story);
                }]);
            }
            ob.actions[actionName].init = function(context, cb){
                return action.initializeContext(context, cb);
            }
            ob.actions[actionName].cleanup = function(context, cb){
                return action.cleanupContext(context, cb);
            }
        }
    })
    var options = this.options;
    this.perform = function(){
        var args = Array.prototype.slice.call(arguments);
        jobs.push(function(){
            ob.perform.apply(ob, args);
        });
    }
    var doReady = function(){
        ob.perform = performer(ob.actions, ob);
        jobs.forEach(function(job){ job() });
        jobs = [];
    }
    if(options.file){
        //todo:
        if(options.file[0] === '/' ){
            fs.readFile(options.file, function(err, data){
                if(err) throw err;
                ob.loadStory(data.toString(), doReady)
            });
        }else{
            request({
                uri: options.file
            }, function(err, res, data){
                if(err) throw err;
                ob.loadStory(data.toString(), doReady)
            });
        }
    }
    if(options.story){
        ob.loadStory(options.story, doReady)
    }
    return this;
}

StoryTeller.prototype.initializeContext = function(context, actionName, callback){
    if(!this.actions[actionName]){
        return callback(new Error('action not found: '+actionName));
    }else{
        this.actions[actionName].init(context, callback);
    }
}

StoryTeller.prototype.cleanupContext = function(context, actionName, callback){
    if(!this.actions[actionName]){
        return callback(new Error('action not found: '+actionName));
    }else{
        this.actions[actionName].cleanup(context, callback);
    }
}

var disassembleBody = function(str){
    var parts = str.split("\n\n************\n\n");
    parts = parts.map(function(part){
        var res = {};
        res.paragraphs = part.split("\n\n").map(function(paragraph){
            var ires = {};
            var words = paragraph.split(/[.?!]/);
            ires.sentences = words.filter(function(sentence){
                return sentence.replace(/[-.?!:;\(\)\[\]\{\}]+/g, '').trim() !== '';
            });
            ires.stopped = words.map(function(snt){
                var words = snt.split(' ');
                var stopped = sw.removeStopwords(words).join(' ');
                return stopped;
            });
            return ires;
        });
        return res;
    })
    return parts;
}

StoryTeller.prototype.loadStory = function(body, callback){
    var ob = this;
    if(!this.extractor){
        try{
            this.extractor = new StoryTeller.Extractor(
                this.options.extract ||
                defaultExtractionOptions
            );
        }catch(ex){ }
    }
    this.extractor.extract(body, function(err, data){
        var structured = disassembleBody(data.body);
        data.chapters = structured;
        var proper = {};
        var counts = data.chapters.reduce(function(counts, chapter){
            return chapter.paragraphs.reduce(function(innercounts, paragraph){
                return paragraph.stopped.reduce(function(cnts, sentence){
                    var words = sentence.split(/[,;:"']? /);
                    words.forEach(function(wrd){
                        var word = (
                            wrd.indexOf("'") === -1?
                            wrd:
                            wrd.substring(0, wrd.indexOf("'"))
                        ).replace(/"/g, '').replace(/,/g, '');
                        var lword = word.toLowerCase();
                        if(lword.length < 2) return;
                        if(lword !== word && stopwords.indexOf(lword) === -1){
                            if(!proper[word]) proper[word] = 1;
                            else proper[word]++;
                        }
                        if(!cnts[lword]) cnts[lword] = 1;
                        else cnts[lword]++;
                    });
                    return cnts;
                }, innercounts);
            }, counts)
        }, {});
        var countList = [];
        Object.keys(counts).map(function(key){
            if(stopwords.indexOf(key) !== -1) return;
            if(key.length < 2) return;
            countList.push({
                key : key,
                value: counts[key]
            });
        });
        countList = countList.sort(function(a, b){
            if(a.value < b.value) return -1;
            if(a.value > b.value) return 1;
            return 0;
        }).reverse()
        var list = countList.slice(0, 20);
        var finalTopics = [];
        Object.keys(proper).forEach(function(key){
            var hasSuffix = suffixes.reduce(function(res, suf){
                if(res) return res;
                if(key.endsWith(suf)) return true;
                return res;
            }, false);
            if(!hasSuffix){
                finalTopics.push(key);
            }
        });
        list.forEach(function(item){
            finalTopics.push(item.key);
        });
        data.keywords = finalTopics;
        ob.data = data;
        callback(undefined, data);
    });
}
//LIB
StoryTeller.MultiTeller = require('./multi-teller');
StoryTeller.Teller = require('./teller');
StoryTeller.Extractor = require('./story-extractor');
StoryTeller.setRequest = function(instance){
    request = instance;
};
//if not in node, go global
if (typeof self !== 'undefined') global.Rhetor = StoryTeller;
module.exports = StoryTeller;
//window.require = require;
