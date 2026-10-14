# Tastory 🍳 — Taste your story

O **Tastory** é uma aplicação móvel desenvolvida em **React Native** (com Expo) integrada ao **Firebase**, projetada para conectar entusiastas da culinária através da partilha, criação e gestão de receitas caseiras e comunitárias.

---

## 🚀 Funcionalidades Principais

* Autenticação Segura: Sistema de registo e início de sessão com persistência automática de sessão via Firebase Auth.


* Feed Personalizado: Visualização em tempo real das receitas criadas pelo próprio utilizador e um carrossel de inspiração com as receitas da comunidade.


* Gestão Completa de Receitas: Criador e editor de receitas estruturado com campos para título, categoria, tempo de preparo, rendimento, ingredientes e modo de preparo.


* Suporte a Multimédia: Capacidade de anexar imagens diretamente da galeria do dispositivo (via upload para o Firebase Storage) ou por meio de links de URLs externos.


* Detalhes da Receita: Ecrã dedicado para explorar os passos detalhados de qualquer prato com um design acolhedor.



---

## 🛠️ Tecnologias Utilizadas

* **React Native** / **Expo**

* **React Navigation** (Bottom Tabs & Stack Navigator)


* **Firebase (Auth, Firestore, Storage)**

* **Expo Vector Icons** & **Expo Image Picker**


---

## 📂 Estrutura do Projeto

```text
src/
│
├── services/
│   └── firebaseConfig.ts      # Configuração e inicialização do Firebase
│
├── context/
│   └── AuthContext.tsx        # Contexto global de autenticação[cite: 1]
│
├── navigation/
│   └── MainTabs.tsx           # Navegação por abas inferiores[cite: 6]
│
└── screens/
    ├── Login.tsx              # Ecrã de autenticação e registo[cite: 3]
    ├── Home.tsx               # Ecrã inicial com receitas do utilizador e comunidade[cite: 2]
    ├── RecipeDetail.tsx       # Ecrã de visualização detalhada da receita[cite: 4]
    └── RecipeForms.tsx        # Ecrã de criação e edição de receitas[cite: 5]

```

---

## ⚙️ Como Executar o Projeto

1. **Pré-requisitos:** Certifique-se de ter o [Node.js](https://nodejs.org/) e o aplicativo **Expo Go** instalado no seu dispositivo móvel (ou um emulador configurado).
2. **Instalar as dependências:**
```bash
npm install

```


3. **Configurar o Firebase:**
Certifique-se de que o ficheiro `src/services/firebaseConfig.ts` está devidamente configurado com as credenciais do seu projeto Firebase (Authentication, Firestore e Storage).
4. **Iniciar a aplicação:**
```bash
npx expo start

```


5. Leia o código QR gerado no terminal com a câmara do seu telemóvel (ou abra num emulador) para testar o aplicativo através do Expo Go.
