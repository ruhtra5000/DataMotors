const mongoose = require('mongoose')

const Produto = new mongoose.Schema({
    descricao: String, 
    marca: String,
    modelo: String,
    quantidade: Number,
    categoria: {
        type: mongoose.Types.ObjectId,
        ref: 'categorias'
    }
})

mongoose.model('produtos', Produto)
module.exports = Produto

