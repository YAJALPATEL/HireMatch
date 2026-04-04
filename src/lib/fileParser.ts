import mammoth from 'mammoth';

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return await extractPdfText(file);
  } else if (extension === 'docx' || extension === 'doc') {
    return await extractDocxText(file);
  } else if (extension === 'txt') {
    return await file.text();
  }

  throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
}

async function extractPdfText(file: File): Promise<string> {
  // Dynamically import pdfjs to avoid Server-Side Rendering (DOMMatrix) errors
  const pdfjsLib = await import('pdfjs-dist');
  
  // Use unpkg CDN which correctly configures CORS and MIME types for Next.js Turbopack
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }
  
  return fullText;
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
