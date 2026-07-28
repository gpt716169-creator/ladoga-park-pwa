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
        if (file.includes('ladoga-park')) {
          events.push({ step: json.step_index, tc, file });
        }
      });
    }
  } catch(e){}
});

rl.on('close', () => {
  console.log(`Processing ${events.length} total file operations across all project files...`);
  
  events.forEach(item => {
    // Determine target local filepath
    let targetFile = item.file;
    if (targetFile.includes('ladoga-park')) {
      const relPath = targetFile.split('ladoga-park')[1].replace(/\\/g, '/');
      targetFile = 'C:/Users/Konstantin/.gemini/antigravity/scratch/ladoga-park' + relPath;
    }

    if (item.tc.name === 'write_to_file') {
      const code = item.tc.args.CodeContent || item.tc.args.codeContent;
      if (code && !targetFile.endsWith('.log') && !targetFile.endsWith('.cjs')) {
        const dir = require('path').dirname(targetFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(targetFile, code, 'utf-8');
        console.log(`[Step ${item.step}] FULL WRITE ${targetFile}`);
      }
    } else if (item.tc.name === 'replace_file_content') {
      if (fs.existsSync(targetFile)) {
        let content = fs.readFileSync(targetFile, 'utf-8');
        const target = item.tc.args.TargetContent || item.tc.args.targetContent;
        const replacement = item.tc.args.ReplacementContent || item.tc.args.replacementContent;
        if (target && content.includes(target)) {
          content = content.replace(target, replacement);
          fs.writeFileSync(targetFile, content, 'utf-8');
          console.log(`[Step ${item.step}] replace in ${targetFile}`);
        }
      }
    } else if (item.tc.name === 'multi_replace_file_content') {
      if (fs.existsSync(targetFile)) {
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
          console.log(`[Step ${item.step}] multi-replace (${ok}/${chunks.length}) in ${targetFile}`);
        }
      }
    }
  });

  console.log('🏁 COMPLETE ALL-FILE 17:20 RECONSTRUCTION FINISHED!');
});
