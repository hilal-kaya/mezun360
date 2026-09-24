import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Button } from './button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './dialog'

it('opens an accessible dialog and restores focus on Escape', async () => {
  const user = userEvent.setup()
  render(<Dialog><DialogTrigger asChild><Button>Aç</Button></DialogTrigger><DialogContent><DialogTitle>Başlık</DialogTitle><DialogDescription>Açıklama</DialogDescription></DialogContent></Dialog>)
  const trigger = screen.getByRole('button', { name: 'Aç' })
  await user.click(trigger)
  expect(screen.getByRole('dialog', { name: 'Başlık', description: 'Açıklama' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Kapat' })).toHaveFocus()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(trigger).toHaveFocus()
})
