import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductIdentity } from '@/components/product-identity'
import { homeFor, useIdentity } from '@/features/auth/auth'

const navigation = [
  ['Platform', '#platform'],
  ['Nasıl Çalışır?', '#nasil-calisir'],
  ['Ekosistem', '#ekosistem'],
  ['İletişim & Destek', '#iletisim'],
] as const

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const identity = useIdentity()

  return (
    <header
      className="public-header backdrop-blur-md bg-white/90 sticky top-0 z-40 border-b border-slate-100"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false)
          toggle.current?.focus()
        }
      }}
    >
      <div className="public-container flex min-h-20 items-center justify-between gap-4">
        <ProductIdentity />
        
        <nav
          aria-label="Ana gezinme"
          className="hidden items-center gap-7 lg:flex"
        >
          {navigation.map(([label, href]) => (
            <a 
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors py-2" 
              href={href} 
              key={href}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" className="text-sm font-semibold text-slate-700 hover:text-primary">
            <Link to={identity.data ? homeFor(identity.data) : '/login'}>
              {identity.data ? 'Alanıma dön' : 'Giriş Yap'}
            </Link>
          </Button>
          <Button asChild className="rounded-full px-5 bg-primary text-white hover:bg-primary/90 font-semibold shadow-sm">
            <Link to={identity.data ? homeFor(identity.data) : '/register'}>
              Mezun Ağına Katıl
              <ArrowUpRight size={16} aria-hidden="true" className="ml-1" />
            </Link>
          </Button>
        </div>

        <Button
          ref={toggle}
          variant="ghost"
          className="lg:hidden"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={open}
          aria-controls="public-mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </Button>
      </div>

      <div
        id="public-mobile-navigation"
        hidden={!open}
        className="border-t bg-white lg:hidden shadow-lg animate-in slide-in-from-top-2 duration-200"
      >
        <nav
          aria-label="Mobil gezinme"
          className="public-container grid gap-2 py-5"
        >
          {navigation.map(([label, href]) => (
            <a
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-pastel-blue-light hover:text-primary transition-colors"
              href={href}
              key={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-4">
            <Button asChild variant="outline" className="w-full justify-center rounded-xl">
              <Link
                to={identity.data ? homeFor(identity.data) : '/login'}
                onClick={() => setOpen(false)}
              >
                {identity.data ? 'Alanıma dön' : 'Giriş Yap'}
              </Link>
            </Button>
            <Button asChild className="w-full justify-center rounded-xl bg-primary text-white hover:bg-primary/90">
              <Link to={identity.data ? homeFor(identity.data) : '/register'} onClick={() => setOpen(false)}>
                Mezun Ağına Katıl
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
