import { createContext } from "react";

const AuthRoleContext = createContext({
  roles: [],
  activeRole: null,
  hasRole: () => false,
  hasAnyRole: () => false,
  isAuthenticated: false,
});

export default AuthRoleContext;
