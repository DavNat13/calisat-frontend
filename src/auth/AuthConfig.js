export const msalConfig = {
  auth: {
    clientId: "d221f0d2-1a7c-4872-ad6c-367a1f0717ec",
    authority: "https://login.microsoftonline.com/e5372bf0-c5e3-4286-887c-79069f209c1f",
    redirectUri: "https://ezeh839whh.execute-api.us-east-1.amazonaws.com/desarrrollo/",
    postLogoutRedirectUri: "https://ezeh839whh.execute-api.us-east-1.amazonaws.com/desarrrollo/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const apiRequest = {
  scopes: ["api://d221f0d2-1a7c-4872-ad6c-367a1f0717ec/read-write"],
};
