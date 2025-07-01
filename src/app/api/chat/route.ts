import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'GitHub ile giriş yapmalısın knkm! 🔐' },
        { status: 401 }
      )
    }

    const { message, history, model = 'gpt-4o' } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Boş mesaj gönderemezsin! 😅' },
        { status: 400 }
      )
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
      ...history.map((msg: { role: string; content: string }) => ({
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
      // GitHub Models API hata verirse fallback kullan
      console.log('GitHub Models API error:', response.status, response.statusText)
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
async function generateFallbackResponse(message: string, history: { role: string; content: string }[], model: string) {
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
- Her konuda konuşurum
- Sorularını yanıtlarım
- Z kuşağı tarzında samimi chat

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

// CORS headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
