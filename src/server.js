"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const ocr_1 = require("./services/ocr");
const mistral_1 = require("./services/mistral");
dotenv_1.default.config();
const app = (0, express_1.default)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
        return;
    }
    try {
        const rawText = await (0, ocr_1.extractTextFromFile)(req.file);
        const structured = await (0, mistral_1.processWithMistral)(rawText);
        res.json({ success: true, data: structured });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Processing failed');
    }
    finally {
        fs_1.default.unlinkSync(req.file.path);
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
