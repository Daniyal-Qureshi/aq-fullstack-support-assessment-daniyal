# Post-Mortem Report for Bug 1: Chart Not Always Showing Country Emissions

## Root Cause:
The primary issue was related to the way the API was handling requests for country emission data. The FootPrint API supports fetching data in batches (for 3 to 5 countries at a time). However, the frontend was trying to request data for all 269 countries in a single request, leading to the following problems:
- **429 Error (Too Many Requests):** Since the API was not designed to handle such large batch requests, it was returning a 429 error, indicating that the rate limit had been exceeded.
- **Flaky Chart Rendering:** Due to the failures in fetching the data for all countries, the chart rendering was inconsistent—sometimes showing data and sometimes not.

## Solution
1. **Batch Requesting with Redis:** 
   - Implemented a solution where only 5 countries are fetched at a time.
   - Redis was used to store the country data in cache. This allows the system to process data in smaller chunks and reduce the load on the API.
2. **Offset Management:** 
   - Implemented an offset mechanism in Redis to track which countries have been successfully fetched. After each iteration, the next batch of countries would be fetched and added to the cache.
3. **Rate Limiting and Cache Hits:**
   - To prevent further overload, I added a 2-second delay between requests. The backend checks if the data for a country is already in the cache; if not, it fetches it from the FootPrint API. This significantly reduced the number of API calls.
4. **Handle Failure:**
   - In case of failure of any country data, in the next iteration the system will retry it and store that in cache, in case of any unexpected failure we show Error Boundary on frontend.
5. **Completion Handling:** 
   - Once all the data is fetched, I set a flag `isCompleted` to true, signaling to the frontend that all data is available, and it can proceed to render the chart.

## Unit Tests:
- I wrote unit tests for frontend and backend to verify that the batch processing works as intended and that the caching mechanism in Redis is functioning correctly.
---

# Post-Mortem Report for Bug 2: Chart Not Showing All Countries

## Root Cause:
Bug 2 was a direct consequence of Bug 1. Since the system was originally requesting all countries' data at once and failing, the chart was only rendering data for a few countries (around 8 to 10). The backend was not properly fetching the full dataset due to the limitations of the FootPrint API.

## Solution:
**Fix from Bug 1 Applied:** 
- By implementing the batch request logic and caching mechanism described in Bug 1, the issue with only partial country data showing up was resolved.
**Complete Data Fetching:** 
- After modifying the API to request smaller batches (5 countries at a time), all 269 countries’ data is fetched successfully, stored in the Redis cache, and sent to the frontend.
**Frontend Behavior:** 
- In each batch new countries are added to the chart, and a loader is shown at the end and once all data is available, the chart is rendered with all countries and loader is removed.

## Unit Tests:
- Additional tests for frontend and backend were written to ensure that the full set of countries (269 in total) is properly fetched and rendered. These tests also check that the cache hit mechanism works as expected.
---

# Post-Mortem Report for Bug 3: Years Not Looping

## Root Cause:
The issue with years not looping was caused by the way the `minYear` and `maxYear` values were being handled. Initially, these values were being stored as strings, but the `currentYear` was being handled as a number. This caused the comparison `if (this.currentYear === this.maxYear)` to never evaluate to true because `currentYear` was an integer, while `maxYear` was a string.

## Solution:
**Conversion of Year Values:** 
   - I converted both `minYear` and `maxYear` to numbers using `parseInt()`. This ensures that both values are treated consistently as integers, allowing the comparison `if (this.currentYear === this.maxYear)` to work as expected.
**Looping Logic:** 
   - With the proper type consistency, I implemented the logic to loop the years correctly. When the chart reaches the last year in the dataset, it should now properly loop back to the first year.

## Unit Tests:
- I wrote unit tests to verify the looping behavior. These tests ensure that once the `currentYear` reaches the last year, it automatically starts from the first year again.
---

## AI Prompts 
- Modify this README.md combining all setup steps, testing instructions, Redis commands in a clean and structured Markdown format.
- Explain fakeTimers in Vitest
- What happens when setInterval is not cleared even component is in unmounted state
