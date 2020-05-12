const express = require('express');
const app = express();

// Encriptación
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Modelo
const Usuario = require('../models/usuario');

module.exports = app;

app.post('/login', (req, res) => {
	let body = req.body;
	Usuario.findOne({
		email: body.email,
	})
		.then((usuarioDB) => {
			if (!usuarioDB) {
				res.status(400).json({
					ok: false,
					err: {
						message: 'Usuario o contraseña incorrecta',
					},
				});
			}

			if (bcrypt.compareSync(body.password, usuarioDB.password)) {
				let token = jwt.sign(
					{
						usuario: usuarioDB,
					},
					process.env.SEED,
					{ expiresIn: process.env.CADUCIDAD_TOKEN }
				);
				res.json({
					ok: true,
					usuario: usuarioDB,
					token,
				});
			} else {
				res.status(400).json({
					ok: false,
					err: {
						message: 'Usuario o contraseña incorrecta',
					},
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
});
