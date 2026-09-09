import { useRef, createContext, useContext, ReactNode } from "react"

// Create a context for the section refs
type SectionRefsContextType = {
  sectionsRef: React.MutableRefObject<(HTMLElement | null)[]>
  registerSection: (index: number, element: HTMLElement | null) => void
}

const SectionRefsContext = createContext<SectionRefsContextType | null>(null)

// Provider component
export function SectionRefsProvider({ children }: { children: ReactNode }) {
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  const registerSection = (index: number, element: HTMLElement | null) => {
    if (sectionsRef.current) {
      sectionsRef.current[index] = element
    }
  }

  return (
    <SectionRefsContext.Provider value={{ sectionsRef, registerSection }}>
      {children}
    </SectionRefsContext.Provider>
  )
}

// Hook to use the section refs
export function useSectionRefs() {
  const context = useContext(SectionRefsContext)
  if (!context) {
    throw new Error("useSectionRefs must be used within a SectionRefsProvider")
  }
  return context
}

// Section ref component to properly handle the ref callback
export function SectionRef({ index, id }: { index: number, id: string }) {
  const { registerSection } = useSectionRefs()
  
  return (
    <div id={id} ref={(el) => registerSection(index, el)} style={{ display: 'contents' }} />
  )
} 