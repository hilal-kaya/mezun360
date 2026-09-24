import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductIdentity } from '@/components/product-identity'
import { homeFor, useIdentity } from '@/features/auth/auth'

const navigation = [
  ['Platform', '#platform'],
  ['Mezun Ağı', '#mezun-agi'],
  ['Kariyer', '#kariyer'],
  ['Mentörlük', '#mentorluk'],
  ['Hakkında', '#hakkinda'],
] as const

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const identity = useIdentity()
  return (
    <header
      className="public-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false)
          toggle.current?.focus()
        }
      }}
    >
      <div className="public-container flex min-h-22 items-center justify-between gap-4">
        <ProductIdentity />
        <nav
          aria-label="Ana gezinme"
          className="hidden items-center gap-6 xl:flex"
        >
          {navigation.map(([label, href]) => (
            <a className="public-nav-link" href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <Button asChild variant="ghost">
            <Link to={identity.data ? homeFor(identity.data) : '/login'}>
              {identity.data ? 'Alanıma dön' : 'Giriş Yap'}
            </Link>
          </Button>
          <Button asChild>
            <Link to="/login">
              Mezun Ağına Katıl
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <Button
          ref={toggle}
          variant="ghost"
          className="xl:hidden"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={open}
          aria-controls="public-mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </div>
      <div
        id="public-mobile-navigation"
        hidden={!open}
        className="border-t bg-card xl:hidden"
      >
        <nav
          aria-label="Mobil gezinme"
          className="public-container grid gap-1 py-5"
        >
          {navigation.map(([label, href]) => (
            <a
              className="public-nav-link rounded-md px-2 py-3"
              href={href}
              key={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="mt-3 flex flex-wrap gap-3 border-t pt-4">
            <Button asChild variant="outline">
              <Link
                to={identity.data ? homeFor(identity.data) : '/login'}
                onClick={() => setOpen(false)}
              >
                {identity.data ? 'Alanıma dön' : 'Giriş Yap'}
              </Link>
            </Button>
            <Button asChild>
              <Link to="/login" onClick={() => setOpen(false)}>
                Mezun Ağına Katıl
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
