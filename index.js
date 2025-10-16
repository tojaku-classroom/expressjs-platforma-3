const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.engine('hbs', engine(
    {
        extname: '.hbs',
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
        partialsDir: path.join(__dirname, 'views', 'partials')
    }
));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

const port = 3000;

app.get('/', (request, response) => {
    response.render('home');
});

app.get('/about', (request, response) => {
    response.render('about');
});

app.get('/contact', (request, response) => {
    response.render('contact');
});

app.listen(port, () => {
    console.log('Spreman sam!');
});