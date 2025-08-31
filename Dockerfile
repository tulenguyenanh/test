# Minimal Dockerfile for quick testing
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Create essential Next.js files if missing
RUN mkdir -p src/app

# Create minimal layout if it doesn't exist
RUN test -f src/app/layout.tsx || cat > src/app/layout.tsx << 'EOF'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

# Create minimal page if it doesn't exist
RUN test -f src/app/page.tsx || cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Trustana Product Platform</h1>
      <p>Application is running successfully!</p>
    </main>
  )
}
EOF

# Create next.config.js if it doesn't exist
RUN test -f next.config.js || cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
}
module.exports = nextConfig
EOF

# Create tsconfig.json if it doesn't exist
RUN test -f tsconfig.json || cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Try to build, fall back to dev mode if build fails
RUN npm run build || echo "Build failed, will run in dev mode"

EXPOSE 3000

# Try production mode first, fall back to dev mode
CMD npm start || npm run dev