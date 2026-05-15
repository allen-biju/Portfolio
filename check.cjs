const fs = require('fs');
const txt = fs.readFileSync('src/App.jsx','utf8');
const d1 = (txt.match(/<div\b[^>]*>/g) || []).length;
const d2 = (txt.match(/<\/div>/g) || []).length;
const m1 = (txt.match(/<motion\.div\b[^>]*>/g) || []).length;
const m2 = (txt.match(/<\/motion\.div>/g) || []).length;
console.log({div: d1 - d2, motion: m1 - m2});
