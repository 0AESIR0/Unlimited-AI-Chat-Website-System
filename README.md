# GitHub Copilot Chat - Unlimited AI 🚀

GitHub Copilot API kullanarak ChatGPT benzeri unlimited AI chat deneyimi! Premium limitlerinden kurtul, kendi GitHub hesabınla sınırsız AI kullan! 💪

## ✨ Özellikler

- 🤖 **Unlimited Chat**: GitHub Copilot Premium'unla sınırsız kullanım
- 🎨 **Resim Üretimi**: AI ile görsel oluşturma
- 💻 **Kod Yazma**: Her dilde profesyonel kod üretimi
- 🔐 **GitHub OAuth**: Güvenli giriş sistemi
- 🌙 **Modern UI**: Dark mode, responsive tasarım
- ⚡ **Hızlı**: Next.js 15 + TypeScript + Tailwind CSS

## 🚀 Kurulum

### 1. Projeyi Klonla
```bash
git clone <repo-url>
cd github-copilot-chat
```

### 2. Paketleri Yükle
```bash
npm install
```

### 3. GitHub OAuth App Oluştur

GitHub'da Developer Settings'e git:
1. [GitHub Developer Settings](https://github.com/settings/developers) → "New OAuth App"
2. **Application name**: "GitHub Copilot Chat"
3. **Homepage URL**: `http://localhost:3000`
4. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
5. **Client ID** ve **Client Secret**'ı kaydet

### 4. Environment Variables

`.env.local` dosyasını düzenle:
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
GITHUB_TOKEN=your_github_personal_access_token_here
```

### 5. Çalıştır
```bash
npm run dev
```

http://localhost:3000 adresinden uygulamaya erişebilirsin! 🎉

## 🔧 GitHub Token Alma

1. [GitHub Personal Access Tokens](https://github.com/settings/tokens) → "Generate new token (classic)"
2. **Scopes** seç:
   - `read:user`
   - `user:email` 
   - `copilot` (eğer varsa)
3. Token'ı `.env.local` dosyasına ekle

## 💡 Nasıl Çalışıyor?

1. **GitHub OAuth** ile güvenli giriş
2. **GitHub Copilot Chat API** ile AI iletişimi
3. **Unlimited kullanım** - GitHub Copilot Premium hesabınla
4. **Resim üretimi** ve **kod yazma** özellikleri
5. **Real-time chat** deneyimi

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js + GitHub OAuth
- **API**: GitHub Copilot Chat API
- **Icons**: Lucide React

## 📝 Notlar

- GitHub Copilot Premium aboneliğin olmalı
- API rate limitleri GitHub'ın belirlediği şekilde
- Resim üretimi için DALL-E entegrasyonu eklendi

## 🎯 Roadmap

- [ ] Conversation history kaydetme
- [ ] Farklı AI modelleri seçme
- [ ] File upload & analysis
- [ ] Voice chat desteği
- [ ] Team collaboration

---

**Made with 💚 by a GitHub Copilot enthusiast!**
#   U n l i m i t e d - A I - C h a t - W e b s i t e - S y s t e m  
 