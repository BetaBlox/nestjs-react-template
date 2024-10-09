import React, { useEffect } from 'react';
import { impersonate } from '@repo/auth';

export default function ImpersonatePage() {
  useEffect(() => {
    const exchangeToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        window.location.href = '/login?error=invalid_token';
        return;
      }

      try {
        const response = await fetch('/api/auth/exchange-impersonation-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange impersonation token');
        }

        const { accessToken, refreshToken } = await response.json();
        console.log('On the Impersonate Page');
        await impersonate(accessToken, refreshToken);
        //set timeout to 2 seconds then redirect to home
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        console.error('Impersonation token exchange error:', error);
        window.location.href = '/login?error=impersonation_failed';
      }
    };

    exchangeToken();
  }, []);

  return (
    <>
      <div>Impersonating user...</div>
      <div>Redirecting to home...</div>
    </>
  );
}
