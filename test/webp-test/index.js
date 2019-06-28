const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

imagemin(['images/*.{jpg,png}'], 'build', {
  use: [
    imageminWebp({lossless: true})
  ]
}).then(() => {
  console.log('Images optimized');
});
