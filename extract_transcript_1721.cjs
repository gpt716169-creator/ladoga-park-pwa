const fs = require('fs');
const path = require('path');

const logFile = 'C:/Users/Konstantin/.gemini/antigravity/brain/f18d7c9f-777c-41b8-9420-f42cf291d3cd/.system_generated/logs/transcript_full.jsonl';

const lines = fs.readFileSync(logFile, 'utf-8').split('\n');

let latestIndexHtml = '';
let latestStyleCss = '';
let latestMainJs = '';
let latestStageManagerJs = '';

lines.forEach((line) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        const file = tc.args.TargetFile || tc.args.target_file || '';
        const content = tc.args.CodeContent || tc.args.ReplacementContent || tc.args.code_content || '';
        
        if (file.includes('index.html') && content.length > 20000) {
          latestIndexHtml = content;
        }
        if (file.includes('style.css') && content.length > 5000) {
          latestStyleCss = content;
        }
        if (file.includes('main.js') && content.length > 10000) {
          latestMainJs = content;
        }
        if (file.includes('stageManager.js') && content.length > 3000) {
          latestStageManagerJs = content;
        }
      });
    }
  } catch (e) {}
});

console.log('Extracted sizes from transcript logs:');
console.log('index.html:', latestIndexHtml.length);
console.log('style.css:', latestStyleCss.length);
console.log('main.js:', latestMainJs.length);
console.log('stageManager.js:', latestStageManagerJs.length);

const outDir = 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park-transcript-1721';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(path.join(outDir, 'src'))) fs.mkdirSync(path.join(outDir, 'src'), { recursive: true });

if (latestIndexHtml) fs.writeFileSync(path.join(outDir, 'index.html'), latestIndexHtml, 'utf-8');
if (latestStyleCss) fs.writeFileSync(path.join(outDir, 'src/style.css'), latestStyleCss, 'utf-8');
if (latestMainJs) fs.writeFileSync(path.join(outDir, 'src/main.js'), latestMainJs, 'utf-8');
if (latestStageManagerJs) fs.writeFileSync(path.join(outDir, 'src/stageManager.js'), latestStageManagerJs, 'utf-8');

console.log('Successfully saved extracted 17:21 files to:', outDir);
