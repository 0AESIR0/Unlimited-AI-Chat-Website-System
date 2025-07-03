import FormData from 'form-data'
import fs from 'fs-extra'
import path from 'path'

export async function uploadToImgBB(imageBuffer: Buffer, fileName: string): Promise<string> {
  try {
    // Geçici dosya yolu
    const tempDir = path.join(process.cwd(), 'GensIMGs')
    const tempFilePath = path.join(tempDir, fileName)
    
    // Dosyayı geçici olarak kaydet
    await fs.ensureDir(tempDir)
    await fs.writeFile(tempFilePath, imageBuffer)
    
    console.log('📁 Resim geçici olarak kaydedildi:', tempFilePath)
    
    // ImgBB API endpoint'i
    const apiKey = process.env.IMGBB_API_KEY
    
    if (!apiKey) {
      throw new Error('ImgBB API key bulunamadı! .env.local dosyasına IMGBB_API_KEY= ekleyin')
    }
    
    // ImgBB API doğru formatı
    const imageBase64 = imageBuffer.toString('base64')
    
    console.log('🚀 ImgBB\'ye upload ediliyor...')
    console.log('📏 Base64 length:', imageBase64.length)
    
    // URL encoded form data kullan
    const formData = new URLSearchParams()
    formData.append('image', imageBase64)
    
    // ImgBB API'sine POST request
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ChatGPT-Clone/1.0'
      }
    })
    
    console.log('🌐 ImgBB API yanıtı:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ ImgBB error body:', errorText)
      throw new Error(`ImgBB upload failed: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('📤 ImgBB upload sonucu:', result)
    
    // Geçici dosyayı sil
    await fs.remove(tempFilePath)
    console.log('🗑️ Geçici dosya silindi:', tempFilePath)
    
    // URL'yi döndür
    if (result.success && result.data?.url) {
      console.log('✅ ImgBB upload başarılı:', result.data.url)
      return result.data.url
    } else {
      throw new Error('ImgBB upload başarılı ama URL bulunamadı')
    }
    
  } catch (error) {
    console.error('❌ ImgBB upload hatası:', error)
    
    // Hata durumunda geçici dosyayı temizle
    try {
      const tempFilePath = path.join(process.cwd(), 'GensIMGs', fileName)
      await fs.remove(tempFilePath)
      console.log('🗑️ Hata durumunda geçici dosya temizlendi')
    } catch (cleanupError) {
      console.error('🗑️ Geçici dosya temizleme hatası:', cleanupError)
    }
    
    throw error
  }
}

// Dosya boyutu kontrolü
export function checkImageSize(buffer: Buffer): boolean {
  const maxSize = 32 * 1024 * 1024 // 32MB limit
  return buffer.length <= maxSize
}

// Desteklenen format kontrolü
export function checkImageFormat(fileName: string): boolean {
  const supportedFormats = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp']
  const ext = path.extname(fileName).toLowerCase()
  return supportedFormats.includes(ext)
}
