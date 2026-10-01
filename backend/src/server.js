require('dotenv').config();
const app = require('./app');

const puerto = process.env.PORT || 4000;

app.listen(puerto, () => {
  console.log(`Servidor corriendo en el puerto ${puerto}`);
});