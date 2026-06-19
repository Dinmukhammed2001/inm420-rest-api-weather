// INM420 Rest API Assignment
// Weather App using WeatherAPI.com

// Sign up at https://www.weatherapi.com/signup.aspx to get your own free key
var apiKey = "ce3aea292b294b1dbd1222852261806";

// get references to the elements we need
var citySelect = document.getElementById("city-select");
var cityInput = document.getElementById("city-input");
var searchBtn = document.getElementById("search-btn");
var errorMessage = document.getElementById("error-message");
var weatherResult = document.getElementById("weather-result");

// when the button is clicked, run getWeather()
searchBtn.addEventListener("click", getWeather);

function getWeather() {

  // figure out which city to search for
  // if the user typed something, use that, otherwise use the dropdown
  var city = cityInput.value;
  if (city === "") {
    city = citySelect.value;
  }

  // make sure a city was actually chosen/typed
  if (city === "") {
    showError("Please select a city or type one in.");
    return;
  }

  // hide any old error and old result before searching again
  errorMessage.classList.remove("visible");
  weatherResult.classList.remove("visible");

  // build the API request url
  var url = "https://api.weatherapi.com/v1/current.json?key=" + apiKey + "&q=" + city + "&aqi=no";

  // call the API
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("City not found. Please try again.");
      }
      return response.json();
    })
    .then(function (data) {
      displayWeather(data);
    })
    .catch(function (error) {
      showError(error.message);
    });
}

// takes the data from the API and puts it into the page
function displayWeather(data) {

  var location = data.location;
  var current = data.current;

  document.getElementById("city-name").textContent = location.name;
  document.getElementById("country-name").textContent = location.country;
  document.getElementById("condition-text").textContent = current.condition.text;
  document.getElementById("temp-c").textContent = current.temp_c;
  document.getElementById("feels-like").textContent = current.feelslike_c;
  document.getElementById("humidity").textContent = current.humidity;
  document.getElementById("wind-speed").textContent = current.wind_kph;

  // the icon url from the API starts with "//" so we add "https:" in front
  var iconUrl = "https:" + current.condition.icon;
  document.getElementById("weather-icon").src = iconUrl;

  // show the result section
  weatherResult.classList.add("visible");
}

// shows an error message on the page
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("visible");
}