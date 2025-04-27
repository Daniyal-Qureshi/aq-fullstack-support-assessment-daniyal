/**
 * @vitest-environment happy-dom
 */

import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Home from '../src/views/Home.vue';
import { useDataStore } from '../src/stores/dataStore';
import { createTestingPinia } from '@pinia/testing';

describe('Home.vue', () => {
  let dataStore: ReturnType<typeof useDataStore>;
  beforeEach(() => {
    createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    });
    dataStore = useDataStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('fetches emission data and renders chart rows', async () => {
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {
        2020: [
          { country: 'USA', total: 1000 },
          { country: 'England', total: 2000 },
        ],
      },
      isCompleted: true,
    });

    const wrapper = mount(Home);
    await flushPromises();

    expect(dataStore.getAllEmissionData).toHaveBeenCalled();

    const rows = wrapper.findAllComponents({ name: 'HomeChartRow' });
    expect(rows.length).toBeGreaterThan(0);

    expect(wrapper.text()).toContain('USA');
    expect(wrapper.text()).toContain('England');
  });

  it('renders chart for 269 countries immediately upon loading', async () => {
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {
        2020: Array.from({ length: 269 }, (_, i) => ({
          country: `Country${i + 1}`,
          total: Math.random() * 1000,
        })),
      },
      isCompleted: true,
    });

    const wrapper = mount(Home);
    await flushPromises();

    const chartRows = wrapper.findAllComponents({ name: 'HomeChartRow' });
    expect(chartRows.length).toBe(269);
  });

  it('calls getAllEmissionData() on mount', async () => {
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {},
      isCompleted: true,
    });

    mount(Home);

    expect(dataStore.getAllEmissionData).toHaveBeenCalled();
    expect(dataStore.getAllEmissionData).toHaveBeenCalledTimes(1);
  });

  it('renders Loader while loading', async () => {
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {},
      isCompleted: false,
    });

    const wrapper = mount(Home);

    await flushPromises();  

    expect(wrapper.findComponent({ name: 'Loader' }).exists()).toBe(true);
  });

  it('renders HomeHeader with correct props', async () => {
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {
        2020: [{ country: 'USA', total: 1000 }],
      },
      isCompleted: true,
    });

    const wrapper = mount(Home);

    await flushPromises();

    const header = wrapper.findComponent({ name: 'HomeHeader' });
    expect(header.exists()).toBe(true);
    expect(header.props('currentYear')).toBe(2020);
    expect(header.props('total')).toBe(1000);
  });

  it('renders HomeChartRow components after loading', async () => {
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {
        2020: [
          { country: 'USA', total: 1000 },
          { country: 'England', total: 2000 },
        ],
      },
      isCompleted: true,
    });

    const wrapper = mount(Home);

    await flushPromises();

    const rows = wrapper.findAllComponents({ name: 'HomeChartRow' });
    expect(rows.length).toBe(2);
    expect(wrapper.text()).toContain('USA');
    expect(wrapper.text()).toContain('England');
  });

  it('shows ErrorBoundary when error occurs', async () => {
    
    vi.spyOn(dataStore, 'getAllEmissionData').mockRejectedValue(
      new Error('MockError: This is intentional for testing Error Boundary ,Failed to fetch data from API')
    );

    const wrapper = mount(Home);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ErrorBoundary' }).exists()).toBe(true);
    expect(wrapper.text()).toContain('Failed to fetch data');
  });

  it('sorts countries by descending carbon emissions', async () => {
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {
        2020: [
          { country: 'USA', total: 1000 },
          { country: 'England', total: 2000 },
          { country: 'Pakistan', total: 500 },
        ],
      },
      isCompleted: true,
    });

    const wrapper = mount(Home);

    const vm = wrapper.vm as InstanceType<typeof Home>;

    await flushPromises();
    const countries = (vm.currentYearSortedCountries as string[]).map((country: any) => country.name);

    expect(countries).toEqual(['England', 'USA', 'Pakistan']);
  });

  it('cycles through years automatically', async () => {
    vi.useFakeTimers();

    const mockData = {
      emissionsPerCountry: {
        2020: [{ country: 'Country1', total: 100 }],
        2021: [{ country: 'Country1', total: 100 }],
        2022: [{ country: 'Country1', total: 100 }],
      },
      isCompleted: true,
    };

    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue(mockData);

    const wrapper = mount(Home);

    await flushPromises();

    expect(wrapper.vm.currentYear).toBe(2020);
    expect(wrapper.vm.minYear).toBe(2020);
    expect(wrapper.vm.maxYear).toBe(2022);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    expect(wrapper.vm.currentYear).toBe(2021);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    expect(wrapper.vm.currentYear).toBe(2022);

    vi.advanceTimersByTime(1000);
    await flushPromises();
    expect(wrapper.vm.currentYear).toBe(2020);

    vi.useRealTimers();
  });

  it('stops polling once data is fully loaded', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    vi.spyOn(dataStore, 'getAllEmissionData').mockResolvedValue({
      emissionsPerCountry: {
        2020: [{ country: 'USA', total: 1000 }],
      },
      isCompleted: true,
    });

    const wrapper = mount(Home);

    await flushPromises();  

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
