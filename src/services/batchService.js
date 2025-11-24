import api from "./api.js";

export const createBatch = async (batchData) => {
  const response = await api.post(`/v1/batch/create-batch`, batchData);
  return response.data;
};