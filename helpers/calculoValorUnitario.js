module.exports = {
	calculoValorUnitario: (quant, vc, ml) => {
		var VUC = Math.ceil(vc / quant);
		var VUF = VUC + VUC * (ml / 100);
		VUF = parseFloat(VUF).toFixed(2);
		return VUF;
	},
};
