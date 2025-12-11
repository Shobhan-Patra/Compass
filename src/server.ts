import expressServer from './app.ts';

const PORT: number = parseInt(process.env.PORT ?? '8000');

expressServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT};\nhttp://localhost:${PORT}`);
});
