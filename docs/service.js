const BASE_URL = "http://localhost:5144";
// const RENDER_URL = "https://webintrofinal-parajulipeshal.onrender.com/";
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
  const cropName = (filters.cropName || "").trim();  //this just says the filters are optional. 
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
  const query = new URLSearchParams({     //this builds query string...
    name: locationName,  
    count: "10",
    language: "en",
    format: "json",
  });

  //this is just to convert location user enters into coordinates. My api uses coordinate rather than location.
//found this is stackoverflow.
  const response = await fetch(`${METRO_API_COORDINATE}?${query.toString()}`);
  const data = await response.json();
  const results = data.results ?? [];
  const normalizedInput = locationName.trim().toLowerCase();

  const exactMatches = results.filter(
    (result) => (result.name ?? "").toLowerCase() === normalizedInput,
  );

  //here sorting is being done by population (to show bigger city 1st/ famous one)
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

  //this time, building query for weather api
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
    elevation: data.elevation,
    unit: data.hourly_units.temperature_2m,     //returning obj from api
    firstHourTemperature: temperatures[0],
  };
};
