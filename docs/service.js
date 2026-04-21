// const API_URL = "http://localhost:5144";
const BASE_URL = "https://webintrofinal-parajulipeshal.onrender.com/";
const METRO_API_COORDINATE = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";

export const AddCrop = async (cropData) => {
  const response = await fetch(`${BASE_URL}/crops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cropData),
  });
  return response.json();
};

export const GetCrops = async (username, filters = {}) => {
  const cropName = (filters.cropName || "").trim();
  const quantity = (filters.quantity || "").toString().trim();

  const query = new URLSearchParams({
    cropName,
    quantity,
  });
  const endpoint = `${BASE_URL}/crops/${username}/filter?${query.toString()}`;

  const response = await fetch(endpoint);
  const crops = await response.json();
  return crops;
};

export const DeleteCrop = async (cropId) => {
  const response = await fetch(`${BASE_URL}/crops/${cropId}`, {
    method: "DELETE",   // I tried using DELETE in this project. 
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const GetCoordinatesForLocation = async (locationName) => {
  const query = new URLSearchParams({
    name: locationName,
    count: "10",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${METRO_API_COORDINATE}?${query.toString()}`);
  const data = await response.json();
  const results = data.results ?? [];
  const normalizedInput = locationName.trim().toLowerCase();

  const exactMatches = results.filter(
    (result) => (result.name ?? "").toLowerCase() === normalizedInput,
  );

  const rankedMatches = exactMatches.length > 0 ? exactMatches : results;
  rankedMatches.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));

  const firstMatch = rankedMatches[0];
  return {
    name: `${firstMatch.name}${firstMatch.admin1 ? `, ${firstMatch.admin1}` : ""}${firstMatch.country ? `, ${firstMatch.country}` : ""}`,
    latitude: firstMatch.latitude,
    longitude: firstMatch.longitude,
  };
};

export const GetHourlyTemperatureForLocation = async (locationName) => {
  const location = await GetCoordinatesForLocation(locationName);

  const query = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: "temperature_2m",
    forecast_days: "1",
    timezone: "auto",
  });

  const response = await fetch(`${OPEN_METEO_FORECAST}?${query.toString()}`);
  const data = await response.json();
  const temperatures = data.hourly.temperature_2m;
  const times = data.hourly.time;

  return {
    locationName: location.name,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    elevation: data.elevation,
    unit: data.hourly_units.temperature_2m,
    firstHourTime: times[0],
    firstHourTemperature: temperatures[0],
  };
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
