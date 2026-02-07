import { toast } from 'sonner'

interface ApiError {
  message: string
  status?: number
  code?: string
}

class ErrorHandler {
  private isInitialLoad = true
  private suppressToasts = false

  setSuppressToasts(suppress: boolean) {
    this.suppressToasts = suppress
  }

  handle(error: any, showToast = true): void {
    console.error('Global Error:', error)

    // Não mostrar toast se suprimido (queries em background)
    if (this.suppressToasts || !showToast) {
      return
    }

    if (error.response) {
      // Erro de resposta da API
      const status = error.response.status
      const message = error.response.data?.message || 'Erro ao processar sua solicitação'
      
      switch (status) {
        case 400:
          toast.error('Dados inválidos', {
            description: message
          })
          break
        case 401:
          toast.error('Não autorizado', {
            description: 'Sua sessão expirou. Faça login novamente.'
          })
          // Redirecionar para login após 2 segundos
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          break
        case 403:
          toast.error('Acesso negado', {
            description: 'Você não tem permissão para realizar esta ação.'
          })
          break
        case 404:
          // Não mostrar toast para 404 em queries de leitura
          if (error.config?.method !== 'get') {
            toast.error('Não encontrado', {
              description: message
            })
          }
          break
        case 409:
          toast.error('Conflito', {
            description: message
          })
          break
        case 422:
          toast.error('Validação falhou', {
            description: message
          })
          break
        case 429:
          toast.error('Muitas tentativas', {
            description: 'Aguarde alguns minutos antes de tentar novamente.'
          })
          break
        case 500:
          toast.error('Erro no servidor', {
            description: 'Ocorreu um erro interno. Tente novamente mais tarde.'
          })
          break
        case 503:
          toast.error('Serviço indisponível', {
            description: 'O servidor está temporariamente indisponível.'
          })
          break
        default:
          toast.error('Erro', {
            description: message
          })
      }
    } else if (error.request) {
      // Requisição foi feita mas sem resposta (backend offline)
      // Apenas logar no console, não mostrar toast irritante
      console.warn('Backend não disponível:', error.message)
      
      // Apenas mostrar toast se for uma ação de mutação (POST, PUT, DELETE)
      if (error.config?.method && ['post', 'put', 'delete', 'patch'].includes(error.config.method)) {
        toast.error('Sem conexão', {
          description: 'Verifique se o servidor está rodando.'
        })
      }
    } else {
      // Erro na configuração da requisição
      toast.error('Erro inesperado', {
        description: error.message || 'Algo deu errado. Tente novamente.'
      })
    }

    // Aqui você pode enviar para serviço de monitoramento
    // Sentry.captureException(error)
  }

  success(message: string, description?: string): void {
    toast.success(message, { description })
  }

  warning(message: string, description?: string): void {
    toast.warning(message, { description })
  }

  info(message: string, description?: string): void {
    toast.info(message, { description })
  }
}

export const errorHandler = new ErrorHandler()
export default errorHandler
