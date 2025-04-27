import assert from 'assert';
import sinon from 'sinon';
import * as seedsController from '../controllers/seeds.controller.js';
import { getEmissionsByCountry } from '../controllers/countries.controller.js'; 

describe('getEmissionsByCountry Controller', () => {
  let prepareEmissionsByCountryStub;
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });


  it('should return emissions data successfully', async () => {
    const data = [{ country: 'USA', emissions: 100 }];
    prepareEmissionsByCountryStub = sinon.stub(seedsController, 'prepareEmissionsByCountry').resolves(data);

    await getEmissionsByCountry(req, res);
    assert(prepareEmissionsByCountryStub.calledOnce, 'prepareEmissionsByCountry should be called once');
    assert(res.status.calledOnceWith(200), 'res.status should be called with 200');
    assert(res.json.calledOnce, 'res.json should be called once');
    assert(res.json.calledWith({
     data,
      message: 'Emissions per country retrieved successfully!',
    }), 'res.json should be called with correct response');
  });

  it('should handle errors with status 500', async () => {
    const data = [];
    prepareEmissionsByCountryStub = sinon.stub(seedsController, 'prepareEmissionsByCountry').rejects(data);

    await getEmissionsByCountry(req, res);

    assert(prepareEmissionsByCountryStub.calledOnce, 'prepareEmissionsByCountry should be called once');
    assert(res.status.calledOnceWith(500), 'res.status should be called with 500');
    assert(res.json.calledOnce, 'res.json should be called once');
    assert(res.json.calledWith({
        message: 'Internal Server Error',
    }), 'res.json should be called with correct response');
  });

  it('should handle 429 Too Many Requests error', async () => {
        const consoleLogStub = sinon.stub(console, 'log'); 

        const tooManyRequestsError = new Error('Too Many Requests');
        tooManyRequestsError.status = 429;
        prepareEmissionsByCountryStub = sinon.stub(seedsController, 'prepareEmissionsByCountry').rejects(tooManyRequestsError);

        await getEmissionsByCountry(req, res);

        assert(res.status.calledOnceWith(429), 'res.status should be called with 429');
        assert(res.json.calledOnce);
        assert(res.json.calledWithMatch({
        message: 'Too Many Requests, please try again in a moment.'
        }), 'res.json should contain Too Many Requests message');
        consoleLogStub.restore(); 
    });

});
