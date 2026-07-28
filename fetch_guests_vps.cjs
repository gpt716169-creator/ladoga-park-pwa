const axios = require('axios');
axios.get('http://132.243.17.20/api/guests')
  .then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.log('Error:', err.message));