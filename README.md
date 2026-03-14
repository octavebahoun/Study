# 📚 StudyNotes

> Carnet de notes intelligent pour étudiants — PWA avec IA intégrée, révisions assistées et suivi en temps réel.

---

## ✨ Fonctionnalités

| Module | Fonctionnalités |
|---|---|
| **Auth** | Inscription / Connexion email+mot de passe (JWT + bcrypt) |
| **Onboarding** | Configuration semestres, matières, formules de calcul personnalisées |
| **Dashboard** | Moyenne globale, progression, prochains contrôles, mot de l'IA |
| **Notes** | Saisie des notes par formule, calcul automatique, feedback IA (OpenRouter) |
| **Matières** | Gestion des notions par matière, suivi des contrôles |
| **Révisions** | Flashcards, Quiz, Résumé, Podcast (gTTS), RAG, Roadmap, Visualiseur (Groq) |
| **Calendrier** | Vue calendrier des contrôles avec code couleur urgence |
| **Profil** | Thèmes, préférences IA, badges, progression |
| **PWA** | Installable sur mobile, cache offline, push notifications |

---

## 🗂️ Structure du projet

```
studynotes/
├── client/                 # React PWA (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── store/          # Zustand (état global)
│   │   ├── utils/          # API, calcul de notes
│   │   └── styles/         # CSS global + thèmes
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express API Node.js
│   ├── models/             # Schémas MongoDB (Mongoose)
│   ├── routes/             # Routes API REST
│   ├── middleware/         # Auth JWT
│   └── Dockerfile
├── tts-service/            # Flask + gTTS (microservice audio)
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Stack technique

- **Frontend** : React 18 + Vite + Tailwind CSS + Zustand + React Router v6
- **Backend** : Node.js + Express + Mongoose
- **Base de données** : MongoDB Atlas
- **IA Notes/Dashboard** : OpenRouter (mistral-7b-instruct gratuit)
- **IA Révisions** : Groq SDK (LLaMA3, Mixtral, Gemma)
- **Audio** : Flask + gTTS
- **PWA** : Workbox + VitePWA
- **Conteneurisation** : Docker + Docker Compose
- **Serveur web** : Nginx (proxy + SPA)

---

## 🚀 Démarrage rapide

### 1. Prérequis

- Docker + Docker Compose installés
- Un compte MongoDB Atlas avec une base créée
- Une clé OpenRouter (gratuit sur openrouter.ai)
- Une clé Groq API (gratuit sur console.groq.com)
- (Optionnel) Clés VAPID pour les push notifications

### 2. Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env avec tes clés
nano .env
```

Remplis les variables suivantes dans `.env` :

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=un_secret_long_et_aleatoire
OPEN_ROUTER_KEY=sk-or-v1-...
GROQ_API_KEY=gsk_...
```

### 3. Lancer l'application

```bash
# Construire et démarrer tous les services
docker-compose up --build

# En arrière-plan
docker-compose up --build -d
```

L'application sera disponible sur :
- **Frontend** : http://localhost:3000
- **API** : http://localhost:5000/api/health
- **TTS** : http://localhost:5001/health

### 4. Arrêter

```bash
docker-compose down
```

---

## 🔧 Développement local (sans Docker)

### Client

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### Serveur

```bash
cd server
npm install
# Créer un .env dans /server avec les mêmes variables
npm run dev
# → http://localhost:5000
```

### TTS Service

```bash
cd tts-service
pip install -r requirements.txt
python app.py
# → http://localhost:5001
```

---

## 📐 Architecture des formules de notes

StudyNotes utilise une approche unique : chaque matière a une **formule de calcul personnalisée**.

### Exemples de formules

```
# 2 notes pondérées
(i1 + i2) * 0.4 + 0.6 * d1

# Moyenne simple de 2 interros + 1 devoir
(i1 + i2) / 2 * 0.3 + d1 * 0.7

# 1 seul devoir
d1

# Moyenne de 3 contrôles
(c1 + c2 + c3) / 3
```

Les variables (i1, i2, d1, c1...) sont automatiquement détectées et deviennent les champs de saisie.

---

## 🤖 Modèles IA disponibles

### OpenRouter (Notes + Dashboard)
- `mistralai/mistral-7b-instruct:free` (par défaut)

### Groq (Révisions)
| Modèle | Usage recommandé |
|---|---|
| `llama3-8b-8192` | Rapide, flashcards, quiz |
| `llama3-70b-8192` | Puissant, résumés, visualiseur |
| `mixtral-8x7b-32768` | Équilibré, roadmap |
| `gemma-7b-it` | Léger, RAG |

---

## 🎨 Thèmes disponibles

| # | Nom | Primaire | Fond |
|---|---|---|---|
| Défaut | Bleu Indigo | `#3F51B5` | `#F5F7FA` |
| Nature | Vert forêt | `#2D6A4F` | `#F8F9F1` |
| Énergie | Orange vif | `#F77F00` | `#FFFFFF` |
| Dark Neon | Violet néon | `#BB86FC` | `#121212` |

---

## 🔔 Push Notifications

Pour activer les notifications push :

1. Génère des clés VAPID :
```bash
npx web-push generate-vapid-keys
```

2. Ajoute les clés dans `.env` :
```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:ton@email.com
```

3. Dans l'app → Profil → Activer les notifications

---

## 🏗️ Déploiement sur VPS

```bash
# Sur ton VPS (Ubuntu/Debian)
sudo apt update && sudo apt install docker.io docker-compose -y

# Clone le projet
git clone <ton-repo> studynotes
cd studynotes

# Configure
cp .env.example .env && nano .env

# Lance
docker-compose up --build -d

# Voir les logs
docker-compose logs -f
```

Pour un domaine custom, configure Nginx en reverse proxy devant le port 3000.

---

## 📱 Installation PWA (mobile)

1. Ouvre l'app dans le navigateur mobile
2. Chrome/Edge : Menu → "Ajouter à l'écran d'accueil"
3. Safari iOS : Partager → "Sur l'écran d'accueil"

---

## 🏆 Système de badges

| Badge | Condition |
|---|---|
| 📝 Première note | Première note saisie |
| ⭐ Perfection | 20/20 obtenu |
| 🎯 Objectif atteint | Moyenne cible dépassée sur une matière |
| 🏅 Semestre validé | Semestre complété |
| 🔥 En feu | 3 bonnes notes consécutives |

---

## 📤 Exports

- **Notes** : PDF du bulletin par semestre (généré côté client avec jsPDF)
- **Révisions** : PDF ou TXT des flashcards et résumés

---

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (12 rounds)
- JWT avec expiration configurable
- Rate limiting sur toutes les routes API
- Helmet.js pour les headers HTTP sécurisés
- CORS configuré pour l'URL client uniquement

---

## 📄 Variables d'environnement

| Variable | Description | Requis |
|---|---|---|
| `MONGODB_URI` | URI de connexion MongoDB Atlas | ✅ |
| `JWT_SECRET` | Secret pour les tokens JWT | ✅ |
| `OPEN_ROUTER_KEY` | Clé API OpenRouter | ✅ |
| `GROQ_API_KEY` | Clé API Groq | ✅ |
| `TTS_SERVICE_URL` | URL du service TTS (auto avec Docker) | ✅ |
| `VAPID_PUBLIC_KEY` | Clé VAPID publique (push notifs) | ⚡ |
| `VAPID_PRIVATE_KEY` | Clé VAPID privée (push notifs) | ⚡ |
| `VAPID_EMAIL` | Email pour VAPID | ⚡ |
| `PORT` | Port du serveur (défaut: 5000) | ➖ |
| `CLIENT_URL` | URL du client pour CORS | ➖ |

✅ Requis · ⚡ Optionnel (fonctionnalité spécifique) · ➖ Optionnel

---

## 🐛 Dépannage

**MongoDB ne se connecte pas**
→ Vérifie que l'IP de ton VPS est autorisée dans Atlas Network Access

**gTTS erreur réseau**
→ Le service TTS nécessite une connexion internet pour générer l'audio

**Push notifications ne fonctionnent pas**
→ Vérifie les clés VAPID et que le service worker est bien enregistré (HTTPS requis en prod)

**Formule non reconnue**
→ Utilise uniquement des variables alphanumériques (i1, d1, c1...) sans espaces

---

*Développé avec ❤️ — Stack: React · Express · MongoDB · Groq · OpenRouter*
