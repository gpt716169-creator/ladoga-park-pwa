const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('https://ladogapark.ru/');
    const html = res.data;
    const match = html.match(/hotel_id=['"]?(\d+)/i) || html.match(/tl-hotel-id=['"]?(\d+)/i) || html.match(/hotel_id\s*[:=]\s*(\d+)/i);
    console.log('Found hotel_id:', match ? match[1] : 'No');
  } catch(e) {
    console.log(e.message);
  }
}
test();