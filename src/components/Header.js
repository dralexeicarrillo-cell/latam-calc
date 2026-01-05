import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="font-serif text-2xl font-bold text-[#1A1F2C]">NHS+</span>
          <div className="h-6 w-[1px] bg-slate-300 mx-2 hidden sm:block"></div>
          <span className="text-sm font-bold text-[#F7941D] tracking-widest uppercase hidden sm:block">
            Market Calculator
          </span>
        </Link>
        
        <a 
          href="https://nhealths.com" 
          className="text-sm font-medium text-slate-500 hover:text-[#1A1F2C] transition-colors"
        >
          ← Volver a NexusHealth
        </a>
      </div>
    </header>
  )
}