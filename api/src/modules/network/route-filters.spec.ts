import {
  filterRouteSummaries,
  routeAgencies,
  routeHeadsigns,
} from './route-filters';
import { snapshot } from './network.fixtures';

describe('Route filters', () => {
  const data = snapshot();
  const routes = [
    {
      id: '101',
      shortName: '101',
      longName: '101',
      agency: 'Test operator',
      patterns: 1,
    },
    {
      id: '202',
      shortName: '202',
      longName: '202',
      agency: 'Other operator',
      patterns: 1,
    },
  ];

  it('filters by agency and destination headsign', () => {
    expect(
      filterRouteSummaries(routes, data, { agency: 'Test operator' })
    ).toHaveLength(1);
    expect(
      filterRouteSummaries(routes, data, { headsign: 'E' }).map((r) => r.id)
    ).toEqual(['202']);
    expect(routeAgencies(routes)).toEqual(['Other operator', 'Test operator']);
    expect(routeHeadsigns(data)).toEqual(['C', 'E', 'F']);
  });
});
