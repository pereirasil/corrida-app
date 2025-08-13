# 🧪 **TESTE DE AUTENTICAÇÃO - CORRIDA APP**

## ✅ **Status do Backend**
- **Servidor**: ✅ Rodando na porta 3000
- **Banco de Dados**: ✅ PostgreSQL conectado
- **API**: ✅ Funcionando perfeitamente
- **Swagger**: ✅ Disponível em `/api-docs`

## 🔧 **Problema Identificado e Resolvido**

### **❌ Problema Original:**
- O app estava tentando conectar em `localhost:3000`
- Dispositivos móveis não conseguem acessar `localhost` do computador
- Erro de "conexão recusada" ou "timeout"

### **✅ Solução Implementada:**
- Alterado para usar o IP da máquina: `192.168.0.127:3000`
- Configuração centralizada em `constants/Config.ts`
- API agora acessível por dispositivos móveis

## 🧪 **Como Testar Agora**

### **1. Verificar se o Backend está Rodando**
```bash
cd backend
node server.js
```

**Saída esperada:**
```
🚀 Servidor iniciado com sucesso!
📍 Porta: 3000
🌍 Ambiente: development
📚 Documentação: http://localhost:3000/api-docs
🔍 Health Check: http://localhost:3000/health
```

### **2. Testar a API Diretamente**
```bash
# Health Check
curl http://192.168.0.127:3000/health

# Criar usuário
curl -X POST http://192.168.0.127:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seu Nome",
    "username": "seuusuario",
    "phone": "11999999999",
    "email": "seu@email.com",
    "password": "123456"
  }'

# Fazer login
curl -X POST http://192.168.0.127:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "123456"
  }'
```

### **3. Testar no App Mobile**

#### **Tela de Cadastro:**
1. Abra o app no dispositivo/emulador
2. Vá para "Cadastre-se"
3. Preencha todos os campos:
   - **Nome Completo**: Seu nome
   - **Nome de Usuário**: usuario123
   - **Celular**: 11999999999
   - **Email**: teste@corridaapp.com
   - **Senha**: 123456
   - **Confirmar Senha**: 123456
4. Toque em "Criar Conta"

#### **Tela de Login:**
1. Após o cadastro, você será redirecionado para login
2. Preencha:
   - **Email**: teste@corridaapp.com
   - **Senha**: 123456
3. Toque em "Entrar"

## 🎯 **Resultados Esperados**

### **✅ Cadastro Bem-sucedido:**
- Mensagem de "Conta criada com sucesso!"
- Redirecionamento para tela de login
- Usuário salvo no banco de dados

### **✅ Login Bem-sucedido:**
- Mensagem de "Login realizado com sucesso!"
- Redirecionamento para app principal
- Token JWT salvo no AsyncStorage

### **✅ App Principal:**
- Todas as telas acessíveis
- Dados do usuário carregados
- Botão de logout funcionando

## 🔍 **Verificar no Banco de Dados**

```bash
# Conectar ao PostgreSQL
psql -h localhost -U postgres -d postgres

# Ver todos os usuários
SELECT id, name, username, email, level, join_date FROM users ORDER BY join_date DESC;

# Ver usuário específico
SELECT * FROM users WHERE email = 'teste@corridaapp.com';
```

## 🚨 **Possíveis Problemas e Soluções**

### **1. Erro de Rede**
- **Sintoma**: "Erro de conexão" ou "timeout"
- **Solução**: Verificar se o IP `192.168.0.127` está correto
- **Como verificar**: `ifconfig | grep "inet " | grep -v 127.0.0.1`

### **2. Erro de CORS**
- **Sintoma**: "CORS policy" ou "Access-Control-Allow-Origin"
- **Solução**: Backend já configurado com CORS habilitado

### **3. Erro de Validação**
- **Sintoma**: "Por favor, preencha todos os campos"
- **Solução**: Verificar se todos os campos estão preenchidos

### **4. Erro de Banco**
- **Sintoma**: "Erro interno do servidor"
- **Solução**: Verificar se PostgreSQL está rodando

## 📱 **Configurações do App**

### **Arquivos Modificados:**
- `constants/Config.ts` - Configuração centralizada
- `constants/Api.ts` - URLs da API
- `hooks/useAuth.ts` - Hook de autenticação
- `app/(auth)/login.tsx` - Tela de login
- `app/(auth)/cadastro.tsx` - Tela de cadastro

### **Configuração da API:**
```typescript
// constants/Config.ts
API: {
  BASE_URL: __DEV__ 
    ? 'http://192.168.0.127:3000'  // IP da sua máquina
    : 'https://sua-api-producao.com',
}
```

## 🎉 **Sucesso!**

Se tudo funcionar, você terá:
- ✅ Sistema de autenticação completo
- ✅ Cadastro e login funcionando
- ✅ Proteção de rotas automática
- ✅ Persistência de sessão
- ✅ Integração com backend real

**Agora teste o cadastro no app e veja se funciona! 🚀** 