const express = require('express');
const app = express();

const connectDB = require('./config/db');

//Middleware

app.use(express.json({ extended: false }));

connectDB();

app.get('/', (req, res) => res.send('API chalu hai mama'));

//Setting Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Started to port ${PORT}`));
