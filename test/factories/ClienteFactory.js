import { connection } from '../../src/configs/Database.js';

export class ClienteFactory {
    static async create(nome, CPF, CEP, logradouro, bairro, cidade, UF, numero, complemento) {
        const [result] = await connection.execute(
            `INSERT INTO clientes (nome, CPF, CEP, logradouro, bairro, cidade, UF, numero, complemento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [ nome, CPF, CEP, logradouro, bairro, cidade, UF, numero, complemento ]
        )

        return {
            id: result.insertId,
            nome,
            CPF,
            CEP,
            logradouro,
            bairro,
            cidade,
            UF,
            numero,
            complemento
        };
    }
    
    static async atualizar(id, nome, CPF, CEP, logradouro, bairro, cidade, UF, numero, complemento) {
        const [result] = await connection.execute(
            `UPDATE clientes SET nome = ?, CPF = ?, CEP = ?, logradouro = ?, bairro = ?, cidade = ?, UF = ?, numero = ?, complemento = ? WHERE id = ?;`,
            [ nome, CPF, CEP, logradouro, bairro, cidade, UF, numero, complemento, id ]
        )
        
        return {
            id,
            nome,
            CPF,
            CEP,
            logradouro,
            bairro,
            cidade,
            UF,
            numero,
            complemento
        };

    }

    static async deletar(id) {
        const [result] = await connection.execute(
            `DELETE FROM clientes WHERE id = ?;`,
            [id]
        )   

        return { id };
    }

    static async selecionar() {
        const [result] = await connection.execute(
            `SELECT * FROM clientes;`
        )

        return result;
    }

}