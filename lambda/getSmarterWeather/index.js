exports.handler = function(event, ctx, cb){
    console.log(JSON.stringify(event))
    var 
      my_response = {};
      if(event.sessionState.intent.slots.city_str){
          // we have the city already awesome keep going
      }else{
          //we need to ask for (elicit) a city
          my_response.statusCode = 200;
          my_response.body = {
              "sessionState": {
                  "dialogAction": {
                      "type": "ElicitSlot",
                      "slotToElicit" : "city_str",
                  },
                  "intent": {
                      "name": "CatWeather",
                      "slots": {
                          "city_str": null
                      },
                      "state": "InProgress"
                  }
              },
              "messages": [
                  {
                      "contentType": "PlainText",
                      "content": "Name the city your cat lives in, thanks"
                  }
              ]
              
          };
          return cb(null, my_response.body);
      }
      var
          city_str = event.sessionState.intent.slots.city_str.value.originalValue,
          AWS = require("aws-sdk"),
          DDB = new AWS.DynamoDB({
              apiVersion: "2012-08-10",
              region: "us-east-1"
          }),
          lookup_name_str = city_str.toUpperCase(),
          params = {
              TableName: "weather",
              KeyConditionExpression: "sc = :v1",
              ExpressionAttributeValues: {
                  ":v1":{
                      "S": lookup_name_str
                  }
              },
              ProjectionExpression: "t"
          }; 
      
      console.log(params);
      DDB.query(params, function(err, data){
          if(err){
              throw err;
          }
          
          if(data.Items && data.Items[0] && data.Items[0].t){
              console.log("city weather found");
              console.log(data.Items[0]);
              my_response.statusCode = 200;
              my_response.body = {
                  "sessionState": {
                      "sessionAttributes": {
                          "temp_str": data.Items[0].t.N,
                          "city_str": city_str
                      },
                      "dialogAction":{
                          "type": "Close"
                      },
                      "intent": {
                          "name":"CatWeather",
                          "slots":{
                              "city_str": {
                                  "shape": "Scalar",
                                  "value": {
                                      "originalValue": city_str,
                                      "interpretedValue": lookup_name_str
                                  }
                              }
                          },
                          "state": "Fulfilled"
                      }
                  },
                  "messages": [
                      {
                          "contentType": "PlainText",
                          "content": data.Items[0].t.N
                      }
                  ]
                  
              };
          }else{
              console.log("city weather not found for " + lookup_name_str);
              my_response.statusCode = 200;
              my_response.body = {
                  "sessionState": {
                      "dialogAction": {
                          "type": "ElicitSlot",
                          "slotToElicit" : "city_str",
                      },
                      "intent": {
                          "name": "CatWeather",
                          "slots": {
                              "city_str": null
                          },
                          "state": "InProgress"
                      }
                  },
                  "messages": [
                      {
                          "contentType": "PlainText",
                          "content": "Please try another city, we couldn't find the weather for that city"
                      }
                  ]
                  
              };
              
          }
          console.log("Response: " + JSON.stringify(my_response));
          return cb(null, my_response.body);
      });
  };