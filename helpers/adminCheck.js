module.exports = {
    adminCheck: (req, res, next) => {
        if(req.isAuthenticated() && req.user.admin == true){
            return next()
        }
        req.flash('err', 'Você precisa ser um administrador para ter acesso a esta página!')
        res.redirect('/')
    }
}