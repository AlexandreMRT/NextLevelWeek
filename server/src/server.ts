import express from 'express';

const app = express();

app.get('/users', (req, res) => {
  res.json([
    'Alexandre',
    'Matheus',
    'Ramalho',
    'Teixeira',
  ]);
});

app.listen(3333);