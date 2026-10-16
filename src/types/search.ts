// Место на карте: результат поиска, пункт назначения, избранное
export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Запись в истории поездок
export interface TripRecord {
  id: string;
  place: Place;
  timestamp: number; // когда ездили, мс
}
