import assert from "assert";
import sinon from "sinon";
import * as seedsHelper from "../helpers/seeds.helper";
import footprintApi from "../helpers/footprint.helper";
import { client } from "./../configs/redis.js";
import { BATCH_SIZE, REDIS_KEYS } from "../configs/vars.js";

describe("Testing seed controller and helper functions", function () {
  let footPrintCountryApiStub;
  let footPrintCountryDataApiStub;

  const mockInputData = {
    usa: [
      { year: 2020, carbon: 10.12345 },
      { year: 2021, carbon: 12.98765 },
    ],
    canada: [
      { year: 2020, carbon: 8.54321 },
      { year: 2021, carbon: 7.87654 },
    ],
  };

  const mockCountries = [
    { countryName: "USA", countryCode: "US" },
    { countryName: "Canada", countryCode: "CA" },
  ];


  beforeEach( async () => {
    footPrintCountryDataApiStub = sinon.stub(footprintApi, "getDataForCountry");
    footPrintCountryApiStub = sinon.stub(footprintApi, 'getCountries');
    await client.flushAll();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should transform data correctly", () => {
    const inputData = {
      armenia: [
        { year: 2020, carbon: 5000.1234 },
        { year: 2021, carbon: 6000.5678 },
      ],
      afghanistan: [
        { year: 2020, carbon: 3000.1234 },
        { year: 2021, carbon: 4000.5678 },
      ],
    };

    const expectedOutput = {
      2020: [
        { country: "armenia", total: 5000.1234 },
        { country: "afghanistan", total: 3000.1234 },
      ],
      2021: [
        { country: "armenia", total: 6000.5678 },
        { country: "afghanistan", total: 4000.5678 },
      ],
    };

    const result = seedsHelper.transformData(inputData);
    assert.deepStrictEqual(result, expectedOutput);
  });

  it("should fetch data", async () => {
    footPrintCountryDataApiStub.resolves({ year: 2020, carbon: 5000 });

    const testPromise = seedsHelper.fetchData("AM");
    const result = await testPromise;

    assert(footPrintCountryDataApiStub.calledOnce);
    assert(result.year === 2020 && result.carbon === 5000);
  });

  it("should sort data by highest total", async () => {
    const inputData = {
      2020: [
        { country: "armenia", total: 5000 },
        { country: "afghanistan", total: 3000 },
      ],
      2021: [
        { country: "armenia", total: 6000 },
        { country: "afghanistan", total: 4000 },
      ],
    };

    const expectedOutput = {
      2020: [
        { country: "armenia", total: 5000 },
        { country: "afghanistan", total: 3000 },
      ],
      2021: [
        { country: "armenia", total: 6000 },
        { country: "afghanistan", total: 4000 },
      ],
    };

    const result = await seedsHelper.sortByHighestTotal(inputData);
    assert.deepStrictEqual(result, expectedOutput);
  });

  it("should organize data by year correctly", function () {
    const result = seedsHelper.transformData(mockInputData);
    
    assert.ok(result.hasOwnProperty("2020"));
    assert.ok(result.hasOwnProperty("2021"));
    assert.strictEqual(result["2020"].length, 2);
    assert.deepStrictEqual(result["2020"][0], {
      country: "usa",
      total: 10.1235,
    });
  });
  

  it("should sort countries by total descending per year", async function () {
    const data = {
      2020: [
        { country: "canada", total: 8 },
        { country: "usa", total: 10 },
      ],
    };
    const result = await seedsHelper.sortByHighestTotal(data);
    assert.strictEqual(result["2020"][0].country, "usa");
    assert.strictEqual(result["2020"][1].country, "canada");
  });


  it("should paginate countries correctly", async function () {

    footPrintCountryApiStub.resolves(mockCountries);

    const { countries, offset, totalCountriesCount } =
      await seedsHelper.getPaginatedCountries();

    assert.ok(Array.isArray(countries));
    assert.ok(offset > 0);
    assert.strictEqual(totalCountriesCount, 2);
  });

  it("should paginate countries correctly from cache", async function () {
    sinon.stub(client, "get").withArgs(REDIS_KEYS.COUNTRIES).resolves(JSON.stringify(mockCountries));
  
    footPrintCountryApiStub.resolves(mockCountries);
  
    const { countries, offset, totalCountriesCount } =
      await seedsHelper.getPaginatedCountries();
    
    assert.ok(Array.isArray(countries));
    assert.strictEqual(countries.length, 2);
    assert.strictEqual(offset, 5);
    assert.strictEqual(totalCountriesCount, 2);
  
    assert.ok(footPrintCountryApiStub.notCalled);
  });


  it("should create promises only for non-skipped, uncached countries", function () {
    const { promises, dataByCountry } =
      seedsHelper.getCountryPromises(mockCountries);
    assert.strictEqual(promises.length, 2);
    assert.strictEqual(Object.keys(dataByCountry).length, 0); 
  });
  
   
  describe("fetchCountryData", function () {
    afterEach(() => {
      sinon.restore();
    });
    
    it("should return cached country data if exists", async function () {
      const fakeData = [{ year: 2020, carbon: 10 }];
      sinon
        .stub(client, "get")
        .withArgs("footprint:country:277")
        .resolves(JSON.stringify(fakeData));
  
      const data = await seedsHelper.fetchCountryWithCache("277");
      const anotherCountryData = await seedsHelper.fetchCountryWithCache(
        "278"
      );
      assert.ok(footPrintCountryDataApiStub.calledOnce);
      assert.deepStrictEqual(data, fakeData);
      assert.deepStrictEqual(anotherCountryData, undefined);
    });

    it("should fetch and cache data if not in cache", async function () {
      sinon.stub(client, "get").resolves(null);
      footPrintCountryDataApiStub.resolves([{ year: 2020, carbon: 10 }]);
      const setExStub = sinon.stub(client, "setEx").resolves("OK");
  
      const data = await seedsHelper.fetchCountryWithCache("US");
  
      assert.ok(footPrintCountryDataApiStub.calledOnce);
      assert.ok(setExStub.calledOnce);
      assert.strictEqual(data.length, 1);
    });

  });
});
