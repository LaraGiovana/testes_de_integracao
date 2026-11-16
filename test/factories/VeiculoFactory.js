import { connection } from '../../src/configs/Database.js';

export class VeiculoFactory {
    static async create(idMontadora, idCliente, modelo, placa, ano, cor, valor) {
        const [result] = await connection.execute(
            `INSERT INTO veiculos (IdMontadora, IdCliente, Modelo, Placa, Ano, Cor, Valor)
            VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [ idMontadora, idCliente, modelo, placa, ano, cor, valor ]
        )

        return {
            id: result.insertId,
            idMontadora,
            idCliente,
            modelo,
            placa,
            ano,
            cor,
            valor
        };
    }

    static async atualizar(id, idMontadora, idCliente, modelo, placa, ano, cor, valor) {
        const [result] = await connection.execute(
            `UPDATE veiculos SET IdMontadora = ?, IdCliente = ?, Modelo = ?, Placa = ?, Ano = ?, Cor = ?, Valor = ? WHERE Id = ?;`,
            [ idMontadora, idCliente, modelo, placa, ano, cor, valor, id ]
        )

        return {
            id,
            idMontadora,
            idCliente,
            modelo,
            placa,
            ano,
            cor,
            valor
        };
    }

    static async deletar(id) {
        const [result] = await connection.execute(
            `DELETE FROM veiculos WHERE Id = ?;`,
            [id]
        )

        return { id };
    }

    static async selecionar() {
        const [result] = await connection.execute(
            `SELECT * FROM veiculos;`
        )

        return result;
    }
}
