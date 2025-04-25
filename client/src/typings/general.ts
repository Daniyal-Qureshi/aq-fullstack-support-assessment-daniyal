export type Country = {
  countryCode: string;
  countryName: string;
  isoa2: string;
  score: string;
  shortName: string;
};

export type CountryEmissionsForYear = {
  country: string;
  total: number; // this represents the emissions for that year
};

export type CountryEmissions = {
  [year: number]: CountryEmissionsForYear[];
};

export type Emissions = { 
  data:  { emissionsPerCountry: CountryEmissions, isCompleted: boolean };
  message: string;
}

export type Year = {
  year: number;
};
