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

const { converterData } = require('../helpers/converterData');
const { adminCheck } = require('../helpers/adminCheck');
const { calculoValorUnitario } = require('../helpers/calculoValorUnitario');

//ROTAS RELACIONADAS AOS FUNCIONARIOS

router.get('/funcionarios', adminCheck, (req, res) => {
	Funcionario.find()
		.lean()
		.then((funcionarios) => {
			res.render('admin/funcionarios', { funcionarios: funcionarios });
		});
});

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
			nome: req.body.nome,
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

//PRODUTOS E SERVIÇOS

//Nova Categoria
router.get('/prodServ/novaCategoria', adminCheck, (req, res) => {
	res.render('admin/cadastroCategoria');
});

router.post('/prodServ/novaCategoria', adminCheck, (req, res) => {
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
router.get('/prodServ/novoProduto', adminCheck, (req, res) => {
	Categoria.find()
		.lean()
		.then((categorias) => {
			res.render('admin/cadastroProduto', { categorias: categorias });
		});
});

router.post('/prodServ/novoProduto', adminCheck, (req, res) => {
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
										.catch((err) => {
											console.log(err);
											req.flash(
												'err',
												'Houve um erro interno. Tente novamente.'
											);
											res.redirect(
												'/admin/prodServ/novoProduto'
											);
										});
								})
								.catch((err) => {
									console.log(err);
									req.flash(
										'err',
										'Houve um erro interno. Tente novamente.'
									);
									res.redirect('/admin/prodServ/novoProduto');
								});
						})
						.catch((err) => {
							console.log(err);
							req.flash(
								'err',
								'Houve um erro interno. Tente novamente.'
							);
							res.redirect('/admin/prodServ/novoProduto');
						});
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
			.catch((err) => {
				console.log(err);
				req.flash('err', 'Houve um erro interno. Tente novamente.');
				res.redirect('/admin/prodServ/novoProduto');
			});
	}
});

//Novo Serviço
router.get('/prodServ/novoServico', adminCheck, (req, res) => {
	Categoria.find()
		.lean()
		.then((categorias) => {
			res.render('admin/cadastroServico', { categorias: categorias });
		});
});

router.post('/prodServ/novoServico', adminCheck, (req, res) => {
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
										.catch((err) => {
											req.flash(
												'err',
												'Houve um erro interno. Tente novamente.'
											);
											res.redirect(
												'/admin/prodServ/novoServico'
											);
										});
								})
								.catch((err) => {
									console.log(err);
									req.flash(
										'err',
										'Houve um erro interno. Tente novamente.'
									);
									res.redirect('/admin/prodServ/novoServico');
								});
						})
						.catch((err) => {
							console.log(err);
							req.flash(
								'err',
								'Houve um erro interno. Tente novamente.'
							);
							res.redirect('/admin/prodServ/novoServico');
						});
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
			.catch((err) => {
				req.flash('err', 'Houve um erro interno. Tente novamente.');
				res.redirect('/admin/prodServ/novoServico');
			});
	}
});

//Gerenciamento de estoque
router.get('/prodServ/estoque', adminCheck, (req, res) => {
	res.render('admin/estoqueIndex');
});

router.get('/prodServ/estoque/:tipo', adminCheck, (req, res) => {
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
router.post('/prodServ/aquisicao', adminCheck, (req, res) => {
	res.render('admin/cadastroAquisicao', { id: req.body.id });
});

router.post('/prodServ/aquisicaoP', adminCheck, (req, res) => {
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
router.post('/prodServ/estoque/editarProduto', adminCheck, (req, res) => {
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

router.post('/prodServ/estoque/editarProdutoP', adminCheck, (req, res) => {
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

router.post('/prodServ/estoque/deletarProduto', adminCheck, (req, res) => {
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
router.post('/prodServ/estoque/editarServico', adminCheck, (req, res) => {
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

router.post('/prodServ/estoque/editarServicoP', adminCheck, (req, res) => {
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

router.post('/prodServ/estoque/deletarServico', adminCheck, (req, res) => {
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

///Relatórios e previsões
router.get('/dashboard/', adminCheck, (req, res) => {
	res.render('admin/dashboard');
});

module.exports = router;
