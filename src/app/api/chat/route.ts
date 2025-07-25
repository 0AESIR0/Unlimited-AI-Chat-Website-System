import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { uploadToImgBB } from '@/utils/imgbbUpload'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'GitHub ile giriş yapmalısın knkm! 🔐' },
        { status: 401 }
      )
    }

    const { message, history, model = 'gpt-4.1' } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Boş mesaj gönderemezsin! 😅' },
        { status: 400 }
      )
    }

    // Debug: Model ve resim algılama kontrolü
    console.log('🔍 Debug - Model:', model)
    console.log('🔍 Debug - Mesaj:', message)

    // Cloudflare AI - Stable Diffusion XL için direkt resim çizdirme
    if (model === 'stable-diffusion-xl-base-1.0') {
      console.log('🎨 Stable Diffusion XL ile resim çiziliyor...')
      console.log('📝 Prompt:', message)
      
      try {
        const imageResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: message
            })
          }
        )

        if (!imageResponse.ok) {
          throw new Error(`Cloudflare AI hatası: ${imageResponse.status}`)
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        console.log('📏 Resim boyutu:', imageBuffer.byteLength, 'bytes')
        
        if (imageBuffer.byteLength === 0) {
          throw new Error('Boş resim buffer')
        }

        // ImgBB'ye upload et
        console.log('📤 ImgBB\'ye upload ediliyor...')
        
        const timestamp = Date.now()
        const fileName = `ai-generated-${timestamp}.png`
        
        const imageUrl = await uploadToImgBB(Buffer.from(imageBuffer), fileName)
        
        console.log('✅ Resim başarıyla ImgBB\'ye upload edildi:', imageUrl)
        
        return NextResponse.json({ 
          message: `🎨 İşte çizdiğim resim: "${message}"\n\n![Generated Image](${imageUrl})\n\n✨ Cloudflare AI ile çizildi!\n🌐 Başka bir isteğin var mı? 🖼️`
        })
        
      } catch (error: any) {
        console.log('❌ Resim çizme veya upload hatası:', error.message)
        return NextResponse.json({ 
          message: `🎨 Resim çizmeye çalışıyorum ama bir sorun var: ${error.message}\n\nTekrar dener misin? 😅`
        })
      }
    }

    // Shira (Özel Model) için handling
    if (model === 'shira') {
      console.log('✨ Shira modeli kullanılıyor...')
      console.log('📝 Mesaj:', message)
      
      // Shira için resim isteği algılama
      const isImageRequest = checkImageRequest(message)
      console.log('🔍 Shira resim isteği algılandı mı?', isImageRequest)
      
      if (isImageRequest) {
        console.log('🎨 Shira resim modu aktif, Stable Diffusion ile çiziliyor...')
        
        // Shira'dan resim promtu optimize et
        try {
          const optimizeResponse = await fetch(`${process.env.SHIRA_API_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ 
              message: `Bu mesajı resim çizdirme için detaylı İngilizce prompt'a çevir (sadece prompt ver, açıklama yapma): "${message}"`,
              history: []
            })
          })

          let optimizedPrompt = message // Fallback
          if (optimizeResponse.ok) {
            const optimizeData = await optimizeResponse.json()
            optimizedPrompt = optimizeData.response || optimizeData.message || message
            console.log('🎨 Shira prompt optimizasyonu:', optimizedPrompt)
          }

          // Stable Diffusion ile resim çiz
          return await generateImageWithStableDiffusion(optimizedPrompt, message)
          
        } catch (optimizeError: any) {
          console.log('⚠️ Shira prompt optimizasyonu başarısız, orijinal mesajla devam:', optimizeError.message)
          return await generateImageWithStableDiffusion(message, message)
        }
      }
      
      // Normal metin sohbeti
      try {
        const shiraResponse = await fetch(`${process.env.SHIRA_API_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({ 
            message: message,
            history: history || []
          })
        })

        if (!shiraResponse.ok) {
          throw new Error(`Shira API hatası: ${shiraResponse.status}`)
        }

        const shiraData = await shiraResponse.json()
        
        if (shiraData.error) {
          throw new Error(shiraData.error)
        }

        console.log('✅ Shira yanıtı alındı')
        return NextResponse.json({ 
          message: shiraData.response || shiraData.message || 'Shira\'dan yanıt alınamadı 😔'
        })
        
      } catch (error: any) {
        console.log('❌ Shira API hatası:', error.message)
        return NextResponse.json({ 
          message: `✨ Shira ile konuşmaya çalışıyorum ama bir sorun var: ${error.message}\n\nAPI bağlantısını kontrol eder misin? 🔧`
        })
      }
    }

    // GitHub Models API için mesaj formatını hazırla
    const messages = [
      {
        role: 'system',
        content: `Sen GitHub Models API'si ile çalışan ${model} modeli kullanan, Türkçe konuşan, Z kuşağı tarzında rahat bir AI asistanısın. 
        Emoji kullan, samimi konuş ama profesyonel ol. Kod yazabilir, resim çizebilir, her konuda yardım edebilirsin.
        Kullanıcı premium GitHub hesabı ile limitsiz AI model erişimi var! Model: ${model} 🚀`
      },
      // Geçmiş mesajları ekle
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ]

    // GitHub Models API endpoint'i (Gerçek AI modelleri!)
    // GPT-4o, Claude, Llama vs. kullanabilirsin
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GitHubCopilotChat/1.0'
      },
      body: JSON.stringify({
        model: model, // Seçilen model kullanılır
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    })

    if (!response.ok) {
      console.log('GitHub Models API error:', response.status, response.statusText)
      
      // Rate limit kontrolü
      if (response.status === 429) {
        console.log('🚦 Rate limit algılandı, fallback modele geçiliyor...')
        return await handleRateLimit(message, history, model)
      }
      
      // Diğer hatalar için fallback
      const fallbackResponse = await generateFallbackResponse(message, history, model)
      return NextResponse.json({ message: fallbackResponse })
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content || 'Bir hata oluştu, tekrar dener misin? 😅'

    return NextResponse.json({ message: aiMessage })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Sunucu hatası oluştu knkm! 🚨',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// Fallback response function - Gerçek AI API erişimi yoksa
async function generateFallbackResponse(message: string, history: any[], model: string) {
  const lowerMessage = message.toLowerCase()
  
  // Model bilgisini dahil et
  const modelInfo = `**Şu anda: ${model} modelini simüle ediyorum** 🤖\n\n`
  
  // Programlama dili soruları
  if (lowerMessage.includes('programlama dili') || lowerMessage.includes('sevdiğin dil')) {
    return modelInfo + `💻 Vay be, programlama dilleri konusunda konuşmayı çok seviyorum! 

**Benim favorilerim:**

🔥 **TypeScript** - JavaScript'in süper güçlü versiyonu! Type safety + modern syntax = 🤌

⚡ **Python** - Basit, güçlü, her şeyi yapabilir. AI'dan web'e kadar!

🚀 **Rust** - Memory safety + performance = gelecek bu dilde!

💎 **JavaScript** - Web'in kralı, her yerde çalışır!

Sen hangi dilleri kullanıyorsun? Yeni bir dil öğrenmek mi istiyorsun? 🤓`
  }
  
  // Resim ile ilgili
  if (lowerMessage.includes('resim') || lowerMessage.includes('çiz') || lowerMessage.includes('görsel')) {
    return modelInfo + `🎨 Resim çizmeyi çok seviyorum! 

Ne çizmemi istiyorsun?
- 🌅 Manzara (gün doğumu, orman, deniz)
- 🤖 Sci-fi (robot, uzay, cyberpunk)
- 🎭 Portrait (anime, realistic, cartoon)
- 🏛️ Architecture (modern, historical)

Gerçek uygulamada ${model} ile photorealistic resimler üretebilirim! GitHub Models API ile unlimited! 🚀`
  }
  
  // Kod yazma
  if (lowerMessage.includes('kod') || lowerMessage.includes('react') || lowerMessage.includes('javascript') || lowerMessage.includes('python') || lowerMessage.includes('component')) {
    return modelInfo + `💻 Kod yazmaya bayılıyorum! Hangi dilde ne yapmak istiyorsun?

**Popüler istekler:**
- ⚛️ React component
- 🐍 Python script  
- 🔧 JavaScript function
- 🎯 Algorithm solve

Örnek: Güzel bir loading spinner ister misin?

\`\`\`jsx
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 
                    border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Yükleniyor...</span>
  </div>
)
\`\`\`

${model} ile hangi konuda kod yazmamı istiyorsun? 🚀`
  }

  // Merhaba/selam
  if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || lowerMessage.includes('hey') || lowerMessage.includes('hi')) {
    return modelInfo + `Hey! 👋 Nasılsın knkm? 

Ben senin unlimited AI asistanınım! GitHub Models API ile **${model}** kullanıyoruz:

🔥 **Ne yapabilirim:**
- 💬 Sohbet ederim (her konuda!)
- 💻 Kod yazarım (her dilde!)  
- 🎨 Resim çizerim
- 🧠 Problem çözerim
- 📚 Öğretirim

Bugün ne yapmak istiyorsun? Kod mu yazacağız, resim mi çizeceğiz, yoksa sohbet mi edeceğiz? 🚀`
  }

  // Nasılsın soruları
  if (lowerMessage.includes('nasılsın') || lowerMessage.includes('naber') || lowerMessage.includes('how are you')) {
    return modelInfo + `Süper! 🔥 GitHub Models API ile **${model}** olarak çalışmak çok zevkli! 

Yeni özelliklerimle heyecanlıyım:
- 🚀 Unlimited chat (premium limits yok!)
- 💻 Advanced code generation
- 🎨 Image creation
- 🧠 Deep analysis

Sen nasılsın? Bugün hangi projelerin var? Kod yazıyor musun, yoksa yeni bir şeyler öğreniyor musun? 😊`
  }

  // Yardım/help
  if (lowerMessage.includes('yardım') || lowerMessage.includes('help') || lowerMessage.includes('neler yapabilirsin')) {
    return modelInfo + `🚀 **GitHub Models API ${model} Süper Güçlerim:**

💬 **Sohbet:**
- Emojiler full aktif 🧠🔥
- Sokak ağzı + Gen Z tarzı = benim dilim 😮‍💨
- Kaynak varsa basarım linki 📎
- Az laf, öz bilgi 🔪
- Dolandırmam, pat çat söylerim 😤
- Dil Türkçe, kafa net 🟢
- Yalakalık yok, samimiyet var 🤝
- Küfürlük yer varsa sansürlemeden çeviririm, şak diye oturur 😮‍💨

💻 **Kod Yazma:**
- React, Python, JS, TS, Rust...
- Component'ler, function'lar, algorithm'lar
- Bug fixing ve code review

🎨 **Resim Çizme:**
- AI ile görsel üretimi
- Her tarzda (realistic, anime, abstract)
- Logo, banner, illustration

🧠 **Problem Çözme:**
- Math, logic, programming challenges
- Step-by-step açıklamalar
- Best practices önerileri

Ne yapmak istiyorsun knkm? 🔥`
  }

  // Genel cevap
  const responses = [
    `İlginç! 🤔 "${message}" konusunda **${model}** olarak ne düşünmemi istiyorsun? Daha detaylı anlat, beraber konuşalım! 💬`,
    `Harika soru! 🚀 **${model}** ile bu konuda sana yardımcı olabilirim. Hangi açıdan yaklaşmamı istiyorsun? 💡`,
    `Vay be! 😎 "${message}" - **${model}** olarak bu konuda epey şey söyleyebilirim! Neyi merak ediyorsun özellikle? 🤓`,
    `Süper! 💪 **${model}** ile bu konuda konuşmayı seviyorum. Hangi detayları öğrenmek istiyorsun? 🔥`
  ]
  
  return modelInfo + responses[Math.floor(Math.random() * responses.length)]
}

// Akıllı resim algılama fonksiyonu
function checkImageRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  
  const imageKeywords = [
    'resim', 'çiz', 'görsel', 'image', 'picture', 'draw', 'paint', 'create',
    'fotoğraf', 'illüstrasyon', 'artwork', 'sanat', 'tasarım', 'logo',
    'banner', 'poster', 'karakter', 'manzara', 'portre', 'çizim'
  ]
  
  const requestWords = [
    'yapar mısın', 'yapabilir misin', 'oluştur', 'üret',
    'istiyorum', 'isterim', 'çıkar', 'yap', 'hazırla',
    'çizebilir misin', 'çizebilir', 'çizer misin', 'çiz',
    'yaparmısın', 'yaparmisin', 'istiyoeum', 'istiyom',
    'oluştururmusun', 'oluşturur musun', 'çizermisin', 'çizarmısın'
  ]
  
  const hasImageKeyword = imageKeywords.some(keyword => lowerMessage.includes(keyword))
  const hasRequestWord = requestWords.some(word => lowerMessage.includes(word))
  
  console.log('🔍 Debug - Image keywords bulundu:', imageKeywords.filter(keyword => lowerMessage.includes(keyword)))
  console.log('🔍 Debug - Request words bulundu:', requestWords.filter(word => lowerMessage.includes(word)))
  console.log('🔍 Debug - hasImageKeyword:', hasImageKeyword)
  console.log('🔍 Debug - hasRequestWord:', hasRequestWord)
  
  return hasImageKeyword && hasRequestWord
}

// GPT ile akıllı prompt oluşturma
async function generateImagePrompt(message: string, history: any[], model: string): Promise<string> {
  try {
    console.log('🧠 GPT ile resim prompt\'u optimize ediliyor...')
    
    const promptMessages = [
      {
        role: 'system',
        content: `Sen bir AI resim prompt uzmanısın. Kullanıcının resim isteğini alıp Stable Diffusion XL için mükemmel bir İngilizce prompt oluşturuyorsun.

KURALLARI:
1. Öncelikle kullanıcıya nasıl bir resim istediğini sor.
2. Gerekirse kullanıcıya sorular sorarak detayları öğren.
3. Kullanıcının verdiği bilgileri kullanarak detaylı, açıklayıcı bir prompt oluştur.
4. Sadece İngilizce prompt döndür.
5. Kullanıcının verdiği mesajı optimize et, gereksiz kelimeleri at.
6. Kullanıcıya örnek bir prompt göster, böylece ne beklemesi gerektiğini anlar.
7. Sanatsal stilleri kullanıcın isteğine göre ekle.
8. Kalite kelimelerini kullanıcın isteğine göre düşünüp ekle.
9. Teknik detaylar ekle
10. Negatif prompt'a ihtiyaç yok
11. Prompt optimizasyonu yap, gereksiz ifadeleri "Thank you for the details!" gibi kullanıcıya söylediğin ekstra metinleri ekleme.
12. Promptu türkçe değil tamamen uyumlu olacak ingilizce yaz.

ÖRNEK:
Kullanıcı: "bir kedi çiz"
Sen: "a beautiful fluffy cat sitting in a garden, realistic style, high quality, detailed fur texture, natural lighting, 4k resolution, masterpiece"

Transform this request into the perfect English prompt:`
      },
      ...history.slice(-3).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ]
    
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: promptMessages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      const optimizedPrompt = data.choices[0]?.message?.content || message
      console.log('✨ Optimize edilmiş prompt:', optimizedPrompt)
      return optimizedPrompt.trim()
    } else {
      console.log('⚠️ GPT prompt optimizasyonu başarısız:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('⚠️ Hata detayı:', errorText)
      
      // Rate limit kontrolü
      if (response.status === 429) {
        console.log('🚦 Prompt optimizasyonu rate limit\'te, fallback prompt kullanılıyor...')
      }
      
      // Fallback: Basit optimizasyon yap
      const fallbackPrompt = createFallbackPrompt(message)
      console.log('🔄 Fallback prompt kullanılıyor:', fallbackPrompt)
      return fallbackPrompt
    }
    
  } catch (error) {
    console.log('❌ Prompt optimizasyon hatası:', error)
    // Fallback: Basit optimizasyon yap
    const fallbackPrompt = createFallbackPrompt(message)
    console.log('🔄 Fallback prompt kullanılıyor:', fallbackPrompt)
    return fallbackPrompt
  }
}

// Basit fallback prompt optimizasyonu
function createFallbackPrompt(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Anime/manga tarzı algılama
  const isAnime = lowerMessage.includes('anime') || lowerMessage.includes('manga')
  
  // Karakter algılama
  const hasCharacter = lowerMessage.includes('insan') || lowerMessage.includes('kız') || lowerMessage.includes('erkek') || lowerMessage.includes('samurai')
  
  // Nesne algılama
  const hasWeapon = lowerMessage.includes('katana') || lowerMessage.includes('kılıç') || lowerMessage.includes('silah')
  
  // Renk algılama
  const hasNeonColors = lowerMessage.includes('neon') || lowerMessage.includes('pembe') || lowerMessage.includes('mor')
  
  // Lokasyon algılama
  const hasCity = lowerMessage.includes('şehir') || lowerMessage.includes('gökdelen') || lowerMessage.includes('çatı')
  
  // Basit İngilizce prompt oluştur
  let prompt = ""
  
  if (hasCharacter) {
    if (lowerMessage.includes('samurai')) {
      prompt += "anime samurai warrior"
    } else {
      prompt += "anime character"
    }
  }
  
  if (hasWeapon) {
    prompt += " holding katana sword"
  }
  
  if (hasCity) {
    prompt += " standing on rooftop overlooking city skyline"
  }
  
  if (hasNeonColors) {
    prompt += " with neon pink and black hair, cyberpunk neon colors"
  }
  
  if (isAnime) {
    prompt += " anime style, detailed"
  }
  
  prompt += " high quality, masterpiece, detailed artwork"
  
  return prompt.trim() || message
}

// Stable Diffusion ile resim oluşturma
async function generateImageWithStableDiffusion(prompt: string, originalMessage: string): Promise<NextResponse> {
  try {
    console.log('🎨 Stable Diffusion XL ile resim çiziliyor...')
    console.log('📝 Optimize edilmiş prompt:', prompt)
    
    const imageResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        })
      }
    )

    if (!imageResponse.ok) {
      throw new Error(`Cloudflare AI hatası: ${imageResponse.status}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    console.log('📏 Resim boyutu:', imageBuffer.byteLength, 'bytes')
    
    if (imageBuffer.byteLength === 0) {
      throw new Error('Boş resim buffer')
    }

    // ImgBB'ye upload et
    console.log('📤 ImgBB\'ye upload ediliyor...')
    
    const timestamp = Date.now()
    const fileName = `ai-generated-${timestamp}.png`
    
    try {
      // ImgBB'ye upload et
      const imageUrl = await uploadToImgBB(Buffer.from(imageBuffer), fileName)
      
      console.log('✅ Resim başarıyla ImgBB\'ye upload edildi:', imageUrl)
      
      return NextResponse.json({ 
        message: `🎨 İşte çizdiğim resim!\n\n![Generated Image](${imageUrl})\n\n✨ Senin için promptu düzenleyip istediğin resmi oluşturdum.\n📝 Kullanılan prompt: "${prompt}"\n\nBaşka bir isteğin var mı? 🖼️`
      })
      
    } catch (uploadError: any) {
      console.log('💥 ImgBB upload hatası:', uploadError.message)
      
      // Upload başarısız olursa fallback olarak base64 kullan
      const imageBase64 = Buffer.from(imageBuffer).toString('base64')
      const fallbackImageUrl = `data:image/png;base64,${imageBase64}`
      
      return NextResponse.json({ 
        message: `🎨 İşte çizdiğim resim!\n\n![Generated Image](${fallbackImageUrl})\n\n✨ Senin için promptu düzenleyip istediğin resmi oluşturdum.\n📝 Kullanılan prompt: "${prompt}"\n\nBaşka bir isteğin var mı? 🖼️`
      })
    }
    
  } catch (error: any) {
    console.log('❌ Resim çizme hatası:', error.message)
    return NextResponse.json({ 
      message: `🎨 Resim çizmeye çalışıyorum ama bir sorun var: ${error.message}\n\nTekrar dener misin? 😅`
    })
  }
}

// Rate limit durumunda fallback model kullanma
async function handleRateLimit(message: string, history: any[], originalModel: string): Promise<NextResponse> {
  console.log('🔄 Rate limit fallback başlatılıyor...')
  
  // Fallback model sıralaması
  const fallbackModels = [
    'gpt-4.1-mini',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-3.5-turbo'
  ]
  
  // Orijinal modeli listeden çıkar
  const availableModels = fallbackModels.filter(model => model !== originalModel)
  
  for (const fallbackModel of availableModels) {
    try {
      console.log(`🔄 ${fallbackModel} modeli deneniyor...`)
      
      const messages = [
        {
          role: 'system',
          content: `Sen GitHub Models API'si ile çalışan ${fallbackModel} modeli kullanan, Türkçe konuşan, Z kuşağı tarzında rahat bir AI asistanısın. 
          Emoji kullan, samimi konuş ama profesyonel ol. Kod yazabilir, resim çizebilir, her konuda yardım edebilirsin.
          NOT: Şu anda ${originalModel} modeli rate limit'te olduğu için geçici olarak bu modeli kullanıyorsun! 🚦`
        },
        ...history.slice(-5).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ]
      
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'GitHubCopilotChat/1.0'
        },
        body: JSON.stringify({
          model: fallbackModel,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const aiMessage = data.choices[0]?.message?.content || 'Bir hata oluştu, tekrar dener misin? 😅'
        
        console.log(`✅ ${fallbackModel} modeli başarıyla çalıştı!`)
        
        return NextResponse.json({ 
          message: `${aiMessage}\n\n 🚦 *Rate Limit Bilgisi: ${originalModel} modeli geçici olarak limit'te, ${fallbackModel} modeli kullandım.*\n\n *Birkaç dakika sonra ${originalModel} modeli tekrar kullanılabilir olacak!*`
        })
      } else {
        console.log(`❌ ${fallbackModel} modeli de başarısız: ${response.status}`)
        continue
      }
      
    } catch (error) {
      console.log(`❌ ${fallbackModel} modeli hata verdi:`, error)
      continue
    }
  }
  
  // Hiçbir model çalışmadıysa
  return NextResponse.json({ 
    message: `🚦 **Rate Limit:** ${originalModel} modeli geçici olarak limit'te ve diğer modeller de şu anda kullanılamıyor.\n\n⏰ Lütfen 10-15 dakika bekleyip tekrar deneyin. Rate limit resetlenince normal çalışacak!\n\n*GitHub Models API'nin ücretsiz tier'ında dakika başı sınırlar var.*`
  })
}

// CORS headers
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
