# Iron Track App 🏋️‍♂️💪

O **Iron Track App** é um aplicativo mobile focado no gerenciamento, acompanhamento e registro de treinos e evolução corporal. Desenvolvido com uma abordagem minimalista de alta performance, o app visa reduzir o atrito do usuário durante o treino, permitindo o registro rápido de cargas, repetições e medições mensais de forma simples e eficiente.

Este repositório contém exclusivamente a camada de **Front-end / Mobile** do projeto.

---

## 🚀 Funcionalidades Principais

* **Autenticação Segura:** Fluxo de acesso otimizado com retenção de sessão local.
* **Dashboard Inteligente:** Visualização rápida do treino do dia atual e atalhos de treino.
* **Gestão de Treinos:** Criação, edição e listagem de blocos de treinos customizados.
* **Modo Execução (Foco):** Tela otimizada para a academia com cronômetro de descanso integrado e input rápido de progressão de carga (séries e pesos).
* **Evolução Corporal:** Registro mensal de medidas antropométricas e peso com visualização de histórico.

---

## 🛠️ Stack Tecnológica & Arquitetura

O projeto foi construído pensando no mínimo processamento possível no dispositivo, garantindo economia de bateria e fluidez de navegação.

* Framework: React Native com Expo (TypeScript nativo).
* Roteamento & Navegação: Expo Router (File-based routing moderno).
* Gerenciamento de Estado: Zustand (Estado global atômico, ultra leve e sem re-renders desnecessários).
* Cache & Consumo de API: TanStack Query / React Query (Gerenciamento agressivo de cache local, evitando requisições redundantes ao backend).
* Persistência de Dados: React Native MMKV (Armazenamento em C++ chave-valor até 30x mais rápido que o AsyncStorage tradicional).

### 📁 Padrão Arquitetural: Feature-First (Feature-Driven)

Para garantir escalabilidade, o código é organizado em torno de domínios de negócio específicos em vez de tipos de arquivos técnicos:

src/
├── core/         # Componentes globais, utilitários e tema visual (Design System)
├── features/     # Módulos isolados de negócio (auth, tracking, routines, evolution)
│   └── [feature]/# Cada funcionalidade contém suas próprias telas, hooks e tipos locais
├── services/     # Camada de rede (Axios/Fetch API) e configurações de storage
└── app/          # Roteador de arquivos (Expo Router), atuando como um entry-point limpo

---

## 📦 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter o Node.js instalado na sua máquina. Para testar o aplicativo direto no seu smartphone físico, instale o aplicativo Expo Go (disponível na Google Play Store e Apple App Store).

1. Clone o repositório:
   git clone https://github.com/seu-usuario/iron-track-app.git
   cd iron-track-app

2. Instale as dependências:
   npm install

3. Inicie o servidor de desenvolvimento do Expo:
   npx expo start

4. Abra o aplicativo:
   * No celular: Escaneie o QR Code exibido no terminal utilizando a câmera do aparelho (iOS) ou o app Expo Go (Android).
   * No emulador: Pressione "a" para abrir no emulador Android ou "i" para o simulador iOS.

---

## ⚙️ Diretrizes de Desenvolvimento

* Simplicidade acima de tudo: Telas limpas, inputs diretos com uma única mão.
* Desempenho de Rede: Estados de inputs de carga modificados localmente na tela. O envio de dados ao backend (Java Spring) deve ocorrer em lote (batch) apenas na finalização do bloco de treino.
* Padrões de Código: Uso estrito de TypeScript para tipagem de contratos e DTOs de comunicação com a API.