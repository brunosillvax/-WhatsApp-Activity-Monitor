# 📱 WhatsApp Activity Monitor

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License MIT"/>
</p>

> ⚠️ **AVISO**: Projeto de pesquisa educacional que demonstra vulnerabilidades de privacidade em aplicativos de mensagens. Use apenas para fins legítimos e com consentimento.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Como Funciona](#como-funciona)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Funcionalidades Avançadas](#funcionalidades-avançadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Considerações Éticas e Legais](#considerações-éticas-e-legais)
- [Proteção](#proteção)
- [Solução de Problemas](#solução-de-problemas)

## 🎯 Sobre o Projeto

Este projeto implementa a pesquisa do artigo **"Careless Whisper: Exploiting Silent Delivery Receipts to Monitor Users on Mobile Instant Messengers"** da Universidade de Viena e SBA Research.

**O que faz:** Medindo o Round-Trip Time (RTT) dos recibos de entrega de mensagens do WhatsApp, esta ferramenta pode detectar:
- ✅ Quando um usuário está usando ativamente o dispositivo (RTT baixo)
- ✅ Quando o dispositivo está em modo standby/travado (RTT alto)
- ✅ Mudanças potenciais de localização (dados móveis vs. WiFi)
- ✅ Padrões de atividade ao longo do tempo
- ✅ Status de presença e digitação
- ✅ Múltiplos dispositivos conectados

**Implicações de segurança:** Demonstra uma vulnerabilidade significativa de privacidade em aplicativos de mensagens que pode ser explorada para vigilância.

## ✨ Funcionalidades

### 🔍 Rastreamento Básico
- **Detecção de Estado do Dispositivo**: Online, Standby ou Offline
- **Medição de RTT em Tempo Real**: Gráficos de Round-Trip Time
- **Múltiplos Dispositivos**: Detecta WhatsApp Web, Desktop, etc.
- **Histórico de Atividade**: Armazena até 2000 medições

### 📊 Estatísticas Avançadas
- **Tempo Total Online**: Calcula tempo total de uso
- **Contagem de Sessões**: Número de sessões detectadas
- **Duração Média de Sessões**: Tempo médio por sessão
- **Horários Mais Ativos**: Análise de padrões de uso
- **Histórico de Mudanças de Estado**: Todas as transições Online/Standby/Offline

### 🔔 Sistema de Alertas
- **Alertas de Mudança de Estado**: Notifica quando contato muda de estado
- **Alertas de Mudança de Rede**: Detecta WiFi ↔ Dados Móveis
- **Notificações do Navegador**: Notificações push (com permissão)
- **Painel de Alertas**: Visualização de todos os alertas recentes

### 💾 Exportação de Dados
- **Exportação em JSON**: Todos os dados de rastreamento
- **Exportação em CSV**: Histórico para análise em planilhas
- **Download Automático**: Arquivos baixados automaticamente

### 📡 Análise de Rede
- **Detecção de Tipo de Rede**: Infere WiFi ou Dados Móveis
- **Histórico de Mudanças**: Rastreia mudanças entre tipos de rede
- **Indicador Visual**: Mostra tipo de rede atual

### 👁️ Captura Avançada
- **Status de Presença**: Online, offline, digitando, etc.
- **Histórico de Presença**: Últimas 100 mudanças de status
- **Indicadores de Digitação**: Detecta quando está digitando
- **Última Vez Online**: Timestamp da última atividade
- **Informações de Conexão**: Dados por dispositivo

### 🎨 Interface Web
- **Dashboard em Tempo Real**: Visualização instantânea
- **Gráficos Interativos**: Visualização de dados históricos
- **Múltiplos Contatos**: Rastreie vários contatos simultaneamente
- **Modo Privacidade**: Mascara números de telefone
- **Interface Responsiva**: Funciona em desktop e mobile

## 🔧 Como Funciona

### Métodos de Sonda (Probe Methods)

| Método | Descrição |
|--------|-----------|
| **Delete** (Padrão) | Envia requisição de "delete" para uma mensagem inexistente (silencioso) |
| **Reaction** | Envia reação emoji para uma mensagem inexistente |

### Lógica de Detecção

O sistema mede o tempo entre o envio da sonda e o recebimento do CLIENT ACK (Status 3) como RTT. O estado do dispositivo é detectado usando um threshold dinâmico calculado como 90% da mediana do RTT:

- **🟢 Online**: RTT abaixo do threshold = dispositivo ativo
- **🟡 Standby**: RTT acima do threshold = tela desligada/standby
- **🔴 Offline**: Sem resposta = dispositivo offline

### O Que É Capturado

✅ **Capturado:**
- Timestamp de envio e recebimento
- RTT (Round-Trip Time)
- Status do ACK (CLIENT/SERVER)
- Estado do dispositivo (Online/Standby/Offline)
- Histórico de mudanças de estado
- Padrões de atividade
- Informações de presença
- Status de digitação
- Tipo de rede (inferido)

❌ **NÃO Capturado:**
- Conteúdo das mensagens
- Fotos/Vídeos
- Localização GPS
- Contatos
- Histórico de conversas
- Status/Stories

## 🚀 Instalação

### Requisitos
- Node.js 20+ 
- npm
- Conta do WhatsApp

### Passos

```bash
# Clone o repositório
git clone https://github.com/brunosillvax/-WhatsApp-Activity-Monitor.git
cd -WhatsApp-Activity-Monitor

# Instale as dependências
npm install
cd client && npm install && cd ..
```

## 📖 Como Usar

### Opção 1: Script PowerShell (Recomendado)

Execute o script que abre automaticamente dois terminais:

```powershell
.\iniciar.ps1
```

### Opção 2: Manualmente

**Terminal 1 - Backend:**
```bash
npm run start:server
```

**Terminal 2 - Frontend:**
```bash
npm run start:client
```

### Conectando o WhatsApp

1. Acesse `http://localhost:3000` no navegador
2. Um QR code será exibido no terminal do backend
3. Abra o WhatsApp no celular
4. Vá em **Configurações** > **Aparelhos conectados**
5. Escaneie o QR code

### Adicionando um Contato

1. Na interface web, digite o número no formato: **código do país + número**
   - Exemplos:
     - Brasil: `5511999999999`
     - Alemanha: `491701234567`
     - EUA: `15551234567`
2. Clique em **"Add Contact"** ou pressione **Enter**
3. O sistema começará a rastrear automaticamente

### Entendendo os Status

- **🟢 Online**: Dispositivo está sendo usado ativamente (RTT baixo)
- **🟡 Standby**: Dispositivo está em modo de espera/travado (RTT alto)
- **🔴 Offline**: Dispositivo está offline ou não responde

## 🎯 Funcionalidades Avançadas

### Ver Estatísticas Detalhadas

1. Clique no botão **📊** no card do contato
2. Veja todas as estatísticas:
   - Tempo total online
   - Número de sessões
   - Duração média de sessões
   - Horários mais ativos
   - Histórico de mudanças de estado

### Captura Avançada

1. Clique no botão **👁️** (roxo) no card do contato
2. Veja informações detalhadas:
   - Status atual de presença
   - Status de digitação
   - Última vez online
   - Histórico de presença (últimas 10 mudanças)
   - Dispositivos rastreados

### Receber Alertas

- Os alertas aparecem automaticamente no topo da interface
- Permita notificações do navegador quando solicitado
- Veja alertas na interface e receba notificações push

### Exportar Dados

1. Clique no botão **⬇️** no card do contato
2. Escolha entre **JSON** ou **CSV**
3. O arquivo será baixado automaticamente

### Modo Privacidade

- Clique no botão **"Privacy OFF"** para ativar
- Quando ativado, os números aparecem mascarados (•••••)
- Útil para screenshots ou demonstrações

## 📁 Estrutura do Projeto

```
whatsapp-activity-monitor/
├── src/
│   ├── tracker.ts         # Lógica de análise RTT do WhatsApp
│   ├── signal-tracker.ts  # Lógica de análise RTT do Signal
│   ├── server.ts          # Servidor API backend (ambas plataformas)
│   └── index.ts           # Interface CLI
├── client/                # Interface React web
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ContactCard.tsx
│   │   │   └── Login.tsx
│   │   └── App.tsx
│   └── package.json
├── auth_info_baileys/     # Dados de autenticação (não commitado)
├── iniciar.ps1            # Script de inicialização
└── package.json
```

## ⚠️ Considerações Éticas e Legais

### ⚖️ Uso Responsável

- ✅ **Para fins educacionais e de pesquisa**
- ✅ **Com consentimento explícito** antes de rastrear
- ✅ **Demonstração de vulnerabilidades** de segurança
- ❌ **NUNCA** rastreie pessoas sem consentimento
- ❌ **NÃO** use para vigilância não autorizada
- ❌ **NÃO** viole leis de privacidade

### 🔒 Privacidade

- Dados de autenticação (`auth_info_baileys/`) são armazenados localmente
- **NUNCA** faça commit de dados de autenticação
- Todas as informações capturadas são apenas relacionadas a atividade/timing
- Não inclui conteúdo de mensagens
- Respeita configurações de privacidade do WhatsApp

## 🛡️ Proteção

### Como Se Proteger

A mitigação mais eficaz é habilitar **"Bloquear mensagens de contas desconhecidas"** no WhatsApp:

**Configurações** → **Privacidade** → **Avançado** → **Bloquear mensagens de contas desconhecidas**

Esta configuração pode reduzir a capacidade de um atacante enviar sondas de números desconhecidos, pois o WhatsApp bloqueia mensagens em alto volume de contas desconhecidas. No entanto, o WhatsApp não divulga o que significa "alto volume", então isso não previne completamente o ataque.

**Nota:** Desabilitar confirmações de leitura ajuda com mensagens regulares, mas não protege contra este ataque específico. Em dezembro de 2024, esta vulnerabilidade permanece explorável no WhatsApp e Signal.

## 🔧 Solução de Problemas

### Não conecta ao WhatsApp
**Solução:** Delete a pasta `auth_info_baileys/` e escaneie o QR code novamente

### Erro ao iniciar
**Solução:** Verifique se o Node.js 20+ está instalado:
```bash
node --version
```

### Porta já em uso
**Solução:** Feche outros processos usando a porta 3000 ou altere a porta no código

### ERR_CONNECTION_REFUSED na porta 3001
**Causa:** O backend não iniciou corretamente

**Soluções:**
1. Inicie apenas o servidor (sem Signal API):
   ```bash
   npx tsx src/server.ts
   ```
2. Ou use o script:
   ```powershell
   .\iniciar-servidor.ps1
   ```

### "Number not on WhatsApp"
- O número não está cadastrado no WhatsApp
- Verifique se digitou o número corretamente com o código do país

### "Already tracking this contact"
- Você já está rastreando este número
- Remova o contato primeiro se quiser adicionar novamente

### Nenhum dado aparece
- Aguarde alguns segundos - o sistema precisa enviar algumas sondas primeiro
- Verifique se o WhatsApp está conectado (deve estar verde)

## 📚 Citação

Baseado na pesquisa de Gegenhuber et al., Universidade de Viena & SBA Research:

```bibtex
@inproceedings{gegenhuber2024careless,
  title={Careless Whisper: Exploiting Silent Delivery Receipts to Monitor Users on Mobile Instant Messengers},
  author={Gegenhuber, Gabriel K. and G{\"u}nther, Maximilian and Maier, Markus and Judmayer, Aljosha and Holzbauer, Florian and Frenzel, Philipp {\'E}. and Ullrich, Johanna},
  year={2024},
  organization={University of Vienna, SBA Research}
}
```

## 📄 Licença

MIT License - Veja arquivo LICENSE.

Desenvolvido com [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)

---

**Use com responsabilidade. Esta ferramenta demonstra vulnerabilidades reais de segurança que afetam milhões de usuários.** 🔒
