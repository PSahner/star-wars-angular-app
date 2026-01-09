import { appConfig } from './app.config';

describe('appConfig', () => {
  it('should define providers', () => {
    expect(appConfig).toBeTruthy();
    expect(Array.isArray(appConfig.providers)).toBeTrue();
    expect((appConfig.providers ?? []).length).toBeGreaterThan(0);
  });
});
