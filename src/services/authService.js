import api from "./api.js";

export const instituteLogin = async (data) => {
    const response = await api.post(`/v1/auth/institute-login`, data);
    return response.data;
}

export const checkAuth = async () => {
    const response = await api.get(`/v1/auth/check-auth`);
    return response.data;
}

export const logout = async () => {
    const response = await api.post(`/v1/auth/logout`);
    return response.data;
};
