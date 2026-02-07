import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'
import { toast } from 'sonner'
import { Scan, Printer } from 'lucide-react'

export default function ExpeditionPage() {
  const [barcode, setBarcode] = useState('')
  const [scannedOrder, setScannedOrder] = useState<any>(null)

  const scanMutation = useMutation({
    mutationFn: async (barcode: string) => {
      const res = await api.post('/api/orders/scan', { barcode })
      return res.data
    },
    onSuccess: (data) => {
      setScannedOrder(data.order)
      toast.success(data.message || 'Pedido identificado!')
      setBarcode('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao escanear código')
    },
  })

  const printMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.post(`/api/orders/${orderId}/print-label`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Etiqueta impressa com sucesso!')
    },
  })

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcode) {
      scanMutation.mutate(barcode)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expedição</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Escaneie os códigos para processar envios</p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="label text-sm sm:text-base">Código de Barras</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Escaneie ou digite o código..."
                  className="input pl-10 text-sm sm:text-base"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary w-full sm:w-auto">
                Escanear
              </button>
            </div>
          </div>
        </form>

        {scannedOrder && (
          <div className="mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3">Pedido Identificado</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <p><span className="font-medium">Número:</span> {scannedOrder.orderNumber}</p>
              <p><span className="font-medium">Cliente:</span> {scannedOrder.customerName}</p>
              <p><span className="font-medium">Total:</span> R$ {Number(scannedOrder.totalAmount).toFixed(2)}</p>
            </div>
            <button
              onClick={() => printMutation.mutate(scannedOrder.id)}
              disabled={printMutation.isPending}
              className="mt-4 btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              {printMutation.isPending ? 'Imprimindo...' : 'Imprimir Etiqueta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
