const mongoose = require('mongoose')

const Produto = new mongoose.Schema({
    codigo: {
        type: Number,
        default: 0
    },
    descricao: String, 
    marca: String,
    modelo: String,
    quantidade: {
        type: Number,
        min: 0
    },
    valorUnit: Number,
    categoria: {
        type: mongoose.Types.ObjectId,
        ref: 'categorias'
    }
})

Produto.pre('save', async function(next) {
    if(this.isNew) {
        let total = await model.find().sort({_id: -1}).limit(1);
        this.codigo = total.length === 0 ? 1 : Number(total[0].codigo) + 1;
        next()
    }
})

const model = mongoose.model('produtos', Produto)
module.exports = model

