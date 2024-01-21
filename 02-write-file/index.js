const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');

const fileToWrite = path.join(__dirname, 'text.txt');
const writable = fs.createWriteStream(fileToWrite, 'utf-8');
const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('Please, write something and it will be added to the file\n');
rl.prompt();
rl.on('line', (line) => {
  if (line === 'exit') {
    process.stdout.write('Bye bye!');
    rl.close();
  } else {
    if (!line.endsWith('\n')) line = `${line}\n`;
    writable.write(line, (err) => err);
  }
});

rl.on('SIGINT', () => {
  process.stdout.write('See ya!');
  rl.close();
});
