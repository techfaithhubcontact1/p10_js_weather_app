// dom element select
const cityInput = document.querySelector('.city_name');
const searchBtn = document.querySelector('.search_btn');

const weatherElm = document.querySelector(".weather_box");
const noCityElm = document.querySelector(".no_city");
const localCity = noCityElm.querySelector(".no_city .local_city");
const paraElm = noCityElm.querySelector(".no_city p");
let cityTextElm = weatherElm.querySelector(".city_text");
const dateTextElm = weatherElm.querySelector(".date_text");
const weatherImgElm = weatherElm.querySelector(".weather_img_elm");
const tempTextElm = weatherElm.querySelector(".temp_text");
const contdTextElm = weatherElm.querySelector(".condition_text");
const humValElm = weatherElm.querySelector(".humidity_value");
const windValElm = weatherElm.querySelector(".wind_speed_value");
let forecastSection = weatherElm.querySelector(".forecast_section");

// get city input on click
searchBtn.addEventListener("click", ()=>{
     if(cityInput.value != ""){
          displayWeather(cityInput.value);
          cityInput.value = "";
     }
});
// get city input on key down event
cityInput.addEventListener("keydown", (e)=>{
     if(cityInput.value != "" && e.key === "Enter" ){
          displayWeather(cityInput.value);
          cityInput.value = "";
     }
});

function getCurrentDate(){
     let currentDate = new Date();
     const opts = {
          day:"2-digit",
          month:"short"
     }
     let dateMonth = currentDate.toLocaleDateString("en-GB", opts)
     let year = currentDate.toString().slice(10, 15);

     dateTextElm.innerText = `${dateMonth}. ${year}`;
}
getCurrentDate();

const apiKey = `4237de05491fc892040dcf624f666ad2`;

//get weather data 
async function getWeatherData(endPoint, city){
     try {
          const apiURL = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
          let res = await fetch(apiURL);
          return res.json();
          
     } catch (error) {
          console.log("error..", error);
     }
};

// display weather data
async function displayWeather(city){
     let currWeather = await getWeatherData("weather",city);
     if(currWeather.cod === 200){
          const {name, main:{temp, humidity}, wind:{speed}, weather:[{main}]} = currWeather;
          cityTextElm.innerText = name;
          cityName = name;
          tempTextElm.innerText = `${Math.round(temp)} °C`;
          contdTextElm.innerText = main;
          humValElm.innerText = humidity + "%";
          windValElm.innerText = `${speed} km/h`;

          forecastData(city);
          let weatherURL = getWeatherIcon(main);
          weatherImgElm.src = weatherURL;

          weatherElm.classList.remove("hide");
          noCityElm.classList.add("hide");
     }
     if(currWeather.cod !== 200){
          weatherElm.classList.add("hide");
          noCityElm.classList.remove("hide");
          paraElm.innerText = "That's Why " + currWeather.message;
     }
};

// get weather Images
function getWeatherIcon(weather){
     if(weather === "Clear") return "img/clear.png";
     if(weather === "Clouds") return "img/clouds.png";
     if(weather === "Rain") return "img/rain.png";
     if(weather === "Drizzle") return "img/drizzle.png";
     if(weather === "Mist") return "img/mist.png";
     return "img/light_clouds.png"
};

// get forecast weather data 
let maxTemp = "";
async function forecastData(city){
     forecastSection.innerHTML = "";
     let forecastWeather  = await getWeatherData("forecast", city);
     forecastWeather.list.forEach((forecast)=>{
          if(forecast.dt_txt.includes("00:00:00")){
               displayForecast(forecast);
          }
          if(forecast.dt_txt.includes("12:00:00")){
               maxTemp = Math.round(forecast.main.temp);
          }
     });
};

// show forecast weather data 
function displayForecast(forecastDetail){
     let weatherURL = getWeatherIcon(forecastDetail.weather[0].main);
     let currYear = forecastDetail.dt_txt.slice(0, 4);
     let currMonth = forecastDetail.dt_txt.slice(4, 7);
     let currDate = forecastDetail.dt_txt.slice(8, 10);
     let forecastElm = `
          <div class="forecast_item">
               <h5 class="forcast_date">${currDate}${currMonth}-${currYear}</h5>
               <img src=${weatherURL} class="my_img">
               <h5 class="forecast_temp">${Math.round(forecastDetail.main.temp)}°C - ${maxTemp}°C</h5>
          </div>
     `;
     forecastSection.innerHTML += forecastElm;
};

// for get current location 
const geoAPIKey = `bdeb7d9fd1384d698a5927ddfa303763`;
let baseURL = `https://api.opencagedata.com/geocode/v1/json`;
async function fetchCurrentLocation(latitude, longitude){
     let query = `${latitude}, ${longitude}`;
     let mainURL = `${baseURL}?q=${query}&key=${geoAPIKey}`;
     let response = await fetch(mainURL);
     return response.json();
};

// found location 
let lCity = "";
navigator.geolocation.getCurrentPosition( async (position)=>{
     let {latitude, longitude} = position.coords;
     let addr = await fetchCurrentLocation(latitude, longitude);
     lCity = addr.results[0].components.city;
     displayWeather(lCity);
},  (err)=>{
     console.log("err..", err);
     displayWeather("Indore");
});

localCity.addEventListener("click", ()=>{
     displayWeather(lCity?lCity:"Indore");
     noCityElm.classList.add("hide");
     weatherElm.classList.remove("hide");
});