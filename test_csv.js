const fs = require('fs');
const path = require('path');

function parseCSV(str) {
  const result = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(cell);
      result.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    result.push(row);
  }

  return result.filter(r => r.length > 1 || r[0] !== "");
}

const text = fs.readFileSync('products_export_1.csv', 'utf-8');
const rows = parseCSV(text);

const headers = rows[0].map(h => h.trim().toLowerCase());
const imgIdx = headers.findIndex(h => h.includes("image src") || h.includes("images") || h === "image");

console.log("imgIdx:", imgIdx);
console.log("Headers length:", headers.length);

for (let i = 1; i <= 3; i++) {
  console.log(`Row ${i} length:`, rows[i].length);
  console.log(`Row ${i} Image Src:`, rows[i][imgIdx]);
}
