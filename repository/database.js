// src/repository/database.js
const pool = require('../config/database');

// مدیریت خطاهای اتصال
pool.on('error', (err) => {
    console.error('تلاش برای برقراری مجدد:', err);

    console.log('Connection is closed. Reconnecting...');
    pool.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL database.');
    });


    // در اینجا می‌توانید اقداماتی مانند تلاش برای برقراری مجدد اتصال انجام دهید
});


const db = {
    query: async (sql, params) => {
        try {
            const result = await new Promise((resolve, reject) => {
                pool.execute(sql, params, (err, results) => {
                    if (err) {
                        console.error('Error data:', err);
                        return reject(err); // Reject the promise on error
                    }
                    resolve(results); // Resolve the promise with the results
                });
            });
            return result; // Return the result
        } catch (err) {
            console.error('Database Error:', err);


            throw err; // Rethrow the error to handle it upstream
        }
    },


    // ایجاد عملیات CRUD
    create: async (table, data) => {
        console.log(`data =>${data}`);
        const keys = Object.keys(data).join(', ');
        const values = Object.values(data);
        const placeholders = values.map(() => '?').join(', ');

        const sql = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`;
        console.log(sql);
        console.log(values);
        return await db.query(sql, values);
    },

    read: async (table, columns = [], conditions = {}) => {
        const column = columns.length ? columns.join() : '*';
        const keys = Object.keys(conditions);
        const whereClause = keys.length
            ? 'WHERE ' + keys.map((key) => `${key} = ?`).join(' AND ')
            : '';

        const values = Object.values(conditions);

        const sql = `SELECT ${column} FROM ${table} ${whereClause}`;

        return await db.query(sql, values);
    },

    update: async (table, data, conditions) => {

        const setClause = Object.entries(data)
            .map(([k, v]) => `${k} = '${v}'`)
            .join(', ');
        const whereClause = Object.entries(conditions)
            .map(([k, v]) => `${k} = '${v}'`)
            .join(' AND ');

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const values = [...Object.values(data), ...Object.values(conditions)];
        console.log(` sql => ${sql}`);
        return await db.query(sql, values);
    },

    delete: async (table, conditions) => {
        const whereClause = Object.keys(conditions)
            .map((key) => `${key} = ?`)
            .join(' AND ');

        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        const values = Object.values(conditions);
        return await db.query(sql, values);
    },

};

module.exports = db