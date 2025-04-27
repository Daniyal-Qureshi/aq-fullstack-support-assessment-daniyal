import footprintApi from './../helpers/footprint.helper';
import { client } from "./../configs/redis.js";
import { BATCH_SIZE, REDIS_KEYS, SKIPPED_COUNTRIES } from "./../configs/vars.js";



/**
 * Transform input data by organizing it by year.
 * 
 * @param {Object} inputData - The raw input data organized by country.
 * @returns {Object} The transformed data organized by year.
 */
export const transformData = (inputData) => {
  const dataByYear = {};

  // Iterate through each country in the input data
  for (const country in inputData) {
    inputData[country].forEach(record => {
      const year = record.year;
      const total = parseFloat(record.carbon.toFixed(4));

      // Initialize the year if it doesn't exist in dataByYear
      if (!dataByYear[year]) {
        dataByYear[year] = [];
      }

      // Add the country and total to the corresponding year
      if (total) {
        dataByYear[year].push({ country, total });
      }
    });
  }

  return dataByYear;
};

/**
 * Fetch data for a country
 * 
 * @param {string} countryCode - The country code to fetch data for.
 * @returns {Promise<Object>} The data for the specified country.
 */
export const fetchData = async (countryCode) => {
  return await footprintApi.getDataForCountry(countryCode);
};

/**
 * Sort data by highest total emissions.
 * 
 * @param {Object} data - The data organized by year.
 * @returns {Object} The data sorted by highest total emissions per year.
 */
export const sortByHighestTotal = async (data) => {
  for (let year in data) {
    data[year].sort((a, b) => b.total - a.total);
  }
  return data;
};

/**
 * Get the list of countries from cache or from the API if not cached.
 *
 * @returns {Promise<Array>} An array of country objects fetched from cache or API.
 */
async function getCountries() {
  const cachedCountries = await client.get(REDIS_KEYS.COUNTRIES);
  if (cachedCountries) return JSON.parse(cachedCountries);

  const countries = await footprintApi.getCountries();
  await client.setEx(REDIS_KEYS.COUNTRIES, 86400, JSON.stringify(countries));
  return countries;
}

/**
 * Fetch emissions data for a specific country using a cache-first strategy.
 * 
 * @param {string} countryCode - The country code to fetch data for.
 * @returns {Promise<Array>} The emissions data for the specified country.
 */
export async function fetchCountryWithCache(countryCode) {
  const cacheKey = REDIS_KEYS.COUNTRY_DATA(countryCode);

  const country = await client.get(cacheKey);
  if (country) return JSON.parse(country);

  const data = await fetchData(countryCode);

  if (data && data.length) {
    await client.setEx(cacheKey, 3600, JSON.stringify(data));
  }

  return data;
}

/**
 * Get a paginated list of countries based on the current offset from cache.
 * 
 * Increments the offset by the defined batch size and slices the country list accordingly.
 * 
 * @returns {Promise<Object>} An object containing the current slice of countries, the offset, and the total count.
 */
export async function getPaginatedCountries() {
  let offset = Number(await client.get(REDIS_KEYS.OFFSET)) || 0;
  const totalCountries = await getCountries();
  let countries = totalCountries;

  if (offset < totalCountries.length) {
    offset = offset + BATCH_SIZE;
    countries = totalCountries.slice(0, offset);
  }
  return { countries, offset, totalCountriesCount: totalCountries.length };
}

/**
 * Generate promises for fetching country emissions data if not already cached.
 * 
 * This function iterates through the provided list of countries and checks if the country is
 * in the `SKIPPED_COUNTRIES` list or if its data has already been fetched (exists in `dataByCountry`).
 * If the country passes both checks, it adds a promise to fetch its emissions data to the `promises` array.
 * 
 * @param {Array} countries - The list of country objects to process.
 * @returns {Object} An object containing:
 *   - `promises` {Array} - An array of promises that will fetch emissions data for the countries.
 *   - `dataByCountry` {Object} - An object that keeps track of the countries already processed.
 */
export function getCountryPromises(countries) {
  const promises = [];
  const dataByCountry = {};
  for (const country of countries) {
    const countryName = country.countryName.toLowerCase().trim();

    if (
      !SKIPPED_COUNTRIES.includes(countryName) &&
      !dataByCountry[countryName]
    ) {
      promises.push(fetchCountryWithCache(country.countryCode));
    }
  }
  return { promises, dataByCountry };

}
