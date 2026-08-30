import { WalkingService, WalkingProviderUnavailable } from './walking.service';
const from = {
  name: 'Test origin',
  coordinates: [30, -1.95] as [number, number],
};
const to = {
  name: 'Test stop',
  coordinates: [30.001, -1.95] as [number, number],
};
describe('Pedestrian provider boundary', () => {
  const original = process.env.GOOGLE_ROUTES_API_KEY;
  afterEach(() => {
    if (original) process.env.GOOGLE_ROUTES_API_KEY = original;
    else delete process.env.GOOGLE_ROUTES_API_KEY;
    jest.restoreAllMocks();
  });
  it('allows exact stop endpoints without a provider request', async () => {
    delete process.env.GOOGLE_ROUTES_API_KEY;
    expect((await new WalkingService().route(from, from))?.distanceMeters).toBe(
      0
    );
    await expect(new WalkingService().route(from, to)).rejects.toBeInstanceOf(
      WalkingProviderUnavailable
    );
  });
  it('requests pedestrian geometry, never driving geometry', async () => {
    process.env.GOOGLE_ROUTES_API_KEY = 'synthetic-test-key';
    const fetcher = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            routes: [
              {
                distanceMeters: 130,
                duration: '105s',
                polyline: {
                  geoJsonLinestring: {
                    coordinates: [from.coordinates, to.coordinates],
                  },
                },
              },
            ],
          }),
          { status: 200 }
        )
      );
    const service = new WalkingService();
    expect(await service.route(from, to)).toMatchObject({
      distanceMeters: 130,
      durationSeconds: 105,
      quality: 'pedestrian-route',
    });
    expect(
      JSON.parse(fetcher.mock.calls[0][1]!.body as string).travelMode
    ).toBe('WALK');
    expect(service.metrics().calls).toBe(1);
  });
  it('does not fabricate a path on quota failures, timeouts, or no routes', async () => {
    process.env.GOOGLE_ROUTES_API_KEY = 'synthetic-test-key';
    const fetcher = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 429 }));
    const service = new WalkingService();
    await expect(service.route(from, to)).rejects.toBeInstanceOf(
      WalkingProviderUnavailable
    );
    expect(service.health()).toBe('degraded');
    fetcher.mockRejectedValue(
      new Error('timeout with private provider payload')
    );
    await expect(service.route(from, to)).rejects.not.toThrow(
      'private provider payload'
    );
    fetcher.mockResolvedValue(
      new Response(JSON.stringify({ routes: [] }), { status: 200 })
    );
    expect(await service.route(from, to)).toBeNull();
  });
});
