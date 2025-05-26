declare module 'pdf-poppler' {
    export function fromPath(pdfPath: string, options: any): Promise<void>;
  }