#!/usr/bin/env node
const fs = require('fs');
const { program } = require('commander');

program
  .option('-i, --input <path>', 'path to input json file')
  .option('-o, --output <path>', 'path to output file')
  .option('-d, --display', 'display result in console')
  .option('-s, --survived', 'show only survived passengers')
  .option('-a, --age', 'include Age in output');

program.parse(process.argv);
const options = program.opts();

// 1) перевірка наявності обов'язкового параметру
if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// 2) перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// 3) читання файлу
let raw;
try {
  raw = fs.readFileSync(options.input, 'utf8');
} catch (err) {
  console.error('Cannot find input file');
  process.exit(1);
}

// 4) парсинг JSON
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Error parsing JSON:', err.message);
  process.exit(1);
}

// 5) знайти масив записів у прочитаному JSON
let records;
if (Array.isArray(data)) records = data;
else if (Array.isArray(data.data)) records = data.data;
else if (Array.isArray(data.rows)) records = data.rows;
else if (Array.isArray(data.passengers)) records = data.passengers;
else {
  const arr = Object.values(data).find(v => Array.isArray(v));
  records = arr || [];
}

// 6) побудова рядків виводу
const lines = [];
for (const r of records) {
  const name = r.Name ?? r.name ?? '';
  const ticket = r.Ticket ?? r.ticket ?? '';
  const ageVal = r.Age ?? r.age;
  const survivedVal = r.Survived ?? r.survived;

  if (options.survived) {
    const s = String(survivedVal ?? '').trim().toLowerCase();
    if (!(s === '1' || s === 'true')) continue;
  }

  const parts = [name];
  if (options.age) parts.push(ageVal ?? '');
  parts.push(ticket);
  lines.push(parts.join(' ').trim());
}

const out = lines.join('\n');

// 7) вивід згідно прапорців
if (options.display) console.log(out);
if (options.output) fs.writeFileSync(options.output, out, 'utf8');
