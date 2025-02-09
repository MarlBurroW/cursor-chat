# AI-Powered Real-Time Chat

Un chat en temps réel développé entièrement avec [Cursor](https://cursor.sh/), sans écrire une seule ligne de code manuellement. Une démonstration des capacités de l'IA dans le développement moderne.

## 🎯 Le Concept

L'objectif de ce projet était de créer une application de chat complète en utilisant uniquement Cursor et son IA, sans taper de code manuellement. Chaque ligne de code, de la structure du projet aux fonctionnalités avancées, a été générée via des conversations avec l'IA.

## 🚀 Fonctionnalités

- 💬 Chat en temps réel multi-utilisateurs
- 📜 Historique des messages avec chargement progressif
- 🌓 Thème clair/sombre
- 🟢 Indicateur de statut de connexion
- 👥 Liste des utilisateurs connectés en temps réel
- 🎨 Messages personnalisés avec couleur par utilisateur
- ✨ Animations fluides
- 📱 Interface responsive

## 🛠️ Stack Technique

### Frontend

- React 18 avec TypeScript
- Vite pour le bundling
- TailwindCSS + Shadcn/ui pour l'interface
- Socket.io-client pour la communication temps réel

### Backend

- Node.js avec Express
- Socket.io pour la gestion temps réel
- MongoDB pour la persistance des données

## 🏁 Démarrage Rapide

### Prérequis

- Node.js >= 18
- MongoDB
- pnpm (recommandé) ou npm

### Installation

```bash
git clone https://github.com/MarlburroW/cursor-chat
cd cursor-chat
yarn install
cd frontend && yarn install
```

### Configuration

Créez un fichier `.env` à la racine :

```env
MONGODB_URI=votre_uri_mongodb
PORT=3001
```

Créez un fichier `.env` dans le dossier frontend :

```env
VITE_WS_URL=http://localhost:3001
```

### Lancement

```bash
# Terminal 1 : Backend
pnpm dev

# Terminal 2 : Frontend
cd frontend
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

## 🐳 Docker

```bash
# Lancement avec Docker Compose
docker compose up
```

## 🤖 Développé avec Cursor

Ce projet est une démonstration des capacités de l'IA dans le développement d'applications modernes. Tout le code a été généré via des conversations avec l'IA de Cursor, démontrant qu'il est possible de créer une application complète et fonctionnelle sans écrire manuellement le code.

## 📝 License

MIT

---

Développé avec ❤️ et 🤖 par [MarlburroW](https://github.com/MarlburroW)
