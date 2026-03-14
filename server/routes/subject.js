const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Semester = require('../models/Semester');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.txt', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Format non supporté (PDF, TXT, DOCX uniquement)'));
    }
});

// Upload a document for a subject
router.post('/:semesterId/subjects/:subjectIndex/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Fichier requis' });

        const semester = await Semester.findOne({ _id: req.params.semesterId, userId: req.user._id });
        if (!semester) return res.status(404).json({ error: 'Semestre non trouvé' });

        const subjectIndex = parseInt(req.params.subjectIndex);
        if (!semester.subjects[subjectIndex]) return res.status(404).json({ error: 'Matière non trouvée' });

        const newDoc = {
            name: req.file.originalname,
            path: req.file.path,
            type: req.file.mimetype,
            createdAt: new Date()
        };

        semester.subjects[subjectIndex].documents.push(newDoc);
        await semester.save();

        res.json(semester);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a document
router.delete('/:semesterId/subjects/:subjectIndex/documents/:docId', auth, async (req, res) => {
    try {
        const semester = await Semester.findOne({ _id: req.params.semesterId, userId: req.user._id });
        if (!semester) return res.status(404).json({ error: 'Semestre non trouvé' });

        const subjectIndex = parseInt(req.params.subjectIndex);
        const subject = semester.subjects[subjectIndex];

        const doc = subject.documents.id(req.params.docId);
        if (!doc) return res.status(404).json({ error: 'Document non trouvé' });

        // Delete file from disk
        if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);

        // Remove from array
        subject.documents.pull(req.params.docId);
        await semester.save();

        res.json(semester);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
