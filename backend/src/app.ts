import express, { Request, Response } from 'express';
const app = express();
app.use(express.json());
app.get('/', function(req: Request, res: Response) {
  res.send('SprintSync Backend Running');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
