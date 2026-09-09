import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDataToSchema, SCHEMA_URLS } from '../lib/verida-schema-mapping';
import { encodeSchemaUrl } from '../lib/verida-schema-mapping';

const AUTH_TOKEN = '58d16670-2dee-11f0-b8ca-5b198f1a59d7pduhzxgYXXdVHL5liF0coKxSTCZMXAUidn63_UnddHHLwm+I';

export function TestVeridaAPI() {
  const [fileName, setFileName] = useState('Test Photo');
  const [fileUrl, setFileUrl] = useState('https://example.com/test.jpg');
  const [fileSize, setFileSize] = useState('1024');
  const [fileExt, setFileExt] = useState('jpg');
  const [fileMimeType, setFileMimeType] = useState('image/jpeg');
  const [fileDescription, setFileDescription] = useState('A test photo');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleTestFormat = () => {
    try {
      // Create photo data object
      const photoData = {
        did: 'test-did-123',
        description: fileDescription,
        photoUrl: fileUrl,
        size: parseInt(fileSize),
        order: 0,
        isPrivate: false
      };
      
      // Format it according to schema
      const formattedData = formatDataToSchema('PROFILE_PHOTOS', photoData);
      
      // Display the formatted data
      setResult(JSON.stringify(formattedData, null, 2));
      setError('');
    } catch (err) {
      setError(`Error formatting data: ${err instanceof Error ? err.message : String(err)}`);
      setResult('');
    }
  };
  
  const handleTestAPI = async () => {
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      // Create photo data object
      const photoData = {
        did: 'test-did-123',
        description: fileDescription,
        photoUrl: fileUrl,
        size: parseInt(fileSize),
        order: 0,
        isPrivate: false
      };
      
      // Format it according to schema
      const formattedData = formatDataToSchema('PROFILE_PHOTOS', photoData);
      
      // Prepare API request
      const FILE_SCHEMA_URL = SCHEMA_URLS.FILE;
      const FILE_SCHEMA_PARAM = encodeSchemaUrl(FILE_SCHEMA_URL);
      
      // Call Verida API
      const response = await fetch(`https://api.verida.ai/api/rest/v1/ds/${FILE_SCHEMA_PARAM}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ record: formattedData })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      setResult(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(`API Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Test Verida File Schema API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fileName">File Name (Required)</Label>
            <Input id="fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fileUrl">File URL (URI)</Label>
            <Input id="fileUrl" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fileSize">File Size in Bytes (Required)</Label>
            <Input id="fileSize" value={fileSize} onChange={(e) => setFileSize(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fileExt">File Extension (Required)</Label>
            <Input id="fileExt" value={fileExt} onChange={(e) => setFileExt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fileMimeType">MIME Type (Required)</Label>
            <Input id="fileMimeType" value={fileMimeType} onChange={(e) => setFileMimeType(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fileDescription">Description</Label>
            <Input id="fileDescription" value={fileDescription} onChange={(e) => setFileDescription(e.target.value)} />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button onClick={handleTestFormat} variant="outline">Test Format</Button>
          <Button onClick={handleTestAPI} disabled={loading}>
            {loading ? 'Submitting...' : 'Test API Call'}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-xs">{error}</pre>
            </AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="bg-slate-100 p-4 rounded-md">
            <Label>Result:</Label>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-60">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TestVeridaAPI; 