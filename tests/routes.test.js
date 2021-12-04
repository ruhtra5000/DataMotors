const test = require('tape')
const supertest = require('supertest')
const app = require('../DataMotors')

console.log('Testando as principais rotas do programa')

test ('Get /', (t) => {
    supertest(app).get('/usuario/login')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .auth('gui@mail.com', 'abc123')
    .expect(200)
    .end((err, res) => {
        if(res.statusCode == 200){
            t.error(err, 'Sem erros')
            t.end() 
        } else {
            t.error(err, 'Sem erros')
            t.end() 
        }
        
    })
})

test ('Get /usuario/login', (t) => {
    supertest(app).get('/usuario/login')
    .auth('gui@mail.com', 'abc123')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /admin/prodServ/estoque', (t) => {
    supertest(app).get('/admin/prodServ/estoque')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect(302)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /orcamento', (t) => {
    supertest(app).get('/orcamento/')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /admin/prodServ/novoProduto', (t) => {
    supertest(app).get('/admin/prodServ/novoProduto')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect(302)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /admin/prodServ/novoServico', (t) => {
    supertest(app).get('/admin/prodServ/novoServico')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect(302)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /admin/prodServ/novaCategoria', (t) => {
    supertest(app).get('/admin/prodServ/novaCategoria')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect(302)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /admin/funcionarios', (t) => {
    supertest(app).get('/admin/funcionarios')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect(302)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /cadastroGeral/cliente', (t) => {
    supertest(app).get('/cadastroGeral/cliente')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test ('Get /cadastroGeral/func', (t) => {
    supertest(app).get('/cadastroGeral/func')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})