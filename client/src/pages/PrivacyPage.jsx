import { Shield, ArrowLeft, Lock, Database, Cpu, EyeOff, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        {/* Navigation / Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:shadow active:scale-95"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 font-sans">
            Politique de Confidentialité
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Chez StudyNotes, nous accordons une importance capitale à la protection de vos données académiques et personnelles.
          </p>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-10"
        >
          {/* Intro */}
          <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
            <p>
              Dernière mise à jour : <strong>Juin 2026</strong>.
            </p>
            <p>
              Cette politique de confidentialité vous explique en toute transparence comment vos données sont collectées, stockées, traitées et protégées lorsque vous utilisez l'application <strong>StudyNotes</strong>.
            </p>
          </div>

          {/* Section 1: Collecte */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">1. Collecte minimale des données</h2>
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Nous appliquons le principe de minimisation des données. Nous ne vous demandons que les informations strictement nécessaires au bon fonctionnement de l'application :
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-2">
              <li>
                <strong>Informations de compte :</strong> Votre prénom, nom et adresse e-mail pour l'authentification.
              </li>
              <li>
                <strong>Données académiques :</strong> Vos matières, coefficients, notes de contrôles et objectifs de moyenne.
              </li>
              <li>
                <strong>Contenu d'apprentissage :</strong> Vos notes de cours rédigées et téléchargées pour générer vos quiz, flashcards et podcasts.
              </li>
            </ul>
          </div>

          {/* Section 2: Stockage et Sécurité */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Database size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">2. Stockage sécurisé</h2>
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Vos informations sont stockées dans une base de données sécurisée hébergée par <strong>MongoDB Atlas</strong>.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-2">
              <li>
                <strong>Chiffrement des mots de passe :</strong> Tous les mots de passe sont chiffrés à l'aide de l'algorithme robuste <strong>bcrypt</strong> (12 rounds) avant d'être enregistrés. Il nous est impossible de lire votre mot de passe en clair.
              </li>
              <li>
                <strong>Sécurisation des échanges :</strong> Toutes les communications entre votre navigateur et nos serveurs s'effectuent via le protocole sécurisé <strong>HTTPS</strong>.
              </li>
            </ul>
          </div>

          {/* Section 3: Traitement IA */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Cpu size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">3. Traitement de l'Intelligence Artificielle</h2>
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              StudyNotes utilise des technologies d'IA tierces pour vous offrir des fonctionnalités d'apprentissage uniques (quiz personnalisés, roadmaps, podcasts, commentaires de bulletin) :
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-2">
              <li>
                <strong>OpenRouter & Groq :</strong> Le contenu de vos cours est envoyé de manière anonymisée à nos fournisseurs d'IA (Groq et OpenRouter) uniquement pour générer le contenu pédagogique demandé (résumés, flashcards).
              </li>
              <li>
                <strong>Confidentialité IA :</strong> Aucune donnée personnelle permettant de vous identifier (comme votre nom, votre e-mail ou vos coordonnées) n'est partagée avec ces API d'intelligence artificielle. De plus, ces données ne sont pas utilisées pour entraîner des modèles externes.
              </li>
              <li>
                <strong>Podcasts (gTTS) :</strong> Pour générer vos fichiers audio, notre service utilise l'API Google Text-to-Speech de manière temporaire. Les fichiers ne sont stockés sur notre serveur que pour la durée de votre écoute.
              </li>
            </ul>
          </div>

          {/* Section 4: Traceurs et Cookies */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <EyeOff size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">4. Cookies et Traceurs publicitaires</h2>
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Nous n'utilisons aucun cookie publicitaire ni aucun traceur tiers.</strong>
            </p>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Nous utilisons uniquement des mécanismes de stockage local (LocalStorage/IndexedDB) sur votre appareil pour mémoriser votre session de connexion (token JWT sécurisé), votre thème graphique préféré (sombre, clair, nature, etc.) et permettre le bon fonctionnement hors-ligne en tant que Progressive Web App (PWA).
            </p>
          </div>

          {/* Section 5: Droits de l'utilisateur */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">5. Vos droits (RGPD)</h2>
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Conformément à la réglementation sur la protection des données personnelles (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-2">
              <li>
                <strong>Droit d'accès et d'exportation :</strong> Vous pouvez exporter vos données sous format PDF directement depuis l'application (bulletin, flashcards).
              </li>
              <li>
                <strong>Droit de rectification et de suppression :</strong> Vous pouvez modifier vos informations à tout moment depuis votre espace profil, ou supprimer définitivement votre compte, ce qui effacera immédiatement toutes vos données de nos serveurs.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="text-center mt-12 text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 StudyNotes. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
