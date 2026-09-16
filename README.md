# MiGaTUBE 🎵💿

Aplicação web moderna, elegante e de alta fidelidade para streaming e reprodução de músicas e vídeos disponíveis no YouTube através dos recursos oficiais permitidos.

Projetada com identidade visual premium em tons de verde escuro, preto obsidiana, cinza grafite e detalhes em verde neon, equipada com um exclusivo **Deck de Vinil Digital em 33⅓ RPM**, medidor de volume **VU Meter** digital com LEDs dinâmicos, playlists personalizáveis, favoritos e suporte completo a **Progressive Web App (PWA)** instalável no smartphone e desktop.

---

## 🌟 Principais Recursos

1. **Deck de Vinil Digital (33⅓ RPM)**:
   - Rotação suave do disco de vinil durante a reprodução com ranhuras sonoras e brilho anisotrópico.
   - Braço de leitura (tonearm) animado com agulha e LED neon que se apoia no disco ao tocar e levanta ao pausar.
   - Selo central personalizado exibindo a capa do álbum/vídeo oficial.

2. **VU Meter Digital em Tempo Real**:
   - Medidor de nível estéreo/mono com segmentos de LEDs em cascata (verde escuro, verde esmeralda e verde neon no pico).
   - Animação rítmica sincronizada com a reprodução musical e decaimento suave em pausas.
   - Pode ser ativado ou desativado nas Configurações.

3. **Pesquisa & Integração YouTube Oficial**:
   - Backend seguro em Express (`server.ts`) e Vercel Serverless (`/api/index.ts`) que atua como proxy para a **YouTube Data API v3**, garantindo que sua chave de API nunca seja exposta no cliente.
   - Filtros inteligentes de pesquisa: **Todos**, **Músicas**, **Vídeos** e **Canais**.
   - Integração com o player oficial **YouTube IFrame Player API** para reprodução contínua em conformidade com as diretrizes e Termos de Serviço do YouTube.
   - Suporte à **Media Session API**: metadados do artista, título, capa e controles nativos na tela de bloqueio e barra de notificações do dispositivo.

4. **Gerenciador Completo de Playlists & Favoritos**:
   - Crie playlists ilimitadas com nomes personalizados (ex: *Reggae das Antigas*, *Rock Clássico*, *Para Viajar*).
   - Adicione e remova músicas instantaneamente.
   - Sistema de favoritos com 1 toque no ícone de coração.
   - Histórico de reprodução recente com função de repetir faixa e limpar histórico.
   - Persistência automática em `localStorage`.

5. **PWA Instalável (Progressive Web App)**:
   - Totalmente compatível com Android, iOS (Safari) e navegadores Desktop.
   - Botão de instalação nativo no aplicativo e guia passo a passo para dispositivos Apple iOS.
   - Service Worker configurado via `vite-plugin-pwa` para cache de interface e indicador de conexão offline.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Motion
- **Player & Áudio**: YouTube IFrame API, Web MediaSession API, VU Meter LED Engine
- **Backend / Proxy**: Express, Node.js, Vercel Serverless Functions (`api/index.ts`)
- **PWA**: `vite-plugin-pwa`, Web App Manifest, Service Worker
- **Persistência**: LocalStorage estruturado com fallback seguro

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar Dependências

```bash
git clone <url-do-repositorio>
cd migatube
npm install
```

### 2. Configurar Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`):

```env
# Chave da API do YouTube Data v3 (Google Cloud Console)
YOUTUBE_API_KEY=sua_chave_aqui
```

> **Nota**: Se a `YOUTUBE_API_KEY` não for informada, o MiGaTUBE entra automaticamente em **Modo Catálogo Inteligente**, disponibilizando uma vasta seleção com Bob Marley, Michael Jackson, Queen, Coldplay, Tom Jobim, Elis Regina e muito mais.

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse no navegador: `http://localhost:3000`

---

## ☁️ Implantação na Vercel (Passo a Passo)

O MiGaTUBE já possui `vercel.json` e a pasta `api/` configurados especificamente para a Vercel.

1. Faça commit do projeto para um repositório no seu GitHub ou GitLab.
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório do **MiGaTUBE**.
4. Nas configurações do projeto na Vercel:
   - **Framework Preset**: *Vite*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Em **Environment Variables**, adicione (se desejar pesquisas ilimitadas ao vivo na API do YouTube):
   - `YOUTUBE_API_KEY`: *(Sua chave gerada no Google Cloud Console com YouTube Data API v3 ativada)*.
6. Clique em **Deploy**!
   - O frontend será hospedado na CDN global de borda da Vercel.
   - As rotas `/api/youtube/search` e `/api/health` serão executadas como Serverless Functions de alta performance.

---

## ⚖️ Conformidade e Termos de Uso

O MiGaTUBE foi desenvolvido com estrito respeito às diretrizes e Termos de Serviço do YouTube:
- Não realiza download não autorizado de arquivos de áudio ou vídeo.
- Não remove nem bloqueia anúncios do YouTube.
- Utiliza os mecanismos oficiais de incorporação (YouTube IFrame Player API).
- Não faz scraping proibido nem bypass de restrições de DRM.

---

Desenvolvido com excelência técnica para proporcionar uma experiência auditiva e visual inesquecível no **MiGaTUBE**!
