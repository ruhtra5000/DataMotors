module.exports = {
    calculoValorUnitario: (quant, vc, ml) => {
        var VUC = Math.ceil((vc/quant))
        var VUF = (VUC + (VUC * (ml/100)))
        return VUF
    }
}