module.exports = {
    gerarIdade: (AnoNasc) => {
        var anoAtual = new Date().getFullYear()
        return (Number(anoAtual) - Number(AnoNasc))
    }
}