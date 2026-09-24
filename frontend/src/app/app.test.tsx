import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './app'
import { AppProviders } from './providers'

describe('application routing', () => {
  it('renders the technical placeholder with a main landmark', () => {
    render(<AppProviders><MemoryRouter><App /></MemoryRouter></AppProviders>)
    expect(screen.getByRole('heading', { name: 'BTÜ Mezun360' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('does not expose a future admin product page', () => {
    render(<AppProviders><MemoryRouter initialEntries={['/admin/alumni']}><App /></MemoryRouter></AppProviders>)
    expect(screen.getByRole('heading', { name: 'Sayfa bulunamadı' })).toBeInTheDocument()
  })
})
