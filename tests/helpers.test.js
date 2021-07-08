const test = require('tape')

const {checarEmail} = require('../helpers/checarEmail')
const {converterData} = require('../helpers/converterData')
const {TestaCPF} = require('../helpers/testarCPF')

console.log('Testando os Helpers')

test('ChecagemEmailValido', (t) => {
    t.assert(checarEmail('arthur@gmail.com') == true, 'Email válido.')
    t.end()
})

test('ChecagemEmailInvalido', (t) =>{
    t.assert(checarEmail('¨ciaGmail.com') == false, 'Email inválido.')
    t.end()
})

test('ConverterData', (t) => { 
    var data = converterData(2, 2, 2005).toISOString()
    var data2 = new Date(2005, 01, 02).toISOString()
    t.assert(data === data2, 'Data convertida com sucesso.')
    t.end()
})

test('TestaCpfValido', (t) => {
    t.assert(TestaCPF('112.316.524-62') == true, 'CPF validado.')
    t.end()
})

test('TestaCpfInvalido', (t) => {
    t.assert(TestaCPF('023.721.781-65') == false, 'CPF validado.')
    t.end()
})