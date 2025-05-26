"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = exports.extractTextFromPdf = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdf_poppler_1 = require("pdf-poppler");
const tesseract_js_1 = __importDefault(require("tesseract.js"));
/**
 * Converts PDF pages to images using pdf-poppler
 */
const convertPdfToImages = async (pdfPath, outputDir) => {
    const options = {
        format: 'jpeg',
        out_dir: outputDir,
        out_prefix: path_1.default.basename(pdfPath, path_1.default.extname(pdfPath)),
        page: null,
    };
    await (0, pdf_poppler_1.fromPath)(pdfPath, options);
    const imageFiles = fs_1.default
        .readdirSync(outputDir)
        .filter((file) => file.endsWith('.jpg') || file.endsWith('.jpeg'))
        .map((file) => path_1.default.join(outputDir, file));
    return imageFiles;
};
/**
 * OCR the image files
 */
const extractTextFromImages = async (imagePaths) => {
    const worker = await tesseract_js_1.default.createWorker('eng'); // ✅ fixed
    let fullText = '';
    for (const imgPath of imagePaths) {
        const { data: { text }, } = await worker.recognize(imgPath);
        fullText += text + '\n';
    }
    await worker.terminate();
    return fullText;
};
/**
 * Extract text from a PDF
 */
const extractTextFromPdf = async (pdfPath) => {
    const tempDir = path_1.default.join(__dirname, '../../uploads/temp');
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir, { recursive: true });
    }
    const imagePaths = await convertPdfToImages(pdfPath, tempDir);
    const text = await extractTextFromImages(imagePaths);
    // Clean up temp images
    for (const file of imagePaths) {
        fs_1.default.unlinkSync(file);
    }
    return text;
};
exports.extractTextFromPdf = extractTextFromPdf;
/**
 * Main function that determines file type and processes accordingly
 */
const extractTextFromFile = async (file) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
        return (0, exports.extractTextFromPdf)(file.path);
    }
    // TODO: Add Excel and image support if needed
    throw new Error(`Unsupported file type: ${ext}`);
};
exports.extractTextFromFile = extractTextFromFile;
