import { GetCurrentUser, SetCurrentUser } from "./domain.js";
import {
  AddCrop,
  GetCrops,
  CalculateGrowthStage,
  DeleteCrop,
  GetHourlyTemperatureForLocation,
} from "./service.js";

let draggedCard = null;

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
  cropCardElement.draggable = true;

    const displayImageElement = document.createElement("img");
    displayImageElement.src = crop.picture;
    displayImageElement.width = 250;
    displayImageElement.alt = "crop-image";
    cropCardElement.appendChild(displayImageElement);

  const cropTypeTextElement = document.createElement("h2");
  cropTypeTextElement.textContent = crop.cropType;
  cropTypeTextElement.classList.add("crop-heading")
  cropCardElement.appendChild(cropTypeTextElement);

    const fieldLocationTextElement = document.createElement("span");
  fieldLocationTextElement.textContent = crop.fieldLocation + ` (${crop.plantingDate})`;
  fieldLocationTextElement.classList.add("crop-location")
  cropCardElement.appendChild(fieldLocationTextElement);

  const quantityTextElement = document.createElement("p");
  quantityTextElement.textContent = "Quantity: " + crop.quantity;
  cropCardElement.appendChild(quantityTextElement);

  const weather = await GetHourlyTemperatureForLocation(crop.fieldLocation);

  const weatherElevationElement = document.createElement("p");
  weatherElevationElement.textContent = "Elevation: " + weather.elevation + " m";
  cropCardElement.appendChild(weatherElevationElement);

  const weatherTemperatureElement = document.createElement("p");
  weatherTemperatureElement.textContent = "Temperature: " + weather.firstHourTemperature + weather.unit;
  cropCardElement.appendChild(weatherTemperatureElement);

  const wateringReminder = calculateWateringReminder(crop);
  if (wateringReminder) {
    const wateringReminderTextElement = document.createElement("p");
    wateringReminderTextElement.textContent = wateringReminder;
    cropCardElement.appendChild(wateringReminderTextElement);
  }

  const growthStage = CalculateGrowthStage(crop.plantingDate);
  const growthStageTextElement = document.createElement("p");
  growthStageTextElement.classList.add("growth-stage-text");
  growthStageTextElement.textContent = growthStage.stage + " stage";
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
  
  const progressPercentTextElement = document.createElement("span");
  progressPercentTextElement.classList.add("progress-percent-text");
  progressPercentTextElement.textContent = Math.round(growthStage.percentage) + "%";
  progressBarContainerElement.appendChild(progressPercentTextElement);

  cropCardElement.appendChild(progressBarContainerElement);

  const deleteButtonElement = document.createElement("button");
  deleteButtonElement.type = "button";
  deleteButtonElement.textContent = "Delete";
  deleteButtonElement.classList.add("delete-button");
  deleteButtonElement.addEventListener("click", async () => {
    await DeleteCrop(crop.id);
    await onDeleteSuccess();
  });
  cropCardElement.appendChild(deleteButtonElement);

  cropCardElement.addEventListener("dragstart", (e) => {
    draggedCard = cropCardElement;
    cropCardElement.classList.add("dragging");
  });

  cropCardElement.addEventListener("dragend", (e) => {
    cropCardElement.classList.remove("dragging");
    draggedCard = null;
  });

  cropCardElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedCard && draggedCard !== cropCardElement) {
      cropCardElement.parentElement.insertBefore(draggedCard, cropCardElement);
    }
  });

  cropCardElement.addEventListener("drop", (e) => {
    e.preventDefault();
  });

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
    const crops = await GetCrops(username, {
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
    SetCurrentUser(name);
    window.location.href = `dashboard.html?name=${encodeURIComponent(name)}`;
  });
};

const initDashboardPage = async () => {
  const dashboardPageElement = document.getElementById("dashboardPage");
  const username = getUserFromQueryString();
  SetCurrentUser(username);

  const dashboardTitleElement = document.getElementById("dashboardTitle");
  const addCropFormElement = document.getElementById("addCropForm");
  const imageInputElement = document.getElementById("imageInput");
  const cardsContainerElement = document.getElementById("cardsContainer");
  const filterCropNameInputElement = document.getElementById("filterCropName");
  const filterQuantityInputElement = document.getElementById("filterQuantity");
  const logoutButtonElement = document.getElementById("logoutButton");
  const addCropButtonElement = document.getElementById("addCrop");
  const addCropModalElement = document.getElementById("popup-form");
  const closeButtonElement = document.querySelector(".close-button");

  dashboardTitleElement.textContent = `Welcome ${username}!`;

  addCropButtonElement.addEventListener("click", () => {
    addCropModalElement.classList.add("active");
  });

  closeButtonElement.addEventListener("click", () => {
    addCropModalElement.classList.remove("active");
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

    await AddCrop(cropData);
    addCropFormElement.reset();
    addCropModalElement.classList.remove("active");
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

if (document.getElementById("loginForm")) {
  initLoginPage();
}

if (document.getElementById("dashboardPage")) {
  initDashboardPage();
}

