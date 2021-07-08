const mongoose = require('mongoose')

const Servico = new mongoose.Schema({
    categoria: {
        type: mongoose.Types.ObjectId,
        ref: 'categorias'
    },
    descricao: String, 
    valor: Number
})

mongoose.model('servicos', Servico)
module.exports = Servico