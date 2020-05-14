const express = require('express');

const { verificaToken, tokenAdmin } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

/* -------------------------------------------------------------------------- */
/*                        MOSTRAR TODAS LAS CATEGORIAS                        */
/* -------------------------------------------------------------------------- */
app.get('/categoria', (req, res) => {
	Categoria.find({})
		.sort('descripcion')
		.populate('usuario', 'nombre email')
		.then(async (categorias) => {
			if (!categorias) {
				res.json({
					ok: false,
					err: {
						message: 'No hay categorias',
					},
				});
			}
			let count = await Categoria.countDocuments();
			res.json({
				ok: true,
				categorias,
				total: count,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
});

/* -------------------------------------------------------------------------- */
/*                        MOSTRAR UNA CATEGORIA POR ID                        */
/* -------------------------------------------------------------------------- */
app.get('/categoria/:id', (req, res) => {
	let id = req.params.id;
	Categoria.findById(id)
		.populate('usuario', 'nombre email')
		.then((categoria) => {
			if (!categoria) {
				res.json({
					ok: false,
					err: {
						message: 'No existe una categoria con el ID dado',
					},
				});
			}
			res.json({
				ok: true,
				categoria,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
});

/* -------------------------------------------------------------------------- */
/*                            CREAR NUEVA CATEGORIA                           */
/* -------------------------------------------------------------------------- */
app.post('/categoria', verificaToken, (req, res) => {
	let body = req.body;
	let categoria = new Categoria({
		descripcion: body.descripcion,
		usuario: req.usuario._id,
	});
	categoria
		.save()
		.then((categoriaDB) => {
			res.json({
				ok: true,
				categoria: categoriaDB,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
});

/* -------------------------------------------------------------------------- */
/*                            ACTUALIZR CATEGORIA                             */
/* -------------------------------------------------------------------------- */
app.put('/categoria/:id', verificaToken, (req, res) => {
	let id = req.params.id;
	let desCategoria = {
		descripcion: req.body.descripcion,
	};
	Categoria.findByIdAndUpdate(id, desCategoria, { new: true })
		.then((categoria) => {
			if (!categoria) {
				return res.status(400).json({
					ok: false,
					err: {
						message: 'No se encontró una categoria con el ID dado',
					},
				});
			}
			res.json({
				ok: true,
				categoria,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
});

/* -------------------------------------------------------------------------- */
/*                          ELIMINAR CATEGORIA (SOFT)                         */
/* -------------------------------------------------------------------------- */
app.delete('/categoria/:id', [verificaToken, tokenAdmin], (req, res) => {
	let id = req.params.id;
	Categoria.findByIdAndDelete(id)
		.then((categoriaBorrada) => {
			if (!categoriaBorrada) {
				res.status(400).json({
					ok: false,
					err: {
						message: 'No se encontró una categoria con el ID dado',
					},
				});
			}
			res.json({
				ok: true,
				categoria: categoriaBorrada,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
});

module.exports = app;
