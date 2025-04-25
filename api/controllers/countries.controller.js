import { prepareEmissionsByCountry } from "./seeds.controller";

/**
 * Controller to get emissions data by country.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} currentTimeProvider - Function to provide the current time (used for testing)
 */
export const getEmissionsByCountry = async (req, res) => {
  try {    
    const emissionsPerCountry = await prepareEmissionsByCountry();
    return res.json({ data: emissionsPerCountry, message: "Emissions per country retrieved successfully!" });
  } catch (error) {
    console.log('Error fetching emissions data:', error);
    if(error.status == 429) {
        return res.status(429).json({
            error,
            message: "Too Many Requests, please try again in a moment."
         })
    }
    else {
        return res.status(500).json({
            error,
            message: "Internal Server Error"
        });
    }
  }
};
