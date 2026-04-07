const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replacements = [
  // Typography mapping
  { match: /(?<!dark:)text-zinc-100\b/g, replace: 'text-zinc-900 dark:text-zinc-100' },
  { match: /(?<!dark:)text-zinc-200\b/g, replace: 'text-zinc-800 dark:text-zinc-200' },
  { match: /(?<!dark:)text-zinc-300\b/g, replace: 'text-zinc-700 dark:text-zinc-300' },
  { match: /(?<!dark:)text-zinc-400\b/g, replace: 'text-zinc-500 dark:text-zinc-400' },
  { match: /(?<!dark:)text-zinc-500\b/g, replace: 'text-zinc-500 dark:text-zinc-500' }, 
  { match: /(?<!dark:)text-white\b/g, replace: 'text-zinc-900 dark:text-white' },
  
  // Background mapping
  { match: /(?<!dark:)bg-zinc-900(?!\/)\b/g, replace: 'bg-white dark:bg-zinc-900' },
  { match: /(?<!dark:)bg-zinc-900\/(\d+)\b/g, replace: 'bg-white/$1 dark:bg-zinc-900/$1' },
  { match: /(?<!dark:)bg-zinc-800(?!\/)\b/g, replace: 'bg-zinc-100 dark:bg-zinc-800' },
  { match: /(?<!dark:)bg-zinc-800\/(\d+)\b/g, replace: 'bg-zinc-100/$1 dark:bg-zinc-800/$1' },
  { match: /(?<!dark:)bg-\[\#121214\]\b/g, replace: 'bg-[#f4f4f5] dark:bg-[#121214]' },
  
  // Border mapping
  { match: /(?<!dark:)border-zinc-800(?!\/)\b/g, replace: 'border-zinc-200 dark:border-zinc-800' },
  { match: /(?<!dark:)border-zinc-800\/(\d+)\b/g, replace: 'border-zinc-200/$1 dark:border-zinc-800/$1' },
  { match: /(?<!dark:)border-zinc-700(?!\/)\b/g, replace: 'border-zinc-300 dark:border-zinc-700' },
  { match: /(?<!dark:)border-zinc-700\/(\d+)\b/g, replace: 'border-zinc-300/$1 dark:border-zinc-700/$1' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rule of replacements) {
        if (rule.match.test(content)) {
          content = content.replace(rule.match, rule.replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Modified: ${fullPath}`);
      }
    }
  }
}

console.log('Starting automated tailwind structural refactor...');
processDirectory(srcDir);
console.log('Refactor complete.');
