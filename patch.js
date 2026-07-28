const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
const newFunc = fs.readFileSync('temp_dashboard.js', 'utf8');
const start = code.indexOf("app.get('/api/admin/dashboard'");
if(start !== -1) {
  code = code.substring(0, start) + newFunc;
  fs.writeFileSync('server.js', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find start string");
}