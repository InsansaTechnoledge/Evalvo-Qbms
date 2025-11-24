import api from "./api.js";

// *******************here the [course] table from evalvo is refered as [Program] in evalvoqbms*****************

export const fetchProgramList = async (params = {}) => {
  const search = new URLSearchParams();
  if (params.id) {
    const ids = Array.isArray(params.id) ? params.id : [params.id];
    ids.forEach((v) => search.append("id", v));
  }
  if (params.program_id) search.set("program_id", params.program_id);
  if (params.code) search.set("code", params.code);

  const qs = search.toString();
  const url = qs ? `/v1/course/course?${qs}` : `/v1/course/course`;
  const res = await api.get(url);
  return res.data;
};

export const createProgram = async (payload) => {
  const res = await api.post("/v1/course/course", payload);
  return res.data;
};

export const deleteProgram = async (programId) => {
  const res = await api.delete(`/v1/course/course/${programId}`);
  return res.data;
};