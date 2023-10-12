/////////////////////////// socket with main server///////////////////////////



var GaugeTemp = Gauge(document.getElementById("gauge-TEMP"),{
	dialRadius: 40,
	dialStartAngle: 135,
	dialEndAngle: 45,
	value: 0,
	max: 100,
	min: 0,
	valueDialClass: "value",
	valueClass: "value-text",
	dialClass: "dial",
	gaugeClass: "gauge",
	showValue: true,
	gaugeColor: null,
	label: function(val) {return Math.round(val);} // returns a string label that will be rendered in the center
});

GaugeTemp.setValueAnimated(9,0.8)

var Gaugehum = Gauge(document.getElementById("gauge-hum"),{
	dialRadius: 40,
	dialStartAngle: 135,
	dialEndAngle: 45,
	value: 0,
	max: 100,
	min: 0,
	valueDialClass: "value",
	valueClass: "value-text",
	dialClass: "dial",
	gaugeClass: "gauge",
	showValue: true,
	gaugeColor: null,
	label: function(val) {return + Math.round(val);} // returns a string label that will be rendered in the center
});
Gaugehum.setValueAnimated(50, 5)

var Gaugesoil = Gauge(document.getElementById("gauge-soil"),{
	dialRadius: 40,
	dialStartAngle: 135,
	dialEndAngle: 45,
	value: 0,
	max: 100,
	min: 0,
	valueDialClass: "value",
	valueClass: "value-text",
	dialClass: "dial",
	gaugeClass: "gauge",
	showValue: true,
	gaugeColor: null,
	label: function(val) {return Math.round(val);} // returns a string label that will be rendered in the center
});
Gaugesoil.setValueAnimated(99, 5)

var gauges = {"hum": Gaugehum, "temp": GaugeTemp, "soil": Gaugesoil}

clouds_rain = document.getElementsByClassName('rainy-cloud')
for(i=0; i<clouds_rain.length; i++)
{
	clouds_rain[i].style.bottom = getRandomInt(i*50,50*(i+1))+'vh';
	if((i+1)%2)
	{
		clouds_rain[i].style.left = getRandomInt(0,15)+'vh';
		console.log(i)
	}
	else clouds_rain[i].style.right = getRandomInt(0,15)+'vh';
}

clouds_sun = document.getElementsByClassName('sunny-cloud')
for(i=0; i<clouds_sun.length; i++)
{
	clouds_sun[i].style.top = (2 + (i+1)%2*57)+'vh'
	clouds_sun[i].style.left = ((i+1)%2*57)+'vh'
}


socket = new WebSocket('ws://'+window.location.hostname+':7071')

socket.onmessage = function(event)
{
	message = JSON.parse(event.data)
	for(i = 0; i<message.length; i++){	
		topic = message[i].var
		value = message[i].val
		console.log(topic)
		if(topic == 'API')
		{ 
			API = true;
			API_Val = value;
			text_box = document.getElementById("API-description");
			text_box.style.opacity = 0;

			setTimeout(() => {
				text_box.innerHTML ="<h2>"+value+"</h2>";
				
				// Set the opacity of the new text to 1 to fade it in
				text_box.style.opacity = 1;
			  }, 500);
		} 
		else if(Object.keys(gauges).includes(topic))
		{
			gauges[topic].setValueAnimated(value)
		}
	if(API) handleAPI(API_Val);
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
  }

async function handleAPI(state)
{
	if(state.includes("sunny"))
	{
		document.getElementById("rain-svg").setAttribute('class', 'invisible')
		document.getElementById("sun-svg").setAttribute('class', 'sun-up')
		document.body.setAttribute('class', 'sunny')
		for(i=0, j=0; j<clouds_sun.length,i<clouds_rain.length; i++,j++)
		{
			clouds_rain[i].classList.add('invisible')
			clouds_sun[j].classList.remove('invisible')
		}
	}
	
	else if (state.includes("rainy")) 
	{
		document.body.setAttribute('class', 'rainy')
		document.getElementById("sun-svg").setAttribute('class', 'invisible')
		document.getElementById("rain-svg").setAttribute('class', 'raining')
		for(i=0, j=0; j<clouds_sun.length,i<clouds_rain.length; i++,j++)
		{
			clouds_rain[i].classList.remove('invisible')
			clouds_sun[j].classList.add('invisible')
		}

	}
}