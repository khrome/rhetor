//var natural = require('natural');

var textSplitter = /(\n?(?:^\n\n|\s+(?:[-=#+_*] ?){3,}))/m
//var textSplitter = /^([\n]*[-=#_*]{3,}[\n]*|[\n]{2,}|[\n]*(?:[-=#_*] ){3,}[-=#_*]?[\n]*)/m;
var emailValidator = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
var alpha = /^[a-z0-9]{1}$/i;
var detectAscii = function(str){
    var alphaCount = 0;
    var otherCount = 0;
    str.split('').forEach(function(chr){
        if(chr.match(alpha)) alphaCount++;
        else otherCount++;
    });
    return alphaCount /(alphaCount+otherCount) < 0.5;
}
var detectHardwrap = function(str){
    var lines = str.split("\n");
    var maxLen = 0;
    var lengths = {};
    lines.forEach(function(line){
        var pos = Math.floor(line.length / 10)*10;
        if(!lengths[pos]) lengths[pos] = 1;
        else lengths[pos]++;
        if(line.length > maxLen) maxLen = pos;
    });
    var maxOccurances = 0;
    var maxOccurancesLength = 0;
    Object.keys(lengths).forEach(function(len){
        if(maxOccurances < lengths[len]){
            maxOccurances = lengths[len]
            maxOccurancesLength = len;
        }
    });
    var ratioWrappedLines = (1-(lengths['0']+maxLen)/lines.length);
    if(maxOccurancesLength  === maxLen+'' && ratioWrappedLines > 0.5){
        return true;
    }else{
        return false;
    }
}
var marker = "#===========<story-extract-PLHD>===========#";
var unwrap = function(str){
    var replaced = str.replace(/\n\n/g, marker);
    replaced = replaced.replace(/\n/g, ' ');
    replaced = replaced.replace(new RegExp(marker, 'g'), "\n\n");
    return replaced;
};
var kvSeperators = [':', '-'];
var detectKeyValue = function(text){
    var pos;
    for(var lcv=0; lcv < kvSeperators.length; lcv++){
        pos = text.indexOf(kvSeperators[lcv]);
        if(
            pos !== -1 && //contains seperator
            pos !== text.length-1 //seperator isn't last char (like a hyphen)
        ){
            return [
                text.substring(0, pos).trim(),
                text.substring(pos+1 ).trim()
            ];
        }
    }
}

var scannables = {
    codes : {
        detect : function(text, options){
            var sep = (options && options.seperator) || ',';
            var l = text.indexOf('(');
            if(l === -1) return false;
            var r = text.indexOf(')');
            if(r === -1) return false;
            if(r < l) return false;
            var str = text.substring(l+1, r);
            var failed;
            str.split(',').map(function(s){
                if(!s.match(/[a-z0-9+]+/i)) failed = true;
                return s.trim();
            });
            if(failed) return false;
            return true;
        },
        extract : function(text, options){
            var sep = (options && options.seperator) || ',';
            var l = text.indexOf('(');
            if(l === -1) return false;
            var r = text.indexOf(')');
            if(r === -1) return false;
            if(r < l) return false;
            var str = text.substring(l+1, r);
            if(str.indexOf(',') === -1) return false;
            var codes = str.split(',').map(function(s){
                return s.trim();
            });
            return {
                codes:codes,
                trimmed : (text.substring(0, l)+text.substring(r+1)).trim()
            };
        }
    },
    email : {
        detect : function(text, options){
            return text.match(emailValidator);
        },
        extract : function(text, options){
            var mails = [];
            var parts = text.split(emailValidator);
            var notMail = [];
            text.match(emailValidator).forEach(function(mail){
                mails.push(mail);
            });
            parts.forEach(function(part){
                if(part.match(emailValidator)){
                    mails.push(part);
                }else{
                    notMail.push(part)
                }
            });
            return {
                mails : mails,
                trimmed : notMail.join('')
            }
        }
    }
}
var types = {
    html : {
        detect : function(text){

        },
        parts : function(text){

        }
    },
    text : {
        detect : function(text){ return true; },
        parts : function(text, results){
            var parts = text.split(textSplitter);
            parts = parts.map(function(text){
                return text.trim();
            }).filter(function(text){
                return text.trim() !== '';
            }).filter(function(text){
                return (!text.match(textSplitter)) && (!detectAscii(text));
            });
            var detected = [];
            //DIRECT PASS

            parts.forEach(function(part, index){
                var lpart = part.toLowerCase();
                var info = {};
                var lastInfo;
                info.raw = part;
                var kv;
                var lineCount = part.split("\n").length;
                if(lineCount < 5){
                    var seenKV;
                    part.split("\n").forEach(function(line){
                        info.line = line;
                        kv = detectKeyValue(line);
                        if(kv){
                            seenKV = true;
                            var v = kv[1];
                            if(scannables.codes.detect(v)){
                                var res = scannables.codes.extract(v);
                                if(res){
                                    results.push({
                                        key : 'codes',
                                        value : res.codes
                                    });
                                    v = res.trimmed;
                                }
                            }
                            if(scannables.email.detect(v)){
                                var res = scannables.email.extract(v);
                                if(res){
                                    results.push({
                                        key : 'email',
                                        value : res.mails[0]
                                    });
                                    v = res.trimmed.replace('()', '').replace('<>', '').trim();
                                }
                            }
                            info.key = kv[0];
                            info.value = v;
                            lastInfo = info;
                            results.push(info);
                            info = {};
                            info.raw = part;
                        }else{
                            //todo: hyphen awareness
                            if(lastInfo) lastInfo.value = lastInfo.value + ' ' +line.trim();
                        }
                    });
                }
                results.push(info);
            });
            //INDIRECT PASS
            //todo: infer lines by contextual info
        }
    }
};


var Story = function(opts){
    this.options = opts || {};
    if(!this.options.fields) this.options.fields = {};
}


Story.prototype.extract = function(text, callback){
    var found;
    var results = [];
    var ob = this;
    Object.keys(types).forEach(function(key){
        if(found) return; //short circuit
        if(types[key].detect(text)){
            found = true;
            types[key].parts(text, results)
        }
    });
    results.forEach(function(item){
        Object.keys(ob.options.fields).forEach(function(detect){
            if(item.key && item.key.toLowerCase().indexOf(detect) != -1){
                if(typeof ob.options.fields[detect] === 'function'){
                    item.key = ob.options.fields[detect](item);
                }
                if(typeof ob.options.fields[detect] === 'string'){
                    item.key = ob.options.fields[detect];
                }
            }
        })
    });
    var structured = {};
    var longest = 0;
    var parts = []; //body
    var bodythresh = 15;
    var bodysep = "\n\n************\n\n";
    var keys = ['body', 'title', 'author', 'codes', 'copyright', 'file', 'email'];
    results.forEach(function(item){
        if(item.key && item.value){
            if(keys.indexOf(item.key) === -1) return;
            structured[item.key] = item.value;
        }else{
            if(item.raw.split("\n").length > bodythresh){
                parts.push( item.raw);
            }
        }
    });
    structured.body = parts.join(bodysep);
    if(detectHardwrap(structured.body)){
        structured.body = unwrap(structured.body).replace(/-  ?/g, '');
    }
    return callback(undefined, structured);
}
module.exports = Story;
