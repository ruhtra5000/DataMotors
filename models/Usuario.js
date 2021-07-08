const mongoose = require('mongoose');

const Usuario = new mongoose.Schema({
	nome: String,
	email: String,
	senha: String,
	admin: {
		type: Boolean,
		default: false,
	},
});

mongoose.model('usuarios', Usuario);
module.exports = Usuario;
