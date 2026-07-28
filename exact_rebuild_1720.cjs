const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\Konstantin\\.gemini\\antigravity\\brain\\f18d7c9f-777c-41b8-9420-f42cf291d3cd\\.system_generated\\logs\\transcript_full.jsonl'),
  crlfDelay: Infinity
});

let events = [];

rl.on('line', (line) => {
  try {
    const json = JSON.parse(line);
    if (json.step_index <= 2925 && json.tool_calls) {
      json.tool_calls.forEach(tc => {
        const file = tc.args.TargetFile || tc.args.targetFile || '';
        if (file.endsWith('index.html') || file.endsWith('main.js')) {
          events.push({ step: json.step_index, tc, file });
        }
      });
    }
  } catch(e){}
});

rl.on('close', () => {
  console.log(`Processing ${events.length} total file operations...`);
  
  events.forEach(item => {
    const isIndex = item.file.endsWith('index.html');
    const targetFile = isIndex ? 'C:\\Users\\Konstantin\\.gemini\\antigravity\\scratch\\ladoga-park\\index.html' : 'C:\\Users\\Konstantin\\.gemini\\antigravity\\scratch\\ladoga-park\\src\\main.js';

    if (item.tc.name === 'write_to_file') {
      const code = item.tc.args.CodeContent || item.tc.args.codeContent;
      if (code) {
        fs.writeFileSync(targetFile, code, 'utf-8');
        console.log(`[Step ${item.step}] FULL WRITE ${isIndex ? 'index.html' : 'main.js'}`);
      }
    } else if (item.tc.name === 'replace_file_content') {
      let content = fs.readFileSync(targetFile, 'utf-8');
      const target = item.tc.args.TargetContent || item.tc.args.targetContent;
      const replacement = item.tc.args.ReplacementContent || item.tc.args.replacementContent;
      if (target && content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(targetFile, content, 'utf-8');
        console.log(`[Step ${item.step}] replace in ${isIndex ? 'index.html' : 'main.js'}`);
      } else {
        console.log(`[Step ${item.step}] WARN: target not found in ${isIndex ? 'index.html' : 'main.js'}`);
      }
    } else if (item.tc.name === 'multi_replace_file_content') {
      let content = fs.readFileSync(targetFile, 'utf-8');
      const chunks = item.tc.args.ReplacementChunks || item.tc.args.replacementChunks || [];
      let ok = 0;
      chunks.forEach(c => {
        const target = c.TargetContent || c.targetContent;
        const replacement = c.ReplacementContent || c.replacementContent;
        if (target && content.includes(target)) {
          content = content.replace(target, replacement);
          ok++;
        }
      });
      if (ok > 0) {
        fs.writeFileSync(targetFile, content, 'utf-8');
        console.log(`[Step ${item.step}] multi-replace (${ok}/${chunks.length}) in ${isIndex ? 'index.html' : 'main.js'}`);
      } else {
        console.log(`[Step ${item.step}] WARN: 0 multi-replace matched in ${isIndex ? 'index.html' : 'main.js'}`);
      }
    }
  });

  console.log('🏁 PERFECT RECONSTRUCTION FINISHED!');
});
