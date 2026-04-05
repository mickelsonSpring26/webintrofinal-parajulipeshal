const API_URL = "http://localhost:5144";

export const addCrop = async (cropData) => {
  const response = await fetch(`${API_URL}/crops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cropData),
  });
  return response.json();
};

export const getCrops = async (username) => {
  const response = await fetch(`${API_URL}/crops/${username}`);
  const crops = await response.json();
  return crops;
};

export const deleteCrop = async (cropId) => {
  const response = await fetch(`${API_URL}/crops/${cropId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

//I will replace this with api thing later on. This is just for mvp.
export const calculateGrowthStage = (plantingDate) => {
  const planted = new Date(plantingDate);
  const today = new Date();
  const daysSincePlanting = Math.floor((today - planted) / (1000 * 60 * 60 * 24));

  if (daysSincePlanting < 0) {
    return { stage: "Not Yet Planted", daysElapsed: 0, percentage: 0 };
  } else if (daysSincePlanting < 7) {
    return { stage: "Germination", daysElapsed: daysSincePlanting, percentage: (daysSincePlanting / 7) * 100 };
  } else if (daysSincePlanting < 30) {
    return { stage: "Seedling/Vegetative", daysElapsed: daysSincePlanting, percentage: ((daysSincePlanting - 7) / 23) * 100 + 14.28 };
  } else if (daysSincePlanting < 60) {
    return { stage: "Flowering", daysElapsed: daysSincePlanting, percentage: ((daysSincePlanting - 30) / 30) * 100 + 42.85 };
  } else if (daysSincePlanting < 90) {
    return { stage: "Fruiting/Grain Filling", daysElapsed: daysSincePlanting, percentage: ((daysSincePlanting - 60) / 30) * 100 + 71.42 };
  } else {
    return { stage: "Mature/Ready to Harvest", daysElapsed: daysSincePlanting, percentage: 100 };
  }
};
