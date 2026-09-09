'use client';

import { useState } from 'react';
import { VeridaAuthButton, useVeridaClient } from '@/app/lib/clientside-verida';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';

export function VeridaAuthExample() {
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { client } = useVeridaClient();

  const handleSuccess = () => {
    setAuthStatus('success');
    setErrorMessage(null);
  };

  const handleError = (error: Error) => {
    setAuthStatus('error');
    setErrorMessage(error.message);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Connect with Verida</CardTitle>
        <CardDescription>
          Use this component instead of direct Verida authentication to avoid font issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <VeridaAuthButton 
            context="dating-blockchain" 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
        
        {authStatus === 'success' && (
          <div className="flex items-center p-3 bg-green-50 rounded-md text-green-700">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Successfully connected to Verida</span>
          </div>
        )}
        
        {authStatus === 'error' && (
          <div className="flex items-center p-3 bg-red-50 rounded-md text-red-700">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{errorMessage || 'An error occurred during authentication'}</span>
          </div>
        )}
        
        {client && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium">Client Information:</p>
            <p className="text-xs truncate">
              {client.isConnected() ? 'Connected' : 'Not connected'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 