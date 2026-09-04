import { ROLES_KEY } from '../../common/decorators/auth.decorators';
import { RoleTypes } from '../../constants/role.constants';
import { DashboardController } from './dashboard.controller';

function rolesOf(method: keyof DashboardController): RoleTypes[] | undefined {
  return Reflect.getMetadata(
    ROLES_KEY,
    DashboardController.prototype[method]
  );
}

describe('DashboardController roles', () => {
  it('restricts the driver summary to drivers and staff', () => {
    expect(rolesOf('getDriverSummary')).toEqual(
      expect.arrayContaining([
        RoleTypes.DRIVER,
        RoleTypes.ADMIN,
        RoleTypes.SUPER_ADMIN,
      ])
    );
    expect(rolesOf('getDriverSummary')).not.toContain(RoleTypes.USER);
  });

  it('restricts the operations overview to staff', () => {
    expect(rolesOf('getOverview')).toEqual(
      expect.arrayContaining([RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN])
    );
    expect(rolesOf('getOverview')).not.toContain(RoleTypes.USER);
    expect(rolesOf('getOverview')).not.toContain(RoleTypes.DRIVER);
  });

  it('leaves the commuter summary open to any authenticated user', () => {
    expect(rolesOf('getCommuterSummary')).toBeUndefined();
  });
});
