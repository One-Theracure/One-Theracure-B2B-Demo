import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Generate a combined PDF from multiple DOM elements, one after another
export async function generateCombinedPDF(elements: HTMLElement[], filename: string) {
  if (!elements.length) return;

  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let isFirstPage = true;

  for (const el of elements) {
    // Ensure element exists and has layout
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      scrollX: 0,
      scrollY: -window.scrollY,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const imgWidth = pageWidth; // fit to page width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0; // top of the page

    // Add a new page between sections
    if (!isFirstPage) {
      pdf.addPage();
    }

    // Add the image, splitting across pages if needed
    while (heightLeft > 0) {
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      if (heightLeft > 0) {
        pdf.addPage();
        position -= pageHeight; // shift up for next slice
      }
    }

    isFirstPage = false;
  }

  pdf.save(filename);
}
