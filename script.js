import { keys } from "./confidentials.js";

const search = document.querySelector(".search-icon");
const close = document.querySelector(".close-icon");
const inputField = document.querySelector(".inputBox__inputfield");
const citiesContainer = document.querySelector(".searchbar__cities");
let cityBtns;
let cityWrappers;
const weatherContainer = document.querySelector(".weatherContainer__grid");
const startBtn = document.querySelector(".startBtn");

search.addEventListener("click", () => {
  search.classList.add("search-icon--openSB");
  close.classList.add("close-icon--openSB");
  inputField.classList.add("inputBox__inputfield--open");
  if (!citiesContainer.hasChildNodes()) {
    citiesContainer.style.border = "none";
  }
  setTimeout(function () {
    citiesContainer.classList.remove("searchbar__cities--deactivated");
  }, 500);
});

close.addEventListener("click", () => {
  citiesContainer.classList.add("searchbar__cities--deactivated");
  setTimeout(function () {
    search.classList.remove("search-icon--openSB");
    close.classList.remove("close-icon--openSB");
    inputField.classList.remove("inputBox__inputfield--open");
  }, 200);
});

//Adding new Cities
inputField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const newCity = inputField.value;
    const newCityContainer = `<div class="cityWrapper">
    <button class="city">${newCity}</button>
    <i class="uil uil-trash-alt trash-icon trash-icon--closed"></i>
  </div>`;
    citiesContainer.insertAdjacentHTML("beforeend", newCityContainer);
    inputField.value = null;
  }
});

citiesContainer.addEventListener("click", (cc) => {
  console.log(cc.target);
  const clicked = cc.target;
  if (clicked.classList.contains("city")) {
    console.log("city button clicked");
    console.log("here is the Sibling");
    console.log(clicked.nextElementSibling);
    const trashIcon = clicked.nextElementSibling;
    trashIcon.classList.toggle("trash-icon--closed");
  }
  if (clicked.classList.contains("trash-icon")) {
    console.log("icon Clicked");
    const parentElement = clicked.parentElement;
    console.log(parentElement);
    citiesContainer.removeChild(parentElement);
  }
});

// API Picture call
async function getCityImage(userCity) {
  console.log("Image function started");
  let auth_key = btoa(`${keys.roadgoat.key}:${keys.roadgoat.secretKey}`);
  const endpoint = new URL(
    `https://api.roadgoat.com/api/v2/destinations/auto_complete?q=${userCity}`
  );
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Basic ${auth_key}`,
    },
  });
  const data = await response.json();
  console.log(data);
  if (!data.data[0]) {
    throw new Error("Can not find the desired city");
  }
  const {
    data: [
      {
        attributes: { longitude, latitude },
      },
    ],
    included: [
      {
        attributes: {
          image: { full: picture },
        },
      },
    ],
  } = data;
  console.log("check");
  console.log(longitude, latitude, picture);

  console.log("checkover");
  const dataArray = [picture, longitude, latitude];
  console.log(dataArray);
  return dataArray;
}

async function getWeatherData(latitude, longitude) {
  const endpoint = new URL(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${keys.openweatherMap.key}`
  );
  const response = await fetch(endpoint);
  //console.log(response);
  const data = await response.json();
  console.log(data);
  const temp = data.main.temp;
  const tempMin = data.main.temp_min;
  const tempMax = data.main.temp_max;
  const finalData = [temp, tempMin, tempMax];
  return finalData;
}

async function createHtml(picture, temperature, maximumTemp, minimumTemp) {
  const html = `<div class="grid__item">
  <img class = "grid__item--img" src="${picture}" alt="">
  <img  class ="grid__item--emoji grid__item--sun" src= "img/sun.png" alt="">
  <img  class ="grid__item--emoji grid__item--up"src="img/upTriangle.png" alt="">
  <img  class ="grid__item--emoji grid__item--down"src="img/downTriangle.png" alt="">
  <p class="grid__item--info grid__item--temp"> ${temperature}° </p>
  <p class="grid__item--info grid__item--maxTemp">${maximumTemp}°</p>
  <p class="grid__item--info grid__item--minTemp">${minimumTemp}°</p>
</div>`;

  weatherContainer.insertAdjacentHTML("beforeend", html);
}

startBtn.addEventListener("click", function () {
  cityBtns = document.querySelectorAll(".city");
  cityWrappers = document.querySelectorAll(".cityWrapper");
  while (weatherContainer.childElementCount > 0) {
    weatherContainer.removeChild(weatherContainer.firstChild);
  }
  cityBtns.forEach(async (cb) => {
    let search = cb.innerHTML.toLowerCase();
    try {
      const [img, long, lat] = await getCityImage(search);
      const [temp, tempMin, tempMax] = await getWeatherData(lat, long);
      createHtml(img, temp, tempMax, tempMin);
    } catch (err) {
      console.log("an error has occured");
      console.log(err);
    }
  });
});
