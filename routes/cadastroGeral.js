const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

require('../models/Cliente');
const Cliente = mongoose.model('clientes');
require('../models/Funcionario');
const Funcionario = mongoose.model('funcionarios');

const { converterData } = require('../helpers/converterData');
const { TestaCPF } = require('../helpers/testarCPF');
const { TestaCNPJ } = require('../helpers/testarCPNJ');
const { adminCheck } = require('../helpers/adminCheck');

//Cadastro de clientes
router.get('/cliente', (req, res) => {
	res.render('cadastroGeral/clienteCad');
});

router.post('/cliente', (req, res) => {
	Cliente.findOne({ cpf: req.body.cpf })
		.then((cliente) => {
			if (cliente) {
				req.flash('err', 'Este cliente já foi cadastrado.');
				res.redirect('/cadastroGeral/cliente');
			} else if (
				TestaCPF(req.body.cpf) == false &&
				TestaCNPJ(req.body.cpf) == false
			) {
				req.flash('err', 'CPF/CNPJ inválido.');
				res.redirect('/cadastroGeral/cliente');
			} else {
				const newCliente = {
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
						telefone: req.body.telefone,
					},
				};

				new Cliente(newCliente)
					.save()
					.then(() => {
						req.flash('suc', 'Cliente cadastrado!');
						res.redirect('/cadastroGeral/cliente');
					})
					.catch((err) => {
						req.flash(
							'err',
							'Houve um erro ao finalizar o cadastro. Tente novamente.'
						);
						console.log(err);
						res.redirect('/cadastroGeral/cliente');
					});
			}
		})
		.catch((err) => {
			req.flash('err', 'Houve um erro interno. Tente novamente.');
			res.redirect('/cadastroGeral/cliente');
		});
});

//Cadastro de funcionários
router.get('/func', adminCheck, (req, res) => {
	res.render('cadastroGeral/funcCad');
});

router.post('/funcionario', adminCheck, (req, res) => {
	Funcionario.findOne({ cpf: req.body.cpf }).then((funcionario) => {
		if (funcionario) {
			req.flash('err', 'Este funcionário já está cadastrado.');
			res.redirect('/cadastroGeral/func');
		}

		//Verifica CPF
		if (TestaCPF(req.body.cpf) == false) {
			req.flash('err', 'CPF inválido.');
			res.redirect('/cadastroGeral/func');
		} else {
			const newFunc = {
				nome: req.body.nome.trim(),
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
					res.redirect('/cadastroGeral/func');
				})
				.catch((err) => {
					console.log(err);
					req.flash(
						'err',
						'Houve um erro ao finalizar o cadastro. Tente novamente.'
					);
					res.redirect('/cadastroGeral/func');
				});
		}
	});
});

module.exports = router;
