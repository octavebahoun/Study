const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, default: '' },
  bio: { type: String, default: '' },
  theme: { type: String, default: 'default', enum: ['default', 'indigo', 'nature', 'energy', 'dark'] },
  language: { type: String, default: 'fr', enum: ['fr', 'en'] },
  aiPreferences: {
    tone: { type: String, default: 'encourageant et pédagogue' },
    style: { type: String, default: 'clair et structuré' },
    language: { type: String, default: 'français' }
  },
  visualizerSystemPrompt: {
    type: String,
    default: `Tu es un expert en développement Frontend et UI Designer spécialisé dans le style "Hand-drawn Sketch" (dessin à la main).
Ton objectif est de générer des pages web explicatives qui ressemblent à un tableau blanc ou un carnet de notes.
Règles de style strictes :
1. Bordures : N'utilise jamais de bordures parfaitement droites. Utilise toujours borderRadius avec des valeurs asymétriques comme 255px 15px 225px 15px/15px 225px 15px 255px.
2. Couleurs : Utilise une palette "Soft Pastel" (bg-yellow-50, bg-blue-50, bg-pink-50) avec des bordures border-gray-800 d'épaisseur 2 ou 3.
3. Typographie : Utilise des polices sans-serif modernes mais avec des variations de rotation légères (rotate-1, rotate-[-2deg]) pour simuler l'écriture humaine.
4. Icônes : Utilise lucide pour les icones.
5. Surlignage : Pour les titres, crée un effet "stabilo" en plaçant un span absolu de couleur jaune/rose derrière le texte avec une rotation.
6. Layout : Utilise un fond quadrillé ou à points avec radial-gradient.
Ta mission : Génère une page html, css, js complète dans un seul fichier utilisant Tailwind CSS qui explique le sujet demandé en suivant exactement ce style visuel.
Format de sortie : Code HTML complet uniquement, sans markdown ni backticks.`
  },
  onboardingCompleted: { type: Boolean, default: false },
  currentSemester: { type: Number, default: 1 },
  totalSemesters: { type: Number, default: 2 },
  badges: [{
    id: { type: String },
    name: { type: String },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now },
    icon: { type: String }
  }],
  pushSubscription: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
