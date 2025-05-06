const express = require('express');
const winston = require('winston');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// MongoDB setup
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'calculatorDB';
let db = null;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'calculator-microservice' },
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Connect to MongoDB
MongoClient.connect(mongoURI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Input validator
function validateNumbers(val1, val2, res) {
  if (isNaN(val1) || isNaN(val2)) {
    const message = 'Invalid input: val1 and val2 must be numbers.';
    logger.error(message);
    res.status(400).json({ error: message });
    return false;
  }
  return true;
}

// Handle math operation + log to DB
async function handleOperation(req, res, operator, operationFn) {
  const { val1, val2 } = req.query;
  if (!validateNumbers(val1, val2, res)) return;

  const num1 = parseFloat(val1);
  const num2 = parseFloat(val2);
  let result;

  try {
    result = operationFn(num1, num2);
  } catch (err) {
    logger.error(err.message);
    return res.status(400).json({ error: err.message });
  }

  logger.info(`${operator}: ${val1} ${operator} ${val2} = ${result}`);

  // Store in DB
  if (db) {
    await db.collection('calculations').insertOne({
      operator,
      val1: num1,
      val2: num2,
      result,
      timestamp: new Date(),
    });
  }

  res.json({ result });
}

// Routes
app.get('/add', (req, res) => handleOperation(req, res, '+', (a, b) => a + b));
app.get('/subtract', (req, res) => handleOperation(req, res, '-', (a, b) => a - b));
app.get('/multiply', (req, res) => handleOperation(req, res, '*', (a, b) => a * b));
app.get('/divide', (req, res) =>
  handleOperation(req, res, '/', (a, b) => {
    if (b === 0) throw new Error('Division by zero is not allowed.');
    return a / b;
  })
);

// Start server
app.listen(port, () => {
  console.log(`Calculator microservice running on http://localhost:${port}`);
  logger.info(`Server started on port ${port}`);
});
