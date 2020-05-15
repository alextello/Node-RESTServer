const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');

app.get('/imagen/:tipo/:img', verificaToken, (req, res) => {
	let tipo = req.params.tipo;
	let img = req.params.img;
	let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
	if (fs.existsSync(pathImagen)) {
		res.sendFile(pathImagen);
	} else {
		let noImagePath = path.resolve(__dirname, '../assets/noimage.jpg');
		res.sendFile(noImagePath);
	}
});

module.exports = app;
