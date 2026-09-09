'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Profile page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Something went wrong</CardTitle>
          <CardDescription className="text-base mt-1 text-gray-600">
            We encountered an issue with the profile creation
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-600 bg-red-50 p-4 rounded-lg text-sm mb-4">
            {error.message || "There was an error connecting to the Verida network. Please try again."}
          </p>
          <p className="text-gray-600 mb-4">
            This could be due to network issues or problems with the Verida integration.
            Please try refreshing the page or try again later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button 
            onClick={reset}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 