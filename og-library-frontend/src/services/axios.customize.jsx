import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:8080/api/v1",
});

instance.interceptors.response.use(
    function (response) {
        return response && response.data ? response.data : response;
    },
    function (error) {
        if (error?.response?.data) return Promise.reject(error.response.data);
        return Promise.reject(error);
    }
);

export default instance;