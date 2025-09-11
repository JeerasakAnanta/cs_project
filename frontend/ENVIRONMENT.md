# Environment Configuration for LannaFinChat Frontend

## Mixed Content Issue Fix for Cloudflare Tunnel

This project has been updated to handle HTTPS/HTTP URLs properly when using Cloudflare Tunnel for frontend hosting.

### Cloudflare Tunnel Setup

When using Cloudflare Tunnel for frontend hosting:

- **Frontend**: Served over HTTPS via Cloudflare Tunnel (`https://chat.jeerasakananta.dev`)
- **Backend**: Remains on HTTP (`http://10.50.5.31:8001`)
- **Solution**: Frontend directly connects to backend IP to avoid Mixed Content errors

### Automatic URL Detection

The frontend now automatically detects the environment and uses appropriate URLs:

- **Development**: Uses `http://localhost:8001`
- **Production with Cloudflare Tunnel**: Uses `http://10.50.5.31:8001`

### Manual Configuration (Optional)

If you need to override the automatic detection, you can set environment variables:

#### Development

```bash
# .env.development
VITE_BACKEND_CHATBOT_API=http://localhost:8001
VITE_BACKEND_DOCS_STATIC=http://localhost:8001
```

#### Production (Cloudflare Tunnel)

```bash
# .env.production
VITE_BACKEND_CHATBOT_API=http://10.50.5.31:8001
VITE_BACKEND_DOCS_STATIC=http://10.50.5.31:8001
```

### Docker Build

The Dockerfile automatically creates the production environment file during build.

### How It Works

1. **Environment Variable Check**: First checks if `VITE_BACKEND_CHATBOT_API` is set
2. **Production Detection**: Checks if current URL is HTTPS and not localhost
3. **Fallback**: Uses localhost for development, HTTPS hostname for production

This ensures no Mixed Content errors in production while maintaining development flexibility.
