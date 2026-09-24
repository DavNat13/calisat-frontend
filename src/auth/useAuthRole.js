import { useContext } from "react";
import AuthRoleContext from "./authRoleContext";

export default function useAuthRole() {
  return useContext(AuthRoleContext);
}
