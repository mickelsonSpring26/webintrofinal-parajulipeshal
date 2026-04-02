import { GetCurrentUser, SetCurrentUser } from "./domain.js";
import { addCrop, getCrops } from "./service.js";

const setUserInQueryString = ()=>{
    const user= GetCurrentUser();
    const url= new URL(window.location)
    url.searchParams.set("name", user);
    history.pushState(null, '', url);
}
const loginUserFromQueryString= ()=>{
    const url = new URL(window.location)
    const currentUser= url.searchParams.get("name") || ""
    SetCurrentUser(currentUser)
}
const renderForm = () => {
  const formElement = document.createElement("form");
  const nameLabel = document.createElement("label");
  const inputElement = document.createElement("input");
  const breakElement = document.createElement("br");
  const submitElement = document.createElement("button");

  nameLabel.textContent = "Name";
  nameLabel.appendChild(inputElement);
  submitElement.textContent = "submit";
  formElement.replaceChildren(nameLabel, breakElement, submitElement);

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

  const heading = document.createElement("h2");
  heading.textContent = username + "'s Dashboard";
  containerElement.appendChild(heading);

  // this is the form to add the crops
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add a Crop";
  containerElement.appendChild(formTitle);

  const form = document.createElement("form");

  const cropTypeLabel = document.createElement("label");
  cropTypeLabel.textContent = "Crop Type: ";
  const cropTypeSelect = document.createElement("select");
  cropTypeSelect.name = "cropType";
  cropTypeSelect.required = true;
  const options = ["", "Wheat", "Rice", "Corn", "Barley", "Soybean", "Cotton"];
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt || "Select a crop";
    cropTypeSelect.appendChild(option);
  });
  cropTypeLabel.appendChild(cropTypeSelect);
  form.appendChild(cropTypeLabel);
  form.appendChild(document.createElement("br"));
  form.appendChild(document.createElement("br"));

  const plantingDateLabel = document.createElement("label");
  plantingDateLabel.textContent = "Planting Date: ";
  const plantingDateInput = document.createElement("input");
  plantingDateInput.type = "date";
  plantingDateInput.name = "plantingDate";
  plantingDateInput.required = true;
  plantingDateLabel.appendChild(plantingDateInput);
  form.appendChild(plantingDateLabel);
  form.appendChild(document.createElement("br"));
  form.appendChild(document.createElement("br"));

  const fieldLocationLabel = document.createElement("label");
  fieldLocationLabel.textContent = "Field Location: ";
  const fieldLocationInput = document.createElement("input");
  fieldLocationInput.type = "text";
  fieldLocationInput.name = "fieldLocation";
  fieldLocationInput.required = true;
  fieldLocationLabel.appendChild(fieldLocationInput);
  form.appendChild(fieldLocationLabel);
  form.appendChild(document.createElement("br"));
  form.appendChild(document.createElement("br"));

  const quantityLabel = document.createElement("label");
  quantityLabel.textContent = "Quantity: ";
  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.name = "quantity";
  quantityInput.min = "1";
  quantityInput.required = true;
  quantityLabel.appendChild(quantityInput);
  form.appendChild(quantityLabel);
  form.appendChild(document.createElement("br"));
  form.appendChild(document.createElement("br"));

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Add Crop";
  form.appendChild(submitButton);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cropData = {
      userName: username,
      cropType: cropTypeSelect.value,
      plantingDate: plantingDateInput.value,
      fieldLocation: fieldLocationInput.value,
      quantity: quantityInput.value
    };
    
    await addCrop(cropData);
    form.reset();
    displayCrops(username, containerElement);
  });

  containerElement.appendChild(form);

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

const displayCrops = async (username, containerElement) => {

  const existingCropsDiv = containerElement.querySelector("#cropsDisplay");
  if (existingCropsDiv) {
    existingCropsDiv.replaceChildren();
  }

  const crops = await getCrops(username);
  
  if (crops.length > 0) {
    const cropsDiv = document.createElement("div");
    cropsDiv.id = "cropsDisplay";

    const cropsTitle = document.createElement("h3");
    cropsTitle.textContent = "Your Crops";
    cropsDiv.appendChild(cropsTitle);

    crops.forEach((crop) => {
      const cropCard = document.createElement("div");
      cropCard.style.border = "1px solid #ddd";
      cropCard.style.padding = "10px";
      cropCard.style.marginBottom = "10px";
      cropCard.style.borderRadius = "4px";

      const cropTypeText = document.createElement("p");
      cropTypeText.textContent = "Crop Type: " + crop.cropType;
      cropCard.appendChild(cropTypeText);

      const plantingDateText = document.createElement("p");
      plantingDateText.textContent = "Planting Date: " + crop.plantingDate;
      cropCard.appendChild(plantingDateText);

      const fieldLocationText = document.createElement("p");
      fieldLocationText.textContent = "Field Location: " + crop.fieldLocation;
      cropCard.appendChild(fieldLocationText);

      const quantityText = document.createElement("p");
      quantityText.textContent = "Quantity: " + crop.quantity;
      cropCard.appendChild(quantityText);

      cropsDiv.appendChild(cropCard);
    });

    containerElement.appendChild(cropsDiv);
  } else {
    console.log("No crops found for user:", username);
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