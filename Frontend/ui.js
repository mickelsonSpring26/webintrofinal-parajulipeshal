import { GetCurrentUser, SetCurrentUser } from "./domain.js";
import {
  addCrop,
  getCrops,
  calculateGrowthStage,
  deleteCrop,
} from "./service.js";


const setUserInQueryString = () => {
  const user = GetCurrentUser();
  const url = new URL(window.location);
  url.searchParams.set("name", user);
  history.pushState(null, "", url);
};
const loginUserFromQueryString = () => {
  const url = new URL(window.location);
  const currentUser = url.searchParams.get("name") || "";
  SetCurrentUser(currentUser);
};
const renderForm = () => {
  const formElement = document.createElement("form");
  const nameLabelElement = document.createElement("label");
  const inputElement = document.createElement("input");
  const breakElement = document.createElement("br");
  const submitElement = document.createElement("button");

  nameLabelElement.textContent = "Name";
  nameLabelElement.appendChild(inputElement);
  submitElement.textContent = "submit";
  formElement.replaceChildren(nameLabelElement, breakElement, submitElement);

  formElement.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = inputElement.value;
    SetCurrentUser(name);
    renderWholePage();
    setUserInQueryString();
    console.log(name);
  });

  const containerElement = document.getElementById("pageContentContainer");
  containerElement.replaceChildren(formElement);
};
const renderContentPage = () => {
  const username = GetCurrentUser();
  const containerElement = document.getElementById("pageContentContainer");
  containerElement.replaceChildren();

  //this is heading part

  const headingElement = document.createElement("h2");
  headingElement.textContent = username + "'s Dashboard";
  containerElement.appendChild(headingElement);

  // this is the form to add the crops
  const formTitleElement = document.createElement("h3");
  formTitleElement.textContent = "Add a Crop";
  containerElement.appendChild(formTitleElement);

  const formElement = document.createElement("form");

  const cropTypeLabelElement = document.createElement("label");
  cropTypeLabelElement.textContent = "Crop Type: ";
  const cropTypeSelectElement = document.createElement("select");
  cropTypeSelectElement.name = "cropType";
  cropTypeSelectElement.required = true;
  const options = ["", "Wheat", "Rice", "Corn", "Barley", "Soybean", "Cotton"];
  options.forEach((opt) => {
    const optionElement = document.createElement("option");
    optionElement.value = opt;
    optionElement.textContent = opt || "Select a crop";
    cropTypeSelectElement.appendChild(optionElement);
  });
  cropTypeLabelElement.appendChild(cropTypeSelectElement);
  formElement.appendChild(cropTypeLabelElement);
  formElement.appendChild(document.createElement("br"));
  formElement.appendChild(document.createElement("br"));

  const plantingDateLabelElement = document.createElement("label");
  plantingDateLabelElement.textContent = "Planting Date: ";
  const plantingDateInputElement = document.createElement("input");
  plantingDateInputElement.type = "date";
  plantingDateInputElement.name = "plantingDate";
  plantingDateInputElement.required = true;
  plantingDateLabelElement.appendChild(plantingDateInputElement);
  formElement.appendChild(plantingDateLabelElement);
  formElement.appendChild(document.createElement("br"));
  formElement.appendChild(document.createElement("br"));

  const fieldLocationLabelElement = document.createElement("label");
  fieldLocationLabelElement.textContent = "Field Location: ";
  const fieldLocationInputElement = document.createElement("input");
  fieldLocationInputElement.type = "text";
  fieldLocationInputElement.name = "fieldLocation";
  fieldLocationInputElement.required = true;
  fieldLocationLabelElement.appendChild(fieldLocationInputElement);
  formElement.appendChild(fieldLocationLabelElement);
  formElement.appendChild(document.createElement("br"));
  formElement.appendChild(document.createElement("br"));

  const quantityLabelElement = document.createElement("label");
  quantityLabelElement.textContent = "Quantity: ";
  const quantityInputElement = document.createElement("input");
  quantityInputElement.type = "number";
  quantityInputElement.name = "quantity";
  quantityInputElement.min = "1";
  quantityInputElement.required = true;
  quantityLabelElement.appendChild(quantityInputElement);
  formElement.appendChild(quantityLabelElement);
  formElement.appendChild(document.createElement("br"));
  formElement.appendChild(document.createElement("br"));

  const wateringLabelElement = document.createElement("label");
  wateringLabelElement.textContent = "Water every: ";
  const wateringSelectElement = document.createElement("select");
  wateringSelectElement.id="selection-day"
  wateringSelectElement.name = "wateringFrequencyDays";
  const wateringOptions = [
    { value: "", label: "No reminder" },
    { value: "1", label: "Every day" },
    { value: "2", label: "Every 2 days" },
    { value: "3", label: "Every 3 days" },
    { value: "7", label: "Every week" },
    { value: "14", label: "Every 2 weeks" },
  ];
  wateringOptions.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    wateringSelectElement.appendChild(optionElement);
  });
  wateringLabelElement.appendChild(wateringSelectElement);
  formElement.appendChild(wateringLabelElement);
  formElement.appendChild(document.createElement("br"));
  formElement.appendChild(document.createElement("br"));

  const pictureLabelElement = document.createElement("label");
  pictureLabelElement.textContent = "Upload Picture: ";
  const pictureInputElement = document.createElement("input");
  pictureInputElement.type = "file";
  pictureInputElement.id = "imageInput";
  pictureLabelElement.appendChild(pictureInputElement);
  formElement.appendChild(pictureLabelElement);
  formElement.appendChild(document.createElement("br"));
  formElement.appendChild(document.createElement("br"));

  const submitButtonElement = document.createElement("button");
  submitButtonElement.type = "submit";
  submitButtonElement.textContent = "Add Crop";
  formElement.appendChild(submitButtonElement);

  const resetButtonElement = document.createElement("button");
  resetButtonElement.type = "button";
  resetButtonElement.textContent = "Reset";
  resetButtonElement.classList.add("reset-button");
  resetButtonElement.addEventListener("click", () => {
    formElement.reset();
  });
  formElement.appendChild(resetButtonElement);

  formElement.addEventListener("submit", async (e) => {
    e.preventDefault();
    const imageInput = document.getElementById("imageInput");
    const imageData = imageInput.files[0];
//convering img into base64 string
    let imageDataUrl = "";
    if (imageData) {
      imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(imageData);
      });
    }

    const cropData = {
      userName: username,
      cropType: cropTypeSelectElement.value,
      plantingDate: plantingDateInputElement.value,
      fieldLocation: fieldLocationInputElement.value,
      quantity: quantityInputElement.value,
      wateringFrequencyDays: wateringSelectElement.value,
      picture: imageDataUrl,
    };

    await addCrop(cropData);
    formElement.reset();
    displayCrops(username, containerElement);
  });

  containerElement.appendChild(formElement);

  displayCrops(username, containerElement);

  const breakElement = document.createElement("br");
  containerElement.appendChild(breakElement);
  containerElement.appendChild(breakElement);
  const logoutButtonElement = document.createElement("button");
  logoutButtonElement.textContent = "logout";
  containerElement.appendChild(logoutButtonElement);
  logoutButtonElement.addEventListener("click", () => {
    SetCurrentUser("");
    setUserInQueryString();
    renderWholePage();
  });
};


const calculateWateringReminder = (crop) => {
  const today = new Date();
  const planted = new Date(crop.plantingDate);
 const wateringSelectElement= document.getElementById("selection-day")
 const wateringFrequencyDays= wateringSelectElement.value

  const daysSincePlanting = Math.floor((today - planted) / 86400000); 
  const daysLeft = wateringFrequencyDays - (daysSincePlanting % crop.wateringFrequencyDays);

  return `Water in ${daysLeft} day(s)`;
};

const displayCrops = async (username, containerElement) => {
  const existingCropsDivElement =
    containerElement.querySelector("#cropsDisplay");
  if (existingCropsDivElement) {
    existingCropsDivElement.replaceChildren();
  }

  const crops = await getCrops(username);

  if (crops.length > 0) {
    const cropsDivElement = document.createElement("div");
    cropsDivElement.id = "cropsDisplay";

    const cropsTitleElement = document.createElement("h3");
    cropsTitleElement.textContent = "Your Crops";
    cropsDivElement.appendChild(cropsTitleElement);

    crops.forEach((crop) => {
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

      const wateringReminder = calculateWateringReminder(crop);
      if (wateringReminder) {
        const wateringReminderTextElement = document.createElement("p");
        wateringReminderTextElement.className = wateringReminder.statusClassName;
        wateringReminderTextElement.textContent = wateringReminder.statusText;
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
        displayCrops(username, containerElement);
      });
      cropCardElement.appendChild(deleteButtonElement);

      cropsDivElement.appendChild(cropCardElement);
    });

    containerElement.appendChild(cropsDivElement);
  }
};

const renderWholePage = () => {
  const user = GetCurrentUser();
  if (!user) {
    renderForm();
  } else {
    renderContentPage();
  }
};
loginUserFromQueryString();
renderWholePage();
