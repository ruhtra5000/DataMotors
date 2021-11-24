const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

require('../models/Orcamento');
const Orcamento = mongoose.model('orcamentos');
require('../models/Cliente');
const Cliente = mongoose.model('clientes');
require('../models/Funcionario');
const Funcionario = mongoose.model('funcionarios');
require('../models/Produto');
const Produto = mongoose.model('produtos');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

const { converterData } = require('../helpers/converterData');

router.get('/', (req, res) => {
	Orcamento.find({ statusAberto: true })
		.lean()
		.then((orcamentos) => {
			res.render('orcamento/index', {
				orcamentos: orcamentos,
			});
		});
});

router.get('/novo', (req, res) => {
	//Realiza a busca de clientes
	Cliente.find()
		.select('nome')
		.then((clientes) => {
			//Realiza a busca de funcionários
			Funcionario.find()
				.select('nome')
				.then((funcionarios) => {
					//Realiza a busca de produtos
					Produto.find()
						.select('codigo descricao quantidade valorUnit')
						.lean()
						.then((produtos) => {
							Produto.find()
								.select('codigo valorUnit quantidade')
								.then((produtos2) => {
									res.render('orcamento/cadOrcamento', {
										userNome: req.user.nome,
										clientes: JSON.stringify(clientes),
										funcionarios:
											JSON.stringify(funcionarios),
										produtos: produtos,
										produtos2: JSON.stringify(produtos2),
									});
								})
								.catch((err) => {
									req.flash(
										'err',
										'Houve um erro interno. Tente novamente.'
									);
									res.redirect('/');
								});
						})
						.catch((err) => {
							req.flash(
								'err',
								'Houve um erro interno. Tente novamente.'
							);
							res.redirect('/');
						});
				})
				.catch((err) => {
					req.flash('err', 'Houve um erro interno. Tente novamente.');
					res.redirect('/');
				});
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/');
		});
});

router.post('/novo', (req, res) => {
	Cliente.findOne({ nome: req.body.cliente })
		.then((cliente) => {
			var valorTotal = 0;

			//Somar valor dos serviços
			if (req.body.arrayServicos != '') {
				var servicos = JSON.parse(req.body.arrayServicos);
				for (servico of servicos) {
					valorTotal += Number(servico.preco);
				}
			}

			//Somar valor dos produtos
			if (req.body.arrayProdutos != '') {
				var produtos = JSON.parse(req.body.arrayProdutos);
				for (produto of produtos) {
					valorTotal +=
						Number(produto.valorUnit) * Number(produto.quantidade);
				}
			}

			//Definir se o orçamento ficará aberto ou fechado
			var status = true;
			if (req.body.status == 'false') {
				status = false;
			}

			//Criação do novo orçamento
			var newOrcamento = {
				responsavel: req.user._id,
				descricao: req.body.descricao,
				cliente: cliente._id,
				data: {
					dataEntrada: converterData(
						req.body.diaEntrada,
						req.body.mesEntrada,
						req.body.anoEntrada
					),
					dataSaida: converterData(
						req.body.diaSaida,
						req.body.mesSaida,
						req.body.anoSaida
					),
				},
				produtos: produtos,
				servicos: servicos,
				valorTotal: valorTotal,
				statusAberto: status,
			};

			new Orcamento(newOrcamento)
				.save()
				.then(() => {
					if (req.body.arrayProdutos != '') {
						for (produto of produtos) {
							Produto.updateOne(
								{ codigo: produto.codigo },
								{
									$inc: {
										quantidade: produto.quantidade * -1,
									},
								}
							)
								.then(() => {
									req.flash(
										'suc',
										'Orçamento salvo com sucesso!'
									);
									res.redirect('/orcamento');
								})
								.catch((err) => {
									req.flash(
										'err',
										'Houve um erro interno. Tente novamente.'
									);
									res.redirect('/orcamento');
								});
						}
					} else {
						req.flash('suc', 'Orçamento salvo com sucesso!');
						res.redirect('/orcamento');
					}
				})
				.catch((err) => {
					req.flash(
						'err',
						'Houve um erro interno ao salvar2. Tente novamente.' +
							err
					);
					res.redirect('/orcamento');
				});
		})
		.catch((err) => {
			req.flash(
				'err',
				'Houve um erro interno ao salvar. Tente novamente. ' + err
			);
			res.redirect('/orcamento');
		});
});

router.post('/editar', (req, res) => {
	//Realiza a busca do orçamento
	Orcamento.findOne({ _id: req.body.id })
		.select('produtos servicos descricao data cliente responsavel')
		.lean()
		.then((orcamento) => {
			//Realiza a busca de funcionários
			Funcionario.find()
				.select('nome')
				.then((funcionarios) => {
					//Realiza a busca de produtos
					Produto.find()
						.select('codigo descricao quantidade valorUnit')
						.lean()
						.then((produtos) => {
							Produto.find()
								.select('codigo valorUnit quantidade')
								.then((produtos2) => {
									//Realiza a busca do cliente
									Cliente.find()
										.select('nome')
										.then((clientes) => {
											Cliente.findOne({
												_id: orcamento.cliente,
											})
												.select('nome')
												.lean()
												.then((cliente) => {
													//Realiza a busca do responsável pelo orçamento
													Usuario.findOne({
														_id: orcamento.responsavel,
													})
														.select('nome')
														.lean()
														.then((usuario) => {
															res.render(
																'orcamento/editarOrcamento',
																{
																	orcamento:
																		orcamento,
																	clientes:
																		JSON.stringify(
																			clientes
																		),
																	cliente:
																		cliente,
																	usuario:
																		usuario,
																	funcionarios:
																		JSON.stringify(
																			funcionarios
																		),
																	produtos:
																		produtos,
																	produtos2:
																		JSON.stringify(
																			produtos2
																		),
																}
															);
														})
														.catch((err) => {
															req.flash(
																'err',
																'Houve um erro interno. Tente novamente.'
															);
															res.redirect(
																'/orcamento'
															);
														});
												})
												.catch((err) => {
													req.flash(
														'err',
														'Houve um erro interno. Tente novamente.'
													);
													res.redirect('/orcamento');
												});
										})
										.catch((err) => {
											req.flash(
												'err',
												'Houve um erro interno. Tente novamente.'
											);
											res.redirect('/orcamento');
										});
								})
								.catch((err) => {
									req.flash(
										'err',
										'Houve um erro interno. Tente novamente.'
									);
									res.redirect('/orcamento');
								});
						})
						.catch((err) => {
							req.flash(
								'err',
								'Houve um erro interno. Tente novamente.'
							);
							res.redirect('/orcamento');
						});
				})
				.catch((err) => {
					req.flash('err', 'Houve um erro interno. Tente novamente.');
					res.redirect('/orcamento');
				});
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/orcamento');
		});
});

router.post('/editarP', (req, res) => {
	Orcamento.findOne({ _id: req.body.id })
		.lean()
		.then((orcamento) => {
			Cliente.findOne({ nome: req.body.cliente })
				.then((cliente) => {
					var valorTotal = orcamento.valorTotal;
					var servicosSalvos = orcamento.servicos;
					var produtosSalvos = orcamento.produtos;

					//Somar valor dos serviços e adicionar novos serviços
					if (req.body.arrayServicos != '') {
						var servicos = JSON.parse(req.body.arrayServicos);
						for (servico of servicos) {
							valorTotal += Number(servico.preco);
							servicosSalvos.push(servico);
						}
					}

					//Somar valor dos produtos e adicionar novos produtos
					if (req.body.arrayProdutos != '') {
						var produtos = JSON.parse(req.body.arrayProdutos);
						for (produto of produtos) {
							valorTotal +=
								Number(produto.valorUnit) *
								Number(produto.quantidade);
							produtosSalvos.push(produto);
						}
					}

					//Definir se o orçamento ficará aberto ou fechado
					var status = true;
					if (req.body.status == 'false') {
						status = false;
					}

					Orcamento.updateOne(
						{ _id: req.body.id },
						{
							$set: {
								descricao: req.body.descricao,
								cliente: cliente._id,
								data: {
									dataEntrada: converterData(
										req.body.diaEntrada,
										req.body.mesEntrada,
										req.body.anoEntrada
									),
									dataSaida: converterData(
										req.body.diaSaida,
										req.body.mesSaida,
										req.body.anoSaida
									),
								},
								produtos: produtosSalvos,
								servicos: servicosSalvos,
								valorTotal: valorTotal,
								statusAberto: status,
							},
						}
					)
						.then(() => {
							if (req.body.arrayProdutos != '') {
								for (produto of produtos) {
									Produto.updateOne(
										{ codigo: produto.codigo },
										{
											$inc: {
												quantidade:
													produto.quantidade * -1,
											},
										}
									)
										.then(() => {
											req.flash(
												'suc',
												'Orçamento editado com sucesso!'
											);
											res.redirect('/orcamento');
										})
										.catch((err) => {
											req.flash(
												'err',
												'Houve um erro interno. Tente novamente.' +
													err
											);
											res.redirect('/orcamento');
										});
								}
							} else {
								req.flash(
									'suc',
									'Orçamento editado com sucesso!'
								);
								res.redirect('/orcamento');
							}
						})
						.catch((err) => {
							req.flash(
								'err',
								'Houve um erro interno. Tente novamente.' + err
							);
							res.redirect('/orcamento');
						});
				})
				.catch((err) => {
					req.flash(
						'err',
						'Houve um erro interno. Tente novamente.' + err
					);
					res.redirect('/orcamento');
				});
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.' + err);
			res.redirect('/orcamento');
		});
});

module.exports = router;
