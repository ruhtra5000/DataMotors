const test = require('tape')
const supertest = require('supertest')
const app = require('../DataMotors')

console.log('Testando as principais rotas do programa')

test('Get /', (t) => {
    supertest(app).get('/')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect(302)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test('Get /usuario/login', (t) => {
    supertest(app).get('/usuario/login')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test('Get /cadastroGeral/', (t) => {
    supertest(app).get('/cadastroGeral/')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})

test('Get /admin/', (t) => {
    supertest(app).get('/admin/')
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect(302)
    .end((err, res) => {
        t.error(err, 'Sem erros')
        t.end()
    })
})