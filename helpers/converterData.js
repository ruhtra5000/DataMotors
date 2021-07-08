module.exports = {
    converterData: (dia, mes, ano) => {
        var Mes = (mes - 1)
        if(dia.length == 1) {
            dia = ('0' + dia)
        }
        else if(Mes.length == 1) {
            Mes = ('0' + Mes)
        }
        return new Date(ano, Mes, dia)
    }
}