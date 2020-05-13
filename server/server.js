require('./config/config');
const express = require('express');
var mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//configuracion global de rutas
app.use(require('./routes/index'));

// Habilitar carpeta public
app.use(express.static(path.resolve(__dirname, '../public/')));
mongoose.connect(
	process.env.URLDB,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	},
	(err, res) => {
		if (err) throw new Error(err);
		else console.log('BASE DE DATOS ONLINE');
	}
);

app.listen(process.env.PORT, () => {
	console.log('Escuchando el puerto ' + process.env.PORT);
});
