import { Link } from 'react-router-dom'

/** Text product identity; this is not an invented university logo. */
export function ProductIdentity({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex flex-col leading-tight ${inverse ? 'text-white' : 'text-primary'}`}
      aria-label="BTÜ Mezun360 ana sayfa"
    >
      <span className="text-xl font-bold tracking-tight sm:text-2xl">
        BTÜ <span className="font-semibold">Mezun360</span>
      </span>
      <span
        className={`mt-1 text-xs font-medium sm:text-sm ${inverse ? 'text-pastel-blue' : 'text-muted-foreground'}`}
      >
        Kariyer ve Mezun Platformu
      </span>
    </Link>
  )
}
