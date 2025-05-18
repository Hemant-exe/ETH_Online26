"use client"

import { useState, useEffect } from "react"
import ChatInterface from "./components/chat-interface"
import { HeartLoader } from "@/components/ui/heart-loader"

export default function ChatsPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate loading for a better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="h-screen fixed w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-slate-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-gradient-to-r from-pink-300 to-rose-300 blur-3xl animate-pulse"></div>
          <div
            className="absolute top-[40%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-[15%] left-[20%] w-72 h-72 rounded-full bg-gradient-to-r from-rose-300 to-red-300 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Floating message bubbles */}
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-pink-500 opacity-10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 2 + 1}rem`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              💬
            </div>
          ))}
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAxMjgsIDE3MCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
            <HeartLoader size="lg" showText text="Loading your matches..." />
            <p className="text-pink-500 mt-6 text-lg font-medium">
              Connecting to the blockchain...
            </p>
            <p className="text-pink-400 mt-2 text-sm max-w-md text-center">
              We're retrieving your conversations and preparing your AI assistant
            </p>
          </div>
        ) : (
          <div className="h-[calc(100%-120px)]">
            <ChatInterface />
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-100px) rotate(10deg);
          }
          100% {
            transform: translateY(-200px) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

