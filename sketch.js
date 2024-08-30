let client = mqtt.connect('wss://test.mosquitto.org:8081');
let _key = "CrazyTest";
var sets = 0;
var mm=0;
var createKeyTimeout;
var name = "Incognito";

function attBtnSend() {
  sendMessage(msgText.value);
  msgText.value="";
}

function getHref() {
  //var href = new URL(`https://abc.def/gi/x?mm=1&key=WSMNNFfr`);
  var href = new URL(document.location.toString());
  //var base = "https://abc.def/gi/x";
  var base = href.origin+href.pathname;
  var url = base+`?mm=${mm}&key=${_key}`;
  return encodeURI(url);
}

function pushToCon(label, body) {
  var d = document.createElement("div");
  d.innerHTML += (`
<div style="width: 96%; border: 1vh solid transparent;">
<div style="background: rgb(38, 39, 44); border-radius: 8px; box-shadow: rgba(255, 255, 255, 0.02) 0px 3px 0px 0px inset, rgba(0, 0, 0, 0.13) 0px 0px 10px 0px, rgba(0, 0, 0, 0.063) 0px -3px 1px 0px inset; width: 100%; padding: 1px;">
<div style="border:3px solid transparent;color:#919191;">
${label}
</div>
<div style="display: flex;border:3px solid transparent;color:#919191;">
${body}
</div>
</div>
</div>`);//align-items: center;justify-content: center;
  con.prepend(d);
}

function connected() {
  console.log("Connected");
  //document.body.append("<div width=100% height=90% style='background-color:blue'></div>");
  var url = getHref();
  //hrefToChat.innerHTML=url;
  hrefToChat.href=url;
  pushToCon("System", "You connected");
}

function error() {
  console.log("Error");
  pushToCon("System", "Error: not acept");
  msgText.readOnly=true;
}

function init(key) {
  client.unsubscribe(_key);
  client.subscribe(key);
  _key=key;
}

function send(val) {
  client.publish(_key,val);
}

function sendMessage(val) {
  send(`{"type":"message","val":"${Crypto.crypt(`{"name":"${name}","val":"${val}"}`, sets.crKey).replace(/"/g, '\\"')}"}`);
}

function getMessage(val) {
  if(sets!=0) {
    //console.log(Crypto.decrypt(val, sets.crKey));
    var msg=JSON.parse(Crypto.decrypt(val, sets.crKey));
    //console.log("Message",msg);
    pushToCon(msg.name, msg.val);
  }
}

//let state=0;
client.on('message', function (topic, message) { // message is Buffer
  //console.log(topic, message.toString());
  var data = JSON.parse(message.toString());
  switch(data.type) {
    case "message":getMessage(data.val);break;
    case "sets":{
      if(sets==0) {
        if(data.res==1) {
          sets=data.val;
          connected();
        } else error();
        clearTimeout(createKeyTimeout);
      }
      break;
    }
    case "getSets": {
      if(sets!=0){
        if(sets.gkc<mm || mm==-1) {
          sets.gkc++;
          //console.log("++");
          send(`{"type":"sets","res":1,"val":${JSON.stringify(sets)}}`);
        } else {
          send(`{"type":"sets","res":0}`);
        }
      }
      break;
    }
    default:break;
    
  }
});
//client.end();

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}



function start(_sets) {
  sets=_sets;
  if(sets==0) {
    send(`{"type":"getSets"}`);
    createKeyTimeout=setTimeout(() => {
      sets={crKey:makeid(32), gkc:0};connected();
    }, 1000);
  }
}

function purl(val) {
  name=prompt("Please put your nickname.");
  val=decodeURI(val);
  var search = val.slice(val.indexOf('?') + 1);
  var json;
  try {
    json = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
  } catch (e) {
    json={};
  }
  //return json;
  mm=json.mm;
  init(json.key);
  start(sets);
  if(_key==undefined) {_key=makeid(8);init(_key);}
  if(mm==undefined) mm=prompt("Please put max num of humans, or put -1 to accept all.");
}

function setup() {
  createCanvas(0, 0);
  //console.log("setup");
  //purl("https://abc.def/a/s/dfg?mm=1&key=qwerty1234");
  //init("qwerty12345");
  //console.log("setup end");
  //for(var i=0;i<15;i++)pushToCon("a", "bcd");
  purl(document.location.toString());
}

function draw() {
  background(220);
}