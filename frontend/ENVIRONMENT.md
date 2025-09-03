# Environment Configuration for LannaFinChat Frontend

## Mixed Content Issue Fix

This project has been updated to handle HTTPS/HTTP URLs properly and prevent Mixed Content errors.

### Automatic URL Detection

The frontend now automatically detects the environment and uses appropriate URLs:

- **Development**: Uses `http://localhost:8001`
- **Production**: Uses `https://[current-hostname]` (with nginx proxy to backend)

### Nginx Proxy Solution

In production, the frontend uses HTTPS URLs that are proxied through nginx to the HTTP backend:

- Frontend: `https://chat.jeerasakananta.dev`
- Backend: `http://10.50.5.31:8001` (proxied through nginx)
- Nginx handles the HTTPS termination and proxies requests to the backend

This prevents Mixed Content errors while maintaining security.

### Manual Configuration (Optional)

If you need to override the automatic detection, you can set environment variables:

#### Development
```bash
# .env.development
VITE_BACKEND_CHATBOT_API=http://localhost:8001
VITE_BACKEND_DOCS_STATIC=http://localhost:8001
```

#### Production
```bash
# .env.production
VITE_BACKEND_CHATBOT_API=https://chat.jeerasakananta.dev
VITE_BACKEND_DOCS_STATIC=https://chat.jeerasakananta.dev
```

### Docker Build

The Dockerfile automatically creates the production environment file during build.

### How It Works

1. **Environment Variable Check**: First checks if `VITE_BACKEND_CHATBOT_API` is set
2. **Production Detection**: Checks if current URL is HTTPS and not localhost
3. **Fallback**: Uses localhost for development, HTTPS hostname for production

This ensures no Mixed Content errors in production while maintaining development flexibility.
