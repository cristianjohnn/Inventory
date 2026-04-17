import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatPercent } from './formatters.js';

export async function exportToPdf(assets, filename = 'assets-report.pdf') {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.text('IT Asset Inventory Report', 14, 22);
  
  // Subtitle / Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Calculate Summaries
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const totalCurrentValue = assets.reduce((sum, a) => sum + (a.depreciation?.currentValue || 0), 0);
  
  doc.setFontSize(10);
  doc.setTextColor(50);
  doc.text(`Total Assets: ${totalAssets}`, 14, 40);
  doc.text(`Original Value: ${formatCurrency(totalValue)}`, 60, 40);
  doc.text(`Current Value: ${formatCurrency(totalCurrentValue)}`, 130, 40);

  // Table Data
  const head = [[
    'Asset Tag', 'Name', 'Category', 'Status', 'Dept/Location', 
    'Assigned To', 'Purchase Price', 'Current Value', 'Remaining'
  ]];
  
  const body = assets.map(a => [
    a.assetTag,
    a.name,
    a.category,
    a.status,
    a.department || a.location || '—',
    a.assignedEmployee || '—',
    formatCurrency(a.purchasePrice),
    formatCurrency(a.depreciation?.currentValue),
    formatPercent(a.depreciation?.percentRemaining)
  ]);
  
  autoTable(doc, {
    startY: 45,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [232, 108, 48] }, // Match accent color #e86c30
    styles: { fontSize: 8, cellPadding: 2 },
  });
  
  // Try using the native File System Access API first
  if (window.showSaveFilePicker) {
    try {
      const blob = doc.output('blob');
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'PDF Document',
          accept: { 'application/pdf': ['.pdf'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return; // Success
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('showSaveFilePicker failed, falling back to legacy download', err);
    }
  }

  // Fallback
  doc.save(filename);
}
