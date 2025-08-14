#!/bin/bash

echo "🚀 Iniciando build para Netlify..."

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 3. Executar build da PWA
echo "🔨 Executando build da PWA..."
npm run build-web

# 4. Verificar se o build foi criado
if [ ! -d "web-build" ]; then
    echo "❌ Erro: Diretório web-build não foi criado"
    exit 1
fi

# 5. Verificar arquivos essenciais
echo "✅ Verificando arquivos essenciais..."
required_files=("index.html" "_redirects" "manifest.json" "sw.js")
for file in "${required_files[@]}"; do
    if [ -f "web-build/$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file não encontrado"
        exit 1
    fi
done

# 6. Criar arquivo de configuração específico para Netlify
echo "⚙️ Criando configuração específica para Netlify..."
cat > web-build/netlify.toml << 'EOF'
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Content-Type = "application/manifest+json"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Content-Type = "application/javascript"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
EOF

# 7. Criar arquivo de instruções para deploy
echo "📖 Criando instruções de deploy..."
cat > web-build/DEPLOY-NETLIFY.md << 'EOF'
# 🚀 Deploy no Netlify

## ✅ Build Concluído com Sucesso!

Seu projeto está pronto para ser deployado no Netlify.

## 📋 Passos para Deploy:

### 1. **Deploy Manual (Recomendado para testes)**
- Acesse [netlify.com](https://netlify.com)
- Faça login ou crie uma conta
- Arraste a pasta `web-build` para a área de deploy
- Aguarde o deploy automático

### 2. **Deploy via Git (Recomendado para produção)**
- Conecte seu repositório GitHub/GitLab
- Configure o build:
  - **Build command**: `npm run build-web`
  - **Publish directory**: `web-build`
- Configure as variáveis de ambiente se necessário

### 3. **Deploy via CLI**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=web-build
```

## 🔧 Configurações Importantes:

- ✅ **SPA Routing**: Configurado para redirecionar todas as rotas
- ✅ **PWA**: Service Worker e Manifest configurados
- ✅ **Headers de Segurança**: Configurados
- ✅ **Cache**: Otimizado para performance

## 🌐 URLs de Teste:

Após o deploy, teste estas rotas:
- `/` - Página principal
- `/login` - Página de login
- `/corrida` - Página de corrida
- `/manifest.json` - Manifest PWA
- `/sw.js` - Service Worker

## 🚨 Solução de Problemas:

### **Erro 404:**
- Verifique se o arquivo `_redirects` está na pasta `web-build`
- Confirme se o `netlify.toml` está configurado corretamente

### **PWA não funciona:**
- Verifique se `manifest.json` e `sw.js` estão acessíveis
- Confirme se os headers estão configurados corretamente

### **Rotas não funcionam:**
- Verifique se o redirect `/*` está configurado
- Confirme se o status é `200` (não `301` ou `302`)

## 📞 Suporte:

Se encontrar problemas:
1. Verifique os logs de build no Netlify
2. Confirme se todos os arquivos estão na pasta `web-build`
3. Teste localmente com `npx serve web-build`

---

**🏃‍♂️ Corrida App - Deploy configurado com sucesso!**
EOF

# 8. Mostrar resumo
echo ""
echo "🎉 BUILD CONCLUÍDO COM SUCESSO!"
echo "=================================="
echo "📁 Pasta de deploy: web-build/"
echo "📄 Arquivos criados:"
echo "   ✅ index.html"
echo "   ✅ _redirects"
echo "   ✅ manifest.json"
echo "   ✅ sw.js"
echo "   ✅ netlify.toml"
echo "   ✅ DEPLOY-NETLIFY.md"
echo ""
echo "🚀 Para fazer deploy no Netlify:"
echo "   1. Arraste a pasta 'web-build' para o Netlify"
echo "   2. Ou use: netlify deploy --prod --dir=web-build"
echo ""
echo "📖 Instruções detalhadas em: web-build/DEPLOY-NETLIFY.md"
echo ""
echo "✅ Seu projeto está pronto para ser publicado!"
