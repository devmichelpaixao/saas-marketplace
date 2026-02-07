import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Logo from './Logo'

describe('Logo Component', () => {
  it('deve renderizar o logo', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    )
    
    const logo = screen.getByText(/MarketPlace/i)
    expect(logo).toBeInTheDocument()
  })

  it('deve renderizar texto SaaS', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    )
    
    expect(screen.getByText('SaaS')).toBeInTheDocument()
  })

  it('deve aplicar className customizada', () => {
    const { container } = render(
      <BrowserRouter>
        <Logo className="custom-class" />
      </BrowserRouter>
    )
    
    const logo = container.querySelector('.custom-class')
    expect(logo).toBeInTheDocument()
  })
})
