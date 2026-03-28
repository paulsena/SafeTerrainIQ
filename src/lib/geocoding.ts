import { BUNCOMBE_BBOX } from './constants';

export function isInsideBuncombe(lng: number, lat: number): boolean {
  return (
    lng >= BUNCOMBE_BBOX.west &&
    lng <= BUNCOMBE_BBOX.east &&
    lat >= BUNCOMBE_BBOX.south &&
    lat <= BUNCOMBE_BBOX.north
  );
}

export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°W`;
}
