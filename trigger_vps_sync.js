const { syncBookings } = require('./server.js');

async function main() {
  console.log('Starting full VPS sync with TravelLine...');
  await syncBookings();
  console.log('Sync finished successfully!');
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
