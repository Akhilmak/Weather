var cityInput = document.getElementById("searchCity");
var temperature;
var temperatureThreshold = document.getElementById("threshold");
var checkInterval;
var backgroundsList = [
  "day1.jpg",
  "day2.jpg",
  "day3.jpg",
  "day4.jpg",
  "day5.jpg",
  // "night1.jpg",
  // "night2.jpg",
  // "night3.jpg",
  // "night4.jpg",
  // "night5.jpg",
  "cloudy1.jpg",
  "cloudy2.jpg",
  "cloudy3.jpg",
  "cloudy4.jpg",
  "cloudy5.jpg",
  // "rainy1.jpg",
  // "rainy2.jpg",
  // "rainy3.jpg",
  // "rainy4.jpg",
  // "rainy5.jpg",
];

// Function to check temperature and send alert if necessary

// Function to set the threshold
function saveValues() {
  const cityInput = document.getElementById("searchCity").value;
  const thresholdInput = document.getElementById("threshold").value;

  localStorage.setItem("cityInput", cityInput);
  localStorage.setItem("thresholdInput", thresholdInput);
}

// Function to restore input values from localStorage
function restoreValues() {
  const cityInput = localStorage.getItem("cityInput");
  const thresholdInput = localStorage.getItem("thresholdInput");

  if (cityInput) {
    document.getElementById("searchCity").value = cityInput;
  }

  if (thresholdInput) {
    document.getElementById("threshold").value = thresholdInput;
  }
}

// Event listener for the reload button
document.getElementById("reloadButton").addEventListener("click", function () {
  saveValues(); // Save current input values
  location.reload(); // Reload the page
});

// Restore values when the page loads
window.onload = function () {
  restoreValues();
};

function checkTemperature() {
  if (temperature > parseFloat(temperatureThreshold.value)) {
    alert(
      `Alert! Current temperature (${temperature} °C) exceeds the set threshold (${temperatureThreshold.value} °C)!`
    );
  }
}
function startCheckingTemperature(interval) {
  // Clear any existing interval
  clearInterval(checkInterval);

  // Set a new interval to check temperature
  checkInterval = setInterval(function () {
    if (temperature !== undefined) {
      checkTemperature();
    }
  }, interval);
}
var randomBackground =
  backgroundsList[Math.floor(Math.random() * backgroundsList.length)];

document.body.style.background =
  "linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)) , url('media/" +
  randomBackground +
  "')";

cityInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    loader();
    function loader() {
      document.getElementById("locationName").innerHTML = "";
      document.getElementById("temperatureValue").innerHTML = "";
      document.getElementById("weatherType").innerHTML = "";

      const img1 = document.createElement("img");
      const img2 = document.createElement("img");
      const img3 = document.createElement("img");

      img1.id = "loader1";
      img2.id = "loader2";
      img3.id = "loader3";

      img1.src = "icons/loader.gif";
      img2.src = "icons/loader.gif";
      img3.src = "icons/loader.gif";

      const parentElement1 = document.getElementById("locationName");
      const parentElement2 = document.getElementById("temperatureValue");
      const parentElement3 = document.getElementById("weatherType");

      parentElement1.appendChild(img1);
      parentElement2.appendChild(img2);
      parentElement3.appendChild(img3);
    }

    var cityInputValue = cityInput.value;

    var apiKey = "822ea28fcae77f170e4cae3562fcf8ec"; // Default
    var unit = "metric";
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInputValue}&appid=${apiKey}&units=${unit}`;

    function celsiusToFahrenheit(celsius) {
      const fahrenheit = (celsius * 9) / 5 + 32;
      return fahrenheit.toFixed(2);
    }

    if (cityInputValue != "") {
      async function getWeather() {
        var response = await fetch(apiUrl);
        var data = await response.json();

        if (data.message != "city not found" && data.cod != "404") {
          var location = data.name;
          temperature = data.main.temp;

          var weatherType = data.weather[0].description;
          var realFeel = data.main.feels_like;
          var windSpeed = data.wind.speed;
          var windDirection = data.wind.deg;
          var visibility = data.visibility / 1000;
          var pressure = data.main.pressure;
          var maxTemperature = data.main.temp_max;
          var minTemperature = data.main.temp_min;
          var humidity = data.main.humidity;
          var sunrise = data.sys.sunrise;
          var sunset = data.sys.sunset;
          var fahrenheitTemperature = celsiusToFahrenheit(temperature);

          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${cityInputValue}&appid=${apiKey}`
          )
            .then((response) => response.json())
            .then((data) => {
              const forecastContainer =
                document.getElementById("forecast-container");

              forecastContainer.innerHTML = "";

              const dailyForecasts = {};
              data.list.forEach((entry) => {
                const dateTime = new Date(entry.dt * 1000);
                const date = dateTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                });
                if (!dailyForecasts[date]) {
                  dailyForecasts[date] = {
                    date: date,
                    icon: `https://openweathermap.org/img/w/${entry.weather[0].icon}.png`,
                    maxTemp: -Infinity,
                    minTemp: Infinity,
                    weatherType: entry.weather[0].main,
                  };
                }

                if (entry.main.temp_max > dailyForecasts[date].maxTemp) {
                  dailyForecasts[date].maxTemp = entry.main.temp_max;
                }
                if (entry.main.temp_min < dailyForecasts[date].minTemp) {
                  dailyForecasts[date].minTemp = entry.main.temp_min;
                }
              });

              Object.values(dailyForecasts).forEach((day) => {
                const forecastCard = document.createElement("div");
                forecastCard.classList.add("daily-forecast-card");

                forecastCard.innerHTML = `
        <p class="daily-forecast-date">${day.date}</p>
        <div class="daily-forecast-logo"><img class="imgs-as-icons" src="${
          day.icon
        }"></div>
        <div class="max-min-temperature-daily-forecast">
          <span class="max-daily-forecast">${Math.round(
            day.maxTemp - 273.15
          )}<sup>o</sup>C</span>
          <span class="min-daily-forecast">${Math.round(
            day.minTemp - 273.15
          )}<sup>o</sup>C</span>
        </div>
        <p class="weather-type-daily-forecast">${day.weatherType}</p>
      `;

                forecastContainer.appendChild(forecastCard);
              });
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });

          document.getElementById("locationName").innerHTML = location;
          document.getElementById("temperatureValue").innerHTML =
            temperature + "<sup>o</sup>C";
          checkTemperature();
          document.getElementById("temperatureValueFarenheit").innerHTML =
            fahrenheitTemperature + "<sup>o</sup>F";
          document.getElementById("weatherType").innerHTML = weatherType;
          document.getElementById("realFeelAdditionalValue").innerHTML =
            realFeel + "<sup>o</sup>C";
          document.getElementById("windSpeedAdditionalValue").innerHTML =
            windSpeed + " km/h";
          document.getElementById("windDirectionAdditionalValue").innerHTML =
            windDirection;
          document.getElementById("visibilityAdditionalValue").innerHTML =
            visibility + " km";
          document.getElementById("pressureAdditionalValue").innerHTML =
            pressure;
          document.getElementById("maxTemperatureAdditionalValue").innerHTML =
            maxTemperature + "<sup>o</sup>C";
          document.getElementById("minTemperatureAdditionalValue").innerHTML =
            minTemperature + "<sup>o</sup>C";
          document.getElementById("humidityAdditionalValue").innerHTML =
            humidity;
          document.getElementById("sunriseAdditionalValue").innerHTML = sunrise;
          document.getElementById("sunsetAdditionalValue").innerHTML = sunset;
          startCheckingTemperature(10000); // Check every 10 seconds
        } else {
          document.getElementById("locationName").innerHTML = "City Not Found";
          document.getElementById("temperatureValue").innerHTML = "";
          document.getElementById("weatherType").innerHTML = "";
        }
      }

      getWeather();
    } else
      document.getElementById("locationName").innerHTML =
        "Enter a city name...";
  }
});
