# The Fate Creator ⚡

**Rewrite history. Explore infinite timelines. Powered by Grok.**

What if an F-22 Raptor streaked over the beaches of Normandy in 1944?  
What if Vancouver quietly ignited the AI revolution in the rainy labs of 1985?  
What if ancient Rome discovered quantum mechanics?

**The Fate Creator** lets you ask these questions—and watch Grok spin vivid, branching alternate histories that evolve with every continuation. Run multiple scenarios in parallel, switch between them instantly, rename or prune timelines, and let your multiverse persist across sessions.

Built by Evan, an aspiring college software developer

## Features
- **Parallel Timelines** — Create unlimited alternate histories and switch seamlessly.
- **Persistent Memory** — Grok remembers everything in each thread; continuations build naturally.
- **Local Persistence** — All timelines saved automatically in your browser (refresh-proof).
- **Elegant Controls** — Right-click for edit/delete, custom titles, cosmic dark UI with glassmorphism.
- **Help & About** — Instant modals with instructions and the creator's bio.
- **Secure Proxy** — Keeps your Grok API key server-side (no exposure in the client).

## Quick Start (Run It Locally in Minutes)

Ready to diverge from our timeline? Follow these steps:

### 1. Get Your Grok API Key
The Fate Creator is powered by xAI's Grok-4-fast-reasoning (Users can switch to newer models). You'll need your own API key:
- Visit https://console.x.ai
- Sign in (links to your X account)
- Go to **API Keys** → Create a new key
- Fund your account with credits (required for Grok-4 access)

### 2. Clone & Install
``` bash
git clone https://github.com/Evan888-super/The-Fate-Creator.git
cd fatecreator-app
npm install 
```

### 3. Set Up the Secure Proxy
Find the .env file in the server folder and paste your Grok API key in it

### 4. Launch the Multiverse
Open two terminals:
Terminal 1 (Frontend):
``` bash
cd ~/Fate-Master/fatecreator-app         
npm run dev
```
Open http://localhost:5173

Terminal 2 (Proxy Server):
``` bash
cd server
node index.js
```
You should see: 🚀 Proxy server online at http://localhost:3001

### 5. Start Rewriting Fate

Click + New Timeline
Type your wild premise (e.g., "What if Vancouver pioneered AI in 1985?")
Hit Create Timeline → Grok responds
Continue the thread, create parallel universes, right-click to edit/delete

Your timelines persist automatically. Refresh and they're still there.
