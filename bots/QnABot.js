// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const { QnAMaker,LuisRecognizer } = require('botbuilder-ai');

class QnABot extends ActivityHandler {
    constructor() {
        super();
        //Mstr
const request = require('request-promise');
const apiRoot = 'http://10.94.184.138:8080/MicroStrategyLibrary/api';
var attributeList
var availableObjects
var metric
var attribute
var respuesta
var reportID


const isSessionCookie = cookie => {
  return cookie.startsWith('JSESSIONID');
};

const getSession = async (username = '', password = 'ujnMKI89', otherVars = {}) => {
  const requestOptions = {
    method:"POST",
    uri: `${apiRoot}/auth/login`,
    json: true,
    body: {
      username: username,
      password: password,
      ...otherVars
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    resolveWithFullResponse: true
  };

  const response = await request(requestOptions);

  const authTokenKey = 'x-mstr-authtoken';

  // these are key:value headers we need to include with every request
  const sessionHeaders = { };

  sessionHeaders[authTokenKey] = response.headers[authTokenKey];
  sessionHeaders['Cookie'] = response.headers['set-cookie'].filter(isSessionCookie).pop();

  return sessionHeaders;
}

const getFolders = sessionHeaders => {
  const requestOptions = {
    method:"GET",
    uri: `${apiRoot}/folders`,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...sessionHeaders
    }
  };

  return request(requestOptions);
}
const getCube = async (sessionHeaders={},requestedObjects={},luisResult,viewFilter,reportID) => {
    const requestOptions = {
      method:"GET",
      uri: `${apiRoot}/reports/${reportID}`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-MSTR-ProjectID':'AC9DEC4E454811B9E621998930E293CC',
        ...sessionHeaders
      }
    };

    console.log("EL REQUEST: "+ JSON.stringify(requestOptions))
    
    const response = await request(requestOptions);
  
    const reportDefinition= response.result.definition.availableObjects;


    for(var i=0;i<reportDefinition.metrics.length;i++){
       if( reportDefinition.metrics[i].name.toLowerCase()==luisResult.entities['metric']){
            requestedObjects.metrics[0].id=reportDefinition.metrics[i].id
   requestedObjects.metrics[0].name=reportDefinition.metrics[i].name.toLowerCase()
   metric=reportDefinition.metrics[i].name
            
            
        }
    }
   
    if(luisResult.entities.$instance.de){
      console.log("DENTRO DEL OF")
      console.log(JSON.stringify(luisResult.entities.de[0]))
     for(var i=0;i<reportDefinition.attributes.length;i++){
       
      if( luisResult.entities.de[0].$instance[reportDefinition.attributes[i].name.toLowerCase()]!=undefined){
        
            var value=''
            value=luisResult.entities.$instance.de[0].text
            console.log("este es el valor del fil " +value)
            viewFilter.viewFilter.operands[0].attribute.id=reportDefinition.attributes[i].id
             viewFilter.viewFilter.operands[0].attribute.name=reportDefinition.attributes[i].name
             viewFilter.viewFilter.operands[0].form.id=reportDefinition.attributes[i].forms[0].id
             viewFilter.viewFilter.operands[0].form.name=reportDefinition.attributes[i].forms[0].name
          viewFilter.viewFilter.operands[1].value=value
          requestedObjects.attributes[0].id=reportDefinition.attributes[i].id
   requestedObjects.attributes[0].name=reportDefinition.attributes[i].name
   attribute=luisResult.entities.$instance.de[0].text
            
      }
        }
    }  else
    {
      console.log ("Se esta yendo por el ELSE")
      viewFilter=''
    }
    if(luisResult.entities.$instance.por)
    {
      for(var i=0;i<reportDefinition.attributes.length;i++){
        if( luisResult.entities.$instance.por[0].text==reportDefinition.attributes[i].name){
        requestedObjects.attributes[0].id=reportDefinition.attributes[i].id
   requestedObjects.attributes[0].name=reportDefinition.attributes[i].name
   attribute=luisResult.entities[reportDefinition.attributes[i].name]
   
        }
      }
    }

    console.log("Esto es el luisresult "+ JSON.stringify(luisResult.entities.$instance))
    if(luisResult.entities.$instance.operador)
    {

      console.log("EL OPERADOR")
      
      viewFilter.viewFilter.operator= luisResult.entities.$instance.operador[0].text
      console.log("EL OPERADOR es "+ viewFilter.viewFilter.operator)
   
   
        
      
    }

    
    loadDefinition(reportDefinition);

    console.log("GET INSTANCE"+ JSON.stringify(requestedObjects) +" "+ JSON.stringify(viewFilter) )

    return getInstance(sessionHeaders,requestedObjects,viewFilter,reportID);
  }
  const getInstance = async (sessionHeaders={},requestedObjects,viewFilter,reportID) => {

    
      
    const requestOptions = {
      method:"POST",
      uri: `${apiRoot}/reports/${reportID}/instances?limit=1000`,
      json: true,
      body: { "requestedObjects":{
        ...requestedObjects
      }   ,
      
      
      
       

        ...viewFilter
       
    },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-MSTR-ProjectID':'AC9DEC4E454811B9E621998930E293CC',
        ...sessionHeaders
      },
      resolveWithFullResponse: true
    };
  console.log("ESTO ES EL REQUEST OPTIONS "+JSON.stringify(requestOptions.body))
    const response = await request(requestOptions);
  
  // console.log("ESTA ES LA RESPUETSA"+response)
    
    const instanceID= response.body.instanceId;

    return getData(sessionHeaders,instanceID,reportID)
  }
  const getData = async (sessionHeaders={},instanceId='',reportID) => {
    console.log("GET DATA")
    const url= apiRoot + `/reports/${reportID}`+'/instances/' + instanceId + '?limit=1000'
    console.log(url)
    const requestOptions = {
      method:"GET",
      uri: url,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-MSTR-ProjectID':'AC9DEC4E454811B9E621998930E293CC',
        ...sessionHeaders
      }
    };
    const response = await request(requestOptions);
  
    console.log("Esto le manda al get data"+ JSON.stringify(response))
    //console.log("Esto es el rsponse: "+ JSON.stringify(response.result.data))
   // console.log("The "+ metric+ " of " + attribute + " is " + response.result.data.root.children[0].metrics[metric].fv)
                
  return response.result.data.root
  }

  function loadDefinition(availableObjects)
  {
    attributeList=availableObjects.metrics
    availableObjects= availableObjects
  }
  function attributes(attributes)
  {
    attributes.array.forEach(element => {
      console.log(element)
    });
  }

// fin mstr
        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        } 
        
        const luisApplication = {
            applicationId: "b38e590b-bf4a-4f31-bd2f-df563330a885",
                endpointKey: "b9ceb1603e7847e8a4d13fbd5e7757e6",
                endpoint: "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b38e590b-bf4a-4f31-bd2f-df563330a885?verbose=true&timezoneOffset=0&subscription-key=b9ceb1603e7847e8a4d13fbd5e7757e6&q="
        }// Create configuration for LuisRecognizer's runtime behavior.
    const luisPredictionOptions = {
        includeAllIntents: true,
        log: true,
        staging: false
    };

            this.luisRecognizer = new LuisRecognizer(luisApplication, luisPredictionOptions , true);
        
        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Welcome to the Mirostrategy Bot assistant! Ask me a question and I will try to answer it.');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // When a user sends a message, perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        this.onMessage(async (context, next) => {
            console.log('Calling QnA Maker');

            /* const qnaResults = await this.qnaMaker.getAnswers(context);

            // If an answer was received from QnA Maker, send the answer back to the user.
            if (qnaResults[0]) {
                await context.sendActivity(qnaResults[0].answer);

            // If no answers were returned from QnA Maker, reply with help.
            } else {*/ 
              
                var requestedObjects= {
                    "attributes": [{
                "id": null,
                "name": "Country"
                }],
                "metrics":[
                {"id":"4C051DB611D3E877C000B3B2D86C964F",
                "name":"Profit"
                }
                ]
                }
                var viewFilter={"viewFilter":{

                    "operator":"Equals",
                
                    "operands":[
                
                      {
                
                        "type":"form",
                
                        "attribute":{
                
                          "id":"",
                
                          "name":""
                
                        },
                
                        "form":{
                            "id": "",
                            "name": "DESC",
                
                        },
                
                      },
                
                      {
                
                        "type":"constant",
                
                        "dataType":"Char",
                
                        "value":""
                
                      }
                
                    ]
                  }
                  }
                  console.log("EL CONTEXT"+ JSON.stringify(context))
                const luisResult= await this.luisRecognizer.recognize(context)
               
                
                switch(LuisRecognizer.topIntent(luisResult))
                {
                    case "3D7B7E764FB072E28C1DF6831759CD63":
                      reportID='C7F38F074DE26345A06C9FBCB95F5262';
                     
                      break;
                      case "Expenditure":
                      reportID='CFB526B74375413D1F532D80E08194AA';
                     
                      break;
                      default:
          }
                      
                    const mstrResult = await  getSession('administrator')
.then(sessionHeaders => {
  return getCube(sessionHeaders,requestedObjects,luisResult,viewFilter,reportID);
});

if(mstrResult!== undefined){
  console.log("El mstr result:" + JSON.stringify(mstrResult))
                            for(var i=0;i<mstrResult.children.length;i++){
                              console.log("La "+ metric+ " de " + JSON.stringify(mstrResult.children[i].element.formValues.DESC) + " es " + mstrResult.children[i].metrics[metric].fv);
                            await context.sendActivity("la "+ metric+ " de " + mstrResult.children[i].element.formValues.DISPLAY_BROWSE + " es " + mstrResult.children[i].metrics[metric].fv);}
}
                
            // }
               /* await this.luisRecognizer.recognize(context).then(res=>{
               
                    const top =  LuisRecognizer.topIntent(res);
                    await context.sendActivity(top)}).catch(error => console.log(error.message));
            }*/

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.QnABot = QnABot;
