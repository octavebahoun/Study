const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');
const Revision = require('../models/Revision');
const googleTTS = require('google-tts-api');
const Semester = require('../models/Semester');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

// ─── OpenRouter helper ──────────────────────────────────────
async function openRouterChat(messages, systemPrompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPEN_ROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://studynotes.app',
      'X-Title': 'StudyNotes'
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Groq helper ───────────────────────────────────────────
function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// ─── Available Groq Models ─────────────────────────────────
router.get('/groq-models', auth, (req, res) => {
  res.json([
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'LLaMA 3 8B (rapide)' },
    { id: 'qwen/qwen3-32b', name: 'Qwen3 32B (puissant)' },
    { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'LLaMA Prompt Guard 2 (équilibré)' },
    { id: 'groq/compound', name: 'Groq Compound (Meilleur modèle)' },
    { id: 'openai/gpt-oss-20b', name: 'GPT 20B (Open AI)' },
    { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2 Instruct' }
  ]);
});

// ─── AI Note Feedback (OpenRouter) ─────────────────────────
router.post('/note-feedback', auth, async (req, res) => {
  try {
    const { subjectName, score, targetAverage, currentAverage, requiredNext, controlsLeft } = req.body;
    const { aiPreferences } = req.user;

    const systemPrompt = `Tu es un assistant scolaire ${aiPreferences.tone}. 
Style de réponse : ${aiPreferences.style}. 
Langue : ${aiPreferences.language}.
Sois concis (2-3 phrases max).`;

    const userMsg = `Matière: ${subjectName}. 
Note obtenue: ${score}/20. 
Objectif: ${targetAverage}/20. 
Moyenne actuelle: ${currentAverage !== null ? currentAverage.toFixed(2) + '/20' : 'pas encore calculable'}. 
${controlsLeft > 0 ? `Il reste ${controlsLeft} contrôle(s). Note minimale requise: ${requiredNext !== null ? requiredNext.toFixed(2) + '/20' : 'N/A'}.` : 'Tous les contrôles sont passés.'}
Donne un feedback motivant et un conseil précis.`;

    const feedback = await openRouterChat([{ role: 'user', content: userMsg }], systemPrompt);
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Global Semester Bilan (OpenRouter) ─────────────────
router.post('/semester-bilan', auth, async (req, res) => {
  try {
    const { semesterNumber, subjects } = req.body;
    const { aiPreferences } = req.user;

    const systemPrompt = `Tu es un conseiller pédagogique ${aiPreferences.tone}. 
Style : ${aiPreferences.style}. Langue : ${aiPreferences.language}.`;

    const subjectSummary = subjects.map(s =>
      `- ${s.name}: moyenne ${s.average.toFixed(2)}/20 (objectif: ${s.target}/20, coeff: ${s.coefficient})`
    ).join('\n');

    const userMsg = `Bilan du Semestre ${semesterNumber}:\n${subjectSummary}\n\nFais un bilan global encourageant avec des points forts, des axes d'amélioration et des conseils pour la suite.`;

    const bilan = await openRouterChat([{ role: 'user', content: userMsg }], systemPrompt);
    res.json({ bilan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Dashboard Word (OpenRouter) ───────────────────────
router.post('/dashboard-word', auth, async (req, res) => {
  try {
    const { currentAverage, target, upcomingControls } = req.body;
    const { aiPreferences } = req.user;

    const systemPrompt = `Tu es un assistant scolaire ${aiPreferences.tone}. 1 phrase max. Langue : ${aiPreferences.language}.`;
    const userMsg = `Moyenne actuelle: ${currentAverage}/20, objectif: ${target}/20. Prochains contrôles: ${upcomingControls.join(', ')}. Dis un mot d'encouragement.`;

    const word = await openRouterChat([{ role: 'user', content: userMsg }], systemPrompt);
    res.json({ word });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Groq Revision Features ────────────────────────────────
router.post('/revision/flashcards', auth, async (req, res) => {
  try {
    const { notions, subjectName, model } = req.body;
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: model || 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert pédagogique. Génère des flashcards en JSON. 
Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown ni backticks.
Format: [{"question": "...", "answer": "...", "difficulty": "easy|medium|hard"}]
Langue : ${req.user.aiPreferences.language}`
        },
        {
          role: 'user',
          content: `Matière: ${subjectName}\nNotions: ${notions.join(', ')}\nGénère 10 flashcards pertinentes.`
        }
      ],
      max_tokens: 2000
    });

    const raw = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    const flashcards = JSON.parse(raw);

    // Save history
    await Revision.create({
      userId: req.user._id,
      semesterId: req.body.semesterId,
      subjectName,
      type: 'flashcards',
      content: { flashcards },
      model: model || 'llama3-8b-8192'
    });

    res.json({ flashcards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/revision/quiz', auth, async (req, res) => {
  try {
    const { notions, subjectName, model } = req.body;
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: model || 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert pédagogique. Génère un quiz QCM en JSON.
Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown ni backticks.
Format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]
Langue : ${req.user.aiPreferences.language}`
        },
        {
          role: 'user',
          content: `Matière: ${subjectName}\nNotions: ${notions.join(', ')}\nGénère 8 questions QCM.`
        }
      ],
      max_tokens: 2000
    });

    const raw = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    const quiz = JSON.parse(raw);

    // Save history
    await Revision.create({
      userId: req.user._id,
      semesterId: req.body.semesterId,
      subjectName,
      type: 'quiz',
      content: { quiz },
      model: model || 'llama3-8b-8192'
    });

    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/revision/summary', auth, async (req, res) => {
  try {
    const { notions, subjectName, model } = req.body;
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: model || 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert pédagogique ${req.user.aiPreferences.tone}. 
Style : ${req.user.aiPreferences.style}. 
Langue : ${req.user.aiPreferences.language}.
Génère un résumé structuré avec titres et points clés en markdown.`
        },
        {
          role: 'user',
          content: `Matière: ${subjectName}\nNotions: ${notions.join(', ')}\nFais un résumé complet et structuré.`
        }
      ],
      max_tokens: 3000
    });

    const summary = completion.choices[0].message.content;

    // Save history
    await Revision.create({
      userId: req.user._id,
      semesterId: req.body.semesterId,
      subjectName,
      type: 'summary',
      content: { summary },
      model: model || 'llama3-8b-8192'
    });

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/revision/roadmap', auth, async (req, res) => {
  try {
    const { notions, subjectName, model } = req.body;
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: model || 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert pédagogique et formateur. 
Génère une roadmap d'apprentissage structurée en JSON.
Réponds UNIQUEMENT avec du JSON valide, sans markdown.
Format: {
  "title": "...",
  "steps": [
    {
      "order": 1,
      "title": "...",
      "description": "...",
      "notions": ["..."],
      "duration": "...",
      "resources": [{"type": "youtube|web", "query": "...", "description": "..."}]
    }
  ]
}
Langue : ${req.user.aiPreferences.language}. Sources en français.`
        },
        {
          role: 'user',
          content: `Matière: ${subjectName}\nNotions à maîtriser: ${notions.join(', ')}\nCrée une roadmap optimale pour maîtriser ces notions étape par étape.`
        }
      ],
      max_tokens: 3000
    });

    const raw = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    const roadmap = JSON.parse(raw);

    // Save history
    await Revision.create({
      userId: req.user._id,
      semesterId: req.body.semesterId,
      subjectName,
      type: 'roadmap',
      content: { roadmap },
      model: model || 'llama3-8b-8192'
    });

    res.json({ roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/revision/rag', auth, async (req, res) => {
  try {
    const { query, notions, subjectName, model, semesterId } = req.body;
    const groq = getGroqClient();

    let docContext = "";

    // 1. Try to find subject documents for context
    if (semesterId) {
      const semester = await Semester.findOne({ _id: semesterId, userId: req.user._id });
      const subject = semester?.subjects.find(s => s.name === subjectName);

      if (subject?.documents?.length > 0) {
        for (const doc of subject.documents) {
          try {
            if (fs.existsSync(doc.path)) {
              if (doc.type === 'application/pdf') {
                const dataBuffer = fs.readFileSync(doc.path);
                const data = await pdfParse(dataBuffer);
                docContext += `\nContenu du document ${doc.name}:\n${data.text.substring(0, 5000)}`; // limit to 5k chars per doc
              } else if (doc.type === 'text/plain') {
                const text = fs.readFileSync(doc.path, 'utf8');
                docContext += `\nContenu du document ${doc.name}:\n${text.substring(0, 5000)}`;
              }
            }
          } catch (e) {
            console.warn(`Impossible de lire le document ${doc.name}:`, e);
          }
        }
      }
    }

    const context = `Notions manuelles pour ${subjectName}: ${notions.join(' | ')}${docContext}`;

    const completion = await groq.chat.completions.create({
      model: model || 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant pédagogique. Réponds en te basant sur le contexte fourni (notions et documents uploadés).
Si la réponse n'est pas dans le contexte, utilise tes connaissances générales en précisant que ce n'est pas dans le cours.
Contexte: ${context}
Langue : ${req.user.aiPreferences.language}.`
        },
        { role: 'user', content: query }
      ],
      max_tokens: 1500
    });

    const answer = completion.choices[0].message.content;

    // Save history
    await Revision.create({
      userId: req.user._id,
      semesterId,
      subjectName,
      type: 'rag',
      content: { query, answer },
      model: model || 'llama3-8b-8192'
    });

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Visualiseur ───────────────────────────────────────────
router.post('/revision/visualizer', auth, async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const groq = getGroqClient();
    const systemPrompt = req.user.visualizerSystemPrompt;

    const completion = await groq.chat.completions.create({
      model: model || 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8000
    });

    const html = completion.choices[0].message.content
      .replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

    // Save history
    await Revision.create({
      userId: req.user._id,
      semesterId: req.body.semesterId,
      subjectName: req.body.subjectName || 'Visualisation',
      type: 'visualizer',
      content: { prompt, html },
      model: model || 'llama3-70b-8192'
    });

    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Podcast (google-tts-api) ─────────────────────────
router.post('/revision/podcast', auth, async (req, res) => {
  try {
    const { notions, subjectName, model } = req.body;
    const groq = getGroqClient();

    // 1. Generate summary
    const completion = await groq.chat.completions.create({
      model: model || 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Tu es un présentateur de podcast éducatif. Fais un script de podcast court et dynamique sur les notions suivantes. Langue: ${req.user.aiPreferences.language}`
        },
        {
          role: 'user',
          content: `Matière: ${subjectName}\nNotions: ${notions.join(', ')}`
        }
      ],
      max_tokens: 1500
    });

    const summary = completion.choices[0].message.content;

    // 2. Generate Audio URL
    // Generate Audio URL via Google TTS API (Fast & Better quality than local gTTS)
    const audioUrl = googleTTS.getAudioUrl(summary.substring(0, 200), {
      lang: req.user.aiPreferences.language === 'français' ? 'fr' : 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Save history
    await Revision.create({
      userId: req.user._id,
      semesterId: req.body.semesterId,
      subjectName,
      type: 'podcast',
      content: { summary, audioUrl },
      model: model || 'llama3-8b-8192'
    });

    res.json({ summary, audioUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
