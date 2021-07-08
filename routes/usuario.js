// Modulos
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');

require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

const { checarEmail } = require('../helpers/checarEmail');

//Rotas
router.get('/login', (req, res) => {
	res.render('login/login');
});

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/usuario/login',
		failureFlash: true,
		failureMessage: 'Erro de autenticação. Cheque os campos.',
	})
);

router.get('/registro', (req, res) => {
	res.render('login/registro');
});

router.post('/registro', (req, res) => {
	Usuario.findOne({ email: req.body.email })
		.lean()
		.then((usuario) => {
			if (usuario) {
				req.flash(
					'err',
					'Este e-mail já está sendo utilizado por outra conta.'
				);
				res.redirect('/usuario/registro');
			}
		})
		.catch((err) => {
			req.flash('err', 'Ocorreu um erro interno. Tente novamente.');
			res.redirect('/usuario/registro');
		});
	if (
		!req.body.nome ||
		typeof req.body.nome == undefined ||
		req.body.nome == null ||
		!req.body.email ||
		typeof req.body.email == undefined ||
		req.body.email == null ||
		!req.body.senha ||
		typeof req.body.senha == undefined ||
		req.body.senha == null
	) {
		req.flash('err', 'Algum campo não foi preenchido.');
		res.redirect('/usuario/registro');
	}
	if (checarEmail(req.body.email) == false) {
		req.flash('err', 'E-mail inválido.');
		res.redirect('/usuario/registro');
	}
	if (req.body.senha.length < 5) {
		req.flash('err', 'A senha tem poucos caracteres.');
		res.redirect('/usuario/registro');
	}
	if (req.body.senha != req.body.senha2) {
		req.flash('err', 'As senhas digitadas não coincidem.');
		res.redirect('/usuario/registro');
	} else {
		var NewUsuario = new Usuario({
			nome: req.body.nome,
			email: req.body.email,
			senha: req.body.senha,
		});

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(NewUsuario.senha, salt, (err, hash) => {
				if (err) {
					req.flash(
						'err',
						'Houve um erro na criação de um novo usuário. Tente novamente.'
					);
					res.redirect('/usuario/registro');
				} else {
					NewUsuario.senha = hash;
					NewUsuario.save()
						.then(() => {
							req.flash('suc', 'Usuário cadastrado!');
							res.redirect('/usuario/login');
						})
						.catch((err) => {
							req.flash(
								'err',
								'Houve um erro ao salvar o novo usuário. Tente novamente.'
							);
							res.redirect('/usuario/registro');
						});
				}
			});
		});
	}
});

router.get('/logout', (req, res) => {
	req.logOut();
	req.flash('suc', 'Logout realizado!');
	res.redirect('/usuario/login');
});

module.exports = router;
