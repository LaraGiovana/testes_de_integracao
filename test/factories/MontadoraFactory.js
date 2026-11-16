import { connection } from "../../src/configs/Database.js"

export class MontadoraFactory {
    static async create (nome, pais) {
        const [result] = await connection.execute(
            `INSERT INTO montadoras (nome, pais) VALUES (?,?);`,
             [nome, pais]
        )

        return {
            id: result.insertId,
            nome,
            pais
        }
    }

    static async atualizar (id, nome, pais) {
        const [result] = await connection.execute(
            `UPDATE montadoras SET nome = ?, pais = ? WHERE id = ?;`,
            [nome, pais, id]
        )   
        return {
            id,
            nome,
            pais 
                }
        }

        static async deletar (id) {
            const [result] = await connection.execute(
                `DELETE FROM montadoras WHERE id = ?;`,
                [id]
            )

            return { id };
        }
}

