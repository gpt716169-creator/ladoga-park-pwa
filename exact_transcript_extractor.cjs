const fs = require('fs');
const path = require('path');

const logFile = 'C:/Users/Konstantin/.gemini/antigravity/brain/f18d7c9f-777c-41b8-9420-f42cf291d3cd/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf-8').split('\n');

const fileContents = new Map();

const CUTOFF_TIME = '2026-07-28T14:25:00Z'; // 17:25 MSK

lines.forEach((line) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.created_at && obj.created_at > CUTOFF_TIME) {
      return; 
    }

    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        const file = tc.args.TargetFile || tc.args.target_file || tc.args.AbsolutePath || '';
        const content = tc.args.CodeContent || tc.args.ReplacementContent || tc.args.code_content || '';
        
        if (tc.name === 'write_to_file' && content && content.length > 50) {
           if (file.includes('src/') || file.includes('src\\') || file.includes('index.html')) {
             const baseName = path.basename(file.replace(/\\/g, '/'));
             // Use filename as key
             fileContents.set(file.includes('index.html') ? 'index.html' : 'src/' + baseName, content);
           }
        }
      });
    }
  } catch (e) {}
});

console.log('Extracted sizes from transcript logs before ' + CUTOFF_TIME + ':');
for (const [file, content] of fileContents.entries()) {
  console.log(`${file}: ${content.length}`);
}

const outDir = 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park';
if (!fs.existsSync(path.join(outDir, 'src'))) fs.mkdirSync(path.join(outDir, 'src'), { recursive: true });

for (const [file, content] of fileContents.entries()) {
  fs.writeFileSync(path.join(outDir, file), content, 'utf-8');
}
console.log('Successfully RESTORED exact historical files to the project folder!');
