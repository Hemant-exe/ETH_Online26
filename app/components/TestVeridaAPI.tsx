'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  testApiConnectivity, 
  testDatabaseQuery, 
  getTokenInfo, 
  verifyTokenScopes, 
  testDataFormatting,
  testCreateSocialPost
} from '@/app/lib/testapi';

export default function TestVeridaAPI() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testType, setTestType] = useState<string>('');

  const runTest = async (type: string, testFn: () => Promise<any>) => {
    setLoading(true);
    setTestType(type);
    try {
      const result = await testFn();
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        message: `Error running test: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Test Verida API Connectivity</CardTitle>
        <CardDescription>
          Use this tool to test connection to Verida API and verify permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => runTest('API Connectivity', testApiConnectivity)}
            disabled={loading}
          >
            Test API Connection
          </Button>
          <Button 
            variant="outline" 
            onClick={() => runTest('Query Test', testDatabaseQuery)}
            disabled={loading}
          >
            Test Datastore Query
          </Button>
          <Button 
            variant="outline" 
            onClick={() => runTest('Token Info', getTokenInfo)}
            disabled={loading}
          >
            Get Token Info
          </Button>
          <Button 
            variant="outline" 
            onClick={() => runTest('Verify Scopes', verifyTokenScopes)}
            disabled={loading}
          >
            Verify Token Scopes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => runTest('Data Formatting', testDataFormatting)}
            disabled={loading}
          >
            Test Data Formatting
          </Button>
          <Button 
            variant="outline" 
            onClick={() => runTest('Social Post Creation', testCreateSocialPost)}
            disabled={loading}
          >
            Test Social Post API
          </Button>
        </div>
        
        {loading && <div className="text-center py-4">Running {testType} test...</div>}
        
        {results && (
          <div className={`p-4 rounded-md ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${results.success ? 'text-green-700' : 'text-red-700'}`}>
              {results.success ? 'Success' : 'Error'}
            </h3>
            <p className="mb-2">{results.message}</p>
            {results.data && (
              <pre className="text-xs bg-gray-800 text-white p-3 rounded overflow-auto max-h-80">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        These tests communicate directly with the Verida API and can help diagnose issues.
      </CardFooter>
    </Card>
  );
} 