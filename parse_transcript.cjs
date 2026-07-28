const fs = require('fs');
const path = require('path');

const logFile = 'C:/Users/Konstantin/.gemini/antigravity/brain/f18d7c9f-777c-41b8-9420-f42cf291d3cd/.system_generated/logs/transcript_full.jsonl';

if (!fs.existsSync(logFile)) {
  console.log('Log file not found!');
  process.exit(1);
}

const lines = fs.readFileSync(logFile, 'utf-8').split('\n');
console.log('Total transcript lines:', lines.length);

const edits = [];

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' || tc.name === 'replace_file_content') {
          const file = tc.args.TargetFile || tc.args.target_file || '';
          if (file.includes('index.html') || file.includes('style.css') || file.includes('main.js') || file.includes('stageManager.js')) {
            edits.push({
              step: obj.step_index,
              tool: tc.name,
              file: path.basename(file),
              contentLength: (tc.args.CodeContent || tc.args.ReplacementContent || tc.args.code_content || '').length,
              args: tc.args
            });
          }
        }
      });
    }
  } catch (e) {}
});

console.log(`Found ${edits.length} file edits in transcript log:`);
edits.forEach(e => {
  console.log(`Step ${e.step}: ${e.tool} on ${e.file} (length: ${e.contentLength})`);
});

fs.writeFileSync('C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park/transcript_edits_summary.json', JSON.stringify(edits, null, 2));
