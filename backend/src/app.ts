/// <reference path="./types/express.d.ts" />
import express from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
app.use(express.json());

// Mount auth routes
app.use('/api/auth', authRoutes);
// Mount user routes
app.use('/api/users', userRoutes);

app.get('/', function(req, res) {
  res.send('SprintSync Backend Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
