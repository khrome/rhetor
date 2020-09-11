var Teller = require('./teller');

var configEvent = function(type, options, config, context){
    if(options[type]){
        config[type+'-start'] = function(){
            options[type]();
            setTimeout(function(){
                context.emit(type+'-stop', {});
            }, 0);
        }
    };
}

var TattleTeller = Teller.extend({
    eventConfiguration : function(context){
        var config = {};
        var ob = this;
        configEvent('word', ob.options, config, context);
        configEvent('sentence', ob.options, config, context);
        configEvent('paragraph', ob.options, config, context);
        configEvent('story', ob.options, config, context);
        return config;
    },
    initializeContext : function(context, cb){
        console.log('INIT', context);
        cb();
    },
    cleanupContext : function(context, cb){
        cb();
    }
});
module.exports = TattleTeller;
