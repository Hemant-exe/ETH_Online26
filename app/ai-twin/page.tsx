"use client"

import AiTwinDashboard from "./components/ai-twin-dashboard"

export default function AiTwinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-slate-800 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

        {/* Floating binary elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-pink-500 opacity-10 font-mono"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 1 + 0.8}rem`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {Math.random() > 0.5 ? "1" : "0"}
            </div>
          ))}
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAxMjgsIDE3MCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full blur opacity-70"></div>
            <h1 className="relative text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600 text-center">
              Your AI Twin
            </h1>
          </div>
          <p className="mt-4 text-lg text-center text-slate-600 max-w-2xl">
            Your AI twin studies your profile, preferences, and interactions to suggest the best matches and
            conversation tips. Customize it below to match your style.
          </p>
        </div>

        <AiTwinDashboard />
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

