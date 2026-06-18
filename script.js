// ── Config ──────────────────────────────────────────────────────────────
// Get your own free key at https://www.weatherapi.com/signup.aspx
const API_KEY = "ce3aea292b294b1dbd1222852261806";

// ── DOM refs ─────────────────────────────────────────────────────────────
const btn      = document.getElementById("fetch-btn");
const select    = document.getElementById("city-select");
const errorMsg  = document.getElementById("error-msg");
const result    = document.getElementById("result");
const banner    = document.getElementById("result-banner");

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Map a WeatherAPI condition code to a banner theme class.
 * Codes: https://www.weatherapi.com/docs/weather_conditions.json
 */
function getBannerTheme(conditionCode, isDay) {
  if ([1000].includes(conditionCode)) return isDay ? "sunny" : "cloudy";
  if ([1003, 1006, 1009].includes(conditionCode)) return "cloudy";
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) return "rainy";
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) return "snowy";
  return "cloudy";
}

function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.classList.toggle("loading", isLoading);
  btn.querySelector(".btn-label").textContent = isLoading ? "Fetching…" : "Get Weather";
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add("visible");
  result.classList.remove("visible", "fade-in");
}

function clearError() {
  errorMsg.classList.remove("visible");
}

// ── Main fetch function ──────────────────────────────────────────────────
async function fetchWeather() {
  const city = select.value.trim();

  // Input validation
  if (!city) {
    showError("Please select a city first.");
    return;
  }

  clearError();
  setLoading(true);

  // Build request URL
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

  try {
    const response = await fetch(url);

    // Handle non-ok HTTP status
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP error ${response.status}`);
    }

    const data = await response.json();

    // ── Populate DOM with API response ──
    const loc = data.location;
    const cur = data.current;

    document.getElementById("city-name").textContent      = loc.name;
    document.getElementById("country-name").textContent   = `${loc.region ? loc.region + ", " : ""}${loc.country}`;
    document.getElementById("condition-text").textContent = cur.condition.text;
    document.getElementById("temp-c").innerHTML           = `${Math.round(cur.temp_c)}<span class="unit">°C</span>`;
    document.getElementById("feels-like").innerHTML       = `${Math.round(cur.feelslike_c)}<span class="unit">°C</span>`;
    document.getElementById("humidity").innerHTML         = `${cur.humidity}<span class="unit">%</span>`;
    document.getElementById("wind-speed").innerHTML       = `${Math.round(cur.wind_kph)}<span class="unit">km/h</span>`;

    // Weather icon — WeatherAPI returns URLs starting with "//"
    const iconSrc = cur.condition.icon.startsWith("//")
      ? "https:" + cur.condition.icon
      : cur.condition.icon;
    document.getElementById("weather-icon").src = iconSrc;
    document.getElementById("weather-icon").alt = cur.condition.text;

    // Apply banner gradient theme based on condition
    const theme = getBannerTheme(cur.condition.code, cur.is_day === 1);
    banner.className = `result-banner ${theme}`;

    // Reveal result card with fade-in
    result.classList.add("visible");
    void result.offsetWidth; // force reflow so the transition fires
    result.classList.add("fade-in");

  } catch (err) {
    showError("Could not fetch weather: " + err.message);
  } finally {
    setLoading(false);
  }
}

// ── Event listeners ─────────────────────────────────────────────────────
btn.addEventListener("click", fetchWeather);

// Keyboard support: pressing Enter while the dropdown is focused also triggers fetch
select.addEventListener("keydown", function (e) {
  if (e.key === "Enter") fetchWeather();
});
