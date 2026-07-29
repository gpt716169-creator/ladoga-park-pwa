const fs = require('fs');

const logFile = 'C:/Users/Konstantin/.gemini/antigravity/brain/f18d7c9f-777c-41b8-9420-f42cf291d3cd/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(logFile, 'utf-8').split('\n');

let targetContent = null;
let foundTime = null;

lines.forEach((line) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        const file = tc.args.TargetFile || tc.args.target_file || tc.args.AbsolutePath || '';
        const content = tc.args.CodeContent || tc.args.ReplacementContent || tc.args.code_content || '';
        
        if (file.includes('index.html') && content.includes('DISCREET DEVELOPER SWITCHER PILL')) {
           targetContent = content;
           foundTime = obj.created_at;
        }
      });
    }
  } catch (e) {}
});

if (targetContent) {
  fs.writeFileSync('C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park/index.html', targetContent, 'utf-8');
  console.log(`Found and extracted index.html from timestamp: ${foundTime}`);
} else {
  console.log('Not found.');
}
