import { Project, DocumentType } from "../types";

declare global {
  interface Window {
    PptxGenJS: any;
    docx: any;
  }
}

export const exportDocument = (project: Project) => {
  if (project.type === DocumentType.PPTX) {
    exportPPTX(project);
  } else {
    exportDOCX(project);
  }
};

// --- Shared Helpers ---

const cleanText = (text: string): string => {
    // Strip HTML tags if any leaked through
    let cleaned = text.replace(/<[^>]*>/g, '');
    // Strip Layout tags and other artifacts
    cleaned = cleaned.replace(/\[LAYOUT:.*?\]/gi, '')
                     .replace(/\[CHART:.*?\]/gi, '')
                     .replace(/\[IMAGE:.*?\]/gi, '')
                     .replace(/\*\*/g, '');
    return cleaned.trim();
};

const getFontFamily = (fontStyle: string): string => {
    const map: Record<string, string> = {
        'Modern': 'Inter',
        'Clean': 'Roboto',
        'Classic': 'Times New Roman',
        'Formal': 'Calibri',
        'Display': 'Impact',
        'Handwriting': 'Segoe Print'
    };
    return map[fontStyle] || 'Arial';
};

// --- DOCX EXPORT ---

const exportDOCX = (project: Project) => {
  if (!window.docx) {
    alert("DOCX Generator library not loaded.");
    return;
  }
  
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = window.docx;
  const styles = getThemeStyles(project.style.template);
  const fontFace = getFontFamily(project.style.font);

  const parseTextWithBold = (text: string, isHeading = false) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return new TextRun({ 
                  text: part.slice(2, -2), 
                  bold: true, 
                  size: isHeading ? undefined : 24, // 12pt
                  font: fontFace,
                  color: isHeading ? styles.accent : styles.text 
              });
          }
          return new TextRun({ 
              text: part, 
              size: isHeading ? undefined : 24, // 12pt
              font: fontFace,
              color: isHeading ? styles.accent : styles.text 
          });
      });
  };

  const docChildren: any[] = [
    new Paragraph({
      text: project.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
      run: { font: fontFace, color: styles.accent, size: 64, bold: true } 
    }),
  ];

  project.sections.forEach(section => {
    // Section Title (H1) with Theme Color
    docChildren.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        run: { font: fontFace, color: styles.accent, size: 32, bold: true }
      })
    );

    const rawClean = cleanText(section.content);
    const lines = rawClean.split('\n');
    let inTable = false;
    let tableRows: string[][] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      
      // Table Detection
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (!inTable) inTable = true;
          const cols = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          if (!trimmed.includes('---')) { tableRows.push(cols); }
          return;
      }
      if (inTable && !trimmed.startsWith('|')) {
          inTable = false;
          if (tableRows.length > 0) {
              const docTable = new Table({
                  rows: tableRows.map((row, rIdx) => new TableRow({ 
                      children: row.map(cell => new TableCell({ 
                          children: [new Paragraph({ children: parseTextWithBold(cell), alignment: "center" })], 
                          width: { size: 100 / row.length, type: WidthType.PERCENTAGE }, 
                          borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } }, 
                          shading: rIdx === 0 ? { fill: styles.accentAlt } : undefined 
                      })) 
                  })),
                  width: { size: 100, type: WidthType.PERCENTAGE }
              });
              docChildren.push(docTable);
              docChildren.push(new Paragraph({ text: "", spacing: { after: 200 } }));
          }
          tableRows = [];
      }

      if (!trimmed) return;

      if (trimmed.startsWith('## ')) {
        docChildren.push(new Paragraph({ 
            text: trimmed.replace('## ', ''), 
            heading: HeadingLevel.HEADING_2, 
            spacing: { before: 240, after: 120 }, 
            run: { font: fontFace, color: styles.text, size: 28, bold: true } 
        }));
      } else if (trimmed.startsWith('### ')) {
         docChildren.push(new Paragraph({ 
             text: trimmed.replace('### ', ''), 
             heading: HeadingLevel.HEADING_3, 
             spacing: { before: 150, after: 50 }, 
             run: { font: fontFace, color: styles.text, size: 24, bold: true } 
        }));
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        docChildren.push(new Paragraph({ 
            children: parseTextWithBold(trimmed.replace(/^[-*•]\s+/, '')), 
            bullet: { level: 0 },
            spacing: { after: 100 }
        }));
      } else {
        // Regular Paragraph
        docChildren.push(new Paragraph({ 
            children: parseTextWithBold(trimmed), 
            spacing: { after: 200, line: 276 } // 1.15 line spacing
        }));
      }
    });
    
    if (inTable && tableRows.length > 0) {
         const docTable = new Table({
             rows: tableRows.map((row, rIdx) => new TableRow({ children: row.map(cell => new TableCell({ children: [new Paragraph({ children: parseTextWithBold(cell) })], width: { size: 100 / row.length, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } }, shading: rIdx === 0 ? { fill: styles.accentAlt } : undefined })) })),
             width: { size: 100, type: WidthType.PERCENTAGE }
         });
         docChildren.push(docTable);
    }
  });

  const doc = new Document({ sections: [{ properties: {}, children: docChildren }] });
  Packer.toBlob(doc).then((blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  });
};

// --- PPTX EXPORT ---

const calculateLayoutMetrics = (itemCount: number, layout: string) => {
    let fontSize = 18; let lineSpacing = 28; 
    if (layout === 'CENTERED') { fontSize = itemCount > 3 ? 24 : 32; lineSpacing = 36; } 
    else if (layout === 'GRID') { fontSize = 16; lineSpacing = 22; } 
    else { if (itemCount <= 3) { fontSize = 24; lineSpacing = 36; } else if (itemCount <= 5) { fontSize = 20; lineSpacing = 28; } else { fontSize = 16; lineSpacing = 22; } }
    return { fontSize, lineSpacing };
};

const exportPPTX = (project: Project) => {
  if (!window.PptxGenJS) { alert("PPTX Generator library not loaded."); return; }
  const pres = new window.PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  const styles = getThemeStyles(project.style.template);
  const fontFace = getFontFamily(project.style.font);

  // Title Slide
  let slide = pres.addSlide();
  slide.background = { color: styles.bg };
  slide.addText(project.title, { x: 0.5, y: 1.8, w: 9, fontSize: 48, bold: true, color: styles.text, align: 'center', fontFace });
  slide.addText("Generated by Templa AI", { x: 0.5, y: 4.0, w: 9, fontSize: 18, color: styles.subtext, align: 'center', fontFace });

  project.sections.forEach(section => {
    slide = pres.addSlide();
    slide.background = { color: styles.bg };
    slide.addText(section.title, { x: 0.5, y: 0.6, w: 9, h: 0.8, fontSize: 32, bold: true, color: styles.accent, fontFace });
    slide.addShape(pres.ShapeType.line, { x: 0.5, y: 1.4, w: 9, h: 0, line: { color: styles.accent, width: 2 } });

    let layout = 'STANDARD';
    if (section.content.includes('[LAYOUT: GRID]')) layout = 'GRID';
    else if (section.content.includes('[LAYOUT: CENTERED]')) layout = 'CENTERED';
    else if (section.content.includes('[LAYOUT: TIMELINE]')) layout = 'TIMELINE';
    else if (section.content.includes('[LAYOUT: WORKFLOW]')) layout = 'WORKFLOW';
    else if (section.content.includes('[LAYOUT: TABLE]')) layout = 'TABLE';

    const rawClean = cleanText(section.content);
    const lines = rawClean.split('\n').filter(l => l.trim().length > 0);
    const items = lines.map(l => l.replace(/^[-*•#]+\s*/, '').trim());
    const metrics = calculateLayoutMetrics(items.length, layout);
    const startY = 1.8; const availH = 3.5;

    if (layout === 'CENTERED') {
        slide.addText(items.join('\n\n'), { x: 1, y: startY, w: 8, h: availH, fontSize: metrics.fontSize, color: styles.text, align: 'center', valign: 'middle', bold: true, fontFace });
    } else if (layout === 'GRID') {
        const mid = Math.ceil(items.length / 2);
        const col1 = items.slice(0, mid);
        const col2 = items.slice(mid);
        const cardFill = styles.cardBg; const cardText = styles.cardText;
        slide.addText(col1.map(l => ({ text: l, options: { bullet: { code: '2022', color: styles.accent } } })), { shape: pres.ShapeType.roundRect, x: 0.5, y: startY, w: 4.3, h: availH * 0.9, fill: { color: cardFill }, color: cardText, fontSize: metrics.fontSize, align: 'left', valign: 'top', margin: 15, fontFace });
        slide.addText(col2.map(l => ({ text: l, options: { bullet: { code: '2022', color: styles.accent } } })), { shape: pres.ShapeType.roundRect, x: 5.2, y: startY, w: 4.3, h: availH * 0.9, fill: { color: cardFill }, color: cardText, fontSize: metrics.fontSize, align: 'left', valign: 'top', margin: 15, fontFace });
    } else if (layout === 'TIMELINE') {
        slide.addShape(pres.ShapeType.line, { x: 0.5, y: 3.2, w: 9, h: 0, line: { color: styles.accent, width: 4 } });
        const count = Math.min(items.length, 5); const step = 9 / count;
        items.slice(0, 5).forEach((item, i) => {
            const xPos = 0.5 + (i * step) + (step/2); const isTop = i % 2 === 0; const yText = isTop ? 1.8 : 3.6;
            slide.addShape(pres.ShapeType.ellipse, { x: xPos - 0.15, y: 3.05, w: 0.3, h: 0.3, fill: { color: styles.accent } });
            slide.addShape(pres.ShapeType.line, { x: xPos, y: 3.2, w: 0, h: isTop ? -0.6 : 0.6, line: { color: styles.accent, width: 1 } });
            slide.addText(item, { x: xPos - 1.0, y: yText, w: 2.0, h: 1.2, fontSize: 14, align: 'center', color: styles.text, bold: true, fontFace, valign: isTop ? 'bottom' : 'top' });
        });
    } else if (layout === 'WORKFLOW') {
        const count = Math.min(items.length, 4); const width = 9 / count; const gap = 0.1;
        items.slice(0, 4).forEach((item, i) => {
            const xPos = 0.5 + (i * width);
            slide.addText(item, { shape: pres.ShapeType.chevron, x: xPos, y: 2.5, w: width - gap, h: 1.5, fill: { color: styles.accent }, color: 'FFFFFF', fontSize: 14, align: 'center', valign: 'middle', bold: true, fontFace });
        });
    } else if (layout === 'TABLE') {
        slide.addText(items.map(l => ({ text: l, options: { bullet: { code: '2022', color: styles.accent } } })), { x: 0.5, y: 1.8, w: '90%', h: '70%', fontSize: metrics.fontSize, color: styles.text, lineSpacing: metrics.lineSpacing, fontFace });
    } else {
         slide.addText(items.map(l => ({ text: l, options: { bullet: { code: '2022', color: styles.accent } } })), { x: 0.5, y: 1.8, w: '90%', h: '75%', fontSize: metrics.fontSize, color: styles.text, valign: 'top', lineSpacing: metrics.lineSpacing, fontFace });
    }
  });
  pres.writeFile({ fileName: `${project.title}.pptx` });
};

const getThemeStyles = (template: string) => {
    const themes: any = {
        'Minimal': { bg: 'FFFFFF', text: '000000', subtext: '666666', accent: '000000', accentAlt: 'E0E0E0', cardBg: 'F8FAFC', cardText: '1E293B' },
        'Corporate': { bg: 'F8FAFC', text: '1E293B', subtext: '475569', accent: '0047AB', accentAlt: 'D1E4FF', cardBg: 'FFFFFF', cardText: '1E293B' },
        'Executive': { bg: '0F172A', text: 'F1F5F9', subtext: '94A3B8', accent: '38BDF8', accentAlt: '0369A1', cardBg: '1E293B', cardText: 'F1F5F9' },
        'Paper': { bg: 'FDFBF7', text: '2C2C2C', subtext: '555555', accent: '8B4513', accentAlt: 'E6D0B3', cardBg: 'FFFFFF', cardText: '2C2C2C' },
        'Vibrant': { bg: '111827', text: 'FFFFFF', subtext: 'A1A1AA', accent: 'D946EF', accentAlt: '86198F', cardBg: '1F2937', cardText: 'FFFFFF' },
        'Ocean': { bg: 'F0F9FF', text: '0C4A6E', subtext: '334155', accent: '0284C7', accentAlt: 'BAE6FD', cardBg: 'FFFFFF', cardText: '0C4A6E' },
        'Dark': { bg: '000000', text: 'E5E5E5', subtext: 'A3A3A3', accent: '22C55E', accentAlt: '14532D', cardBg: '171717', cardText: 'E5E5E5' }
    };
    return themes[template] || themes['Minimal'];
};