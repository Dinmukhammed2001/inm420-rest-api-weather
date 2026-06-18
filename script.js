/* ============================================================
   weathernow — script.js
   inm420 rest api assignment

   makes one rest api call to weatherapi.com's "current weather"
   endpoint and renders the response into the dom. the user can
   either pick a preset city from the dropdown or type any city
   name into the text field — both feed the same api call.
   ============================================================ */

// get your own free key at https://www.weatherapi.com/signup.aspx
const API_KEY = "ce3aea292b294b1dbd1222852261806";

// ── dom references ─────────────────────────────────────────────────────
const btn        = document.getElementById("fetch-btn");
const citySelect = document.getElementById("city-select");
const cityInput  = document.getElementById("city-input");
const errorMsg   = document.getElementById("error-msg");
const result     = document.getElementById("result");
const banner     = document.getElementById("result-banner");

// ── helpers ──────────────────────────────────────────────────────────────

/**
 * maps a weatherapi condition code to a banner gradient theme.
 * full code list: https://www.weatherapi.com/docs/weather_conditions.json
 */
function getBannerTheme(conditionCode, isDay) {
  if (conditionCode === 1000) return isDay ? "sunny" : "cloudy";
  if ([1003, 1006, 1009].includes(conditionCode)) return "cloudy";
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) return "rainy";
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) return "snowy";
  return "cloudy";
}

// toggles the button between idle and loading visual states
function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.classList.toggle("loading", isLoading);
  btn.querySelector(".btn-label").textContent = isLoading ? "Fetching…" : "Get Weather";
}

// shows an error message and hides any previous result
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add("visible");
  result.classList.remove("visible", "fade-in");
}

function clearError() {
  errorMsg.classList.remove("visible");
}

/**
 * decides which location to search for.
 * the free-text input takes priority over the dropdown,
 * since typing a city is a more specific user action than
 * leaving a stale dropdown selection in place.
 */
function getSelectedCity() {
  const typed = cityInput.value.trim();
  if (typed) return typed;
  return citySelect.value.trim();
}

// ── main rest api call ──────────────────────────────────────────────────
async function fetchWeather() {
  const city = getSelectedCity();

  // basic input validation before calling the api
  if (!city) {
    showError("Please pick a city or type one in.");
    return;
  }

  clearError();
  setLoading(true);

  // build the request url with the user-supplied location as a param
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

  try {
    const response = await fetch(url);

    // weatherapi returns a json error body even on bad requests (e.g. unknown city)
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody?.error?.message || `Request failed (${response.status})`);
    }

    const data = await response.json();
    renderWeather(data);

  } catch (err) {
    showError("Could not fetch weather: " + err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * takes the parsed api response and writes every value into the dom.
 * this is the dom manipulation step that makes the page interactive —
 * no part of this content exists until the user triggers a search.
 */
function renderWeather(data) {
  const location = data.location;
  const current  = data.current;

  document.getElementById("city-name").textContent      = location.name;
  document.getElementById("country-name").textContent   = `${location.region ? location.region + ", " : ""}${location.country}`;
  document.getElementById("condition-text").textContent = current.condition.text;
  document.getElementById("temp-c").innerHTML            = `${Math.round(current.temp_c)}<span class="unit">°C</span>`;
  document.getElementById("feels-like").innerHTML        = `${Math.round(current.feelslike_c)}<span class="unit">°C</span>`;
  document.getElementById("humidity").innerHTML          = `${current.humidity}<span class="unit">%</span>`;
  document.getElementById("wind-speed").innerHTML        = `${Math.round(current.wind_kph)}<span class="unit">km/h</span>`;

  // weatherapi returns icon urls starting with "//" — needs a protocol prefix
  const iconUrl = current.condition.icon.startsWith("//")
    ? "https:" + current.condition.icon
    : current.condition.icon;
  const icon = document.getElementById("weather-icon");
  icon.src = iconUrl;
  icon.alt = current.condition.text;

  // recolour the banner gradient to match the current condition
  const theme = getBannerTheme(current.condition.code, current.is_day === 1);
  banner.className = `result-banner ${theme}`;

  // reveal the result card with a fade-in transition
  result.classList.add("visible");
  void result.offsetWidth; // force a reflow so the css transition actually fires
  result.classList.add("fade-in");
}

// ── event listeners ─────────────────────────────────────────────────────
btn.addEventListener("click", fetchWeather);

// pressing enter in either input field also triggers the search
citySelect.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchWeather(); });
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchWeather(); });

// typing a custom city clears any leftover dropdown selection,
// so getSelectedCity() always reflects what the user actually wants
cityInput.addEventListener("input", () => {
  if (cityInput.value.trim()) citySelect.value = "";
});

// picking from the dropdown clears any leftover typed text, same reasoning
citySelect.addEventListener("change", () => {
  if (citySelect.value) cityInput.value = "";
});