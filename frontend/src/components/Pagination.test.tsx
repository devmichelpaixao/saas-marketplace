import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from './Pagination'

describe('Pagination Component', () => {
  const mockOnPageChange = vi.fn()

  beforeEach(() => {
    mockOnPageChange.mockClear()
  })

  it('deve renderizar números de páginas corretos', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    )
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('deve desabilitar botão Anterior na primeira página', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    )
    
    const prevButton = screen.getByText('Anterior')
    expect(prevButton).toBeDisabled()
  })

  it('deve desabilitar botão Próxima na última página', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    )
    
    const nextButton = screen.getByText('Próxima')
    expect(nextButton).toBeDisabled()
  })

  it('deve chamar onPageChange ao clicar em número', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    )
    
    const page3Button = screen.getByText('3')
    fireEvent.click(page3Button)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })

  it('deve mostrar página atual destacada', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    )
    
    const currentPageButton = screen.getByText('3')
    expect(currentPageButton).toHaveClass('bg-primary-600')
  })

  it('deve navegar para página anterior', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    )
    
    const prevButton = screen.getByText('Anterior')
    fireEvent.click(prevButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('deve navegar para próxima página', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    )
    
    const nextButton = screen.getByText('Próxima')
    fireEvent.click(nextButton)
    
    expect(mockOnPageChange).toHaveBeenCalledWith(4)
  })
})
