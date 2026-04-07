const userLocation = document.getElementById("userLocation");

const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feelslike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.querySelector(".city");

const Hvalue = document.getElementById("Hvalue");
const Wvalue = document.getElementById("Wvalue");
const SRValue = document.getElementById("SRValue");
const SSValue = document.getElementById("SSValue");
const Cvalue = document.getElementById("Cvalue");
const Pvalue = document.getElementById("Pvalue");
const Vvalue = document.getElementById("Vvalue");

const Forecast = document.querySelector(".Forecast");
const weatherIcon = document.querySelector(".weatherIcon");

let currentWeatherData = null; 
let tomorrowWeather = null;
const API_KEY = "your_api key ";


function findUserLocation() {

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${userLocation.value}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {

      if (data.cod !== 200) {
        alert(data.message);
        return;
      }

      currentWeatherData = data; // ✅ SAVE DATA

      // BASIC INFO
      city.innerHTML = data.name + ", " + data.sys.country;
      temperature.innerHTML = data.main.temp + "°C";
      feelsLike.innerHTML = "Feels like: " + data.main.feels_like + "°C";
      description.innerHTML = data.weather[0].description;

      // ICON
      weatherIcon.style.backgroundImage =
        `url('https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png')`;

      // DETAILS
      Hvalue.innerHTML = data.main.humidity + "%";
      Wvalue.innerHTML = data.wind.speed + " m/s";
      SRValue.innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      SSValue.innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      Cvalue.innerHTML = data.clouds.all + "%";
      Pvalue.innerHTML = data.main.pressure + " hPa";
      Vvalue.innerHTML = data.visibility / 1000 + " km";

      // AI Suggestion
      generateAISuggestion(data);

      // DATE
      updateDateTime();

      // FORECAST
      getForecast(data.coord.lat, data.coord.lon);
      tomorrowWeather = forecastData.list.find(item => {
  return item.dt_txt.includes("12:00:00") &&
         new Date(item.dt * 1000).getDate() === new Date().getDate() + 1;
});

    })
    .catch(err => console.error(err));
}


//  AI SUGGESTION
function generateAISuggestion(data) {

  let suggestion = "";
  const temp = data.main.temp;
  const weatherMain = data.weather[0].main.toLowerCase();
  const humidity = data.main.humidity;

  if (temp > 35) {
    suggestion = "🔥 It's very hot! Stay hydrated.";
  } else if (temp < 15) {
    suggestion = "🥶 It's cold! Wear warm clothes.";
  } else if (weatherMain.includes("rain")) {
    suggestion = "☔ Carry an umbrella!";
  } else if (humidity > 80) {
    suggestion = "💧 High humidity, may feel uncomfortable.";
  } else {
    suggestion = "🌤️ Weather looks pleasant!";
  }

  document.getElementById("aiSuggestion").innerHTML = suggestion;
}


//  DATE FUNCTION
function updateDateTime() {

  const now = new Date();

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);

  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  date.innerHTML = `${formattedDate} | ${hours}:${minutes} ${ampm}`;
}

setInterval(updateDateTime, 60000);


//  FORECAST FUNCTION
function getForecast(lat, lon) {

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(forecastData => {

      Forecast.innerHTML = "";

      const daily = forecastData.list
        .filter(item => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);

      daily.forEach(weather => {

        const date = new Date(weather.dt * 1000);
        const day = date.toLocaleDateString(undefined, { weekday: 'short' });

        const div = document.createElement("div");
        div.className = "forecast-card";

        div.innerHTML = `
          <div class="day">${day}</div>
          <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png"/>
          <div class="temp">${Math.round(weather.main.temp)}°C</div>
          <div class="desc">${weather.weather[0].description}</div>
        `;

        Forecast.appendChild(div);
      });

      
      tomorrowWeather = forecastData.list.find(item => {
        return item.dt_txt.includes("12:00:00") &&
               new Date(item.dt * 1000).getDate() === new Date().getDate() + 1;
      });

    });
}


function sendMessage() {

  const inputField = document.getElementById("chatInput");
  const input = inputField.value.toLowerCase();
  const chatBox = document.getElementById("chatResponse");

  if (!input) return;

  // Show user message
  chatBox.innerHTML += `<p><b>You:</b> ${input}</p>`;
  inputField.value = "";

  let reply = "";

  if (!currentWeatherData) {
    reply = "⚠️ Please search a city first!";
  } 
  else {
    const temp = currentWeatherData.main.temp;
    const weather = currentWeatherData.weather[0].main.toLowerCase();

    if (input.includes("weather") || input.includes("temperature")) {
      reply = `🌤️ Right now in ${currentWeatherData.name}, it's ${temp}°C with ${currentWeatherData.weather[0].description}.`;
    }

    else if (input.includes("humidity")) {
      reply = `💧 Humidity is ${currentWeatherData.main.humidity}%`;
    }

    else if (input.includes("wind")) {
      reply = `💨 Wind speed is ${currentWeatherData.wind.speed} m/s`;
    }

    else if (input.includes("pressure")) {
      reply = `🌡️ Pressure is ${currentWeatherData.main.pressure} hPa`;
    }

    else if (input.includes("visibility")) {
      reply = `👀 Visibility is ${currentWeatherData.visibility / 1000} km`;
    }

    else if (input.includes("rain") || input.includes("umbrella")) {
      reply = weather.includes("rain") 
        ? "☔ Yes, take an umbrella." 
        : "🌤️ No need for umbrella.";
    }

    else if (input.includes("hot")) {
      reply = temp > 30 
        ? "🔥 Yes, it's hot today. Stay hydrated!" 
        : "😊 The temperature is comfortable. Stay hydrated!";
    }

    else if (input.includes("cold")) {
      reply = temp < 20 
        ? "🥶 Yes, it's cold. Wear warm clothes." 
        : "🙂 Not very cold today.";
    }

    else if (input.includes("where to go") || input.includes("visit")) {
      if (weather.includes("rain")) {
        reply = "🏬 It's rainy 🌧️. Visit malls or cafes.";
      } else if (temp > 35) {
        reply = "🥵 Too hot! Try indoor places.";
      } else {
        reply = "🌴 Perfect weather! Visit Marine Drive, Gateway of India, Juhu Beach!";
      }
    }

    else if (input.includes("wear") || input.includes("clothes")) {
      if (temp > 35) {
        reply = "👕 Wear light clothes & sunglasses 😎";
      } else if (temp < 15) {
        reply = "🧥 Wear warm clothes!";
      } else {
        reply = "😊 Wear comfortable clothes.";
      }
    }

    else if (input.includes("advice") || input.includes("suggest")) {
      if (temp > 35) {
        reply = "💧 Drink water & avoid sun.";
      } else if (weather.includes("rain")) {
        reply = "☔ Carry an umbrella.";
      } else {
        reply = "🌤️ Great day to go outside!";
      }
    }
    else if (input.includes("tomorrow")) {

  if (!tomorrowWeather) {
    reply = "⚠️ Tomorrow data not available.";
  } else {

    const tTemp = tomorrowWeather.main.temp;
    const tWeather = tomorrowWeather.weather[0].main.toLowerCase();

    if (tWeather.includes("rain")) {
      reply = "☔ Tomorrow will be rainy. Don't forget your umbrella!";
    } 
    else if (tTemp > 30) {
      reply = "🔥 Tomorrow will be hot. Stay hydrated!";
    } 
    else if (tTemp < 20) {
      reply = "🥶 Tomorrow will be cold. Wear warm clothes!";
    } 
    else {
      reply = "🌤️ Tomorrow weather will be pleasant.";
    }
  }
}

    else if (input.includes("hi") || input.includes("hello")) {
      reply = "👋 Hello! Ask me about weather, travel, or advice.";
    }

    else {
      reply = "🤖 I can help with weather, advice & travel suggestions!";
    }
    
    
  }
  
  

  // Typing animation
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing";
  typingDiv.innerHTML = "<span></span><span></span><span></span>";
  chatBox.appendChild(typingDiv);

  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    typingDiv.remove();

    const msg = document.createElement("p");
    msg.innerHTML = `<b>AI:</b> ${reply}`;
    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);
}