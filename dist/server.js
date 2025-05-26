import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import { extractTextFromFile } from './services/ocr';
import { processWithMistral } from './services/mistral';
dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
        return;
    }
    try {
        const rawText = await extractTextFromFile(req.file);
        const structured = await processWithMistral(rawText);
        res.json({ success: true, data: structured });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Processing failed');
    }
    finally {
        fs.unlinkSync(req.file.path);
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
