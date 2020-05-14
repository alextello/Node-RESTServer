const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
const Producto = require('../models/producto');

/* -------------------------------------------------------------------------- */
/*                         OBTENER TODOS LOS PRODUCTOS                        */
/* -------------------------------------------------------------------------- */
app.get('/productos', (req, res) => {
	let desde = Number(req.query.desde) || 0;
	let limite = Number(req.query.limite) || 5;
	Producto.find({ disponible: true })
		.skip(desde)
		.limit(limite)
		.populate('usuario', 'nombre email')
		.populate('categoria')
		.exec()
		.then(async (productos) => {
			let total = await Producto.countDocuments({ disponible: true });
			res.json({
				ok: true,
				productos,
				total,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
	//populate
	//paginado
});

/* -------------------------------------------------------------------------- */
/*                           OBTENER PRODUCTO POR ID                          */
/* -------------------------------------------------------------------------- */
app.get('/productos/:id', (req, res) => {
	let id = req.params.id;
	Producto.findById(id)
		.populate('usuario', 'nombre email')
		.populate('categoria', 'descripcion')
		.then((producto) => {
			if (!producto) {
				return res.status(400).json({
					ok: false,
					err: {
						message: 'No existe el producto con el ID dado',
					},
				});
			}
			res.json({
				ok: true,
				producto,
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
/*                              BUSCAR PRODUCTOS                              */
/* -------------------------------------------------------------------------- */
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
	let termino = req.params.termino;
	let regex = new RegExp(termino, 'i');
	Producto.find({ nombre: regex })
		.populate('categoria', 'descripcion')
		.exec()
		.then((productos) => {
			res.json({
				ok: true,
				productos,
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
/*                               CREAR PRODUCTO                               */
/* -------------------------------------------------------------------------- */
app.post('/productos', verificaToken, (req, res) => {
	let body = req.body;
	let producto = new Producto({
		nombre: body.nombre,
		precioUni: body.precio,
		descripcion: body.descripcion,
		disponible: body.disponible,
		categoria: body.categoria,
		usuario: req.usuario._id,
	});
	producto
		.save()
		.then((producto) => {
			res.json({
				ok: true,
				producto,
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
/*                             ACTUALIZAR PRODUCTO                            */
/* -------------------------------------------------------------------------- */
app.put('/productos/:id', verificaToken, (req, res) => {
	let id = req.params.id;
	let body = req.body;
	let productoActualizado = {
		nombre: body.nombre,
		precioUni: body.precio,
		descripcion: body.descripcion,
		categoria: body.categoria,
		usuario: req.usuario._id,
		disponible: body.disponible,
	};
	Producto.findByIdAndUpdate(id, productoActualizado, {
		new: true,
		runValidators: true,
	})
		.then((producto) => res.json({ ok: true, producto }))
		.catch((err) => res.status(500).json({ ok: false, err }));
});

/* -------------------------------------------------------------------------- */
/*                              ELIMINAR PRODUCTO                             */
/* -------------------------------------------------------------------------- */
app.delete('/productos/:id', verificaToken, (req, res) => {
	//solo cambiar 'disponible'
	let id = req.params.id;
	Producto.findByIdAndUpdate(
		id,
		{ disponible: false },
		{ new: true, runValidators: true }
	)
		.then((producto) => {
			res.json({
				ok: true,
				producto,
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
