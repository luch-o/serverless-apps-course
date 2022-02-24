function handler(event, context, callback){      
    var 
        MESSAGE_STR = event.message_str,
        USER_ID_STR = event.user_id_str,
        AWS = require("aws-sdk"),
        LEXRUNTIME = {},
        //BOT_NAME_STR = "WeatherCatBot",
        //BOT_ALIAS_STR = "$LATEST",
        // In lex v2 API botId and botAliasId replace botName and botAlias
        // these ids can be found in the lex console
        BOT_ID = "",
        BOT_ALIAS_ID = "",
        LOCALE_ID = "en_US",
        //sessionAttributes = {},
        params = {};
    
    AWS.config.update({
        region: "us-east-1"
    });
    
    LEXRUNTIME = new AWS.LexRuntimeV2();

    params = {
        botAliasId: BOT_ALIAS_ID,
        botId: BOT_ID,
        text: MESSAGE_STR,
        sessionId: USER_ID_STR,
        localeId: LOCALE_ID
        //sessionAttributes: sessionAttributes
    };
    LEXRUNTIME.recognizeText(params, function(error, data){
        var response = {};
        if(error){
            console.log(error, error.stack);
            response = "problem with lex";
            callback(null, response);
        }else{
            console.log(data);
            response = data;
            callback(null, response);
        }
    });
}
exports.handler = handler;