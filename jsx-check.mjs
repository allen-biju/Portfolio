import fs from 'fs';

const code = fs.readFileSync('src/App.jsx', 'utf8');
const stack = [];
let lineNum = 1;

for (let i = 0; i < code.length; i++) {
  if (code[i] === '\n') lineNum++;
  
  if (code.startsWith('//', i)) {
    while (i < code.length && code[i] !== '\n') i++;
    lineNum++;
    continue;
  }
  
  if (code.startsWith('/*', i)) {
    while (i < code.length && !code.startsWith('*/', i)) {
      if (code[i] === '\n') lineNum++;
      i++;
    }
    continue;
  }
  
  if (code[i] === '<') {
    let j = i + 1;
    let isClosing = false;
    if (code[j] === '/') {
      isClosing = true;
      j++;
    }
    
    let tagName = '';
    while (j < code.length && /[a-zA-Z0-9\.-]/.test(code[j])) {
      tagName += code[j];
      j++;
    }
    
    if (tagName) {
      // Find end of tag
      let k = j;
      let inString = false;
      let stringChar = '';
      while (k < code.length) {
        if (code[k] === '\n') lineNum++;
        
        if (!inString && (code[k] === '"' || code[k] === "'")) {
          inString = true;
          stringChar = code[k];
        } else if (inString && code[k] === stringChar) {
          inString = false;
        } else if (!inString && code[k] === '>') {
          break;
        }
        k++;
      }
      
      const isSelfClosing = code[k - 1] === '/';
      
      if (!isSelfClosing) {
        if (!isClosing) {
          stack.push({ tag: tagName, line: lineNum, pos: i });
        } else {
          if (stack.length > 0 && stack[stack.length - 1].tag === tagName) {
            stack.pop();
          } else {
            console.log(`Unmatched closing tag </${tagName}> at line ${lineNum}`);
          }
        }
      }
      
      i = k; // skip to end of tag
    }
  }
}

if (stack.length > 0) {
  console.log('Unclosed tags:');
  stack.forEach(item => console.log(`<${item.tag}> at line ${item.line}`));
} else {
  console.log('All tags balanced!');
}
