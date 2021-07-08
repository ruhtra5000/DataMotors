// Carregando módulos
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('./config/autenticacao')(passport);

//Rotas
const admin = require('./routes/admin');
const usuario = require('./routes/usuario');
const cadastroGeral = require('./routes/cadastroGeral');

// Configurações
// Sessão
app.use(
	session({
		secret: 'DataMotors248++',
		resave: true,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Middleware
app.use((req, res, next) => {
	res.locals.err = req.flash('err');
	res.locals.suc = req.flash('suc');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});
// Handlebars (Template Engine)
app.engine(
	'handlebars',
	handlebars({
		defaultLayout: 'main',
		helpers: {
			getDia: (Data) => {
				var data = new Date(Data).toISOString();
				data = data.split('-');
				data2 = data[2].split('T'); // 0- dia, 1- resto
				return data2[0];
			},
			getMes: (Data) => {
				var data = new Date(Data).toISOString();
				data = data.split('-'); // 0- ano, 1- mes, 2- resto
				return data[1];
			},
			getAno: (Data) => {
				var data = new Date(Data).toISOString();
				data = data.split('-'); // 0- ano, 1- mes, 2- resto
				return data[0];
			},
		},
	})
);
app.set('view engine', 'handlebars');
// Express (onde se encontrava o BodyParser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Mongoose
mongoose.Promise = global.Promise;
mongoose
	.connect('mongodb://localhost/DMdb', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Banco de dados conectado!');
	})
	.catch((err) => {
		console.log(
			'Houve um erro ao realizar a conexão com o banco de dados: ' + err
		);
	});
// Public
app.use(express.static(path.join(__dirname + '/public')));

// Rotas
app.use('/admin', admin);
app.use('/usuario', usuario);
app.use('/cadastroGeral', cadastroGeral);

app.get('/', (req, res) => {
	if(req.user == null){
		res.redirect('/usuario/login')
	} else { 
		res.render('index');
	}
});

// Outros
const porta = 1881;
if (require.main === module){
	app.listen(porta, () => {
		console.log('Servidor rodando na URL http://localhost:1881');
	});
}

module.exports = app
