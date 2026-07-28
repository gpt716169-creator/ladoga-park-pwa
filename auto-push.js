import { watch } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

let timeout = null;
const WATCH_PATHS = ['./src', './index.html', './server.js', './vite.config.js'];

console.log('⚡ Auto-Push Watcher Started! Watching for changes...');

function syncAndPush(changedFile) {
  console.log(`\n📝 Change detected in ${changedFile}. Building & Pushing to GitHub...`);
  try {
    // 1. Build dist
    execSync('npm run build', { stdio: 'inherit' });

    // 2. Stage & Commit
    execSync('git add index.html src/ server.js dist/ vite.config.js package.json', { stdio: 'inherit' });
    
    // Check if there are changes to commit
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      const timestamp = new Date().toLocaleTimeString('ru-RU');
      execSync(`git commit -m "Auto-sync: ${timestamp} [${changedFile}]"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Successfully pushed changes to GitHub!');
      
      console.log('🚀 Deploying automatically to VPS...');
      execSync('node deploy.js', { stdio: 'inherit' });
      console.log('🎉 Live VPS deployment complete!');
    } else {
      console.log('ℹ️ No new git changes to commit.');
    }
  } catch (err) {
    console.error('❌ Auto-push error:', err.message);
  }
}

function handleFileChange(event, filename) {
  if (!filename || filename.includes('node_modules') || filename.includes('.git') || filename.includes('dist')) return;
  
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    syncAndPush(filename);
  }, 3000); // 3 second debounce
}

WATCH_PATHS.forEach(p => {
  try {
    watch(resolve(p), { recursive: true }, handleFileChange);
  } catch (e) {
    // fallback if non-recursive or single file
    watch(resolve(p), handleFileChange);
  }
});
