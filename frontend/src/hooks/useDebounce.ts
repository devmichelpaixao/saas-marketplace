import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * Útil para buscas e inputs que disparam requisições
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Valor debounced
 * 
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 300)
 * 
 * useEffect(() => {
 *   // Buscar apenas quando debouncedSearch mudar
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Criar timer para atualizar o valor após o delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpar timeout se value mudar antes do delay
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
