/**
 * Stub temporal: lo sustituye @Frontend Developer con la lógica MSAL +
 * Cognito (mismo contrato).
 *
 * Forma del objeto consumida por LoginPage: institucional / publico /
 * sesionActiva / error / cerrando. No cambies la forma sin avisar.
 */
export default function useLoginActions() {
  return {
    institucional: { loading: false, onAcceder: () => {} },
    publico: { loading: false, onAcceder: () => {}, onRegistro: () => {} },
    sesionActiva: { proveedor: null, identificador: null, onCerrarSesion: () => {} },
    error: null,
    cerrando: false,
  };
}
