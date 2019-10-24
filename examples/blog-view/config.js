module.exports = {
  port: process.env.PORT || 3000,
  staticPath: '/public', // The URL portion
  staticSrc: 'public', // The local path on disk
  distDir: 'dist',
};
