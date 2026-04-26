var currentUser= ""
export const SetCurrentUser = (newUsername)=>{
    if(currentUser !== "" && newUsername !=="")
       { console.log("cannot signin user if already signin")
        return false;
       }
           currentUser= newUsername;
           return true;
}

export const GetCurrentUser = ()=>{
   return currentUser;
}
export const calculateWateringReminder = (crop) => {
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

export const getUserFromQueryString = () => {
  const url = new URL(window.location);
  return (url.searchParams.get("name") || "").trim();
};

export const CalculateGrowthStage = (plantingDate) => {
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