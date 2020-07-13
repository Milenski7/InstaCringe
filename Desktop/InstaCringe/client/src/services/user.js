import http from "./http";
import config from '../config/config.json';

export function register(user) {
    return http.post(`${config.apiEndpoint}/user`, user);
};