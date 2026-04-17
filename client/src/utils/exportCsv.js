export async function exportToCsv(assets, filename = 'assets-export.csv') {
  const headers = [
    'Asset Tag', 'Name', 'Category', 'Serial Number', 'Status',
    'Assigned Employee', 'Purchase Date', 'Purchase Price',
    'Current Value', 'Salvage Value', '% Remaining',
    'Depreciation Method', 'Location', 'Notes',
  ];

  const rows = assets.map((a) => [
    a.assetTag,
    a.name,
    a.category,
    a.serialNumber,
    a.status,
    a.assignedEmployee || '',
    new Date(a.purchaseDate).toLocaleDateString(),
    a.purchasePrice,
    a.depreciation?.currentValue || '',
    a.salvageValue,
    a.depreciation?.percentRemaining || '',
    a.depreciationMethod,
    a.location || '',
    (a.notes || '').replace(/,/g, ';'),
  ]);

  const csv = [headers, ...rows].map((row) =>
    row.map((cell) => `"${cell}"`).join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Try using the native File System Access API first (forces correct filename in all modern browsers)
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'CSV File',
          accept: { 'text/csv': ['.csv'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return; // Success
    } catch (err) {
      // If user cancels the dialog, just return
      if (err.name === 'AbortError') return;
      console.warn('showSaveFilePicker failed, falling back to legacy download', err);
    }
  }

  // Fallback for older browsers or restricted WebViews
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
