import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import fs from 'fs'
import path from 'path'

export const uploadImages = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado' })
    }

    // Retornar URLs das imagens
    const imageUrls = files.map(file => `/uploads/${file.filename}`)

    res.json({ 
      message: 'Upload realizado com sucesso',
      images: imageUrls 
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    res.status(500).json({ message: 'Erro ao fazer upload das imagens' })
  }
}

export const deleteImage = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params

    if (!filename) {
      return res.status(400).json({ message: 'Nome do arquivo não informado' })
    }

    const filePath = path.join(__dirname, '../../uploads', filename)

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' })
    }

    // Deletar o arquivo
    fs.unlinkSync(filePath)

    res.json({ message: 'Imagem excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    res.status(500).json({ message: 'Erro ao excluir imagem' })
  }
}
