import { AuthProvider } from '@repo/auth';

export function ImpersonationBanner() {
  const isImpersonated = AuthProvider.isImpersonated;

  if (!isImpersonated) {
    return null;
  }

  return (
    <div
      className="flex w-full items-center justify-end border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700"
      role="alert"
    >
      <div>
        <p className="font-bold">You are impersonating a user</p>
        <p>Remember to log out when you're done.</p>
      </div>
      <button
        // onClick={logout}
        className="ml-4 rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-700"
      >
        End Impersonation
      </button>
    </div>
  );
}
