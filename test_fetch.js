const https = require('https');

const url = "https://script.google.com/macros/s/AKfycby7g6aigvN0V-n40RLEF4s7U5pE8F-2c_f-3HqAEvzG6XrtU-6X3HlX1Y_o8a/exec";

https.get(url, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (res2) => {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => console.log(data.substring(0, 1000)));
    });
  } else {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data.substring(0, 1000)));
  }
}).on('error', (e) => {
  console.error(e);
});
