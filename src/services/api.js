import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

// Request interceptor — attach JWT from localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("csclash_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("csclash_token");
            // Only redirect if not already on login/signup page
            if (
                !window.location.pathname.includes("/login") &&
                !window.location.pathname.includes("/signup")
            ) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
