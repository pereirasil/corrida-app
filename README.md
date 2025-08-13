# 🏃‍♂️ Corrida App - Aplicativo Social de Corridas

Um aplicativo móvel completo para corredores que desejam treinar em grupo, sincronizar música e compartilhar conquistas.

## ✨ **Funcionalidades Principais**

### 🎯 **Rastreamento de Corridas**
- **GPS em tempo real** com precisão de localização
- **Métricas detalhadas**: distância, pace, velocidade, calorias, passos
- **Histórico completo** de todas as sessões
- **Estatísticas semanais e mensais** com gráficos visuais

### 👥 **Funcionalidades Sociais**
- **Convidar amigos** para correr juntos
- **Visualização em tempo real** de todos os participantes
- **Sistema de amizades** com solicitações e bloqueios
- **Perfis de usuário** com estatísticas e conquistas

### 🎵 **Sincronização de Música**
- **Sessões compartilhadas** de música durante corridas
- **Playlists colaborativas** entre participantes
- **Controle de reprodução** pelo host da sessão
- **Sincronização automática** de faixas

### 🏆 **Sistema de Conquistas**
- **Desafios personalizáveis** (distância, tempo, frequência)
- **Conquistas automáticas** por metas atingidas
- **Rankings competitivos** entre amigos
- **Badges e níveis** de corredor

## 🚀 **Tecnologias Utilizadas**

### **Frontend (React Native/Expo)**
- **Expo SDK 53** com TypeScript
- **Expo Router** para navegação baseada em arquivos
- **React Navigation** para navegação entre telas
- **Expo Location** para rastreamento GPS
- **React Native Maps** para visualização de mapas
- **Expo AV** para reprodução de áudio
- **AsyncStorage** para persistência local

### **Backend (Node.js/Express)**
- **Express.js** com middleware de segurança
- **PostgreSQL** como banco de dados principal
- **JWT** para autenticação e autorização
- **bcryptjs** para hash de senhas
- **Swagger/OpenAPI** para documentação da API
- **Validação** com express-validator

## 📱 **Estrutura do App**

### **Telas de Autenticação** 🔐
- **Login**: Email e senha com validação
- **Cadastro**: Nome completo, usuário, celular, email e senha
- **Navegação automática** baseada no estado de autenticação
- **Persistência** de sessão com AsyncStorage

### **Telas Principais** 🏠
- **Início**: Dashboard com estatísticas e próximas corridas
- **Corrida**: Rastreamento GPS e métricas em tempo real
- **Amigos**: Gerenciamento de amizades e convites
- **Perfil**: Estatísticas pessoais e configurações

### **Hooks Personalizados** ⚡
- **useAuth**: Gerenciamento completo de autenticação
- **useRunningTracker**: Rastreamento GPS e métricas
- **useMusicSync**: Sincronização de sessões musicais

## 🛠️ **Instalação e Configuração**

### **Pré-requisitos**
- Node.js 18+ e npm
- Expo CLI (`npm install -g @expo/cli`)
- PostgreSQL 12+
- iOS Simulator (para desenvolvimento iOS)
- Android Studio (para desenvolvimento Android)

### **1. Clone o Repositório**
```bash
git clone <url-do-repositorio>
cd corrida-app
```

### **2. Instale as Dependências do Frontend**
```bash
npm install
```

### **3. Configure o Backend**
```bash
cd backend
npm install
```

### **4. Configure o Banco de Dados**
```bash
# Crie um arquivo .env na pasta backend
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=July@100312
JWT_SECRET=sua_chave_secreta_aqui
```

### **5. Execute o Schema do Banco**
```bash
npm run db:setup
```

### **6. Inicie o Backend**
```bash
npm run dev
```

### **7. Inicie o App Mobile**
```bash
# Em outro terminal, na pasta raiz
npm start
```

## 🔐 **Sistema de Autenticação**

### **Fluxo de Login**
1. Usuário acessa a tela de login
2. Preenche email e senha
3. App faz requisição para `/api/auth/login`
4. Backend valida credenciais e retorna JWT
5. Token é salvo no AsyncStorage
6. Usuário é redirecionado para as telas principais

### **Fluxo de Cadastro**
1. Usuário acessa a tela de cadastro
2. Preenche todos os campos obrigatórios
3. App valida dados localmente
4. Requisição para `/api/auth/register`
5. Backend cria usuário e retorna confirmação
6. Usuário é redirecionado para login

### **Proteção de Rotas**
- **Rotas públicas**: Login e cadastro
- **Rotas protegidas**: Todas as telas principais
- **Verificação automática** de autenticação
- **Redirecionamento** baseado no estado de login

## 🌐 **API Backend**

### **Endpoints Principais**
- **`/api/auth/*`** - Autenticação e registro
- **`/api/users/*`** - Gerenciamento de usuários
- **`/api/running/*`** - Sessões de corrida
- **`/api/music/*`** - Sessões musicais
- **`/api/friends/*`** - Sistema de amizades
- **`/api/achievements/*`** - Conquistas e desafios

### **Documentação Swagger**
- **URL**: `http://localhost:3000/api-docs`
- **Interface interativa** para testar endpoints
- **Schemas** completos de todos os modelos
- **Exemplos** de requisições e respostas

## 📊 **Banco de Dados**

### **Tabelas Principais**
- **`users`** - Dados dos usuários
- **`running_sessions`** - Sessões de corrida
- **`route_points`** - Pontos GPS das rotas
- **`music_sessions`** - Sessões musicais
- **`friendships`** - Relacionamentos entre usuários
- **`achievements`** - Conquistas e badges

### **Relacionamentos**
- Usuários podem ter múltiplas sessões de corrida
- Sessões podem ter múltiplos participantes
- Músicas são sincronizadas por sessão
- Amizades são bidirecionais com status

## 🧪 **Testando o App**

### **1. Teste de Autenticação**
```bash
# Criar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste",
    "username": "teste",
    "phone": "11999999999",
    "email": "teste@corridaapp.com",
    "password": "123456"
  }'

# Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@corridaapp.com",
    "password": "123456"
  }'
```

### **2. Teste das Telas**
- **Login**: Preencha email e senha válidos
- **Cadastro**: Crie uma nova conta
- **Dashboard**: Visualize estatísticas mockadas
- **Corrida**: Teste o rastreamento GPS
- **Amigos**: Explore funcionalidades sociais

## 🚀 **Próximos Passos**

### **Funcionalidades Planejadas**
- [ ] **Upload de avatar** para perfil
- [ ] **Notificações push** para convites
- [ ] **Modo offline** com sincronização
- [ ] **Exportação** de dados para Strava/Garmin
- [ ] **Chat em tempo real** durante corridas
- [ ] **Gamificação** com pontos e rankings

### **Melhorias Técnicas**
- [ ] **Testes automatizados** com Jest
- [ ] **CI/CD** com GitHub Actions
- [ ] **Monitoramento** com Sentry
- [ ] **Analytics** com Firebase
- [ ] **Deploy** para App Store e Google Play

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Suporte**

- **Issues**: Use o GitHub Issues para reportar bugs
- **Discussions**: Use o GitHub Discussions para perguntas
- **Email**: contato@corridaapp.com

---

**🏃‍♂️ Corra com amigos, sincronize sua música e alcance suas metas! 🎵🏆**
