const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const upload = multer({ dest: 'pic_uploads/' });
const app = express();
const PORT = 8080;

app.use(session({
    secret: 'very-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/pic_uploads', express.static('pic_uploads'));

const db = new sqlite3.Database('./maintenance_requests.db', (err) => {
    if (err)
        return console.error(err.message);
    else { console.log("Connected to the database."); }
});


app.listen(PORT, (error) => {
    if(error)
        console.log("Error occurred, server can't start", error);
    else {
        console.log("Server is Successfully Running" + " on port " + PORT);
    }
});

app.get('/', (req, res) => {
    // Check if the session user is present.
    if (!req.session.user)
        return res.redirect('login');

    const user = req.session.user[0];
    if (user === 0)
        return res.redirect('admin_page');
    if (user === -1)
        return res.redirect('staff_page');
    
    res.redirect('tenant_page');
});


app.get('/admin_page', (req, res) => {
    const { password, first_name, last_name, phone_number, email, check_in_date, check_out_date, apartment_number } = req.query;
    let query = `SELECT * FROM users`;
    const params = [];
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('admin_page', { users: rows, password: password,
            first_name: first_name, last_name: last_name, 
            phone_number: phone_number, email: email, 
            check_in_date: check_in_date, check_out_date: check_out_date, 
            apartment_number: apartment_number });
    });
});

app.get('/add_tenant', (req, res) => {
    const { user_id, password, first_name, last_name, phone_number, email, check_in_date, check_out_date, apartment_number } = req.query;
    let query = `SELECT * FROM users WHERE true`;
    const params = [];

    if (first_name && first_name != ' ') {
        query += ` AND first_name = ?`;
        params.push(first_name);
    }
    if (last_name && last_name != ' ') {
        query += ` AND last_name = ?`;
        params.push(last_name);
    }
    if (phone_number && phone_number != ' ') {
        query += ` AND phone_number = ?`;
        params.push(phone_number);
    }
    if (email && email != ' ') {
        query += ` AND email = ?`;
        params.push(email);
    }
    if (check_in_date && check_in_date != ' ') {
        query += ` AND check_in_date = ?`;
        params.push(check_in_date);
    }
    if (check_out_date && check_out_date != ' ') {
        query += ` AND check_out_date = ?`;
        params.push(check_out_date);
    }
    if (apartment_number && apartment_number != ' ') {
        query += ` AND apartment_number = ?`;
        params.push(apartment_number);
    }
    db.all(query, params, (err, tenant) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('add_tenant', { 
            requests: tenant, user_id: user_id, password: password,
            first_name: first_name, last_name: last_name, 
            phone_number: phone_number, email: email, 
            check_in_date: check_in_date, check_out_date: check_out_date, 
            apartment_number: apartment_number });
    });
});

app.post('/add_tenant', (req, res) => {
    const sql_prompt = `INSERT or REPLACE INTO users (user_id, password, first_name, last_name, phone_number, email, check_in_date, check_out_date, apartment_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const check_in_date = req.body.date_filter[0];
    const check_out_date = req.body.date_filter[1];

    db.run(sql_prompt,
    [
        req.body.user_id,
        req.body.password,
        req.body.first_name,
        req.body.last_name,
        req.body.phone_number,
        req.body.email,
        check_in_date,
        check_out_date,
        req.body.apartment_number
    ], function(err) {
        if (err) {
            console.error("Error inserting data:", err.message);
        }
    });
    res.redirect('/add_tenant');
});

app.get('/move_tenant', (req, res) => {
    const { user_id, apartment_number } = req.query;
    let query = `SELECT * FROM users WHERE true`;
    const params = [];

    if (user_id && user_id != ' ') {
        query += ` AND user_id = ?`;
        params.push(user_id);
    }
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('move_tenant', { requests: rows, user_id: user_id, apartment_number: apartment_number });
    });
});

app.post('/move_tenant', (req, res) => {
    const user_id = parseInt(req.body.user_id);
    const new_apartment = req.body.apartment_number;
    if (!user_id) {
        return res.status(400).send('User ID is required.');
    }
    if (!new_apartment) {
        return res.status(400).send('Apartment Number is required.');
    }
    db.run('UPDATE users SET apartment_number = ? WHERE user_id = ?', [new_apartment, user_id], function(err) {
        if (err) {
            return res.status(500).send('Error moving tenant apartment');
        }
        res.redirect(`/move_tenant`)
    });
});

app.get('/delete_tenant', (req, res) => {
    const { user_id } = req.query;
    let query = `SELECT * FROM users WHERE true`;
    const params = [];

    if (user_id && user_id != ' ') {
        query += ` AND user_id = ?`;
        params.push(user_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('delete_tenant', { requests: rows, user_id: user_id });
    });
});

app.post('/delete_tenant', (req, res) => {
    const user_id = req.body.user_id;
    const action = req.body.action;

    if (!user_id) {
        return res.status(400).send('User ID is required.');
    }

    // Expand allows the admin to see more information about the tenant before deletion.
    if (action === 'expand') {
        db.get('SELECT * FROM users WHERE user_id = ?', [user_id], (err, tenant) => {
            if (err) {
                return res.status(500).send('Error retrieving tenant details.');
            }
            if (!tenant) {
                return res.status(404).send('Tenant not found.');
            }
            res.render('tenant_details', { tenant: tenant });
        });
    }
    else if (action === 'delete') {
        db.run('DELETE FROM users WHERE user_id = ?', [user_id], function(err) {
            if (err) {
                return res.status(500).send('Error deleting tenant.');
            }
            res.redirect('/delete_tenant');
        });
    }
    else {
        return res.status(400).send('Invalid action.');
    }
});


app.get('/tenant_page', (req, res) => {
    res.render('tenant_page');
});

app.get('/request_maintenance', (req, res) => {
    const apartment_number = req.session.user[2];
    res.render('request_maintenance', { apartment_number: apartment_number });
});

app.post('/submit-maintenance-request', upload.single('photo'), (req, res) => {
    const { apartment_number, area, description } = req.body;
    const photo = req.file ? req.file.filename : null; // File upload, if any

    // Convert timestamp from the "YYYY-MM-DDTHH:MM" format to "YYYY-MM-DD HH:MM:SS"
    const timestamp = new Date().toISOString().slice(0, 19);
    const formattedTimestamp = timestamp.replace('T', ' ');

    // Create a new maintenance request in the database
    const sql = 'INSERT INTO requests (apartment_number, area, description, timestamp, photo, status) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [apartment_number, area, description, formattedTimestamp, photo, 'Pending'];

    db.run(sql, values, function(err) {
        if (err) {
            let error = err;
            console.log(err);
            
            return res.status(500).send('Error creating maintenance request.');
        }

        res.redirect('/tenant_page');
    });
});

app.get('/staff_page', (req, res) => {
    const { request_id, apartment_number, area, description, timestamp, photo, status } = req.query;
    let query = `SELECT * FROM requests WHERE true`;
    const params = [];

    if (apartment_number && apartment_number != ' ') {
        query += ` AND apartment_number = ?`;
        params.push(apartment_number);
    }
    if (area && area != ' ') {
        query += ` AND area = ?`;
        params.push(area);
    }
    if (timestamp && timestamp != ' ') {
        dates = timestamp.split(" : ");
        query += ` AND strftime('%Y-%m-%d %H:%M', timestamp) BETWEEN ? AND ?`;
        params.push(dates[0], dates[1]);
    }
    if (status && status != ' ') {
        query += ` AND status = ?`;
        if (status)
            params.push(`Completed`);
        else {
            params.push(`Pending`);
        }
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('staff_page', { requests: rows, request_id: request_id, 
            apartment_number: apartment_number, area: area, 
            description: description, timestamp: timestamp, photo: photo, 
            status: status });
    });
});

app.get('/request/:id', (req, res) => {
    const request_id = req.params.id;
    // Query the database for this request
    db.get('SELECT * FROM requests WHERE rowid = ?', [request_id], (err, row) => {
        if (err) {
            return res.status(500).send('Error fetching request details');
        }
        if (!row) {
            return res.status(404).send('Request not found');
        }
        res.render('request_record', { request: row });
    });
});

app.post('/request/:id/complete', (req, res) => {
    const request_id = req.params.id;
    db.run('UPDATE requests SET status = ? WHERE request_id = ?', ['Completed', request_id], function(err) {
        if (err) {
            return res.status(500).send('Error updating request status');
        }
        res.redirect(`/request/${request_id}`)
    });

});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const username = parseInt(req.body.username, 10);
    const password = req.body.password;

    db.get(`SELECT * FROM users WHERE user_id = ? AND password = ?`, [username, password], (err, tenant) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error logging in: ', err);
        }
        if (!tenant) {
            res.render('login');
        }
        else if (username === tenant.user_id && password === tenant.password) {
            req.session.user = [username, password, tenant.apartment_number];
            res.redirect('/');
        }
    });
});