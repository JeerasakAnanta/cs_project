# Environment Configuration for LannaFinChat Frontend

## Mixed Content Issue Fix

This project has been updated to automatically handle HTTPS/HTTP URLs based on the current environment.

### Automatic URL Detection

The frontend now automatically detects the environment and uses appropriate URLs:

- **Development**: Uses `http://localhost:8001`
- **Production**: Uses `https://[current-hostname]`

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
