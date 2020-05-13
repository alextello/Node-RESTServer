const express = require('express');
const app = express();

// Encriptación
const bcrypt = require('bcrypt');

const _ = require('underscore');
// Modelo
const Usuario = require('../models/usuario');

//Middleware
const { verificaToken, tokenAdmin } = require('../middlewares/autenticacion');

/* -------------------------------------------------------------------------- */
/*                                    RUTAS                                   */
/* -------------------------------------------------------------------------- */

app.get('/usuario', verificaToken, (req, res) => {
	let desde = Number(req.query.desde) || 0;
	let limite = Number(req.query.limite) || 5;
	Usuario.find({}, 'nombre email role estado google img')
		.skip(desde)
		.limit(limite)
		.exec()
		.then(async (usuarios) => {
			let count = await Usuario.countDocuments({ estado: true });
			res.json({
				ok: true,
				usuarios,
				count,
			});
		})
		.catch((err) => {
			res.status(400).json({
				ok: false,
				err,
			});
		});
});

/* ------------------------------ CREAR USUARIO ----------------------------- */
app.post('/usuario', [verificaToken, tokenAdmin], (req, res) => {
	let body = req.body;
	let usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		role: body.role,
	});
	if (body.nombre === undefined) {
		return res.status(400).json({
			mensaje: 'El nombre es requerido',
		});
	}
	usuario
		.save()
		.then((usuarioBD) => {
			res.status(200).json({
				ok: true,
				usuario: usuarioBD,
			});
		})
		.catch((err) => {
			res.status(400).json({
				ok: false,
				mensaje: 'Ha ocurrido un error al guardar el usuario',
				error: err,
			});
		});
});

/* --------------------------- ACTUALIZAR USUARIO --------------------------- */

app.put('/usuario/:id', [verificaToken, tokenAdmin], (req, res) => {
	const id = req.params.id;
	// Función que retorna un nuevo objeto con las propiedades especificadas
	let body = _.pick(req.body, ['nombre', 'img', 'role', 'estado']);
	Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true })
		.then((usuarioDB) => {
			res.json({
				ok: true,
				usuario: usuarioDB,
			});
		})
		.catch((err) => {
			res.status(400).json({
				ok: true,
				err,
			});
		});
});

/* ---------------------------- ELIMINAR USUARIO ---------------------------- */
app.delete('/usuario/:id', [verificaToken, tokenAdmin], (req, res) => {
	let id = req.params.id;
	let cambioEstado = {
		estado: false,
	};
	Usuario.findByIdAndUpdate(id, cambioEstado, { new: true })
		.then((usuarioBorrado) => {
			if (!usuarioBorrado) {
				res.status(400).json({
					ok: false,
					err: {
						message:
							'No se encontró un usuario con el ID proporcionado',
					},
				});
			}
			res.json({
				ok: true,
				usuario: usuarioBorrado,
			});
		})
		.catch((err) => {
			res.status(400).json({
				ok: false,
				err,
			});
		});
});

module.exports = app;
