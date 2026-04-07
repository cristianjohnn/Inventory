export function exportToCsv(assets, filename = 'assets-export.csv') {
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
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
