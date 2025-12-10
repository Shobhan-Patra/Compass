import app from './app.ts';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT};\nhttp://localhost:${PORT}`);
});
