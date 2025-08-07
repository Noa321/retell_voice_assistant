# Retell AI Voice Widget

A floating voice widget that integrates with Retell.AI to provide embeddable voice conversations for any website.

## Features

- 🎤 Real-time voice conversations with AI agents
- 🔧 Easy integration with a simple JavaScript snippet
- 🎨 Customizable positioning, colors, and sizing
- 🔒 Secure API key management on the backend
- 📱 Responsive design with visual feedback
- ⚡ Built with React, TypeScript, and Express

## Quick Start

### Environment Variables

Set up your Retell AI credentials:

```bash
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_agent_id_here
```

### Development

```bash
npm install
npm run dev
```

### Deployment to Vercel

1. **Connect GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `RETELL_API_KEY`
     - `RETELL_AGENT_ID`
   - Deploy!

## Integration

Add this snippet to any website:

```html
<!-- Add before closing </body> tag -->
<script src="https://your-deployed-url.vercel.app/retell-widget.js"></script>
<script>
  RetellWidget.init({
    apiKey: 'your_api_key',
    agentId: 'your_agent_id', 
    position: 'bottom-right',
    theme: {
      primaryColor: '#2563EB',
      buttonSize: 'medium'
    }
  });
</script>
```

## Configuration Options

- **position**: `'bottom-right'` | `'bottom-left'` | `'top-right'` | `'top-left'`
- **primaryColor**: Hex color for the voice button
- **buttonSize**: `'small'` | `'medium'` | `'large'`

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Voice**: Retell AI Web SDK
- **Deployment**: Vercel-ready configuration