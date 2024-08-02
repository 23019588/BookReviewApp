const express = require('express'); 
const mysql = require('mysql2'); 
const multer = require('multer');
const app = express(); 

 
// Create MySQL connection 
const connection = mysql.createConnection({ 
    host: 'sql.freedb.tech', 
    user: 'freedb_Haniel', 
    password: '6pbFD3K$GVy85XE', 
    database: 'freedb_BookReviewApp' 
}); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: (req, file    , cb) => {
        cb(null, file.fieldname);
    }
});
const upload = multer({ storage: storage });
 
connection.connect((err) => { 
    if (err) { 
        console.error('Error connecting to MySQL:', err); 
        return; 
    } 
    console.log('Connected to MySQL database'); 
}); 
 
// Set up view engine 
app.set('view engine', 'ejs'); 
//  enable static files 
app.use(express.static('public')); 
app.use(express.urlencoded({ 
    extended: false
}));
 
// Define routes 
app.get('/', (req, res) => { 
    connection.query('SELECT * FROM book_reviews', (error, results) => { 
      if (error) {
        console.error('Database query error:', error.message);
        return res.status(500).send('Error Retrieving reviews');
      }
       res.render('index', {book: results });
    }); 
}); 

//Retrieve by id
app.get('/book/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = 'SELECT * FROM book_reviews WHERE bookId = ?';
    connection.query(sql, [bookId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving book');
        }
        if (results.length >0) {
            res.render('book', { book: results[0] });
        }else{
            res.status(404).send('Book not found');
        }
    });
});


app.get('/addBook', (req, res) => {
    res.render('addBook');
});

app.post('/addBook',upload.single('image'), (req, res) => {
    const {bookname, rating, review} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; 
    } else {
        image = null;
    }
    const sql = 'INSERT INTO book_reviews (bookname, image, rating, review) VALUES (?, ?, ?, ?)';
    connection.query(sql, [bookname, image, rating, review], (error, results) => {
        if (error) {
            console.error('Error adding book', error);
            res.status(500).send('Error adding book');
        } else{
        res.redirect('/');
        }
    });
});

app.get('/editBook/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = 'SELECT * FROM book_reviews WHERE bookId = ?';
    connection.query(sql, [bookId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving book');
        }
        if (results.length >0) {
            res.render('editBook', { book: results[0] });
        }else{
            res.status(404).send('book not found');
        }
    });
});

app.post('/editBook/:id', upload.single('image'), (req, res) => {
    const bookId = req.params.id;
    const {bookname, rating, review} = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'UPDATE book_reviews SET bookname = ?, image = ?, rating = ?, review = ? WHERE bookId = ?';
    connection.query(sql, [bookname, image, rating, review, bookId], (error, results) => {
        if (error) {
            console.error('Error updating book', error);
            res.status(500).send('Error updating book');
        } else{
        res.redirect('/');
        }
    });
});

app.get('/deleteBook/:id', (req, res) => {
    const bookId = req.params.id;
    const sql = 'DELETE FROM book_reviews WHERE bookId = ?';
    connection.query(sql, [bookId], (error, results) => {
        if (error) {
            console.error('Error deleting book', error);
            res.status(500).send('Error deleting book');
        } else{
        res.redirect('/');
        }
    });
} );



const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 