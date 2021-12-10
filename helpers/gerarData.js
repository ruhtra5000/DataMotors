module.exports = {
    gerarData: () => {
        var data = new Date()
	    var hoje = new Date(data.getFullYear(), data.getMonth(), data.getDate())
	    hoje.setMonth(hoje.getMonth()-1)
        return hoje
    }
}