// src/utils/exporters.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * captureElementToPNG: returns dataURL
 */
export async function captureElementToPNG(el, opts = { scale: 2, bg: null }) {
  if (!el) return null;
  const canvas = await html2canvas(el, { scale: opts.scale || 2, backgroundColor: opts.bg ?? null });
  return canvas.toDataURL("image/png");
}

/**
 * exportElementsToMultipagePDF(elementsArray, filename)
 * elementsArray: [{ el, title }]
 */
export async function exportElementsToMultipagePDF(elements = [], filename = "report.pdf") {
  if (!elements.length) return;
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i].el;
    if (!el) continue;
    const img = await captureElementToPNG(el, { scale: 2, bg: "#06060a" });
    const props = doc.getImageProperties(img);
    const imgW = pageW - 20;
    const imgH = (props.height * imgW) / props.width;
    if (i > 0) doc.addPage();
    doc.setFillColor(6, 6, 10);
    doc.rect(0, 0, pageW, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(elements[i].title || "Report", 10, 13);
    doc.addImage(img, "PNG", 10, 24, imgW, Math.min(imgH, pageH - 30), undefined, "FAST");
  }
  doc.save(filename);
}
