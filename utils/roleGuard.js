import { UnauthorizedException } from "./appError.js";
import { RolePermissions } from "./role-permission.js";

export const roleGuard = (role,requiredPermissions) => {
    // Get the permissions for the given role
    const permissions = RolePermissions[role];
  
    // Check if the role has all the required permissions
    const hasPermission = requiredPermissions.every((permission) => permissions.includes(permission));

    if(!hasPermission){
        throw new UnauthorizedException("You do not have the neccessary permissions to perform this action")
    }
  }

  