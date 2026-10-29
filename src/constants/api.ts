// Пустая строка: запросы идут на тот же origin, Vite проксирует /api/v1 на Go :8080.
export const API_URL = "";

export const TRAFFIC_LIGHTS_ENDPOINT = "/traffic-lights";

// Ключ localStorage, где заглушка хранит светофоры вместо сервера
export const STUB_STORAGE_KEY = "stub-traffic-lights";
