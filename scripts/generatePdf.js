import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { marked } from 'marked';

const rootDir = process.cwd();
const mdPath = path.join(rootDir, 'docs', 'Technical_Design_Document.md');
const htmlPath = path.join(rootDir, 'docs', 'Technical_Design_Document.html');
const pdfPath = path.join(rootDir, 'Technical_Design_Document.pdf');

console.log('[PDF Generator] Reading Markdown from:', mdPath);
const markdownContent = fs.readFileSync(mdPath, 'utf8');

const htmlBody = marked.parse(markdownContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DriveX - Technical Design Document</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 22pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-top: 0;
      margin-bottom: 6px;
    }
    h2 {
      font-size: 15pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      font-weight: 600;
      color: #1e293b;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    h4 {
      font-size: 10.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
      text-align: justify;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 9px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    code {
      font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      color: #09090b;
      border: 1px solid #e2e8f0;
    }
    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 8pt;
      line-height: 1.45;
      page-break-inside: avoid;
      margin: 10px 0 14px 0;
    }
    pre code {
      background-color: transparent;
      color: #f8fafc;
      padding: 0;
      border: none;
      font-size: 8pt;
    }
    blockquote {
      border-left: 4px solid #2563eb;
      background-color: #eff6ff;
      margin: 10px 0 14px 0;
      padding: 8px 14px;
      color: #1e3a8a;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 18px 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: 600;
    }
    .header-meta {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 9pt;
      color: #475569;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      margin: 10px 0 16px 0;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf8');
console.log('[PDF Generator] Wrote HTML template to:', htmlPath);

// Locate Chrome or Edge
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let browserPath = '';
if (fs.existsSync(chromePath)) {
  browserPath = chromePath;
} else if (fs.existsSync(edgePath)) {
  browserPath = edgePath;
} else {
  console.error('Neither Chrome nor Edge was found at standard locations.');
  process.exit(1);
}

console.log('[PDF Generator] Using browser:', browserPath);

const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
console.log('[PDF Generator] Executing:', cmd);

try {
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(pdfPath);
  console.log(`[PDF Generator] Success! Generated ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('[PDF Generator] Error running browser headless print:', err);
  process.exit(1);
}
