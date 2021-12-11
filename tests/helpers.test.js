const test = require('tape')

const {checarEmail} = require('../helpers/checarEmail')
const {converterData} = require('../helpers/converterData')
const {TestaCPF} = require('../helpers/testarCPF')
const {TestaCNPJ} = require('../helpers/testarCPNJ')
const {calculoValorUnitario} = require('../helpers/calculoValorUnitario')
const {gerarData} = require('../helpers/gerarData')
const {gerarIdade} = require('../helpers/gerarIdade')

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

test('TestaCnpjValido', (t) => {
    t.assert(TestaCNPJ('38.508.049/0001-22') == true, 'CNPJ validado.')
    t.end()
})

test('TestaCnpjInvalido', (t) => {
    t.assert(TestaCNPJ('93.664.062/0071-35') == false, 'CNPJ validado.')
})

test('TestaCalculoValorUnitário', (t) => {
    t.assert(calculoValorUnitario(5, 500, 15) == 115, 'Valor unitário válido.')
    t.end()
})

test('TestaGerarData', (t) => {
    t.equals(gerarData().toLocaleString(), '2021-11-11 0:00:00', 'Data gerada corretamente.')
    t.end()
})

test('TestaGerarIdade', (t) => {
    t.assert(gerarIdade(2003) == 18, 'Idade gerada válida.')
    t.end()
})