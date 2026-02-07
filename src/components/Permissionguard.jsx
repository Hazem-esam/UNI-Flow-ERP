import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Lock } from "lucide-react";

const PermissionGuard = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showDenied = true,     // 👈 hide/show denied UI
  fullScreen = true,    // 👈 page-level vs inline
}) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } =
    useContext(AuthContext);

  // Not logged in → no render
  if (!user) return null;

  // ---- permission check ----
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = true;
  }

  // ✅ allowed
  if (hasAccess) return <>{children}</>;

  // ✅ silent mode (buttons, tabs, sections)
  if (!showDenied) return fallback;

  // ✅ inline usage → do NOT render denied UI
  if (!fullScreen) return fallback;

  // ❌ page-level denied UI
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 p-6">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
        <Lock className="w-14 h-14 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-4">
          You don’t have permission to access this content.
        </p>
        <p className="text-sm text-gray-500">
          Required permission:
          <br />
          <strong>{permission || permissions.join(", ")}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Your roles: {user.roles?.join(", ") || "None"}
        </p>
      </div>
    </div>
  );
};

export default PermissionGuard;
