const fs = require('fs');
try {
  const content = fs.readFileSync('js/sales.js', 'utf8');
  new Function(content);
  console.log("Syntax is OK!");
} catch (e) {
  console.error("Syntax Error:", e);
}
