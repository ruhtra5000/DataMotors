const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

require('../models/Cliente');
const Cliente = mongoose.model('clientes');
require('../models/Funcionario');
const Funcionario = mongoose.model('funcionarios');

const { converterData } = require('../helpers/converterData');
const { TestaCPF } = require('../helpers/testarCPF');

router.get('/cliente', (req, res) => {
	res.render('cadastroGeral/clienteCad');
});

router.get('/func', (req, res) => {
	res.render('cadastroGeral/funcCad')
})

router.post('/cliente', (req, res) => {
	Cliente.findOne({ cpf: req.body.cpf })
		.then((cliente) => {
			if (cliente) {
				req.flash('err', 'Este cliente já foi cadastrado.');
				res.redirect('/cadastroGeral');
			} else if (TestaCPF(req.body.cpf) == false) {
				req.flash('err', 'CPF inválido.');
				res.redirect('/cadastroGeral');
			} else {
				const newCliente = {
					nome: req.body.nome,
					cpf: req.body.cpf,
					endereco: req.body.endereco,
					dataNasc: converterData(
						req.body.dia,
						req.body.mes,
						req.body.ano
					),
					contato: {
						email: req.body.email,
						telefone: req.body.telefone,
					},
				};

				new Cliente(newCliente)
					.save()
					.then(() => {
						req.flash('suc', 'Cliente cadastrado!');
						res.redirect('/cadastroGeral');
					})
					.catch((err) => {
						req.flash(
							'err',
							'Houve um erro ao finalizar o cadastro. Tente novamente.'
						);
						console.log(err);
						res.redirect('/cadastroGeral');
					});
			}
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/cadastroGeral');
		});
});

router.post('/funcionario', (req, res) => {
	Funcionario.findOne({ cpf: req.body.cpf }).then((funcionario) => {
		if (funcionario) {
			req.flash('err', 'Este funcionário já está cadastrado.');
			res.redirect('/cadastroGeral');
		}

		//Verifica CPF
		if (TestaCPF(req.body.cpf) == false) {
			req.flash('err', 'CPF inválido.');
			res.redirect('/cadastroGeral');
		} else {
			const newFunc = {
				nome: req.body.nome,
				cpf: req.body.cpf,
				dataNasc: converterData(
					req.body.dia,
					req.body.mes,
					req.body.ano
				),
				contato: {
					email: req.body.email,
					telefone: req.body.telefone,
				},
			};

			new Funcionario(newFunc)
				.save()
				.then(() => {
					req.flash('suc', 'Funcionário cadastrado!');
					res.redirect('/cadastroGeral');
				})
				.catch((err) => {
					console.log(err);
					req.flash(
						'err',
						'Houve um erro ao finalizar o cadastro. Tente novamente.'
					);
					res.redirect('/cadastroGeral');
				});
		}
	});
});

module.exports = router;
