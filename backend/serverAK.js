const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./appointments.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado ao banco de dados SQLite.');
});

// Criar a tabela appointments se ela não existir
db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        description TEXT NOT NULL
    )
`);

// Rota para buscar compromissos por data e hora (ambos opcionais)
app.get('/appointments', (req, res) => {
    const { date, time } = req.query;
    let query = 'SELECT * FROM appointments';
    let params = [];

    if (date && time) {
        query += ' WHERE date = ? AND time = ?';
        params = [date, time];
    } else if (date) {
        query += ' WHERE date = ?';
        params = [date];
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro ao buscar compromissos.');
        }
        res.json(rows);
    });
});

// Rota para contar compromissos por data em um intervalo
app.get('/appointments/count', (req, res) => {
    const { startDate, endDate } = req.query;
    const query = `
        SELECT date, COUNT(*) as count
        FROM appointments
        WHERE date BETWEEN ? AND ?
        GROUP BY date
    `;
    db.all(query, [startDate, endDate], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro ao buscar contagem de compromissos.');
        }
        res.json(rows);
    });
});

// Adicionar novo compromisso
app.post('/appointments', (req, res) => {
    const { date, time, description } = req.body;
    db.run('INSERT INTO appointments (date, time, description) VALUES (?, ?, ?)',
        [date, time, description],
        function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Erro ao adicionar compromisso.');
            }
            res.json({ id: this.lastID, date, time, description });
        }
    );
});

// Excluir compromisso
app.delete('/appointments/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM appointments WHERE id = ?', id, (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro ao excluir compromisso.');
        }
        res.send('Compromisso excluído com sucesso.');
    });
});

// Atualizar compromisso
app.put('/appointments/:id', (req, res) => {
    const id = req.params.id;
    const { description } = req.body;
    db.run('UPDATE appointments SET description = ? WHERE id = ?', [description, id], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro ao atualizar compromisso.');
        }
        db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Erro ao buscar compromisso atualizado.');
            }
            res.json(row);
        });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});