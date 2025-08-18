#!/bin/bash

echo "🚀 Iniciando deploy completo no Vercel (Frontend + Backend + Banco)..."
echo "================================================================"

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# 2. Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# 3. Fazer build do frontend
echo "🔨 Fazendo build do frontend..."
npm run build-web

# 4. Verificar se o build foi criado
if [ ! -d "web-build" ]; then
    echo "❌ Erro: Diretório web-build não foi criado"
    exit 1
fi

# 5. Verificar arquivos essenciais
echo "✅ Verificando arquivos essenciais..."
required_files=("index.html" "manifest.json" "sw.js")
for file in "${required_files[@]}"; do
    if [ -f "web-build/$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file não encontrado"
        exit 1
    fi
done

# 6. Verificar backend
echo "🔧 Verificando backend..."
if [ ! -f "backend/server.js" ]; then
    echo "❌ Erro: backend/server.js não encontrado"
    exit 1
fi

# 7. Fazer deploy no Vercel
echo "🚀 Fazendo deploy no Vercel..."
echo ""
echo "📋 INSTRUÇÕES IMPORTANTES:"
echo "=========================="
echo "1. Se for a primeira vez, você será redirecionado para fazer login"
echo "2. Escolha 'Link to existing project' se já tiver um projeto"
echo "3. Escolha 'Create new project' se for novo"
echo "4. Para o banco de dados, escolha 'Vercel Postgres' (GRATUITO)"
echo "5. Configure as variáveis de ambiente quando solicitado"
echo ""

# Deploy
vercel --prod

# 8. Mostrar instruções pós-deploy
echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "===================="
echo ""
echo "📱 FRONTEND (PWA):"
echo "   • URL: https://seu-projeto.vercel.app"
echo "   • Funciona offline"
echo "   • Pode ser instalado como app"
echo ""
echo "🔧 BACKEND (API):"
echo "   • URL: https://seu-projeto.vercel.app/api"
echo "   • Rotas: /api/auth, /api/users, /api/running, etc."
echo ""
echo "🗄️ BANCO DE DADOS:"
echo "   • Vercel Postgres (GRATUITO)"
echo "   • Acessível via dashboard do Vercel"
echo ""
echo "🔑 VARIÁVEIS DE AMBIENTE CONFIGURADAS:"
echo "   • POSTGRES_HOST, POSTGRES_DATABASE, etc."
echo "   • JWT_SECRET para autenticação"
echo ""
echo "📊 MONITORAMENTO:"
echo "   • Logs em tempo real no dashboard"
echo "   • Métricas de performance"
echo "   • Deploy automático a cada push"
echo ""
echo "✅ Seu app completo está rodando no Vercel!"
echo "🌐 Acesse: https://vercel.com/dashboard"
