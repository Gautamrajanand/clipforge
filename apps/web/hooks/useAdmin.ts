import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchWithAuth } from '@/lib/api';

export function useAdmin() {
  const { getToken: getClerkToken, isLoaded, isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    checkAdminStatus();
  }, [isLoaded, isSignedIn]);

  const checkAdminStatus = async () => {
    try {
      // Try to access admin dashboard endpoint
      const response = await fetchWithAuth('http://localhost:3000/admin/dashboard', {
        method: 'GET',
        getToken: getClerkToken,
      });

      setIsAdmin(response.ok);
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}
