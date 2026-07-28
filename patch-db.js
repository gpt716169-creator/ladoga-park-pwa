const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function run() {
  await ssh.connect({ host: '132.243.17.20', username: 'root', password: '@bh)/94\\q8o3xBOX' });
  const patch = `
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('/var/www/ladoga-park/database.sqlite');
db.serialize(() => {
  db.run("INSERT OR IGNORE INTO catalog_items (id, displayName, desc, price, category, icon, isQuickOrder) VALUES ('sauna-forest', 'Баня в лесу у поляны', 'Прогрев до 85°C', 4000, 'sauna', '🌲', 0)");
  db.run("INSERT OR IGNORE INTO catalog_items (id, displayName, desc, price, category, icon, isQuickOrder) VALUES ('sauna-lake', 'Баня на берегу Ладоги', 'Спуск к воде', 4000, 'sauna', '🌊', 0)");
  db.run("INSERT OR IGNORE INTO catalog_items (id, displayName, desc, price, category, icon, isQuickOrder) VALUES ('hottub-siberian', 'Сибирский банный чан', 'Теплый чан', 3500, 'sauna', '♨️', 0)");
  db.run("INSERT OR IGNORE INTO catalog_items (id, displayName, desc, price, category, icon, isQuickOrder) VALUES ('aroma-tub', 'Арома-купель', 'На цитрусах', 3500, 'sauna', '🍋', 0)");
});
`;
  await ssh.execCommand('cat << \'EOF\' > /var/www/ladoga-park/patch.js\n' + patch + '\nEOF');
  const res = await ssh.execCommand('node /var/www/ladoga-park/patch.js');
  console.log(res);
  process.exit(0);
}
run();