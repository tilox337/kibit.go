// Пустой base URL оставляет запросы на текущем origin; Vite проксирует API локально.
export const API_URL = "";

export const TRAFFIC_LIGHTS_ENDPOINT = "/traffic-lights";

// Ключ localStorage, где заглушка хранит светофоры вместо сервера
export const STUB_STORAGE_KEY = "stub-traffic-lights";
