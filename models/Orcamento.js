const mongoose = require('mongoose');

const Orcamento = new mongoose.Schema({
	numero: {
		type: Number,
		default: 0,
	},
	responsavel: {
		type: mongoose.Types.ObjectId,
		ref: 'usuarios',
	},
	descricao: String,
	cliente: {
		type: mongoose.Types.ObjectId,
		ref: 'clientes',
	},
	data: {
		dataEntrada: Date,
		dataSaida: Date,
	},
	produtos: [
		{
			codigo: Number,
			quantidade: Number,
			valorUnit: Number,
		},
	],
	servicos: [
		{
			nomeFunc: String,
			descricao: String,
			preco: Number,
		},
	],
	valorTotal: Number,
	statusAberto: {
		type: Boolean,
		default: true,
	},
});

Orcamento.pre('save', async function (next) {
	if (this.isNew) {
		let total = await model.find().sort({ _id: -1 }).limit(1);
		this.numero = total.length === 0 ? 1 : Number(total[0].numero) + 1;
		next();
	}
});

const model = mongoose.model('orcamentos', Orcamento);
module.exports = Orcamento;
