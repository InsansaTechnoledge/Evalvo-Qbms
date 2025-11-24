import api from "./api.js";

export const createBatch = async (batchData) => {
  const response = await api.post(`/v1/batch/create-batch`, batchData);
  return response.data;
};

export const fetchBatchList = async (id) => {
  const query = id ? `?id=${id}` : '';
  const response = await api.get(`/v1/batch/get-batch/${query}`);
  return response.data;
};