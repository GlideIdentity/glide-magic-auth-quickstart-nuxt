# 🚀 Magical Auth Quick Start - Nuxt 3

Experience carrier-grade phone authentication in **2 minutes**. No SMS, no delays, no fraud - just instant verification through SIM cards.

## 💨 Start in 30 Seconds

```bash
# Clone and install
npm install

# Copy environment file and add your API key
cp env.example .env
# Then edit .env and replace 'your_api_key_here' with your actual API key

# Run it!
npm run dev
```

**That's it!** Open http://localhost:3000 and try it out 🎉

## 🎮 What You Can Do

### Two Modes to Play With

**⚡ High Level Mode** (Default)
- One-click authentication
- SDK handles everything
- Perfect for production apps

**🔧 Granular Mode**
- See each step happening
- Great for understanding the flow
- Debug-friendly with full logging

### Two Use Cases to Try

1. **📲 Get Phone Number** - Retrieves the phone number from your SIM card
2. **✓ Verify Phone Number** - Confirms you own a specific phone number

## 🏗️ What's Inside

```
magical-auth-quickstart-nuxt/
├── pages/
│   └── index.vue              # Main app page
├── components/
│   └── SdkConfigPanel.vue     # SDK configuration panel
├── server/
│   ├── api/phone-auth/
│   │   ├── prepare.post.ts    # Step 1: Initialize
│   │   ├── process.post.ts    # Step 3: Get result
│   │   └── status/
│   │       └── [sessionId].get.ts  # Status polling proxy
│   └── utils/
│       └── glideClient.ts     # Glide SDK client setup
├── assets/css/
│   └── main.css               # Global styles
└── nuxt.config.ts             # Config (SSR disabled for Web APIs)
```

## 🔧 Want Your Own API Key?

The quickstart works out-of-the-box with our demo server. To use your own credentials:

1. Get your API key from [Glide Dashboard](https://docs.glideidentity.com/)
2. Create `.env` file:
```env
GLIDE_API_KEY=your_api_key_here
```
3. Restart the app - it'll use your key automatically!

## 👀 See What's Happening

### Enable Debug Mode

1. Toggle "Debug Mode" at the bottom of the page
2. Open browser console (F12)
3. Watch the magic:

```javascript
[PhoneAuth] PrepareResponse received: {...}
[Granular] Step 2: About to invoke secure prompt
[PhoneAuth] Credential obtained from browser
[Granular] Step 3: Final response: {phone_number: "+1234567890"}
```

### Understanding the Flow

**Step 1: Prepare** → Your server talks to Glide

**Step 2: Browser Prompt** → Secure carrier verification  

**Step 3: Process** → Get the verified result

## 🎨 Quick Customizations


### Change Server Port
```bash
# Default is 3000
NUXT_PORT=3001 npm run dev
```


## 🚀 What's Next?

Now that you've seen it work:

1. **Try both modes** - Toggle between High Level and Granular
2. **Check the console** - See all the API calls
3. **Look at the code** - It's all in `pages/index.vue`
4. **Integrate into your app** - Copy the patterns you need

## 📚 Resources

- **[SDK Documentation](https://docs.glideidentity.com/)**

## 🌟 Why Nuxt 3?

- **Vue 3 + Composition API** - Modern reactive patterns
- **Full-stack in one** - Pages and API routes together
- **Auto-imports** - No need to import Vue utilities
- **TypeScript ready** - Type-safe out of the box
- **Vue composable** - Uses `usePhoneAuth` from `@glideidentity/web-client-sdk/vue`

## 💬 Need Help?

- **Email**: support@glideidentity.com

---

Built with ❤️ by Glide Identity | Making authentication magical ✨
