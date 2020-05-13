const jwt = require('jsonwebtoken');

/* -------------------------------------------------------------------------- */
/*                               Verificar token                              */
/* -------------------------------------------------------------------------- */
let verificaToken = (req, res, next) => {
	let token = req.get('token'); // obtener el header 'token'
	jwt.verify(token, process.env.SEED, (err, decoded) => {
		if (err) {
			res.status(401).json({
				ok: false,
				err,
			});
		}
		req.usuario = decoded.usuario;
		next();
	});
};

/* -------------------------------------------------------------------------- */
/*                          VERIFICA TOKEN ADMIN ROLE                         */
/* -------------------------------------------------------------------------- */

let tokenAdmin = (req, res, next) => {
	if (req.usuario.role === 'ADMIN_ROLE') {
		next();
	} else {
		res.status(401).json({
			ok: false,
			err: {
				message: 'El usuario no es administrador',
			},
		});
	}
};

module.exports = {
	verificaToken,
	tokenAdmin,
};
