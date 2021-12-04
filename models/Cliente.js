const mongoose = require('mongoose');

const Cliente = new mongoose.Schema({
	nome: String,
	cpf: String,
	endereco: String,
	dataNasc: Date,
	contato: {
		email: {
			type: String,
			default: 'Email não informado',
		},
		telefone: {
			type: String,
			default: 'Telefone não informado',
		},
	},
});

mongoose.model('clientes', Cliente);
module.exports = Cliente;
