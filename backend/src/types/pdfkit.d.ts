declare module "pdfkit" {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    bufferPages?: boolean;
    info?: Record<string, string>;
    autoFirstPage?: boolean;
  }

  interface PDFDocument {
    page: { width: number; height: number };
    fontSize(size: number): PDFDocument;
    font(fontName: string): PDFDocument;
    text(text: string, options?: any): PDFDocument;
    text(text: string, x: number, y: number, options?: any): PDFDocument;
    moveDown(lines?: number): PDFDocument;
    moveUp(lines?: number): PDFDocument;
    addPage(options?: PDFDocumentOptions): PDFDocument;
    end(): void;
    on(event: string, callback: (...args: any[]) => void): PDFDocument;
    x: number;
    y: number;
    width: number;
    height: number;
    moveTo(x: number, y: number): PDFDocument;
    lineTo(x: number, y: number): PDFDocument;
    stroke(color?: string): PDFDocument;
    fill(color?: string): PDFDocument;
  }

  interface PDFDocumentConstructor {
    new (options?: PDFDocumentOptions): PDFDocument;
  }

  const PDFDocument: PDFDocumentConstructor;
  export default PDFDocument;
}
