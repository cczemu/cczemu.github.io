// 运行：node gen-pages-index.js
// 作用：生成 pages/index.json，包含 pages 目录下所有 .md 文件名

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const outFile = path.join(__dirname, 'index.json');

fs.readdir(pagesDir, (err, files) => {
  if (err) throw err;
  const mdFiles = files.filter(f => f.endsWith('.md'));
  fs.writeFileSync(outFile, JSON.stringify(mdFiles, null, 2), 'utf-8');
  console.log('已生成:', outFile);
});
