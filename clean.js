const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      content = content.replace(/text-zinc-500 dark:text-zinc-500 dark:text-zinc-400/g, 'text-zinc-500 dark:text-zinc-400');
      content = content.replace(/text-zinc-500 dark:text-zinc-500 text-sm/g, 'text-zinc-500 text-sm');
      content = content.replace(/text-zinc-500 dark:text-zinc-500/g, 'text-zinc-500');
      content = content.replace(/dark:text-zinc-500 dark:text-zinc-500/g, 'dark:text-zinc-500');
      content = content.replace(/dark:text-zinc-500 dark:text-zinc-400/g, 'dark:text-zinc-400');
      
      content = content.replace(/dark:bg-zinc-800 dark:bg-zinc-800/g, 'dark:bg-zinc-800');
      content = content.replace(/bg-zinc-100 dark:bg-zinc-800 dark:bg-zinc-800/g, 'bg-zinc-100 dark:bg-zinc-800');
      
      // Clean up common duplicate class names in general
      // Avoid duplicate consecutive identical strings (e.g. "dark:text-zinc-500 dark:text-zinc-500")
      content = content.replace(/\b([\w:-]+)\s+\1\b/g, '$1');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

console.log("Cleaning up classes...");
processDirectory('client/src');
console.log("Cleanup complete!");
