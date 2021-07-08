const mongoose = require('mongoose')

const Aquisicao = new mongoose.Schema({
    valorCompra: Number,
    quantidadeCompra: Number,
    margemLucro: String,
    dataCompra: Date,
    produto: {
        type: mongoose.Types.ObjectId,
        ref: 'produtos'
    }
})

mongoose.model('aquisicoes', Aquisicao)
module.exports = Aquisicao