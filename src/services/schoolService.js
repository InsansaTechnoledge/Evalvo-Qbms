import api from "./api";

// *****************************program Table(evalvo) refered as the school here********************

// List programs (supports filters: id (string or array), organization_id, code)
export const getSchool = async (params = {}) => {
  const search = new URLSearchParams();

  if (params.id) {
    // allow string or array for id
    const ids = Array.isArray(params.id) ? params.id : [params.id];
    ids.forEach((v) => search.append('id', v));
  }
  if (params.organization_id) search.set('organization_id', params.organization_id);
  if (params.code) search.set('code', params.code);

  const qs = search.toString();
  const url = qs ? `/v1/programs/program?${qs}` : `/v1/programs/program`;

  console.log("Fetching programs with URL:", url);
  const res = await api.get(url);
  return res.data;
};

export const addSchool = async (data) => {
    const response = await api.post(`/v1/programs/program`, data);
    return response.data;
}

export const deleteSchool = async (schoolId) => {
  const response = await api.delete(`/v1/programs/program/${schoolId}`);
  return response.data;
};
