const fs = require('fs');
const path = require('path');
const process = require('process');

const fileToRead = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(fileToRead, 'utf-8');
stream.pipe(process.stdout);
stream.close();
