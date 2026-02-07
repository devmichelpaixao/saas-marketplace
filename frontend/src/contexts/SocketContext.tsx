import { createContext, useContext, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'

interface SocketContextType {
  socket: Socket | null
}

const SocketContext = createContext<SocketContextType>({ socket: null })

export function SocketProvider({ children }: { children: ReactNode }) {
  const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
    autoConnect: true,
  })

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket conectado')
    })

    socket.on('new-order', (order) => {
      toast.success(`Novo pedido: ${order.orderNumber}`)
    })

    socket.on('order-status-updated', ({ orderId, status }) => {
      toast.info(`Pedido atualizado: ${status}`)
    })

    socket.on('order-arrived', (order) => {
      toast.success(`Pedido chegou no seu departamento: ${order.orderNumber}`)
    })

    socket.on('physical-stock-updated', ({ message }) => {
      toast.info(message)
    })

    socket.on('new-message', (message) => {
      toast('Nova mensagem recebida')
    })

    return () => {
      socket.disconnect()
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
