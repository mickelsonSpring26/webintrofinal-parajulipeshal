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
