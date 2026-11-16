import app from '../src/app.js';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearDatabase } from './utils/clearDatabase.js';
import { MontadoraFactory } from './factories/MontadoraFactory.js';
import { ClienteFactory } from './factories/ClienteFactory.js';
import { consultarCep } from '../src/utils/consultarCep.js';

vi.mock('../src/utils/consultarCep.js', () => ({ consultarCep: vi.fn() }));

const cepMock = vi.mocked(consultarCep);

const CLIENTE = {
    nome: 'Ana Silva',
    cpf: '111.444.777-35',
    cep: '13185-880',
    numero: '123',
    complemento: 'Casa'
};

const VEICULO = {
    modelo: 'Corolla',
    placa: 'ABC1D23',
    ano: 2020,
    cor: 'Prata',
    valor: 90000
};

beforeEach(() => {
    cepMock.mockImplementation(async (cep) => {
        const cepLimpo = String(cep ?? '').replace(/\D+/g, '');
        if (cepLimpo !== '13185880') throw new Error('CEP inválido');

        return {
            cep: cepLimpo,
            logradouro: 'Rua das Acácias',
            bairro: 'Centro',
            cidade: 'Campinas',
            uf: 'SP'
        };
    });
});

afterEach(clearDatabase);

describe('API de montadoras', () => {
    it('deve executar o CRUD completo', async () => {
        const criada = await request(app)
            .post('/montadoras')
            .send({ nome: 'Toyota', pais: 'Japão' });

        expect(criada.status).toBe(201);
        const id = criada.body.data.insertId;

        const listadas = await request(app).get('/montadoras');
        expect(listadas.status).toBe(200);
        expect(listadas.body.data).toEqual(
            expect.arrayContaining([expect.objectContaining({ Id: id, Nome: 'Toyota' })])
        );

        const atualizada = await request(app)
            .put(`/montadoras?id=${id}`)
            .send({ nome: 'Toyota Motors', pais: 'Japão' });

        expect(atualizada.status).toBe(200);
        expect(atualizada.body.data.affectedRows).toBe(1);

        const removida = await request(app).delete(`/montadoras/${id}`);
        expect(removida.status).toBe(200);
        expect((await request(app).get('/montadoras')).body.data).toHaveLength(0);
    });

    it('deve validar os dados e tratar registro inexistente', async () => {
        const invalida = await request(app)
            .post('/montadoras')
            .send({ nome: '', pais: 'Japão' });

        expect(invalida.status).toBe(500);
        expect(invalida.body.error).toBe('Nome inválido');

        const inexistente = await request(app)
            .put('/montadoras?id=999999')
            .send({ nome: 'Ford', pais: 'EUA' });

        expect(inexistente.status).toBe(404);
        expect((await request(app).delete('/montadoras/999999')).status).toBe(404);
    });
});

describe('API de clientes', () => {
    it('deve executar o CRUD completo', async () => {
        const criado = await request(app).post('/clientes').send(CLIENTE);

        expect(criado.status).toBe(201);
        expect(cepMock).toHaveBeenCalledWith('13185-880');
        const id = criado.body.data.insertId;

        const listados = await request(app).get('/clientes');
        expect(listados.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ Id: id, Nome: 'Ana Silva', CPF: '11144477735', CEP: '13185880' })
            ])
        );

        const atualizado = await request(app)
            .put(`/clientes?id=${id}`)
            .send({ ...CLIENTE, nome: 'Ana Silva Santos', numero: '999' });

        expect(atualizado.status).toBe(200);
        expect(atualizado.body.data.affectedRows).toBe(1);

        const removido = await request(app).delete(`/clientes/${id}`);
        expect(removido.status).toBe(200);
        expect((await request(app).get('/clientes')).body.data).toHaveLength(0);
    });

    it('deve rejeitar CEP e dados inválidos', async () => {
        const cepInvalido = await request(app)
            .post('/clientes')
            .send({ ...CLIENTE, cep: '123' });

        expect(cepInvalido.status).toBe(500);
        expect(cepInvalido.body.error).toBe('CEP inválido');

        const nomeInvalido = await request(app)
            .post('/clientes')
            .send({ ...CLIENTE, nome: '' });

        expect(nomeInvalido.status).toBe(500);
        expect(nomeInvalido.body.error).toBe('Nome inválido');
    });
});

describe('API de veículos', () => {
    let montadora;
    let cliente;

    beforeEach(async () => {
        montadora = await MontadoraFactory.create('Toyota', 'Japão');
        cliente = await ClienteFactory.create(
            'Ana Silva', '11144477735', '13185880', 'Rua das Acácias',
            'Centro', 'Campinas', 'SP', '123', null
        );
    });

    it('deve executar o CRUD completo', async () => {
        const criado = await request(app)
            .post('/veiculos')
            .send({ idMontadora: montadora.id, idCliente: cliente.id, ...VEICULO });

        expect(criado.status).toBe(201);
        const id = criado.body.data.insertId;

        const listados = await request(app).get('/veiculos');
        expect(listados.status).toBe(200);
        expect(listados.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ Id: id, Montadora: 'Toyota', Cliente: 'Ana Silva', Modelo: 'Corolla' })
            ])
        );

        const atualizado = await request(app)
            .put(`/veiculos?id=${id}`)
            .send({ idMontadora: montadora.id, idCliente: cliente.id, ...VEICULO, modelo: 'Corolla XEI' });

        expect(atualizado.status).toBe(200);
        expect(atualizado.body.data.affectedRows).toBe(1);

        const removido = await request(app).delete(`/veiculos/${id}`);
        expect(removido.status).toBe(200);
        expect((await request(app).get('/veiculos')).body.data).toHaveLength(0);
    });

    it('deve validar dados e chaves estrangeiras', async () => {
        const semMontadora = await request(app)
            .post('/veiculos')
            .send({ idCliente: cliente.id, ...VEICULO });

        expect(semMontadora.status).toBe(500);
        expect(semMontadora.body.error).toBe('ID da montadora inválido');

        const montadoraInexistente = await request(app)
            .post('/veiculos')
            .send({ idMontadora: 999999, idCliente: cliente.id, ...VEICULO });

        expect(montadoraInexistente.status).toBe(500);
        expect(montadoraInexistente.body).toHaveProperty('error');
    });
});
