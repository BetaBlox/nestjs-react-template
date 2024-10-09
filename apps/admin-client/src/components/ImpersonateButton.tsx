import React from 'react';
import { Button } from '@/components/button';
import { useMutation } from '@tanstack/react-query';
import { customFetch, HttpMethod } from '@/common/custom-fetcher';

interface ImpersonateButtonProps {
  userId: string;
}

export function ImpersonateButton({ userId }: ImpersonateButtonProps) {
  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await customFetch('/api/auth/impersonate', {
        method: HttpMethod.POST,
        body: JSON.stringify({ userId }),
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data && data.redirectUrl) {
        // Open the redirect URL in a new tab
        window.open(data.redirectUrl, '_blank');
      } else {
        console.error('Impersonation failed: No redirect URL received');
      }
    },
    onError: (error) => {
      console.error('Impersonation error:', error);
      alert('Failed to impersonate user. Please try again.');
    },
  });

  const handleImpersonate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('HANDLING IMPERSONATION CLICKED');
    impersonateMutation.mutate(userId);
  };

  return (
    <Button
      onClick={handleImpersonate}
      disabled={impersonateMutation.isPending}
      variant="outline"
      size="sm"
    >
      {impersonateMutation.isPending ? 'Impersonating...' : 'Impersonate'}
    </Button>
  );
}
