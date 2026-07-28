const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

console.log('Resetting git to base commit 9b55e74...');
execSync('git reset --hard 9b55e74', { cwd: process.cwd() });

const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\Konstantin\\.gemini\\antigravity\\brain\\f18d7c9f-777c-41b8-9420-f42cf291d3cd\\.system_generated\\logs\\transcript_full.jsonl'),
  crlfDelay: Infinity
});

let appliedCount = 0;

rl.on('line', (line) => {
  try {
    const json = JSON.parse(line);
    if (json.step_index <= 2925 && json.tool_calls) {
      json.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file') {
          const filePath = tc.args.TargetFile || tc.args.targetFile;
          if (filePath && filePath.includes('ladoga-park')) {
            fs.writeFileSync(filePath, tc.args.CodeContent || tc.args.codeContent, 'utf-8');
            console.log(`[Step ${json.step_index}] Wrote ${filePath}`);
            appliedCount++;
          }
        } else if (tc.name === 'replace_file_content') {
          const filePath = tc.args.TargetFile || tc.args.targetFile;
          if (filePath && filePath.includes('ladoga-park') && fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf-8');
            const target = tc.args.TargetContent || tc.args.targetContent;
            const replacement = tc.args.ReplacementContent || tc.args.replacementContent;
            if (target && content.includes(target)) {
              content = content.replace(target, replacement);
              fs.writeFileSync(filePath, content, 'utf-8');
              console.log(`[Step ${json.step_index}] Replaced in ${filePath}`);
              appliedCount++;
            } else {
              console.log(`[Step ${json.step_index}] WARN: target content not found in ${filePath}`);
            }
          }
        } else if (tc.name === 'multi_replace_file_content') {
          const filePath = tc.args.TargetFile || tc.args.targetFile;
          if (filePath && filePath.includes('ladoga-park') && fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf-8');
            const chunks = tc.args.ReplacementChunks || tc.args.replacementChunks || [];
            let appliedInFile = false;
            chunks.forEach(chunk => {
              const target = chunk.TargetContent || chunk.targetContent;
              const replacement = chunk.ReplacementContent || chunk.replacementContent;
              if (target && content.includes(target)) {
                content = content.replace(target, replacement);
                appliedInFile = true;
              }
            });
            if (appliedInFile) {
              fs.writeFileSync(filePath, content, 'utf-8');
              console.log(`[Step ${json.step_index}] Multi-replaced in ${filePath}`);
              appliedCount++;
            }
          }
        }
      });
    }
  } catch(e){}
});

rl.on('close', () => {
  console.log('SUCCESS! Replay finished. Total operations applied:', appliedCount);
});
