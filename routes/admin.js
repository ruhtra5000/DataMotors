const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

require('../models/Funcionario');
const Funcionario = mongoose.model('funcionarios');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Produto');
const Produto = mongoose.model('produtos');
require('../models/Servico');
const Servico = mongoose.model('servicos');
require('../models/Aquisicao');
const Aquisicao = mongoose.model('aquisicoes');
require('../models/Cliente')
const Cliente = mongoose.model('clientes')
require('../models/Orcamento')
const Orcamento = mongoose.model('orcamentos')

const { converterData } = require('../helpers/converterData');
const { adminCheck } = require('../helpers/adminCheck');
const { calculoValorUnitario } = require('../helpers/calculoValorUnitario');
const { gerarData } = require('../helpers/gerarData');
const { gerarIdade } = require('../helpers/gerarIdade')


//ROTAS DE FUNCIONÁRIOS

//Listar funcionários
router.get('/funcionarios', adminCheck, (req, res) => {
	Funcionario.find()
		.lean()
		.then((funcionarios) => {
			res.render('admin/funcionarios', { funcionarios: funcionarios });
		});
});

//Editar funcionários
router.post('/funcionarios/editar', adminCheck, (req, res) => {
	Funcionario.findOne({ _id: req.body.id })
		.lean()
		.then((funcionario) => {
			res.render('admin/editarFunc', { funcionario: funcionario });
		});
});

router.post('/funcionarios/editarP', adminCheck, (req, res) => {
	//Adicionar outras validações aqui, caso necessário
	Funcionario.updateOne(
		{ _id: req.body.id },
		{
			nome: req.body.nome.trim(),
			cpf: req.body.cpf,
			dataNasc: converterData(req.body.dia, req.body.mes, req.body.ano),
			contato: {
				email: req.body.email,
				telefone: req.body.telefone,
			},
		}
	)
		.then(() => {
			req.flash('suc', 'Dados editados!');
			res.redirect('/admin/funcionarios');
		})
		.catch((err) => {
			req.flash(
				'err',
				'Houve um erro ao finalizar a edição. Tente novamente.'
			);
			res.redirect('/admin/funcionarios');
		});
});

//Deletar funcionários
router.post('/funcionarios/deletar', adminCheck, (req, res) => {
	Funcionario.deleteOne({ _id: req.body.id })
		.then(() => {
			req.flash('suc', 'Funcionário deletado!');
			res.redirect('/admin/funcionarios');
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/admin/funcionarios');
		});
});

//ROTAS DE CLIENTES

//Listar clientes
router.get('/clientes', (req, res) => {
	Cliente.find().lean().sort({nome: 1}).then((clientes) => {
		res.render('admin/clientes', {clientes: clientes})
	})
})

//Editar clientes
router.post('/clientes/editar', (req, res) => {
	Cliente.findOne({_id: req.body.id}).lean().then((cliente) => {
		var cpf
		if(cliente.cpf.length == 14){
			var cpf = true
		} 
		res.render('admin/editarCliente', {cliente: cliente, cpf: cpf})
	})
})

router.post('/clientes/editarP', (req, res) => {
	Cliente.updateOne(
		{_id: req.body.id}, 
		{	
			nome: req.body.nome.trim(),
			cpf: req.body.cpf,
			endereco: req.body.endereco,
			dataNasc: converterData(
				req.body.dia,
				req.body.mes,
				req.body.ano
			),
			contato: {
				email: req.body.email,
				telefone: req.body.telefone 
			}
	}).then(() => {
		req.flash('suc', 'Dados editados com sucesso!')
		res.redirect('/admin/clientes')
	}).catch((err) => {
		req.flash('err', 'Houve um erro interno. Tente novamente.' + err)
		res.redirect('/admin/clientes')
	})
})

//Deletar clientes
router.post('/clientes/deletar', (req, res) => {
	Cliente.deleteOne({_id: req.body.id}).then(() => {
		req.flash('suc', 'Cliente deletado!')
		res.redirect('/admin/clientes')
	}).catch((err) => {
		req.flash('err', 'Houve um erro interno. Tente novamente.')
		res.redirect('/admin/clientes')
	})
})

//PRODUTOS E SERVIÇOS

//Nova Categoria
router.get('/prodServ/novaCategoria', (req, res) => {
	res.render('admin/cadastroCategoria');
});

router.post('/prodServ/novaCategoria', (req, res) => {
	Categoria.findOne({ nome: req.body.nome }).then((categoria) => {
		if (categoria) {
			req.flash('err', 'A categoria já existe!');
			res.redirect('/admin/prodServ/novaCategoria');
		} else {
			novaCategoria = {
				nome: req.body.nome,
			};

			new Categoria(novaCategoria)
				.save()
				.then(() => {
					req.flash('suc', 'Categoria criada!');
					res.redirect('/admin/prodServ/novaCategoria');
				})
				.catch((err) => {
					req.flash('err', 'Houve um erro interno. Tente novamente.');
					res.redirect('/admin/prodServ/novaCategoria');
				});
		}
	});
});

//Novo Produto
router.get('/prodServ/novoProduto', (req, res) => {
	Categoria.find()
		.lean()
		.then((categorias) => {
			res.render('admin/cadastroProduto', { categorias: categorias });
		});
});

router.post('/prodServ/novoProduto', (req, res) => {
	try {
		//Checa se é para criar uma nova categoria
		if (req.body.tipo == 'categNova') {
			//Checando se a categoria já existe
			Categoria.findOne({ nome: req.body.novaCategoria }).then(
				(categoria) => {
					if (categoria) {
						req.flash('err', 'A categoria já existe!');
						res.redirect('/admin/prodServ/novoProduto');
					} else {
						//Criando a categoria
						novaCategoria = {
							nome: req.body.novaCategoria,
						};
	
						new Categoria(novaCategoria)
							.save()
							.then(() => {
								Categoria.findOne({ nome: req.body.novaCategoria })
									.lean()
									.then((categoriaCriada) => {
										//Settando o produto que será criado
										var novoProduto = {
											categoria: categoriaCriada._id,
											descricao: req.body.descricao,
											marca: req.body.marca,
											modelo: req.body.modelo,
											quantidade: req.body.quantidade,
											valorUnit: req.body.valor,
										};
										new Produto(novoProduto)
											.save()
											.then(() => {
												req.flash(
													'suc',
													'Produto cadastrado!'
												);
												res.redirect(
													'/admin/prodServ/novoProduto'
												);
											})
									})
							})
					}
				}
			);
		}
	
		//Checa se é para criar um produto normalmente
		else if (req.body.tipo == 'categNormal') {
			var novoProduto = {
				categoria: req.body.categoria,
				descricao: req.body.descricao,
				marca: req.body.marca,
				modelo: req.body.modelo,
				quantidade: req.body.quantidade,
				valorUnit: req.body.valor,
			};
			new Produto(novoProduto)
				.save()
				.then(() => {
					req.flash('suc', 'Produto cadastrado!');
					res.redirect('/admin/prodServ/novoProduto');
				})
		}
	}
	catch(err) {
		req.flash('err', 'Houve um erro interno. Tente novamente.');
		res.redirect('/admin/prodServ/novoProduto');
	}
});

//Novo Serviço
router.get('/prodServ/novoServico', (req, res) => {
	Categoria.find()
		.lean()
		.then((categorias) => {
			res.render('admin/cadastroServico', { categorias: categorias });
		});
});

router.post('/prodServ/novoServico', (req, res) => {
	try {
		//Checa se é para criar uma nova categoria
		if (req.body.tipo == 'categNova') {
			//Checando se a categoria já existe
			Categoria.findOne({ nome: req.body.novaCategoria }).then(
				(categoria) => {
					if (categoria) {
						req.flash('err', 'A categoria já existe!');
						res.redirect('/admin/prodServ/novoServico');
					} else {
						//Criando a categoria
						novaCategoria = {
							nome: req.body.novaCategoria,
						};
	
						new Categoria(novaCategoria)
							.save()
							.then(() => {
								Categoria.findOne({ nome: req.body.novaCategoria })
									.lean()
									.then((categoriaCriada) => {
										//Settando o serviço que será criado
										var novoServico = {
											categoria: categoriaCriada._id,
											descricao: req.body.descricao,
											valor: req.body.valor,
										};
	
										new Servico(novoServico)
											.save()
											.then(() => {
												req.flash('suc', 'Serviço criado!');
												res.redirect(
													'/admin/prodServ/novoServico'
												);
											})
											
									})
							})
					}
				}
			);
		} else if (req.body.tipo == 'categNormal') {
			var novoServico = {
				categoria: req.body.categoria,
				descricao: req.body.descricao,
				valor: req.body.valor,
			};
	
			new Servico(novoServico)
				.save()
				.then(() => {
					req.flash('suc', 'Serviço criado!');
					res.redirect('/admin/prodServ/novoServico');
				})
		}

	}
	catch(err) {
		req.flash('err', 'Houve um erro interno. Tente novamente.');
		res.redirect('/admin/prodServ/novoServico');
	}
});

//Gerenciamento de estoque
router.get('/prodServ/estoque', (req, res) => {
	res.render('admin/estoqueIndex');
});

router.get('/prodServ/estoque/:tipo', (req, res) => {
	if (req.params.tipo == 'produtos') {
		Produto.find()
			.populate('categoria')
			.lean()
			.then((produtos) => {
				res.render('admin/estoque', { produtos: produtos });
			})
			.catch((err) => {
				req.flash('err', 'Houve um erro interno. Tente novamente.');
				res.redirect('/admin/prodServ/estoque');
			});
	} else if (req.params.tipo == 'servicos') {
		Servico.find()
			.populate('categoria')
			.lean()
			.then((servicos) => {
				res.render('admin/estoque', { servicos: servicos });
			})
			.catch((err) => {
				req.flash('err', 'Houve um erro interno. Tente novamente.');
				res.redirect('/admin/prodServ/estoque');
			});
	}
});

//Registro de aquisição
router.post('/prodServ/aquisicao', (req, res) => {
	res.render('admin/cadastroAquisicao', { id: req.body.id });
});

router.post('/prodServ/aquisicaoP', (req, res) => {
	const novaAquisicao = {
		valorCompra: req.body.valor,
		quantidadeCompra: req.body.quantidade,
		margemLucro: req.body.margemLucro,
		dataCompra: converterData(req.body.dia, req.body.mes, req.body.ano),
		produto: req.body.id,
	};

	new Aquisicao(novaAquisicao)
		.save()
		.then(() => {
			Produto.updateOne(
				{ _id: novaAquisicao.produto },
				{
					$inc: { quantidade: novaAquisicao.quantidadeCompra },
					$set: {
						valorUnit: calculoValorUnitario(
							novaAquisicao.quantidadeCompra,
							novaAquisicao.valorCompra,
							novaAquisicao.margemLucro
						),
					},
				}
			).then(() => {
				req.flash('suc', 'Aquisição registrada!');
				res.redirect('/admin/prodServ/estoque/produtos');
			});
		})
		.catch((err) => {
			console.log(err);
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/admin/prodServ/estoque/produtos');
		});
});

//Editar e deletar produtos
router.post('/prodServ/estoque/editarProduto', (req, res) => {
	Produto.findOne({ _id: req.body.id })
		.lean()
		.then((produto) => {
			Categoria.find()
				.lean()
				.then((categorias) => {
					res.render('admin/editarProduto', {
						produto: produto,
						categorias: categorias,
					});
				})
				.catch((err) => {
					req.flash('err', 'Houve um erro interno. Tente novamente.');
					res.redirect('/prodServ/estoque');
				});
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/admin/prodServ/estoque');
		});
});

router.post('/prodServ/estoque/editarProdutoP', (req, res) => {
	Produto.updateOne(
		{ _id: req.body.id },
		{
			categoria: req.body.categoria,
			descricao: req.body.descricao,
			marca: req.body.marca,
			modelo: req.body.modelo,
			quantidade: req.body.quantidade,
		}
	)
		.then(() => {
			req.flash('suc', 'Dados editados!');
			res.redirect('/admin/prodServ/estoque/produtos');
		})
		.catch((err) => {
			req.flash(
				'err',
				'Houve um erro ao registrar a edição. Tente novamente.'
			);
			res.redirect('/admin/prodServ/estoque/');
		});
});

router.post('/prodServ/estoque/deletarProduto', (req, res) => {
	Produto.deleteOne({ _id: req.body.id })
		.then(() => {
			req.flash('suc', 'Produto deletado!');
			res.redirect('/admin/prodServ/estoque/produtos');
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno');
			res.redirect('/admin/prodServ/estoque/');
		});
});

//Editar e deletar serviços
router.post('/prodServ/estoque/editarServico', (req, res) => {
	Servico.findOne({ _id: req.body.id })
		.lean()
		.then((servico) => {
			Categoria.find()
				.lean()
				.then((categorias) => {
					res.render('admin/editarServico', {
						servico: servico,
						categorias: categorias,
					});
				})
				.catch((err) => {
					req.flash('err', 'Houve um erro interno. Tente novamente.');
					res.redirect('/admin/prodServ/estoque/servicos');
				});
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/admin/prodServ/estoque/servicos');
		});
});

router.post('/prodServ/estoque/editarServicoP', (req, res) => {
	Servico.updateOne(
		{ _id: req.body.id },
		{
			categoria: req.body.categoria,
			descricao: req.body.descricao,
			valor: req.body.valor,
		}
	)
		.then(() => {
			req.flash('suc', 'Dados editados!');
			res.redirect('/admin/prodServ/estoque/servicos');
		})
		.catch((err) => {
			req.flash(
				'err',
				'Houve um erro ao salvar a edição. Tente novamente.'
			);
			res.redirect('/admin/prodServ/estoque/servicos');
		});
});

router.post('/prodServ/estoque/deletarServico', (req, res) => {
	Servico.deleteOne({ _id: req.body.id })
		.then(() => {
			req.flash('suc', 'Serviço deletado!');
			res.redirect('/admin/prodServ/estoque/servicos');
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/admin/prodServ/estoque/servicos');
		});
});

///Relatórios
router.get('/dashboard', adminCheck, async (req, res) => {
	//Gerar as vendas de todos os meses do ano
	var orcaments = await Orcamento.aggregate([
		{$match: 
			{
				statusAberto: false
			}
		},
		{$group: 
			{_id: 
				{data: "$data.dataSaida", 
				total: "$valorTotal"}
			}
		} 
	])
	
	var orcamentosAnoParcial = []
	for(i = 0; i < orcaments.length; i++) {
		if(orcaments[i]._id.data.getFullYear() == new Date().getFullYear()) {
			orcamentosAnoParcial.push(orcaments[i])
		}
	}

	var orcamentosAno = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	for(orc of orcamentosAnoParcial) {
		orcamentosAno[orc._id.data.getMonth()] += orc._id.total
	}

	//Buscar orçamentos para produtos mais vendidos, produtividade e clientes mais presentes
	var orcamentos = await Orcamento.aggregate([
		{$match: 
			{'data.dataSaida': {$gte: gerarData()}, 
			statusAberto: false}
		},
		{$group: 
			{_id: 
				{produtos: '$produtos',
				servicos: '$servicos',
				cliente: '$cliente'}
			}
		}
	])

	//Determinar os produtos mais vendidos
	var prodParcial = []

	for(orc of orcamentos) {
		if (orc._id.produtos != []) {
			for(prod of orc._id.produtos){
				var contador = 0
				while(contador < prod.quantidade){
					prodParcial.push(prod.codigo)
					contador++
				}
			}
		}
	}
	prodParcial.sort((a, b) => a - b)

	var produtos = []
	total = 1
	for(u = 0; u < prodParcial.length; u++){
		if (u < prodParcial.length - 1 && prodParcial[u] == prodParcial[u + 1]) {
			total++;
		} else {
			produtos.push({ codigo: prodParcial[u], quant: total });
			total = 1;
		}
	}

	produtos.sort((a, b) => {
		if(a.quant > b.quant){
			return -1
		}
	})

	produtos = produtos.splice(0, 5)
	
	var prodFinal = []
	for(e = 0; e < produtos.length; e++){
		var produt = await Produto.findOne({codigo: produtos[e].codigo})
		.select('descricao valorUnit')
		.lean()
		
		produt['codigo'] = produtos[e].codigo
		produt['quant'] = produtos[e].quant
		produt['valorTotal'] = (produtos[e].quant * produt.valorUnit)
		prodFinal.push(produt)
	}

	//Determinar funcionários mais produtivos
	var funcParcial = []
	
	for(orc of orcamentos) {
		if (orc._id.servicos != []){
			for(servico of orc._id.servicos) {
				funcParcial.push(servico.nomeFunc)
			}
		}
	}

	funcParcial.sort((a, b) => {
		if(a < b) { return -1 }
		if(a > b) { return 1 }
	})

	var funcionarios = []
	total = 1
	for(g = 0; g < funcParcial.length; g++){
		if (g < funcParcial.length - 1 && funcParcial[g] == funcParcial[g + 1]) {
			total++;
		} else {
			funcionarios.push({ nome: funcParcial[g], servicos: total });
			total = 1;
		}
	}

	funcionarios.sort((a, b) => {
		if(a.servicos < b.servicos) { return 1 }
		if(a.servicos > b.servicos) { return -1 }
	})

	funcionarios = funcionarios.splice(0, 5)

	//Determinar clientes mais presentes
	cliParcial = []
	for(orc of orcamentos) {
		cliParcial.push(orc._id.cliente)
	}

	cliParcial.sort((a, b) => {
		if(a < b) { return -1 }
		if(a > b) { return 1 }
	})

	var clientes = []
	total = 1
	for(q = 0; q < cliParcial.length; q++){
		if (q < cliParcial.length - 1 && cliParcial[q].equals(cliParcial[q + 1])) {
			total++;
		} else {
			clientes.push({ id: cliParcial[q], compras: total });
			total = 1;
		}
	}
	
	clientes.sort((a, b) => {
		if(a.compras < b.compras) { return 1 }
		if(a.compras > b.compras) { return -1 }
	})
	
	clientes = clientes.splice(0, 5)
	
	var cliFinal = []
	for(p = 0; p < clientes.length; p++){
		var client = await Cliente.findOne({_id: clientes[p].id})
		.select('nome')
		.lean()

		client ['compras'] = clientes[p].compras
		cliFinal.push(client)
	}

	//Média da idade dos clientes
	var Clientes = await Cliente.find().select('dataNasc').lean()
	var idade = 0
	for(l = 0; l < Clientes.length; l++){
		idade += gerarIdade(Clientes[l].dataNasc.getFullYear())
	}
	idade = (idade/Clientes.length).toFixed(0)
	
	//Renderizar página
	res.render('admin/dashboard'), {
		orcamentosAno: orcamentosAno, //não funciona
		prodFinal: prodFinal,
		funcionarios: funcionarios,
		cliFinal: cliFinal,
		idadeMedia: idade
	};
});

module.exports = router;
