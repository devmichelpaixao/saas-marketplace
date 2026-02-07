import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Hook para prefetch de dados ao fazer hover em links
 * Carrega dados antes do usuário clicar, melhorando percepção de velocidade
 * 
 * @example
 * const prefetchProducts = usePrefetch(['products'], () => 
 *   api.get('/api/products')
 * )
 * 
 * <Link onMouseEnter={prefetchProducts}>Produtos</Link>
 */
export function usePrefetch(
  queryKey: string[],
  queryFn: () => Promise<any>,
  enabled: boolean = true
) {
  const queryClient = useQueryClient()
  
  return () => {
    if (!enabled) return
    
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }
}

/**
 * Hook para detectar quando usuário está inativo
 * Útil para pausar operações pesadas quando usuário não está usando
 */
export function useUserIdle(timeout: number = 60000) {
  const isIdle = useRef(false)
  
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    const resetTimer = () => {
      clearTimeout(timer)
      isIdle.current = false
      timer = setTimeout(() => {
        isIdle.current = true
      }, timeout)
    }
    
    // Eventos que indicam atividade
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })
    
    resetTimer()
    
    return () => {
      clearTimeout(timer)
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [timeout])
  
  return isIdle
}

/**
 * Hook para executar código apenas quando componente estiver visível
 * Usa Intersection Observer para detectar visibilidade
 */
export function useOnScreen(ref: React.RefObject<HTMLElement>, rootMargin = '0px') {
  const isIntersecting = useRef(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.current = entry.isIntersecting
      },
      { rootMargin }
    )
    
    observer.observe(element)
    
    return () => {
      observer.disconnect()
    }
  }, [ref, rootMargin])
  
  return isIntersecting
}

/**
 * Hook para throttle (limitar execuções por tempo)
 * Diferente de debounce, executa a cada X ms enquanto está sendo chamado
 */
export function useThrottle<T>(value: T, limit: number = 500): T {
  const lastRan = useRef(Date.now())
  const throttledValue = useRef(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        throttledValue.current = value
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])
  
  return throttledValue.current
}
