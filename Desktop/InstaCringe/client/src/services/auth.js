import http from "../services/http";
import config from '../config/config.json';

export function login(user) {
    return http.post(`${config.apiEndpoint}/auth`, user);
};
