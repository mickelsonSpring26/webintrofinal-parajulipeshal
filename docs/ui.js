import { GetCurrentUser, SetCurrentUser } from "./domain.js";
import {
  addCrop,
  getCrops,
  calculateGrowthStage,
  deleteCrop,
  getHourlyTemperatureForLocation,
} from "./service.js";

const calculateWateringReminder = (crop) => {
  const frequency = Number(crop.wateringFrequencyDays);
  if (!frequency) {
    return "";
  }

  const today = new Date();
  const planted = new Date(crop.plantingDate);
  const daysSincePlanting = Math.floor((today - planted) / 86400000);
  const remainder = daysSincePlanting % frequency;
  const daysLeft = remainder === 0 ? frequency : frequency - remainder;

  return `Water in ${daysLeft} day(s)`;
};

const createCropCardElement = async (crop, onDeleteSuccess) => {
  const cropCardElement = document.createElement("div");
  cropCardElement.classList.add("crop-card");

  if (crop.picture) {
    const displayImageElement = document.createElement("img");
    displayImageElement.src = crop.picture;
    displayImageElement.width = 200;
    displayImageElement.alt = `${crop.cropType} in ${crop.fieldLocation}`;
    cropCardElement.appendChild(displayImageElement);
  }

  const cropTypeTextElement = document.createElement("p");
  cropTypeTextElement.textContent = "Crop Type: " + crop.cropType;
  cropCardElement.appendChild(cropTypeTextElement);

  const plantingDateTextElement = document.createElement("p");
  plantingDateTextElement.textContent =
    "Planting Date: " + crop.plantingDate;
  cropCardElement.appendChild(plantingDateTextElement);

  const fieldLocationTextElement = document.createElement("p");
  fieldLocationTextElement.textContent =
    "Field Location: " + crop.fieldLocation;
  cropCardElement.appendChild(fieldLocationTextElement);

  const quantityTextElement = document.createElement("p");
  quantityTextElement.textContent = "Quantity: " + crop.quantity;
  cropCardElement.appendChild(quantityTextElement);

  const weatherDetailsElement = document.createElement("div");
  weatherDetailsElement.classList.add("weather-details");

  const weatherTitleElement = document.createElement("h4");
  weatherTitleElement.textContent = "Weather";
  weatherDetailsElement.appendChild(weatherTitleElement);

  const weather = await getHourlyTemperatureForLocation(crop.fieldLocation);

  const weatherLocationElement = document.createElement("p");
  weatherLocationElement.textContent = "Location: " + weather.locationName;
  weatherDetailsElement.appendChild(weatherLocationElement);

  const weatherLatitudeElement = document.createElement("p");
  weatherLatitudeElement.textContent = "Latitude: " + weather.latitude;
  weatherDetailsElement.appendChild(weatherLatitudeElement);

  const weatherLongitudeElement = document.createElement("p");
  weatherLongitudeElement.textContent = "Longitude: " + weather.longitude;
  weatherDetailsElement.appendChild(weatherLongitudeElement);

  const weatherTimezoneElement = document.createElement("p");
  weatherTimezoneElement.textContent = "Timezone: " + weather.timezone;
  weatherDetailsElement.appendChild(weatherTimezoneElement);

  const weatherElevationElement = document.createElement("p");
  weatherElevationElement.textContent = "Elevation: " + weather.elevation + " m";
  weatherDetailsElement.appendChild(weatherElevationElement);

  const weatherTimeElement = document.createElement("p");
  weatherTimeElement.textContent = "Time: " + weather.firstHourTime;
  weatherDetailsElement.appendChild(weatherTimeElement);

  const weatherTemperatureElement = document.createElement("p");
  weatherTemperatureElement.textContent = "Temperature: " + weather.firstHourTemperature + weather.unit;
  weatherDetailsElement.appendChild(weatherTemperatureElement);

  cropCardElement.appendChild(weatherDetailsElement);

  const wateringReminder = calculateWateringReminder(crop);
  if (wateringReminder) {
    const wateringReminderTextElement = document.createElement("p");
    wateringReminderTextElement.textContent = wateringReminder;
    cropCardElement.appendChild(wateringReminderTextElement);
  }

  const growthStage = calculateGrowthStage(crop.plantingDate);
  const growthStageTextElement = document.createElement("p");
  growthStageTextElement.classList.add("growth-stage-text");
  growthStageTextElement.textContent = "Growth Stage: " + growthStage.stage;
  cropCardElement.appendChild(growthStageTextElement);

  const daysElapsedTextElement = document.createElement("p");
  daysElapsedTextElement.textContent =
    "Days Since Planting: " + growthStage.daysElapsed;
  cropCardElement.appendChild(daysElapsedTextElement);

  const progressBarContainerElement = document.createElement("div");
  progressBarContainerElement.classList.add("progress-bar-container");

  const progressBarElement = document.createElement("div");
  progressBarElement.classList.add("progress-bar");
  progressBarElement.style.width = growthStage.percentage + "%";

  progressBarContainerElement.appendChild(progressBarElement);
  cropCardElement.appendChild(progressBarContainerElement);

  const progressPercentTextElement = document.createElement("p");
  progressPercentTextElement.classList.add("progress-percent-text");
  progressPercentTextElement.textContent =
    "Progress: " + Math.round(growthStage.percentage) + "%";
  cropCardElement.appendChild(progressPercentTextElement);

  const deleteButtonElement = document.createElement("button");
  deleteButtonElement.type = "button";
  deleteButtonElement.textContent = "Delete";
  deleteButtonElement.classList.add("delete-button");
  deleteButtonElement.addEventListener("click", async () => {
    await deleteCrop(crop.id);
    await onDeleteSuccess();
  });
  cropCardElement.appendChild(deleteButtonElement);

  return cropCardElement;
};

const displayCrops = async (
  username,
  cardsContainerElement,
  filterCropNameInputElement,
  filterQuantityInputElement,
) => {
  const renderCards = async () => {
    cardsContainerElement.replaceChildren();

    const crops = await getCrops(username, {
      cropName: filterCropNameInputElement.value,
      quantity: filterQuantityInputElement.value,
    });

    for (const crop of crops) {
      const cropCardElement = await createCropCardElement(crop, renderCards);
      cardsContainerElement.appendChild(cropCardElement);
    }
  };

  filterCropNameInputElement.addEventListener("input", renderCards);
  filterQuantityInputElement.addEventListener("input", renderCards);

  await renderCards();
};

const getUserFromQueryString = () => {
  const url = new URL(window.location);
  return (url.searchParams.get("name") || "").trim();
};

const initLoginPage = () => {
  const loginFormElement = document.getElementById("loginForm");
  const nameInputElement = document.getElementById("nameInput");
  if (!loginFormElement || !nameInputElement) {
    return;
  }

  const currentUser = getUserFromQueryString();
  if (currentUser) {
    window.location.href = `dashboard.html?name=${encodeURIComponent(currentUser)}`;
    return;
  }

  loginFormElement.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInputElement.value.trim();
    if (!name) {
      return;
    }

    SetCurrentUser(name);
    window.location.href = `dashboard.html?name=${encodeURIComponent(name)}`;
  });
};

const initDashboardPage = async () => {
  const dashboardPageElement = document.getElementById("dashboardPage");
  if (!dashboardPageElement) {
    return;
  }

  const username = getUserFromQueryString();
  if (!username) {
    window.location.href = "index.html";
    return;
  }
  SetCurrentUser(username);

  const dashboardTitleElement = document.getElementById("dashboardTitle");
  const addCropFormElement = document.getElementById("addCropForm");
  const fieldLocationInputElement = document.getElementById("fieldLocation");
  const checkWeatherButtonElement = document.getElementById("checkWeatherButton");
  const weatherResultTextElement = document.getElementById("weatherResult");
  const imageInputElement = document.getElementById("imageInput");
  const cardsContainerElement = document.getElementById("cardsContainer");
  const filterCropNameInputElement = document.getElementById("filterCropName");
  const filterQuantityInputElement = document.getElementById("filterQuantity");
  const logoutButtonElement = document.getElementById("logoutButton");

  dashboardTitleElement.textContent = `${username}'s Dashboard`;

  checkWeatherButtonElement.addEventListener("click", async () => {
    const locationName = fieldLocationInputElement.value.trim();
    if (!locationName) {
      weatherResultTextElement.textContent = "Enter a location first.";
      return;
    }

    weatherResultTextElement.textContent = "Loading...";
    const weather = await getHourlyTemperatureForLocation(locationName);
    weatherResultTextElement.textContent = `${weather.locationName}: ${weather.firstHourTemperature}${weather.unit}`;
  });

  addCropFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageData = imageInputElement.files?.[0];
    let imageDataUrl = "";
    if (imageData) {
      imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(imageData);
      });
    }

    const formData = new FormData(addCropFormElement);
    const cropData = {
      userName: username,
      cropType: formData.get("cropType")?.toString() ?? "",
      plantingDate: formData.get("plantingDate")?.toString() ?? "",
      fieldLocation: formData.get("fieldLocation")?.toString() ?? "",
      quantity: formData.get("quantity")?.toString() ?? "",
      wateringFrequencyDays:
        formData.get("wateringFrequencyDays")?.toString() ?? "",
      picture: imageDataUrl,
    };

    await addCrop(cropData);
    addCropFormElement.reset();
    await displayCrops(
      username,
      cardsContainerElement,
      filterCropNameInputElement,
      filterQuantityInputElement,
    );
  });

  logoutButtonElement.addEventListener("click", () => {
    SetCurrentUser("");
    window.location.href = "index.html";
  });

  await displayCrops(
    username,
    cardsContainerElement,
    filterCropNameInputElement,
    filterQuantityInputElement,
  );
};

initLoginPage();
initDashboardPage();
