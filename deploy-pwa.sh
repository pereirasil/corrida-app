#!/bin/bash

echo "🚀 DEPLOY DA PWA CORRIDA APP"
echo "================================"

# Verificar se a pasta web-build existe
if [ ! -d "web-build" ]; then
    echo "❌ Erro: Pasta web-build não encontrada!"
    echo "Execute primeiro: npm run build-web"
    exit 1
fi

echo "✅ PWA construída encontrada!"
echo ""

echo "🌐 OPÇÕES DE DEPLOY:"
echo "1. Vercel (Recomendado - GRATUITO)"
echo "2. Netlify (GRATUITO)"
echo "3. GitHub Pages (GRATUITO)"
echo "4. Firebase Hosting (GRATUITO)"
echo "5. Servidor Local (TESTE)"
echo ""

read -p "Escolha uma opção (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 DEPLOY NO VERCEL:"
        echo "1. Acesse: https://vercel.com"
        echo "2. Faça login com GitHub/Google"
        echo "3. Clique em 'New Project'"
        echo "4. Importe este repositório"
        echo "5. Configure:"
        echo "   - Framework Preset: Other"
        echo "   - Root Directory: ./"
        echo "   - Build Command: echo 'PWA já construída'"
        echo "   - Output Directory: web-build"
        echo "6. Clique em 'Deploy'"
        echo ""
        echo "📱 Sua PWA estará disponível em: https://seu-projeto.vercel.app"
        ;;
    2)
        echo ""
        echo "🚀 DEPLOY NO NETLIFY:"
        echo "1. Acesse: https://netlify.com"
        echo "2. Faça login com GitHub/Google"
        echo "3. Arraste a pasta 'web-build' para a área de deploy"
        echo "4. Aguarde o deploy automático"
        echo "5. Personalize a URL se desejar"
        echo ""
        echo "📱 Sua PWA estará disponível em: https://sua-url.netlify.app"
        ;;
    3)
        echo ""
        echo "🚀 DEPLOY NO GITHUB PAGES:"
        echo "1. Execute os comandos:"
        echo "   git checkout -b gh-pages"
        echo "   git add web-build/"
        echo "   git commit -m 'Deploy PWA'"
        echo "   git push origin gh-pages"
        echo "2. Vá em Settings > Pages"
        echo "3. Source: Deploy from a branch"
        echo "4. Branch: gh-pages, folder: / (root)"
        echo "5. Clique em Save"
        echo ""
        echo "📱 Sua PWA estará disponível em: https://seu-usuario.github.io/seu-repo"
        ;;
    4)
        echo ""
        echo "🚀 DEPLOY NO FIREBASE:"
        echo "1. Execute: npm install -g firebase-tools"
        echo "2. Execute: firebase login"
        echo "3. Execute: firebase init hosting"
        echo "4. Configure:"
        echo "   - Public directory: web-build"
        echo "   - Single-page app: Yes"
        echo "   - GitHub Actions: No"
        echo "5. Execute: firebase deploy"
        echo ""
        echo "📱 Sua PWA estará disponível em: https://seu-projeto.web.app"
        ;;
    5)
        echo ""
        echo "🚀 TESTE LOCAL:"
        echo "1. Instale um servidor local:"
        echo "   npm install -g serve"
        echo "2. Execute: serve web-build -p 3000"
        echo "3. Acesse: http://localhost:3000"
        echo "4. Teste a instalação PWA no navegador"
        echo ""
        echo "📱 PWA funcionando localmente!"
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "📱 Sua PWA está pronta para ser usada!"
echo ""
echo "🔧 Para personalizar:"
echo "   - Edite: web-build/index.html"
echo "   - Edite: web-build/manifest.json"
echo "   - Edite: web-build/sw.js"
echo ""
echo "📊 Para testar:"
echo "   - Use o Lighthouse no Chrome DevTools"
echo "   - Verifique se é instalável"
echo "   - Teste funcionamento offline"
echo ""
echo "🏃‍♂️ Corrida App - Revolucionando a experiência de corrida!"
