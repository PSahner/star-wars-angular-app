import { routes } from './app.routes';

describe('app routes', () => {
  it('should define root redirect to /charaktere', () => {
    const root = routes.find(r => r.path === '');
    expect(root).toBeTruthy();
    expect(root?.redirectTo).toBe('/charaktere');
    expect(root?.pathMatch).toBe('full');
  });

  it('should define people list route', () => {
    const r = routes.find(x => x.path === 'charaktere');
    expect(r).toBeTruthy();
    expect(r?.title).toContain('Charaktere');
    expect(r?.component).toBeTruthy();
  });

  it('should define people detail route', () => {
    const r = routes.find(x => x.path === 'charaktere/:id');
    expect(r).toBeTruthy();
    expect(r?.title).toContain('Charakter Details');
    expect(r?.component).toBeTruthy();
  });

  it('should define wildcard redirect', () => {
    const wild = routes.find(r => r.path === '**');
    expect(wild).toBeTruthy();
    expect(wild?.redirectTo).toBe('/charaktere');
  });
});
