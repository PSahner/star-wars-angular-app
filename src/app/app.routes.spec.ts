import { routes } from './app.routes';

describe('app routes', () => {
  it('should define people list route', () => {
    const r = routes.find(x => x.path === 'people');
    expect(r).toBeTruthy();
    expect(r?.title).toContain('People');
    expect(r?.component).toBeTruthy();
  });

  it('should define people detail route', () => {
    const r = routes.find(x => x.path === 'people/:id');
    expect(r).toBeTruthy();
    expect(r?.title).toContain('People');
    expect(r?.component).toBeTruthy();
  });

  it('should define films list route', () => {
    const r = routes.find(x => x.path === 'films');
    expect(r).toBeTruthy();
    expect(r?.title).toContain('Films');
    expect(r?.component).toBeTruthy();
  });

  it('should define planets list route', () => {
    const r = routes.find(x => x.path === 'planets');
    expect(r).toBeTruthy();
    expect(r?.title).toContain('Planets');
    expect(r?.component).toBeTruthy();
  });

  it('should define wildcard redirect', () => {
    const wild = routes.find(r => r.path === '**');
    expect(wild).toBeTruthy();
    expect(wild?.redirectTo).toBe('/');
  });
});
