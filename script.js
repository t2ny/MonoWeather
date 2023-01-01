const searchBar = document.querySelector(".search-bar");
const searchBtn = document.querySelector(".search-btn");
const list = document.querySelector(".search-result-list");
const spinner = document.querySelector(".spinner");
const searchPage = document.querySelector(".search-wrapper");
const mainPage = document.querySelector("main");
const body = document.querySelector("body");
const darkModeBtn = document.querySelector(".dark-mode-btn");
const lightModeBtn = document.querySelector(".light-mode-btn");

searchBtn.addEventListener("click", getGeo);

searchBar.addEventListener("keypress", function(e) {
    if(e.key === "Enter") {
        getGeo();
    }
})
// Navigation bar search button
document.querySelector(".cancel-btn").addEventListener("click", function() {
    mainPage.style.display = "none";
    searchPage.style.display = "flex";
    searchBar.select();
})
// Turn on and off dark mode
darkModeBtn.addEventListener("click", function() {
    body.style.filter = "invert(100%)";
    lightModeBtn.style.display = "block";
    darkModeBtn.style.display = "none";
})

lightModeBtn.addEventListener("click", function() {
    body.style.filter = "none";
    darkModeBtn.style.display = "block";
    lightModeBtn.style.display = "none";
})

async function getGeo() {
    
    console.log(searchBar.value);
    // Clear the list
    list.innerHTML = "";

    if(searchBar.value == "") {
        const errorItem = document.createElement("li");
        errorItem.innerHTML = "Please enter a city.";
        errorItem.style.color = "black";
        list.appendChild(errorItem);
        searchBar.focus();
        return;
    }
    spinner.style.display = "block";

    const endpoint = new URL(`https://geocoding-api.open-meteo.com/v1/search?name=${searchBar.value}`);

    const response = await fetch(endpoint);

    if(response === 400) {
        alert("Error");
        return
    }

    const data = await response.json();

    spinner.style.display = "none";

    displayList(data);
}
// Display list of possible locations
function displayList(dataIn) {

    const data = dataIn;
    console.log(data.results);

    if(data.results == undefined) {
        const errorItem = document.createElement("li");
        errorItem.innerHTML = "Please try a different city.";
        list.appendChild(errorItem);
        searchBar.select();
        return;
    }

    for(let i=0; i<data.results.length; i++) {
        const listItem = document.createElement("li");
        listItem.id = i;
        // Refactored with a closure.
        listItem.onclick = getCoordinates(data);
        // listItem.onclick = function(e){getCoordinates(data, e)};
        listItem.innerHTML = `${data.results[i].name}, ${data.results[i].admin1 || "N/A"}, ${data.results[i].country}`
        list.appendChild(listItem);
    }

}
// Gets coordinates of location with target ID. Refactored with a closure.
function getCoordinates(dataIn) {
    return function(e) {
        const data = dataIn;
        let index = e.target.id;
        const coordArray = [];

        coordArray.push(data.results[index].latitude);
        coordArray.push(data.results[index].longitude);
        coordArray.push(data.results[index].name);

        console.log(coordArray);

        list.innerHTML = "";

        fetchWeather(coordArray, ["current_weather=true", "timezone=auto"], createView);
    }
}

async function fetchWeather(coordinatesIn, APIParams, callback) {

    let url = `https://api.open-meteo.com/v1/forecast?latitude=${coordinatesIn[0]}&longitude=${coordinatesIn[1]}`;

    APIParams.forEach(item => {
        url += `&${item}`;
    })

    const endpoint = new URL(url);

    spinner.style.display = "block";

    const response = await fetch(endpoint);

    if(response === 400) {
        alert("Error");
        return;
    }

    const data = await response.json();

    const locationName = coordinatesIn[2];

    spinner.style.display = "none";

    callback(data, locationName);
}
// Populate view with data
function createView(dataIn, locationNameIn) {

    const data = dataIn;
    const locationName = locationNameIn;

    searchPage.style.display = "none";
    // searchPage.style.top = "-100%";
    mainPage.style.display = "block";

    console.log(data);

    const txtItems = document.querySelectorAll(".info-container > p");

    txtItems[0].innerHTML = `City: <strong>${locationName}</strong>`;
    txtItems[1].innerHTML = `Latitude: ${data.latitude}`;
    txtItems[2].innerHTML = `Longitude: ${data.longitude}`;
    txtItems[3].innerHTML = `Wind: ${data.current_weather.windspeed} KM/H`;

    const weatherItems = document.querySelectorAll(".weather-container > *");

    // const iconCondition = getWeatherIcon("1", "2022-12-21T21:00");
    const iconCondition = getWeatherIcon(data.current_weather.weathercode, data.current_weather.time);
    console.log(iconCondition);
    
    weatherItems[0].style.backgroundImage = `url(${iconCondition[0]})`;
    weatherItems[1].innerHTML = `${Math.round(data.current_weather.temperature)}°C`;
    weatherItems[2].innerHTML = `${iconCondition[1]}`;   
}

function getWeatherIcon(weatherCodeIn, timeIn) {

    let code = weatherCodeIn;
    let time = new Date(timeIn);
    let hour = time.getHours();
    let icon = [];

    console.log(code);

    if(code == "0" && (hour < 6 || hour >= 18)) {
        return ["images/Night_Clear.svg", "Clear Sky"];
    }

    if((code == "1" || code == "2") && (hour < 6 || hour >= 18)) {
        return ["images/Night_Cloudy.svg", "Partly Cloudy"];
    }

    switch(code) {
        case 0:
            icon.push("images/Sunny.svg");
            icon.push("Clear Sky");
            break;
        case 1:
        case 2:
            icon.push("images/Partly_Cloudy.svg");
            icon.push("Partly Cloudy");
            break;
        case 3:
            icon.push("images/Cloudy.svg");
            icon.push("Overcast");
            break;
        case 45:
        case 48:
            icon.push("images/Fog.svg");
            icon.push("Fog");
            break;
        case 51:
        case 53:
        case 55:
            icon.push("images/Drizzle.svg");
            icon.push("Drizzle");
            break;
        case 56:
        case 57:
        case 66:
        case 67:
            icon.push("images/Freezing_Rain.svg");
            icon.push("Freezing Rain");
            break;
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            icon.push("images/Rain.svg");
            icon.push("Rain");
            break;
        case 71:
            icon.push("images/Flurries.svg");
            icon.push("Flurries");
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            icon.push("images/Snow.svg");
            icon.push("Snow");
            break;
        case 95:
        case 96:
        case 99:
            icon.push("images/Thunderstorm.svg");
            icon.push("Thunderstorm");
            break;
        default:
            icon.push("images/No_Image.svg");
            icon.push("Error");
    }

    return icon;
    
}