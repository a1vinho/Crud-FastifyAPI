import { randomUUID } from "crypto";
export default function (fastify) {
    fastify.mysql.query(`CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(60) PRIMARY KEY UNIQUE,
        title VARCHAR(255) NOT NULL,
        done BOOLEAN NOT NULL,
        date VARCHAR(255) NOT NULL
    )`, function (err, row) {
        if (err) {
            return fastify.log.error(err);
        };

        console.log('Table created with sucess');
    });
    fastify.get('/tasks', {
        schema: {
            response: {
                200: {
                    type: "object",
                    required: ["tasks"],
                    properties: {
                        tasks: { type: "array" }
                    },
                    additionalProperties: false
                },
                404: {
                    type: "object",
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        }
    }, function (request, reply) {
        fastify.mysql.query(`SELECT * FROM tasks`, function (err, data) {
            if (err) {
                fastify.log.error(err);
                return reply.send(`Erro no servidor,tente novamente mais tarde.`);
            };
            if (data.length <= 0) {
                return reply.code(404).send({
                    error: "Nenhuma tarefa encontrada."
                });
            };
            return reply.send({
                tasks: data
            });
        });
    });
    fastify.post('/create', {
        schema: {
            body: {
                type: "object",
                required: ["title", "description"],
                properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                },
                additionalProperties: false
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    }
                }
            }
        }
    }, function (request, reply) {
        const { title, description } = request.body;

        fastify.mysql.query(`INSERT INTO tasks (id,title,done,date,description) VALUES (?,?,?,?,?)`, [
            randomUUID(), title, false, Date.now(), description
        ], function (err, row) {
            if (err) {
                fastify.log.error(err);
                return reply.code(500).send({ error: "Erro no servidor,tente novamente mais tarde." });
            };
            return reply.code(201).send({
                message: "Tarefa criada com sucesso."
            });
        });
    });
    fastify.delete('/delete/:id', {
        schema: {
            params: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string" }
                },
                additionalProperties: false
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    }
                },
                404: {
                    type: "object",
                    properties: {
                        error: { type: "string" }
                    }
                }
            }
        }
    }, function (request, reply) {
        const id = request.params.id;
        fastify.mysql.query(`DELETE FROM tasks WHERE id = ?`, id, function (err, row) {
            if (err) {
                fastify.log.error(err);
                return reply.code(500).send({ error: "Erro no servidor,tente novamente mais tarde." });
            };
            if (row.affectedRows <= 0) {
                return reply.code(404).send({
                    error: "Nenhuma tarefa encontrada."
                });
            };
            return reply.code(200).send({ message: "Tarefa deletada com sucesso." });
        });
    });
    fastify.patch('/update/:id', {
        schema: {
            params: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string" }
                }, additionalProperties: false
            },
            body: {
                type: "object",
                required: ["title", 'description', 'done'],
                additionalProperties: false,
                properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    done: { type: "boolean" }
                }
            }
        }
    }, function (request, reply) {
        const id = request.params.id;
        const { title, description, done } = request.body;
        fastify.mysql.query(`UPDATE tasks SET title = ?,description = ?,done = ? WHERE id = ?`, [
            title, description, done, id
        ], function (err, row) {
            if (err) {
                return reply.code(500).send({
                    error: "Erro no servidor,tente novamente mais tarde."
                });
            };
            return reply.code(200).send({
                message: "Tarefa atualizada com sucesso."
            });
        });
    });
};