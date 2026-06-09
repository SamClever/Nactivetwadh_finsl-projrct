import axios from 'axios';

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://127.0.0.1:8000/api/locations';

export async function fetchCountries(q = '', page = 1, page_size = 25) {
  const res = await axios.get(`${API_BASE}/countries/`, {
    params: { search: q, page, page_size }
  });
  return res.data;
}

export async function fetchRegions(countryId, q = '', page = 1, page_size = 25) {
  const params = { search: q, page, page_size };
  if (countryId) params.country = countryId;
  const res = await axios.get(`${API_BASE}/regions/`, { params });
  return res.data.results ?? res.data;
}

export async function fetchCities(regionId, q = '', page = 1, page_size = 25) {
  const params = { search: q, page, page_size };
  if (regionId) params.region = regionId;
  const res = await axios.get(`${API_BASE}/cities/`, { params });
  return res.data.results ?? res.data;
}

export async function fetchDistricts(cityId, q = '', page = 1, page_size = 25) {
  const params = { search: q, page, page_size };
  if (cityId) params.city = cityId;
  const res = await axios.get(`${API_BASE}/districts/`, { params });
  return res.data.results ?? res.data;
}

export async function fetchWards(districtId, q = '', page = 1, page_size = 25) {
  const params = { search: q, page, page_size };
  if (districtId) params.district = districtId;
  const res = await axios.get(`${API_BASE}/wards/`, { params });
  return res.data.results ?? res.data;
}

export async function fetchStreets(wardId, q = '', page = 1, page_size = 25) {
  const params = { search: q, page, page_size };
  if (wardId) params.ward = wardId;
  const res = await axios.get(`${API_BASE}/streets/`, { params });
  return res.data.results ?? res.data;
}
