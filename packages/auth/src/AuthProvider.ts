import { User } from '@repo/database';
import { JwtPayload, jwtDecode } from 'jwt-decode';

interface AuthProvider {
  loaded: boolean;
  isAuthenticated: boolean;
  email: string | null;
  user: User | null;
  isImpersonated: boolean;
  impersonatedBy: string | null;
}

export type RefreshTokensResponse = {
  accessToken: string | null;
  refreshToken: string | null;
};

export const AUTH_TOKENS = 'authTokens';

export const AuthProvider: AuthProvider = {
  // indicates that the auth provider has full initialized
  // from memory/short-term storage
  loaded: false,
  isAuthenticated: false,
  email: null,
  user: null,
  isImpersonated: false,
  impersonatedBy: null,
};

export async function isAuthenticatedAsync() {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (AuthProvider.loaded) {
        resolve(AuthProvider.isAuthenticated);
        clearInterval(interval);
      }
    }, 100);
  });
}

export async function signin(
  email: string,
  password: string,
): Promise<Response> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.ok) {
    const { accessToken, refreshToken } = await response.json();

    AuthProvider.isAuthenticated = true;
    AuthProvider.email = email;
    localStorage.setItem(
      AUTH_TOKENS,
      JSON.stringify({
        accessToken,
        refreshToken,
      }),
    );

    await loadUserProfile();
  }

  return response;
}

export async function loadUserProfile(): Promise<void> {
  const token = getAccessTokenFromStorage();
  const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const json = await response.json();
    AuthProvider.user = json;
    AuthProvider.email = json.email;
    checkImpersonationFromToken(token);
  } else {
    await signout();
    window.location.href = '/';
  }
}

export async function updateUserProfile(updates: object): Promise<Response> {
  const token = getAccessTokenFromStorage();

  const response = await fetch('/api/auth/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (response.ok) {
    const json = await response.json();
    AuthProvider.user = json;
    AuthProvider.email = json.email;
  }

  return response;
}

export async function signout() {
  const token = getAccessTokenFromStorage();

  await fetch('/api/auth/logout', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  AuthProvider.isAuthenticated = false;
  AuthProvider.email = null;
  AuthProvider.user = null;
  localStorage.removeItem(AUTH_TOKENS);
}

let refreshPromise: Promise<RefreshTokensResponse> | null = null;
export async function refreshTokens(): Promise<RefreshTokensResponse> {
  // Make sure we only try to refresh once.
  // Even if a bunch of API requests fire off at once.
  if (refreshPromise) {
    console.log('existing refresh promise found, returning it');
    return refreshPromise;
  }

  const token = getRefreshTokenFromStorage();

  console.log('user token is expired. Attempting to refresh.');

  refreshPromise = new Promise(async (resolve) => {
    const response = await fetch('/api/auth/refresh', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('user token successfully refreshed');
      const { accessToken, refreshToken } = await response.json();
      localStorage.setItem(
        AUTH_TOKENS,
        JSON.stringify({
          accessToken,
          refreshToken,
        }),
      );

      return resolve({
        accessToken,
        refreshToken,
      });
    } else {
      await signout();
      return resolve({
        accessToken: null,
        refreshToken: null,
      });
    }
  });

  // Make sure to wipe this once resolved so we can refresh again later
  refreshPromise.then(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function tokenIsExpired(token: string) {
  const decodedToken = jwtDecode<JwtPayload>(token);

  if (!token || !decodedToken.exp) {
    return true;
  }

  const currentTimestamp = Date.now() / 1000;
  return decodedToken.exp < currentTimestamp;
}

export async function loadFromStorage() {
  console.log('loading user authentication from storage');
  const accessToken = getAccessTokenFromStorage();
  const refreshToken = getRefreshTokenFromStorage();

  if (!accessToken || !refreshToken) {
    console.log('unable to find access token or refesh token from storage');
  }

  const isValid = accessToken && tokenIsExpired(accessToken) === false;
  const isExpired = accessToken && tokenIsExpired(accessToken);

  if (isValid) {
    console.log('user is authenticated via access token');
    // User access token is still valid we don't need to do anything
    await loadUserProfile();
    AuthProvider.isAuthenticated = true;
    AuthProvider.loaded = true;
    return;
  } else if (isExpired) {
    console.log('user access token is expired, attempting to refresh');
    // Access token exists, but is expired. Let's try to refresh before kicking the user out
    await refreshTokens();
    await loadUserProfile();
    AuthProvider.isAuthenticated = true;
    AuthProvider.loaded = true;
    return;
  } else {
    console.log('failed to prove if the token is expired or valid');

    // Kick the user out because we can't be sure what's going on.
    AuthProvider.loaded = true;
    await signout();
  }
}

export function getAccessTokenFromStorage(): string | null {
  const tokens = localStorage.getItem(AUTH_TOKENS);
  const decodedTokens = tokens ? JSON.parse(tokens) : {};
  return decodedTokens.accessToken || null;
}

export function getRefreshTokenFromStorage(): string | null {
  const tokens = localStorage.getItem(AUTH_TOKENS);
  const decodedTokens = tokens ? JSON.parse(tokens) : {};
  return decodedTokens.refreshToken || null;
}

export async function changePassword(password: string): Promise<Response> {
  const token = getAccessTokenFromStorage();

  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
  return response;
}

// Add this new function to the AuthProvider
export async function impersonate(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const decodedToken = jwtDecode<JwtPayload>(accessToken);
  console.log('Impersonating!!!');
  console.log('decodedToken', decodedToken);

  //@ts-expect-error
  const impersonatedBy = decodedToken.impersonatedBy;
  AuthProvider.isAuthenticated = true;
  AuthProvider.isImpersonated = true;
  AuthProvider.impersonatedBy = impersonatedBy;
  localStorage.setItem(
    AUTH_TOKENS,
    JSON.stringify({
      accessToken,
      refreshToken,
    }),
  );

  await loadUserProfile();
}

export function checkImpersonationFromToken(accessToken: string) {
  const decodedToken = jwtDecode<JwtPayload>(accessToken);
  console.log('decodedToken', decodedToken);
  //@ts-expect-error
  const impersonatedBy = decodedToken.impersonatedBy;
  if (impersonatedBy) {
    AuthProvider.isImpersonated = true;
    AuthProvider.impersonatedBy = impersonatedBy;
  }
}
