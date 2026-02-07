import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import introJs from 'intro.js'
import 'intro.js/introjs.css'

interface OnboardingContextType {
  startTour: () => void
  skipTour: () => void
  completeTour: () => void
  hasCompletedTour: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('onboarding-completed') === 'true'
  })

  const dashboardSteps = [
    {
      element: '#dashboard-stats',
      intro: '👋 Bem-vindo ao seu Dashboard! Aqui você visualiza as estatísticas principais do seu negócio.',
      position: 'bottom'
    },
    {
      element: '#nav-products',
      intro: '📦 Gerencie todos os seus produtos, controle de estoque e preços.',
      position: 'right'
    },
    {
      element: '#nav-orders',
      intro: '🛒 Acompanhe todos os pedidos, desde a criação até a entrega.',
      position: 'right'
    },
    {
      element: '#nav-users',
      intro: '👥 Gerencie usuários e suas permissões de acesso.',
      position: 'right'
    },
    {
      element: '#notifications',
      intro: '🔔 Receba notificações importantes sobre seu negócio.',
      position: 'left'
    },
    {
      intro: '✅ Tudo pronto! Explore a plataforma e comece a gerenciar seu negócio.'
    }
  ]

  const startTour = () => {
    const intro = introJs()
    
    intro.setOptions({
      steps: dashboardSteps,
      exitOnOverlayClick: false,
      showStepNumbers: true,
      showBullets: true,
      showProgress: true,
      nextLabel: 'Próximo',
      prevLabel: 'Anterior',
      doneLabel: 'Concluir',
      skipLabel: 'Pular',
    })

    intro.oncomplete(() => {
      completeTour()
    })

    intro.onexit(() => {
      skipTour()
    })

    intro.start()
  }

  const skipTour = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setHasCompletedTour(true)
  }

  const completeTour = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setHasCompletedTour(true)
  }

  useEffect(() => {
    // Auto-start tour for new users after 2 seconds
    if (!hasCompletedTour) {
      const timeout = setTimeout(() => {
        startTour()
      }, 2000)
      
      return () => clearTimeout(timeout)
    }
  }, [hasCompletedTour])

  return (
    <OnboardingContext.Provider value={{ startTour, skipTour, completeTour, hasCompletedTour }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
