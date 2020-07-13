require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const config = require('config');
const cors = require('cors');
const port = process.env.PORT || 3000;
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const error = require('./middleware/error');
require('./prod')(app);

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR. PROCESS TERMINATING.')
    process.exit(1);
};

app.listen(port, () => { console.log(`Listening on port ${port}...`) });

mongoose.connect(process.env.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { console.log('Connected to MongoDB...') })
    .catch(err => console.error(err));
mongoose.set("useCreateIndex", true);

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use(error);