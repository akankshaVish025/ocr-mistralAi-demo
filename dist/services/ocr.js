import path from 'path';
import fs from 'fs';
import { fromPath } from 'pdf-poppler';
import Tesseract from 'tesseract.js';
/**
 * Converts PDF pages to images using pdf-poppler
 */
const convertPdfToImages = async (pdfPath, outputDir) => {
    const options = {
        format: 'jpeg',
        out_dir: outputDir,
        out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
        page: null,
    };
    await fromPath(pdfPath, options);
    const imageFiles = fs
        .readdirSync(outputDir)
        .filter((file) => file.endsWith('.jpg') || file.endsWith('.jpeg'))
        .map((file) => path.join(outputDir, file));
    return imageFiles;
};
/**
 * OCR the image files
 */
const extractTextFromImages = async (imagePaths) => {
    const worker = await Tesseract.createWorker('eng'); // ✅ fixed
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
export const extractTextFromPdf = async (pdfPath) => {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const imagePaths = await convertPdfToImages(pdfPath, tempDir);
    const text = await extractTextFromImages(imagePaths);
    // Clean up temp images
    for (const file of imagePaths) {
        fs.unlinkSync(file);
    }
    return text;
};
/**
 * Main function that determines file type and processes accordingly
 */
export const extractTextFromFile = async (file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
        return extractTextFromPdf(file.path);
    }
    // TODO: Add Excel and image support if needed
    throw new Error(`Unsupported file type: ${ext}`);
};
