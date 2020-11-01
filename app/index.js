const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { generate, getMostRecentFile } = require('./automation');
const requestData = require('./request-data.json');

const app = express();
app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
  console.log(req.body);
  
  await generate({
    ...requestData,
    ...req.body,
  });
  res.send(200);
});

app.use('/last', (req, res) => {
  const { file } = getMostRecentFile(path.join(__dirname, '..', 'public', 'attestations'));
  res.sendFile(path.join(__dirname, '..', 'public', 'attestations', file));
});

app.get('*', express.static(path.join(__dirname, '..', 'public')));


app.listen(1337, () => {
  console.log('server listening on port 1337');
});
