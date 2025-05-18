"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

// Constants
const API_BASE_URL = 'https://api.verida.ai'
const AUTH_TOKEN = '58d16670-2dee-11f0-b8ca-5b198f1a59d7pduhzxgYXXdVHL5liF0coKxSTCZMXAUidn63_UnddHHLwm+I'
const CHAT_SCHEMA = 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json'

export default function ApiTestPage() {
  const [endpoint, setEndpoint] = useState(`/api/rest/v1/ds/query/${btoa(CHAT_SCHEMA).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`)
  const [method, setMethod] = useState("POST")
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    recordFilter: {
      groupId: "chat:group:did:vda:testnet:0x123:did:vda:testnet:0x456"
    },
    options: {
      sort: { sentAt: 1 },
      limit: 50,
      skip: 0
    }
  }, null, 2))
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendRequest = async () => {
    setIsLoading(true)
    setError("")
    setResponse("")
    
    try {
      // Validate JSON
      const body = JSON.parse(requestBody)
      
      // Send request
      const url = API_BASE_URL + endpoint
      console.log(`Sending ${method} request to: ${url}`)
      console.log('Request body:', body)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      
      // Get response text first
      const responseText = await response.text()
      
      if (!response.ok) {
        setError(`Error ${response.status}: ${responseText}`)
        return
      }
      
      // Try to parse as JSON for pretty printing
      try {
        const json = JSON.parse(responseText)
        setResponse(JSON.stringify(json, null, 2))
      } catch {
        setResponse(responseText)
      }
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Try common sort formats
  const trySortFormats = () => {
    const tryFormats = [
      // Try object format
      { sentAt: 1 },
      // Try array format
      [["sentAt", 1]],
      // Try string
      "sentAt",
      // Try without sort
      undefined
    ]
    
    let body = JSON.parse(requestBody)
    const sortType = parseInt(prompt("Which sort format to try? (0-3)", "0") || "0")
    
    if (sortType >= 0 && sortType < tryFormats.length) {
      body.options.sort = tryFormats[sortType]
      setRequestBody(JSON.stringify(body, null, 2))
      alert(`Updated sort format to: ${JSON.stringify(tryFormats[sortType])}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Verida API Test</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>API Request</CardTitle>
            <CardDescription>Test Verida API endpoints directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Endpoint</label>
              <Input 
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/rest/v1/ds/query/..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Method</label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Request Body (JSON)</label>
              <Textarea 
                className="font-mono text-sm"
                rows={10}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={trySortFormats}
            >
              Try Sort Formats
            </Button>
            
            <Button 
              onClick={handleSendRequest}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>View the response from the API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                <p className="font-semibold">Error</p>
                <pre className="whitespace-pre-wrap text-sm mt-2">{error}</pre>
              </div>
            )}
            
            {response && (
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="font-semibold">Response</p>
                <pre className="whitespace-pre-wrap text-sm mt-2 overflow-auto max-h-[500px]">{response}</pre>
              </div>
            )}
            
            {!error && !response && (
              <div className="text-center py-8 text-slate-500">
                <p>Send a request to see the response</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 