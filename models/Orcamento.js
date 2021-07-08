const mongoose = require('mongoose')

const Orcamento = new mongoose.Schema({
    responsavelAuxiliar: {
        type: mongoose.Types.ObjectId,
        ref: 'usuarios'
    },
    responsavelFuncionario: {
        type: [mongoose.Types.ObjectId],
        ref: 'funcionarios'
    },
    descricao: String,
    cliente: {
        type: mongoose.Types.ObjectId,
        ref: 'clientes'
    },
    data: {dataEntrada, dataSaida},
    produtos: {
        type: [mongoose.Types.ObjectId],
        ref: 'produtos'
    },
    servicos: {
        type: [mongoose.Types.ObjectId],
        ref: 'servicos'
    }
})

mongoose.model('orcamentos', Orcamento)
module.exports = Orcamento

