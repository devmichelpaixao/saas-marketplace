import { Router, Response } from 'express'
import { AuthRequest, authenticate } from '../middlewares/auth.middleware'
import { upload } from '../middlewares/upload.middleware'
import fs from 'fs'
import path from 'path'

const router = Router()

// Rotas de upload (protegidas)
router.post('/', authenticate, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo foi enviado' })
    }

    const imageUrls = files.map(file => `/uploads/${file.filename}`)
    res.json({ message: 'Upload realizado com sucesso', images: imageUrls })
  } catch (error) {
    console.error('Erro no upload:', error)
    res.status(500).json({ message: 'Erro ao fazer upload das imagens' })
  }
})

router.delete('/:filename', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params
    if (!filename) {
      return res.status(400).json({ message: 'Nome do arquivo não informado' })
    }

    const filePath = path.join(__dirname, '../../uploads', filename)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' })
    }

    fs.unlinkSync(filePath)
    res.json({ message: 'Imagem excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    res.status(500).json({ message: 'Erro ao excluir imagem' })
  }
})

export default router
