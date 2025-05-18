'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AUTH_TOKEN } from './verida-config';

// Define a type for the Verida client
interface VeridaClient {
  connect: () => Promise<boolean>;
  isConnected: () => boolean;
  getDid: () => string | null;
  openDatabase: (dbName: string) => Promise<any>;
  disconnect: () => void;
  getClient: () => any;
  getAccount: () => any;
  getContext: () => any;
}

// Create placeholders for state
let veridaClientInstance: VeridaClient | null = null;
let isClientInitialized = false;

// Create a hook to use Verida client safely on the client side
export const useVeridaClient = () => {
  const [client, setClient] = useState<VeridaClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Dynamic import of the Verida client - only happens on client side
    const loadVeridaClient = async () => {
      try {
        setIsLoading(true);
        
        // Only initialize once
        if (!isClientInitialized) {
          // Dynamically import the Verida modules only on the client side
          const { veridaClient } = await import('./verida-client');
          veridaClientInstance = veridaClient;
          isClientInitialized = true;
        }
        
        setClient(veridaClientInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Verida client:', err);
        setError(err instanceof Error ? err : new Error('Failed to load Verida client'));
        setIsLoading(false);
      }
    };

    loadVeridaClient();
  }, []);

  // Enhanced utility functions for the hook
  
  // Get authentication status
  const getAuthStatus = async (): Promise<boolean> => {
    if (isLoading || !client) return false;
    try {
      return client.isConnected();
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return false;
    }
  };
  
  // Get user's DID
  const getDidId = async (): Promise<string | null> => {
    if (isLoading || !client) return null;
    try {
      return client.getDid();
    } catch (error) {
      console.error('Failed to get DID:', error);
      return null;
    }
  };
  
  // Get authentication token for API calls
  const getAuthToken = async (): Promise<string | null> => {
    // Using the centralized auth token from config
    try {
      return AUTH_TOKEN;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  };

  return { 
    client, 
    isLoading, 
    error,
    getAuthStatus,
    getDidId,
    getAuthToken
  };
};

// Wrapper for the ProfileService
export const useProfileService = () => {
  const [profileService, setProfileService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProfileService = async () => {
      try {
        setIsLoading(true);
        // Dynamically import the profile service
        const { ProfileService } = await import('./profile-service');
        setProfileService(ProfileService);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load ProfileService:', err);
        setError(err instanceof Error ? err : new Error('Failed to load ProfileService'));
        setIsLoading(false);
      }
    };

    loadProfileService();
  }, []);

  return { profileService, isLoading, error };
};

// Create a hook that uses ProfileRestService
export const useProfileRestService = () => {
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadService = async () => {
      try {
        setIsLoading(true);
        const { ProfileRestService } = await import('./profile-rest-service');
        setService(ProfileRestService);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load ProfileRestService:', err);
        setError(err instanceof Error ? err : new Error('Failed to load ProfileRestService'));
        setIsLoading(false);
      }
    };

    loadService();
  }, []);

  return { service, isLoading, error };
};

// Hook for listening to profile changes
export const useProfileChanges = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { client } = useVeridaClient();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!client) return;
      
      try {
        setIsLoading(true);
        // Open the profile database
        const profileDb = await client.openDatabase('profile');
        
        // Get initial profile data
        const profile = await profileDb.get('profile');
        setProfileData(profile);

        // Set up change listener
        profileDb.onChange((changes: any) => {
          if (changes.type === 'profile') {
            setProfileData(changes.data);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [client]);

  return { profileData, isLoading, error };
};

// Hook for listening to photo changes
export const usePhotoChanges = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { client } = useVeridaClient();

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!client) return;
      
      try {
        setIsLoading(true);
        // Open the photos database
        const photosDb = await client.openDatabase('photos');
        
        // Get initial photos
        const photosList = await photosDb.getMany('photos');
        setPhotos(photosList);

        // Set up change listener
        photosDb.onChange((changes: any) => {
          if (changes.type === 'photos') {
            setPhotos(changes.data);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch photos:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch photos'));
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [client]);

  return { photos, isLoading, error };
};

// Hook for handling message notifications
export const useMessageNotifications = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { client } = useVeridaClient();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!client) return;
      
      try {
        setIsLoading(true);
        // Open the messages database
        const messagesDb = await client.openDatabase('messages');
        
        // Get initial messages
        const messagesList = await messagesDb.getMany('messages', {
          sort: [{ sentAt: 'desc' }]
        });
        setMessages(messagesList);

        // Set up change listener
        messagesDb.onChange((changes: any) => {
          if (changes.type === 'messages') {
            setMessages(changes.data);
            setHasNewMessages(true);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [client]);

  const markAsRead = () => {
    setHasNewMessages(false);
  };

  return { messages, hasNewMessages, isLoading, error, markAsRead };
};

// No-op component for SSR
export const NoSSR = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Export a No-SSR wrapper for components that use Verida
export const withNoSSR = (Component: React.ComponentType<any>) => {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
  });
};

// Add a custom VeridaAuthWrapper to fix font issues
export const useVeridaAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { client, getAuthStatus } = useVeridaClient();

  useEffect(() => {
    const checkAuth = async () => {
      if (!client) return;
      try {
        const authenticated = await getAuthStatus();
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to check auth status:', err);
        setError(err instanceof Error ? err : new Error('Failed to check auth status'));
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [client, getAuthStatus]);

  const login = async (contextName: string) => {
    if (!client) return false;
    try {
      // Direct implementation instead of using the problematic module
      // This simulates what the Verida auth flow does but without the font import
      const didLogin = await client.connect();
      if (didLogin) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to login:', err);
      setError(err instanceof Error ? err : new Error('Failed to login'));
      return false;
    }
  };

  const logout = async () => {
    if (!client) return false;
    try {
      client.disconnect();
      setIsAuthenticated(false);
      return true;
    } catch (err) {
      console.error('Failed to logout:', err);
      setError(err instanceof Error ? err : new Error('Failed to logout'));
      return false;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };
};

// Custom component that doesn't rely on the problematic font import
export const VeridaAuthButton = withNoSSR(({ context, onSuccess, onError }: { 
  context: string, 
  onSuccess?: () => void, 
  onError?: (error: Error) => void 
}) => {
  const { login, isAuthenticated, isLoading, error } = useVeridaAuth();
  const [isAttemptingLogin, setIsAttemptingLogin] = useState(false);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (isAuthenticated && onSuccess) {
      onSuccess();
    }
  }, [isAuthenticated, onSuccess]);

  const handleLogin = async () => {
    setIsAttemptingLogin(true);
    try {
      await login(context);
    } catch (e) {
      console.error('Login error:', e);
      if (onError) onError(e instanceof Error ? e : new Error('Login failed'));
    } finally {
      setIsAttemptingLogin(false);
    }
  };

  if (isLoading) {
    return <button className="btn-loading" disabled>Loading...</button>;
  }

  if (isAuthenticated) {
    return <button className="btn-success" disabled>Connected</button>;
  }

  return (
    <button 
      onClick={handleLogin} 
      disabled={isAttemptingLogin}
      className={`btn-auth ${isAttemptingLogin ? 'btn-loading' : ''}`}
    >
      {isAttemptingLogin ? 'Connecting...' : 'Connect with Verida'}
    </button>
  );
}); 