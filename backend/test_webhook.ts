const axios = require('axios');
axios.post('http://localhost:3001/api/webhook/n8n-result', {
  jobId: 'test-job',
  status: 'completed',
  rawCode: 'Hello World'
}).then(res => console.log(res.data)).catch(err => console.error(err.response.data));
