<template>
  <main class="container">
    <HomeHeader
        :current-year="currentYear"
        :total="totalCarbon"
      />
    <ErrorBoundary v-if="error" :message="error" />
    <template v-else>
      <TransitionGroup
        v-if="!!currentYearSortedCountries.length"
        name="chart"
        tag="div"
        class="chart"
      >
        <HomeChartRow
          v-for="(country, index) in currentYearSortedCountries"
          :key="`${country.name}-${index}`"
          :country="country"
          :max-value="maxCarbonValuePerYear"
        />
      </TransitionGroup>
      <Loader v-if="isLoading" />
    </template>
  </main>
</template>

<script lang="ts">
  import { mapStores } from 'pinia';
  import { defineComponent } from 'vue';

  import { getColorsRange } from '@/lib/utils/getColorsRange';
  import { useDataStore } from '@/stores/dataStore';
  import type { CountryEmissions } from '@/typings/general';
  import HomeHeader from '@/components/home/HomeHeader.vue';
  import HomeChartRow from '@/components/home/HomeChartRow.vue';
  import Loader from '@/components/Loader.vue';
  import ErrorBoundary from '@/components/ErrorBoundary.vue';

  type HomeState = {
    currentYear: number;
    minYear: number;
    maxYear: number;
    emissionData: CountryEmissions;
    isLoading: boolean;
    error: string;
    getDataIntervalId?: NodeJS.Timeout;
    cycleYearIntervalId?: NodeJS.Timeout;
  };

  export default defineComponent({
    name: 'home',

    components: { HomeHeader, HomeChartRow, Loader, ErrorBoundary },

    data(): HomeState {
      return {
        currentYear: 0,
        minYear: 0,
        maxYear: 0,
        emissionData: { },
        isLoading: true,
        error: "",
      };
    },
    computed: {
      ...mapStores(useDataStore),

      countriesForCurrentYear() {
        if (!this.currentYear || !this.emissionData) return [];

        const countriesForCurrentYear = this.emissionData[this.currentYear];

        if (!countriesForCurrentYear) return;

        const colorSet = getColorsRange(countriesForCurrentYear.length);

        return (
          this.emissionData[this.currentYear]?.map((country, i) => ({
            color: colorSet[i],
            name: country.country,
            carbon: country.total,
          })) || []
        );
      },

      currentYearSortedCountries() {
        if (!this.countriesForCurrentYear?.length) return [];
        return this.countriesForCurrentYear.slice().sort((a, b) => {
          return b.carbon - a.carbon;
        });
      },

      maxCarbonValuePerYear() {
        return this.currentYearSortedCountries[0]?.carbon || 0;
      },

      totalCarbon() {
        return Math.floor(
          this.currentYearSortedCountries.reduce((acc, curr) => {
            return (acc += curr.carbon);
          }, 0)
        );
      },
    },

    unmounted() {
      clearInterval(this.getDataIntervalId);
      clearInterval(this.cycleYearIntervalId);
    },

    async mounted() {
      this.getData();
      
      this.getDataIntervalId = setInterval(() => {
        this.getData();
      }, 2000);

      this.cycleYearIntervalId = setInterval(() => {
        if(Object.keys(this.emissionData).length === 0) return;

        if (this.currentYear === this.maxYear) {
          this.currentYear = this.minYear;
        } else if (Object.keys(this.emissionData).length) {
          this.currentYear++;
        }
      }, 1000);
    },

    methods: {
      delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },

      async getData() {
        try {
         const { emissionsPerCountry, isCompleted} = await this.dataStore.getAllEmissionData();
          this.emissionData = emissionsPerCountry;
          
          if(isCompleted) {
            clearInterval(this.getDataIntervalId);
            this.isLoading = false;
          }

          const years = Object.keys(this.emissionData);
          if (years.length) {
            this.minYear = parseInt(years[0]);
            this.maxYear = parseInt(years[years.length - 1]);
            this.currentYear = this.minYear;
          }
        } catch (err:any) {
          console.log(err)
          this.error = err.message;
        }
       
      },
    },
  });
</script>

<style lang="scss" scoped>
  @use '@/styles/colors' as colors;

  .chart-move {
    transition: all 500ms;
  }

  .container {
    display: flex;
    flex-flow: column;
    align-items: center;
    padding: 89px 0 81px;
  }

  .chart {
    display: flex;
    flex-flow: column;
    gap: 10px;

    max-width: 837px;
    width: 100%;
    padding: 50px;

    background-color: colors.$white;

    border: 1px solid #e6e6e6;
    border-radius: 8px;

    margin-top: 20px;
  }
</style>
