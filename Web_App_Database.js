const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./maintenance_requests.db', (err) => {
    if (err)
        return console.error(err.message);
    else { console.log("Connected to the database."); }
});

// Create request history table
db.run(`CREATE TABLE IF NOT EXISTS requests (
        request_id INTEGER,
        apartment_number TEXT NOT NULL,
        area TEXT NOT NULL,
        description TEXT,
        timestamp DATETIME NOT NULL,
        photo TEXT,
        status TEXT NOT NULL,
        PRIMARY KEY (request_id),
        UNIQUE (apartment_number, area, timestamp)
    )`
);

// Create mock values for testing.
const mockRequests = [
    {
        apartment_number: '101',
        area: 'Kitchen',
        description: 'Bathtub drain gets stuck',
        timestamp: '2024-10-20 14:30',
        photo: '5b509e708964d0166a460fdc42ec578c',
        status: 'Pending'
    },
    {
        apartment_number: '102',
        area: 'Bathroom',
        description: 'AC does not work',
        timestamp: '2024-10-21 09:00',
        photo: '36a36141c2ffef7563b5233054ddd788',
        status: 'Completed'
    },
    {
        apartment_number: '103',
        area: 'Living Room',
        description: 'Leaking ceiling',
        timestamp: '2024-10-22 11:15',
        photo: 'f15c7e09a2192c31d0410d72ff591d64',
        status: 'Pending'
    },
    {
        apartment_number: '104',
        area: 'Bedroom',
        description: 'Light fixture not working',
        timestamp: '2024-10-23 16:45',
        photo: '',
        status: 'Pending'
    },
    {
        apartment_number: '105',
        area: 'Laundry Room',
        description: 'Washing machine making noise',
        timestamp: '2024-10-24 08:30',
        photo: '49dbce0a0b09039813388e7c227785ee',
        status: 'Pending'
    },
];

// Add mock values for testing.
db.serialize(() => {
    const stmt = db.prepare(`INSERT or IGNORE INTO requests (apartment_number, area, description, timestamp, photo, status) VALUES (?, ?, ?, ?, ?, ?)`);
    mockRequests.forEach(request => {
        stmt.run(request.apartment_number, request.area, request.description, request.timestamp, request.photo, request.status);
    });
    stmt.finalize();
});


// Create users table for tenants, admins, and staff
db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    check_in_date DATETIME,
    check_out_date DATETIME NOT NULL,
    apartment_number TEXT NOT NULL,
    PRIMARY KEY (user_id, password)
    )`
);

const mockData = [
    {
        user_id: 0,
        password: "adminpassword123",
        first_name: "John",
        last_name: "Doe",
        phone_number: "012-345-0000",
        email: "admin@example.com",
        check_in_date: "0000-01-01 10:00:00",
        check_out_date: "9999-01-01 10:00:00",
        apartment_number: "-1"
    },
    {
        user_id: -1,
        password: "staffpassword123",
        first_name: "John",
        last_name: "Doe",
        phone_number: "012-345-9999",
        email: "staff@example.com",
        check_in_date: "0000-01-01 10:00:00",
        check_out_date: "9999-01-01 10:00:00",
        apartment_number: "-1"
    },
    {
        user_id: 1,
        password: "password123",
        first_name: "John",
        last_name: "Doe",
        phone_number: "123-456-7890",
        email: "john.doe@example.com",
        check_in_date: "2024-01-01 10:00:00",
        check_out_date: "2025-02-01 10:00:00",
        apartment_number: "101"
    },
    {
        user_id: 2,
        password: "password123",
        first_name: "Jane",
        last_name: "Smith",
        phone_number: "234-567-8901",
        email: "jane.smith@example.com",
        check_in_date: "2024-02-01 12:00:00",
        check_out_date: "2025-03-01 12:00:00",
        apartment_number: "102"
    },
    {
        user_id: 3,
        password: "password123",
        first_name: "Alice",
        last_name: "Johnson",
        phone_number: "345-678-9012",
        email: "alice.johnson@example.com",
        check_in_date: "2024-03-01 14:00:00",
        check_out_date: "2025-04-01 14:00:00",
        apartment_number: "103"
    },
    {
        user_id: 4,
        password: "password123",
        first_name: "Bob",
        last_name: "Brown",
        phone_number: "456-789-0123",
        email: "bob.brown@example.com",
        check_in_date: "2024-01-15 09:00:00",
        check_out_date: "2025-02-15 09:00:00",
        apartment_number: "104"
    },
    {
        user_id: 5,
        password: "password123",
        first_name: "Charlie",
        last_name: "Davis",
        phone_number: "567-890-1234",
        email: "charlie.davis@example.com",
        check_in_date: "2024-02-15 08:30:00",
        check_out_date: "2025-03-15 08:30:00",
        apartment_number: "105"
    },
    {
        user_id: 6,
        password: "password123",
        first_name: "Diana",
        last_name: "Wilson",
        phone_number: "678-901-2345",
        email: "diana.wilson@example.com",
        check_in_date: "2024-04-01 10:30:00",
        check_out_date: "2025-05-01 10:30:00",
        apartment_number: "106"
    },
    {
        user_id: 7,
        password: "password123",
        first_name: "Edward",
        last_name: "Miller",
        phone_number: "789-012-3456",
        email: "edward.miller@example.com",
        check_in_date: "2024-05-01 11:00:00",
        check_out_date: "2025-06-01 11:00:00",
        apartment_number: "107"
    },
    {
        user_id: 8,
        password: "password123",
        first_name: "Fay",
        last_name: "Taylor",
        phone_number: "890-123-4567",
        email: "fay.taylor@example.com",
        check_in_date: "2024-06-01 12:00:00",
        check_out_date: "2025-07-01 12:00:00",
        apartment_number: "108"
    },
    {
        user_id: 9,
        password: "password123",
        first_name: "George",
        last_name: "Anderson",
        phone_number: "901-234-5678",
        email: "george.anderson@example.com",
        check_in_date: "2024-07-01 13:00:00",
        check_out_date: "2025-08-01 13:00:00",
        apartment_number: "109"
    },
    {
        user_id: 10,
        password: "password456",
        first_name: "Hannah",
        last_name: "Thomas",
        phone_number: "012-345-6789",
        email: "hannah.thomas@example.com",
        check_in_date: "2024-08-01 09:00:00",
        check_out_date: "2025-09-01 09:00:00",
        apartment_number: "110"
    }
];

// Insert mock data into the database
mockData.forEach((tenant) => {
    const sql_prompt = `INSERT or REPLACE INTO users (user_id, password, first_name, last_name, phone_number, email, check_in_date, check_out_date, apartment_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql_prompt,
        [
            tenant.user_id,
            tenant.password,
            tenant.first_name,
            tenant.last_name,
            tenant.phone_number,
            tenant.email,
            tenant.check_in_date,
            tenant.check_out_date,
            tenant.apartment_number
        ], function(err) {
            if (err) {
                console.error("Error inserting data:", err.message);
            }
        }
    );
});

// Closes the database connection
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});