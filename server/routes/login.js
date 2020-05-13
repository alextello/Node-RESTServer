const express = require('express');
const app = express();

// Encriptación
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Modelo
const Usuario = require('../models/usuario');
//Sign-In de Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// CONFIGURACIONES DE GOOGLE

async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true,
	};
}

app.post('/logingoogle', async (req, res) => {
	const token = req.body.idtoken;
	let googleUser = await verify(token).catch((e) => {
		res.status(403).json({
			ok: false,
			err: e,
		});
	});

	Usuario.findOne({ email: googleUser.email })
		.then((usuarioDB) => {
			if (usuarioDB) {
				if (usuarioDB.google === false) {
					res.status(400).json({
						ok: false,
						err: {
							message: 'Debe de usar la autenticación local',
						},
					});
				} else {
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
				}
			} else {
				// Si el usuario no existe en la BD
				let usuario = new Usuario();
				usuario.nombre = googleUser.nombre;
				usuario.email = googleUser.email;
				usuario.img = googleUser.img;
				usuario.google = true;
				usuario.password = ':)';
				usuario
					.save()
					.then((usuarioDB) => {
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
					})
					.catch((err) => {
						res.status(500).json({
							ok: false,
							err,
						});
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

module.exports = app;
