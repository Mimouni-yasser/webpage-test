var express = require('express');
var mqtt = require('mqtt');
var websocket = require("ws")
var payload = [];


const brokerUrl = 'mqtt://irrigo.cloud.shiftr.io/'; // Replace with your broker's URL
const options = {
  username: 'irrigo', // MQTT username
  password: 'CarpetMan12', // MQTT password
};



//////////////////////////////HTTP server for the interface////////////////////////////////////
var app = express();
app.use(express.static('.'));

app.get('/', function (req, res) {
    res.sendFile(__dirname+"/index.html");
})



var server = app.listen(5001, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("app listening at http://%s:%s", host, port)
})




/////////////////////////////websocket server for interface data//////////////////////////////////

const clients = new Map(); //store connected clients

const wss = new websocket.Server({ port: 7071 });

wss.on('connection', (ws) => {
    const id = uuidv4();
    const metadata = { id};

    clients.set(ws, metadata);

    ws.on("message", (message) => {
      //add pump status to payload, if the pump status already exists, update it
      if(message == 'pump ON') value = "ON";
      else if(message == 'pump OFF') value = "OFF";
      topic = "pump"
      let topicExists = false;
      for (let i = 0; i < payload.length; i++) {
        if (payload[i].var === topic) {
            // Topic already exists, update its value
            payload[i].val = value;
            topicExists = true;
            break;
        }
      }
      if(!topicExists){
        payload.push(
        {
          var: topic,
          val: value
        })
      }

      mqtt_client.publish("irrigo/pump", value);

      //send payload to all clients
      const outbound = JSON.stringify(payload);
      notifyAll(outbound)
    })

    if(payload.length > 0)
      ws.send(JSON.stringify(payload))
});

wss.on("close", (ws)=>
{
  clients.delete(ws)
})

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

function notifyAll(outbound)
{
  [...clients.keys()].forEach((client) => {
    client.send(outbound);
  });
}



  ///////////////////////////mqtt server for data/////////////////////////////////////////////

var mqtt_client = mqtt.connect(brokerUrl, options);
mqtt_client.on("connect", () => {
    mqtt_client.subscribe("irrigo/#", (err) => {
        if (err) {
            console.log(err);
        }
        else
            console.log("mqtt client connected succesfully");
    });
});

mqtt_client.on("message", (topic, message) => {
    
  subtopic = topic.split('/')[1];
  value = message.toString();
  let topicExists = false;


  for (let i = 0; i < payload.length; i++) {
    if (payload[i].var === subtopic) {
        // Topic already exists, update its value
        payload[i].val = value;
        topicExists = true;
        break;
    }
  }
  
  if(!topicExists){
    payload.push(
    {
      var: subtopic,
      val: value
    })
    console.log(payload)
  }

  const outbound = JSON.stringify(payload);
  notifyAll(outbound)
});
