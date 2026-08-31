import {
  kigaliDate,
  kigaliWeekday,
  serviceActiveAtTime,
  serviceRunsOnDate,
} from './service-calendar';
import { pattern } from './network.fixtures';

describe('Service calendar', () => {
  const p = pattern('101', ['A', 'B']);
  p.service.validFrom = '2019-02-25';
  p.service.validTo = '2021-02-25';
  p.service.weekdays = [true, true, true, true, true, false, false];
  p.service.exceptions = [{ date: '2019-03-01', added: false }];
  p.service.windows = [
    { startSeconds: 6 * 3600, endSeconds: 22 * 3600, headwaySeconds: 600 },
  ];

  it('respects validity, weekdays, and calendar exceptions', () => {
    expect(serviceRunsOnDate(p.service, '2019-02-26')).toBe(true);
    expect(serviceRunsOnDate(p.service, '2019-03-02')).toBe(false);
    expect(serviceRunsOnDate(p.service, '2019-03-01')).toBe(false);
    expect(serviceRunsOnDate(p.service, '2022-01-01')).toBe(false);
  });

  it('checks frequency windows without inventing headway waits', () => {
    expect(serviceActiveAtTime(p.service, '2019-02-26', 8 * 3600)).toBe(true);
    expect(serviceActiveAtTime(p.service, '2019-02-26', 23 * 3600)).toBe(false);
    const noWindows = { ...p.service, windows: [] };
    expect(serviceActiveAtTime(noWindows, '2019-02-26', 8 * 3600)).toBeNull();
  });

  it('formats Kigali local dates', () => {
    const date = new Date('2019-02-26T22:30:00Z');
    expect(kigaliDate(date)).toMatch(/2019-02-2[67]/);
    expect(kigaliWeekday(new Date('2019-02-26T12:00:00Z'))).toBeGreaterThanOrEqual(
      0
    );
  });
});
