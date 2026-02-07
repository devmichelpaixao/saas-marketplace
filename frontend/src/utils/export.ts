import * as XLSX from 'xlsx'

/**
 * Utilitários para exportação de dados em Excel e CSV
 * Suporta filtros, formatação customizada e múltiplas sheets
 */

export interface ExportColumn {
  header: string
  key: string
  format?: (value: any) => string | number
  width?: number
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
  columns?: ExportColumn[]
  includeTimestamp?: boolean
  autoFilter?: boolean
  freezeHeader?: boolean
}

/**
 * Exporta dados para Excel (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
) {
  const {
    filename = 'export',
    sheetName = 'Sheet1',
    columns,
    includeTimestamp = true,
    autoFilter = true,
    freezeHeader = true
  } = options

  if (data.length === 0) {
    throw new Error('Nenhum dado para exportar')
  }

  // Preparar dados com colunas customizadas
  const processedData = columns
    ? data.map(row => {
        const processedRow: Record<string, any> = {}
        columns.forEach(col => {
          const value = row[col.key]
          processedRow[col.header] = col.format ? col.format(value) : value
        })
        return processedRow
      })
    : data

  // Criar worksheet
  const worksheet = XLSX.utils.json_to_sheet(processedData)

  // Configurar largura das colunas
  if (columns) {
    worksheet['!cols'] = columns.map(col => ({
      wch: col.width || 15
    }))
  }

  // Auto-filtro
  if (autoFilter && processedData.length > 0) {
    const ref = worksheet['!ref']
    if (ref) {
      worksheet['!autofilter'] = { ref }
    }
  }

  // Congelar primeira linha (cabeçalho)
  if (freezeHeader) {
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 }
  }

  // Criar workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Nome do arquivo com timestamp
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split('T')[0]}`
    : ''
  const finalFilename = `${filename}${timestamp}.xlsx`

  // Download
  XLSX.writeFile(workbook, finalFilename)
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
) {
  const {
    filename = 'export',
    columns,
    includeTimestamp = true
  } = options

  if (data.length === 0) {
    throw new Error('Nenhum dado para exportar')
  }

  // Preparar dados
  const processedData = columns
    ? data.map(row => {
        const processedRow: Record<string, any> = {}
        columns.forEach(col => {
          const value = row[col.key]
          processedRow[col.header] = col.format ? col.format(value) : value
        })
        return processedRow
      })
    : data

  // Gerar CSV
  const headers = columns
    ? columns.map(c => c.header)
    : Object.keys(processedData[0])

  const csvContent = [
    headers.join(','),
    ...processedData.map(row =>
      headers.map(header => {
        const value = row[header]
        // Escapar valores com vírgula ou aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().split('T')[0]}`
    : ''
  link.download = `${filename}${timestamp}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporta múltiplas sheets em um único arquivo Excel
 */
export function exportMultiSheetExcel(
  sheets: Array<{
    name: string
    data: any[]
    columns?: ExportColumn[]
  }>,
  filename: string = 'export'
) {
  const workbook = XLSX.utils.book_new()

  sheets.forEach(sheet => {
    const processedData = sheet.columns
      ? sheet.data.map(row => {
          const processedRow: Record<string, any> = {}
          sheet.columns!.forEach(col => {
            const value = row[col.key]
            processedRow[col.header] = col.format ? col.format(value) : value
          })
          return processedRow
        })
      : sheet.data

    const worksheet = XLSX.utils.json_to_sheet(processedData)

    // Auto-filtro
    if (processedData.length > 0) {
      const ref = worksheet['!ref']
      if (ref) {
        worksheet['!autofilter'] = { ref }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  const timestamp = new Date().toISOString().split('T')[0]
  XLSX.writeFile(workbook, `${filename}-${timestamp}.xlsx`)
}

/**
 * Helpers de formatação comuns
 */
export const formatters = {
  currency: (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),

  number: (value: number, decimals: number = 2) =>
    Number(value).toFixed(decimals),

  percentage: (value: number) =>
    `${(value * 100).toFixed(1)}%`,

  date: (value: string | Date) =>
    new Date(value).toLocaleDateString('pt-BR'),

  datetime: (value: string | Date) =>
    new Date(value).toLocaleString('pt-BR'),

  boolean: (value: boolean) =>
    value ? 'Sim' : 'Não',

  status: (value: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      PENDING: 'Pendente',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado'
    }
    return statusMap[value] || value
  }
}
