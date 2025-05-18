import ProfileOverview from "./components/profile-overview"

export const metadata = {
  title: 'Your NFT Profile | Dating Blockchain',
  description: 'View and manage your blockchain-secured dating profile',
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-slate-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAxMjgsIDE3MCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-70" />
        
        {/* Add animated blockchain nodes background */}
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          <div className="blockchain-nodes"></div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Add page header with blockchain integration messaging */}
        {/* <div className="text-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent inline-block">
            Your Blockchain Profile
          </h1>
          
        </div> */}

        <ProfileOverview />
      </div>
    </div>
  )
}

// Add this to your global.css or as a styled component
/* 
.blockchain-nodes {
  background-image: radial-gradient(circle at center, rgba(109, 40, 217, 0.1) 2px, transparent 2px);
  background-size: 50px 50px;
  width: 100%;
  height: 100%;
  animation: nodeFloat 15s infinite linear;
}

@keyframes nodeFloat {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}
*/

