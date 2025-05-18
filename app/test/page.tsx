"use client";

import { TestVeridaAPI } from "../components/test-verida-api";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 via-purple-50 to-pink-50 p-4">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Verida API Testing</h1>
        <TestVeridaAPI />
      </div>
    </main>
  );
} 