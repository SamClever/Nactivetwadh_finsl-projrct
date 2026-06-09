import AsyncSelect from 'react-select/async';
import {
  fetchRegions,
  fetchCities,
  fetchDistricts,
  fetchWards,
  fetchStreets,
} from '../services/locationService';

export default function LocationAutocomplete({
  level = 'regions',
  parentId = null,
  value = null,
  onChange = () => {},
  placeholder = 'Search...',
  disabled = false,
}) {
  const loadOptions = async (inputValue) => {
    try {
      let items = [];
      if (level === 'regions') items = await fetchRegions(null, inputValue);
      else if (level === 'cities') items = await fetchCities(parentId, inputValue);
      else if (level === 'districts') items = await fetchDistricts(parentId, inputValue);
      else if (level === 'wards') items = await fetchWards(parentId, inputValue);
      else if (level === 'streets') items = await fetchStreets(parentId, inputValue);
      return (items || []).map((item) => ({ value: item.id, label: item.name, data: item }));
    } catch {
      return [];
    }
  };

  const selectedOption = value ? { value: value.id, label: value.name, data: value } : null;

  return (
    <AsyncSelect
      key={`${level}-${parentId}`}
      cacheOptions={false}
      defaultOptions
      loadOptions={loadOptions}
      value={selectedOption}
      onChange={(option) => onChange(option?.data || null)}
      placeholder={placeholder}
      isDisabled={disabled}
      isClearable
      isSearchable
      noOptionsMessage={() => (disabled ? 'Select parent first' : 'No results found')}
      loadingMessage={() => 'Loading...'}
      styles={{
        control: (base) => ({ ...base, minHeight: 44 }),
      }}
    />
  );
}
