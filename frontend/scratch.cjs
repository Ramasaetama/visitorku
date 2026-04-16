const https = require('https');

https.get('https://visitorku.io/api-stg/signage/kTNBr-2otS3-cj6Sy', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
