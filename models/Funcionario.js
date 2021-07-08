const mongoose = require('mongoose')

const Funcionario = new mongoose.Schema({
    nome: String,
    cpf: String,
    dataNasc: Date,
    contato: {
        email: {
            type: String,
            default: 'Email não informado'
        },
        telefone: {
            type: String,
            default: 'Telefone não informado'
        }
    }
})

mongoose.model('funcionarios', Funcionario)
module.exports = Funcionario
