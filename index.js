const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const productsRouter = require('./routes/admin/products');

const app = express();

app.use(express.static('public')); //makes everything inside there available to the outside world.
/*app.use(bodyParser.urlencoded({ extended: true }));*/ //is not sufficient to pull out the image that we've tried to upload
app.use(
    cookieSession({
        keys: ['lkasld235j']
    })
);
app.use(authRouter);
app.use(productsRouter);

app.listen(3000, () => {
    console.log('Listening');
});