"use client"

import { useEffect } from "react"
import { Heart } from "lucide-react"

export default function Background() {
  // Add cursor trail effect
  useEffect(() => {
    const createCursorTrail = (e: MouseEvent) => {
      const trail = document.createElement('div')
      trail.className = 'cursor-trail'
      trail.style.left = `${e.pageX}px`
      trail.style.top = `${e.pageY}px`
      document.body.appendChild(trail)
      
      setTimeout(() => {
        trail.style.opacity = '0'
        setTimeout(() => {
          document.body.removeChild(trail)
        }, 500)
      }, 500)
    }

    window.addEventListener('mousemove', createCursorTrail)
    
    return () => {
      window.removeEventListener('mousemove', createCursorTrail)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute top-0 left-0 w-full h-full bg-[#F9F5FF]"></div>
      <div className="bg-love-pattern"></div>
      <div className="bg-hearts-pattern absolute inset-0 opacity-50"></div>

      {/* Wave paths */}
      <div className="wave-path wave-path-top"></div>
      <div className="wave-path wave-path-bottom"></div>

      {/* Animated cursor elements */}
      <div className="path-container">
        {/* Flowing elegant hearts - keep these */}
        <div className="absolute top-[15%] animate-flowing">
          <div className="elegant-heart glow scale-150"></div>
        </div>
        <div className="absolute top-[35%] animate-flowing-slow">
          <div className="elegant-heart glow scale-100"></div>
        </div>
        <div className="absolute top-[55%] animate-flowing">
          <div className="elegant-heart glow scale-125"></div>
        </div>
        <div className="absolute top-[75%] animate-flowing-slow">
          <div className="elegant-heart glow scale-75"></div>
        </div>

        {/* Flowing outlined hearts - keep these */}
        <div className="absolute top-[25%] animate-flowing-reverse">
          <div className="outlined-heart glow-purple scale-150"></div>
        </div>
        <div className="absolute top-[45%] animate-flowing-reverse">
          <div className="outlined-heart glow-purple scale-100"></div>
        </div>
        <div className="absolute top-[65%] animate-flowing-reverse">
          <div className="outlined-heart glow-purple scale-125"></div>
        </div>

        {/* Barbie pink cursors - new elements */}
        <div className="cursor-element style-1" style={{ top: '10%', left: '20%' }}></div>
        <div className="cursor-element style-2" style={{ top: '30%', right: '15%' }}></div>
        <div className="cursor-element style-3" style={{ top: '50%', left: '30%' }}></div>
        <div className="cursor-element style-4" style={{ top: '70%', right: '25%' }}></div>
        <div className="cursor-element style-1 pulse" style={{ top: '15%', right: '30%' }}></div>
        <div className="cursor-element style-2 pulse" style={{ top: '45%', left: '15%' }}></div>
        <div className="cursor-element style-3 pulse" style={{ top: '65%', left: '40%' }}></div>
        <div className="cursor-element style-4 pulse" style={{ top: '25%', left: '35%' }}></div>
        <div className="cursor-element style-1" style={{ top: '85%', right: '10%' }}></div>
        <div className="cursor-element style-2" style={{ top: '5%', left: '45%' }}></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#F0ABFC] to-[#818CF8] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#EC4899] opacity-10 blur-3xl"></div>

        {/* Floating shapes */}
        <div className="absolute top-[20%] left-[10%] w-16 h-16 bg-[#F0ABFC] opacity-20 rounded-full animate-float-slow"></div>
        <div className="absolute top-[40%] right-[15%] w-24 h-24 bg-[#818CF8] opacity-20 rounded-blob animate-float"></div>
        <div className="absolute bottom-[30%] left-[20%] w-20 h-20 bg-[#EC4899] opacity-20 rounded-blob-2 animate-float-medium"></div>

        {/* Barbie Pink Cursor Elements */}
        <div className="cursor-element style-1" style={{ top: '12%', right: '20%' }}></div>
        <div className="cursor-element style-2" style={{ top: '55%', left: '12%' }}></div>
        <div className="cursor-element style-3" style={{ top: '32%', left: '45%' }}></div>
        <div className="cursor-element style-4" style={{ bottom: '25%', right: '25%' }}></div>
        <div className="cursor-element style-1 pulse" style={{ top: '75%', right: '15%' }}></div>

        {/* Varied Heart Styles */}
        <div className="absolute top-[28%] left-[8%] scale-150 animate-float-diagonal-reverse">
          <div className="elegant-heart glow"></div>
        </div>

        <div className="absolute top-[48%] right-[6%] scale-200 animate-float-slow">
          <div className="outlined-heart glow-purple"></div>
        </div>

        <div className="absolute bottom-[18%] left-[15%] scale-150 animate-float-diagonal">
          <div className="elegant-heart glow"></div>
        </div>

        <div className="absolute top-[68%] right-[18%] scale-125 animate-float-diagonal-reverse">
          <div className="outlined-heart glow-purple"></div>
        </div>

        <div className="absolute top-[82%] left-[28%] scale-175 animate-wave">
          <div className="elegant-heart glow"></div>
        </div>

        {/* Decorative patterns */}
        <div className="absolute inset-0 bg-pattern opacity-[0.03]"></div>
      </div>
    </div>
  )
} 