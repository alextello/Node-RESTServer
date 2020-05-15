const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function (req, res) {
	let tipo = req.params.tipo;
	let id = req.params.id;

	if (!req.files) {
		return res.status(400).json({
			ok: false,
			err: {
				message: 'No se ha seleccionado ningún archivo',
			},
		});
	}

	// Valida tipo
	let tiposValidos = ['productos', 'usuarios'];
	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: 'Los tipos permitidas son ' + tiposValidos.join(', '),
			},
		});
	}

	let archivo = req.files.img;
	let nombreCortado = archivo.name.split('.');
	let extension = nombreCortado[nombreCortado.length - 1];

	// Extensiones permitidas
	let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	if (extensionesValidas.indexOf(extension) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message:
					'Las extensiones permitidas son ' +
					extensionesValidas.join(', '),
				ext: extension,
			},
		});
	}

	// Cambiar nombre al archivo
	// 183912kuasidauso-123.jpg
	let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

	archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
		if (err)
			return res.status(500).json({
				ok: false,
				err,
			});

		// Aqui, imagen cargada
		if (tipo === 'usuarios') {
			imagenUsuario(id, res, nombreArchivo);
		} else {
			imagenProducto(id, res, nombreArchivo);
		}
	});
});

function imagenUsuario(id, res, nombreArchivo) {
	Usuario.findByIdAndUpdate(id, { img: nombreArchivo })
		.then((nuevoUsuario) => {
			borraArchivo(nuevoUsuario.img, 'usuarios');
			res.json({
				ok: true,
				usuario: nuevoUsuario,
				img: nombreArchivo,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
}

function imagenProducto(id, res, nombreArchivo) {
	Producto.findByIdAndUpdate(id, { img: nombreArchivo })
		.then((nuevoProducto) => {
			borraArchivo(nuevoProducto.img, 'productos');
			res.json({
				ok: true,
				producto: nuevoProducto,
				img: nombreArchivo,
			});
		})
		.catch((err) => {
			res.status(500).json({
				ok: false,
				err,
			});
		});
}

function borraArchivo(nombreImagen, tipo) {
	let pathImagen = path.resolve(
		__dirname,
		`../../uploads/${tipo}/${nombreImagen}`
	);
	if (fs.existsSync(pathImagen)) {
		fs.unlinkSync(pathImagen);
	}
}

module.exports = app;
