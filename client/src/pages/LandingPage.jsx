import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Sparkles,
  Calculator,
  Brain,
  Calendar,
  Volume2,
  ChevronRight,
  TrendingUp,
  Award,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "../store/useStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive Grade Demo State
  const [demoFormula, setDemoFormula] = useState("(i1 + i2) * 0.3 + d1 * 0.7");
  const [demoNotes, setDemoNotes] = useState({ i1: 14, i2: 16, d1: 12 });
  const [demoResult, setDemoResult] = useState(13.1);

  const handleDemoNoteChange = (key, val) => {
    const parsed = Math.max(0, Math.min(20, parseFloat(val) || 0));
    const newNotes = { ...demoNotes, [key]: parsed };
    setDemoNotes(newNotes);

    // Calculate manually for the demo formula: (i1 + i2) * 0.3 + d1 * 0.7
    const average = (newNotes.i1 + newNotes.i2) * 0.3 + newNotes.d1 * 0.7;
    setDemoResult(parseFloat(average.toFixed(2)));
  };

  const faqData = [
    {
      q: "Comment fonctionne le système de formules de calcul ?",
      a: "Chaque école ou matière a sa propre méthode de calcul. Sur StudyNotes, vous pouvez écrire votre formule exacte (ex: `(i1 + i2) * 0.4 + d1 * 0.6` pour 2 interros à 40% et 1 devoir à 60%). L'application génère automatiquement les champs pour que vous n'ayez qu'à saisir vos notes."
    },
    {
      q: "Quels modèles d'intelligence artificielle sont utilisés ?",
      a: "Pour le tableau de bord et les analyses globales, nous utilisons OpenRouter (avec le modèle gratuit Mistral-7B). Pour la génération de résumés, quiz et flashcards de révision, nous exploitons l'API ultra-rapide de Groq (avec des modèles comme LLaMA3)."
    },
    {
      q: "Est-ce gratuit ? Est-ce que mes données sont protégées ?",
      a: "L'application est entièrement gratuite pour les étudiants. De plus, conformément au RGPD, nous n'utilisons aucun traceur publicitaire et vos données ne sont pas vendues ni utilisées pour entraîner des modèles d'IA externes."
    },
    {
      q: "L'application fonctionne-t-elle hors-ligne ?",
      a: "Oui ! StudyNotes est une Progressive Web App (PWA). Une fois installée sur votre smartphone ou votre ordinateur, vous pouvez consulter vos notes, vos révisions et votre calendrier même sans connexion Internet."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
              <BookOpen size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              StudyNotes
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Fonctionnalités
            </a>
            <a href="#demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Démo Interactive
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              FAQ
            </a>
            <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Confidentialité
            </Link>
          </nav>

          {/* Header CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-150 dark:shadow-none transition-all"
              >
                Mon Tableau de Bord
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-150 dark:shadow-none transition-all"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 px-4 py-6 space-y-4"
          >
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600"
              >
                Fonctionnalités
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600"
              >
                Démo Interactive
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600"
              >
                FAQ
              </a>
              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600"
              >
                Confidentialité
              </Link>
            </div>
            <hr className="border-slate-100 dark:border-slate-850" />
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Tableau de Bord
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                  >
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-55/10 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/30 mb-8"
          >
            <Sparkles size={12} className="animate-pulse" />
            L'assistant étudiant intelligent propulsé par l'IA
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6"
          >
            Maîtrisez vos études,{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
              boostez vos notes
            </span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Calculateurs de moyenne sur-mesure, flashcards interactives générées par IA, et résumés en podcasts. L'application indispensable pour valider votre semestre.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 dark:hover:shadow-none transition-all cursor-pointer"
              >
                Accéder à mon espace
                <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 dark:hover:shadow-none transition-all cursor-pointer"
                >
                  Commencer gratuitement
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 shadow-sm transition-all"
                >
                  Voir le simulateur
                </a>
              </>
            )}
          </motion.div>

          {/* Interactive Screen Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 p-3 shadow-2xl backdrop-blur-sm"
          >
            <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 aspect-[16/9] bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-slate-950 flex flex-col justify-between p-6 text-left relative">
              {/* Mini Mockup Header */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="px-4 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/40 text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles size={10} className="animate-spin" />
                  Dashboard Semestre 2
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
                {/* Card 1: Moyenne */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Moyenne Générale</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">15.82</span>
                    <span className="text-sm font-semibold text-slate-400">/ 20</span>
                  </div>
                  <div className="w-full bg-indigo-50 dark:bg-indigo-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: "79%" }} />
                  </div>
                </div>

                {/* Card 2: Prochain contrôle */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Prochain examen</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Algorithmique</h4>
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">Demain à 08h30</p>
                  </div>
                  <span className="text-[10px] bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full w-fit font-bold">Urgent</span>
                </div>

                {/* Card 3: Feedback IA */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Brain size={12} className="text-violet-500" />
                    Conseil de l'IA
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-3 leading-snug">
                    "Excellent travail en Mathématiques (17.5). Concentre tes révisions sur la Physique pour valider ton objectif de 16/20 globale !"
                  </p>
                </div>
              </div>

              {/* Bottom mockup info */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <span>⚡ Calculez, planifiez, révisez</span>
                <span>Version 2.0 (PWA)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. KEY FEATURES SECTION */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/60 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
              Une suite d'outils complète pour vos révisions
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Du calcul automatique de vos moyennes à l'apprentissage assisté par l'IA, gagnez du temps et optimisez votre organisation académique.
            </p>
          </div>

          {/* Grid of features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Calcul personnalisé */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Calculator size={24} />
              </div>
              <h3 className="text-xl font-bold">Calcul par formules</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Créez vos propres formules de notes (coefficients, interros, devoirs). L'application s'adapte à la structure de notation exacte de votre université ou école.
              </p>
            </motion.div>

            {/* Feature 2: Flashcards & Quiz IA */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold">Révision IA (Groq)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Téléchargez ou collez vos cours pour générer instantanément des résumés clairs, des quiz d'entraînement à choix multiples et des flashcards interactives.
              </p>
            </motion.div>

            {/* Feature 3: Podcasts Révisions */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Volume2 size={24} />
              </div>
              <h3 className="text-xl font-bold">Podcasts de cours (TTS)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Transformez vos résumés écrits en podcasts audio de révision d'une qualité naturelle. Idéal pour réviser dans les transports ou en marchant !
              </p>
            </motion.div>

            {/* Feature 4: Calendrier intelligent */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold">Calendrier des examens</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualisez vos prochains contrôles sur une vue calendaire intelligente avec un code couleur d'urgence pour ne plus jamais être pris au dépourvu.
              </p>
            </motion.div>

            {/* Feature 5: Progression IA */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold">Statistiques et Conseils</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                L'IA analyse vos forces et vos faiblesses, calcule votre progression par rapport à votre moyenne cible, et vous propose des roadmaps personnalisées.
              </p>
            </motion.div>

            {/* Feature 6: PWA Hors-ligne */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold">Installable & PWA</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Installez l'application sur votre écran d'accueil mobile comme une application native. Profitez du cache hors-ligne et des notifications de rappel.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SIMULATOR (DEMO) */}
      <section id="demo" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side info */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold mb-4">
                Simulateur en direct
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
                Essayez le calculateur de formules
              </h2>
              <p className="text-slate-600 dark:text-slate-450 text-base md:text-lg mb-8 leading-relaxed">
                Pas de coefficients figés. Écrivez la formule correspondant à votre mode d'évaluation, saisissez vos notes et observez votre moyenne mise à jour instantanément.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">Variables dynamiques illimitées</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">Arithmétique simple et avancée</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">Feedback intelligent instantané</span>
                </div>
              </div>
            </div>

            {/* Right side Simulator Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator size={18} className="text-indigo-600" />
                Simulateur de Matière
              </h3>

              <div className="space-y-6">
                {/* Subject name selector (visual only) */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 block">
                    Matière test
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none font-medium">
                    <option>Mathématiques (Examen écrit + 2 interros)</option>
                  </select>
                </div>

                {/* Formula display */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Formule de calcul
                  </span>
                  <code className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {demoFormula}
                  </code>
                </div>

                {/* Variable fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">
                      Interro 1 (i1)
                    </label>
                    <input
                      type="number"
                      value={demoNotes.i1}
                      onChange={(e) => handleDemoNoteChange("i1", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none text-center font-bold focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">
                      Interro 2 (i2)
                    </label>
                    <input
                      type="number"
                      value={demoNotes.i2}
                      onChange={(e) => handleDemoNoteChange("i2", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none text-center font-bold focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">
                      Devoir (d1)
                    </label>
                    <input
                      type="number"
                      value={demoNotes.d1}
                      onChange={(e) => handleDemoNoteChange("d1", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none text-center font-bold focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Calculation outcome */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                      Moyenne calculée
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {demoResult}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">/ 20</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                      Statut
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                        demoResult >= 10
                          ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {demoResult >= 10 ? "Matière validée" : "Sous la moyenne"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Questions Fréquentes
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3">
              Tout ce que vous devez savoir sur la plateforme StudyNotes.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150/80 dark:border-slate-850 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 dark:text-slate-200 outline-none text-sm md:text-base hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-all"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-indigo-600" /> : <ChevronDown size={18} />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-indigo-950 to-violet-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight max-w-2xl mx-auto">
            Prêt à faire décoller votre moyenne ?
          </h2>
          <p className="text-indigo-200 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Rejoignez dès aujourd'hui les étudiants qui révisent intelligemment avec notre assistant IA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-950 hover:bg-indigo-50 active:scale-95 rounded-2xl font-bold transition-all cursor-pointer shadow-lg"
              >
                Mon Tableau de Bord
                <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-950 hover:bg-indigo-55 active:scale-95 rounded-2xl font-bold transition-all cursor-pointer shadow-lg"
                >
                  S'inscrire gratuitement
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-indigo-200/30 hover:bg-white/10 active:scale-95 rounded-2xl font-bold transition-all text-white"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850/60 py-12 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <BookOpen size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold tracking-tight">StudyNotes</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <a href="#features" className="hover:text-indigo-600 transition-colors">
                Fonctionnalités
              </a>
              <a href="#demo" className="hover:text-indigo-600 transition-colors">
                Simulateur
              </a>
              <a href="#faq" className="hover:text-indigo-600 transition-colors">
                FAQ
              </a>
              <Link to="/privacy" className="hover:text-indigo-600 transition-colors">
                Politique de Confidentialité
              </Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-400 dark:text-slate-500">
            <p>© 2026 StudyNotes. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-600/70" />
              <span>Conforme RGPD · Vos données vous appartiennent</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
