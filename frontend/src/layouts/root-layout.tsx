import { ProductIdentity } from '@/components/product-identity'
import { Link, Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:p-3">İçeriğe geç</a>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <ProductIdentity />
          <Link to="/" className="py-3 text-sm font-semibold text-primary underline">Ana sayfaya dön</Link>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-10 sm:py-14"><Outlet /></main>
    </>
  )
}
