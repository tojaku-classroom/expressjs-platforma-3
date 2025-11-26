const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const ajv = require('./lib/validation');
const db = require('./lib/db');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.post('/contact', async (request, response) => {
    const data = request.body;
    const schema = require('./lib/schemas/contact');
    const validateData = ajv.compile(schema);
    const valid = validateData(data);
    if (!valid) {
        console.log(validateData.errors);
        response.render('contactData', { data: data, valid: valid, success: false });
        return;
    }

    let success = false;
    try {
        data._id = Date.now().toString();
        const result = await db.put(data);
        success = true;
    } catch (error) {
        console.log(error);
        success = false;
    }

    response.render('contactData', { data: data, valid: valid, success: success });
});

app.get('/contacts', async (request, response) => {
    let items = null;
    try {
        items = await db.allDocs({ include_docs: true });
        console.log(items);
        items = items.rows.map(r => {
            const doc = r.doc;
            doc.date = new Date(Number(doc._id)).toLocaleDateString('hr');
            return doc;
        });
    } catch (error) {
        console.log(error);
    }
    response.render('contacts', { items: items });
});

app.get('/contact/view/:id', async (request, response) => {
    const data = request.params;
    const schema = require('./lib/schemas/id');
    const validateData = ajv.compile(schema);
    const valid = validateData(data);
    if(!valid) {
        console.log(validateData.errors);
        response.redirect('/error');
    }

    const messageId = data.id.toString();
    try {
        const doc = await db.get(messageId);
        console.log(doc);
        response.render('contactView', {item: doc});
    } catch (error) {
        console.log(error);
        response.redirect('/error');
    }
});

app.listen(port, () => {
    console.log('Spreman sam!');
});