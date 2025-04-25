import {
  transformData,
  sortByHighestTotal,
  getPaginatedCountries,
  getCountryPromises,
} from "./../helpers/seeds.helper";
import { REDIS_KEYS, SKIPPED_COUNTRIES } from "./../configs/vars";
import { client } from "./../configs/redis.js";

/**
 * Prepare emissions data by country.
 * 
 * Fetches data for all countries from the footprint API, processes it, and returns the results
 * 
 * @returns {Promise<Object>} The emissions data organized by country.
 */
export const prepareEmissionsByCountry = async () => {
  const  { countries, offset, totalCountriesCount } = await getPaginatedCountries();

  const { promises, dataByCountry} = getCountryPromises(countries);
  
  let results = await Promise.allSettled(promises);

  const rejected = results.filter((result) => result.status === "rejected");
  console.log("total rejected", rejected.length);

  const fulfilled = results.filter((result) => result.status === "fulfilled");

  results = fulfilled
    .filter((result) => result.value?.length)
    .map((result) => result.value);

  const isCompleted = fulfilled.length + 1 >=  totalCountriesCount; // SKIPPED 'ALL' COUNTRY CODE
  console.log({ isCompleted });

  results.forEach((r) => {
    const countryName = r[0].countryName.toLowerCase().trim();
    dataByCountry[countryName] = r;
  });

  let emissionsPerCountry = transformData(dataByCountry);
  emissionsPerCountry = await sortByHighestTotal(emissionsPerCountry);

  console.log({ offset });
  await client.setEx(REDIS_KEYS.OFFSET, 86400, offset.toString());

  return {
    emissionsPerCountry,
    isCompleted,
  };
};
