const passport = require('passport')
const LocalStrategy  = require('passport-local').Strategy
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcrypt')

module.exports = (passport) => {
    passport.use(new LocalStrategy((username, password, done) => {
        Usuario.findOne({email: username}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: 'Usuário inexistente'})
            }

            bcrypt.compare(password, usuario.senha, (err, igual) => {
                if(igual){
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: 'Senha incorreta'})
                }
            })
        }).catch((err) => {
            console.log(err)
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario._id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}