# Unlimited AI Chat 🚀

Experience **ChatGPT-style unlimited AI chat** powered by the **GitHub Copilot API**!
Say goodbye to usage limits and unlock full AI potential using **your own GitHub account**. 💪

## ✨ Features

* 🤖 **Unlimited Chat** – Enjoy unlimited conversations with your Copilot Premium
* 🎨 **Image Generation** – Create visuals instantly with AI
* 💻 **Code Generation** – Write professional code in any language
* 🔐 **GitHub OAuth** – Secure authentication via GitHub
* 🌙 **Modern UI** – Dark mode, responsive layout, and smooth design
* ⚡ **Blazing Fast** – Built with Next.js 15, TypeScript, and Tailwind CSS

## 🚀 Setup

### 1. Clone the Project

```bash
git clone <repo-url>
cd github-copilot-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a GitHub OAuth App

Go to your GitHub Developer Settings:

1. [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. **Application name**: `GitHub Copilot Chat`
3. **Homepage URL**: `http://localhost:3000`
4. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
5. Save your **Client ID** and **Client Secret**

---

### 4. Configure Environment Variables

Create a `.env.local` file and fill in the following:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
GITHUB_TOKEN=your_github_personal_access_token_here
```

---

### 5. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start chatting! 🎉

---

## 🔧 Getting a GitHub Token

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens) → **Generate new token (classic)**
2. Select the following scopes:

   * `read:user`
   * `user:email`
   * `copilot` *(if available)*
3. Add your token to `.env.local`

---

## 💡 How It Works

1. Authenticate securely with **GitHub OAuth**
2. Communicate through the **GitHub Copilot Chat API**
3. **Unlimited AI usage** via your Copilot Premium account
4. Enjoy **image generation** and **code writing** features
5. Real-time chat for a smooth, interactive experience

---

## 🛠 Tech Stack

* **Frontend:** Next.js 15, React, TypeScript
* **Styling:** Tailwind CSS
* **Auth:** NextAuth.js + GitHub OAuth
* **API:** GitHub Copilot Chat API
* **Icons:** Lucide React

---

## 📝 Notes

* A **GitHub Copilot Premium** subscription is required
* API rate limits depend on GitHub’s policies
* **DALL·E integration** included for image generation

---

## 🎯 Roadmap

* [ ] Save conversation history
* [ ] Switch between different AI models
* [ ] File upload & content analysis
* [ ] Voice chat support
* [ ] Team collaboration features

---

**Made with 💚 by a GitHub Copilot enthusiast!**

---
