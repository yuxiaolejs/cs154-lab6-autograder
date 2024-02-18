const app = require('express')();
const bodyParser = require('body-parser');
const testGen = require("./tests")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

process.on('uncaughtException', function (err) {
    console.log(err);
})

process.on('unhandledRejection', function (err) {
    console.log(err);
})

app.all('*', (req, res, next) => {
    let time = new Date()
    let date = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
    console.log(date, req.method, req.url, req.headers['x-real-ip'])
    next()
})

app.get('/', (req, res) => {
    res.redirect("https://github.com/yuxiaolejs/cs154-lab6-autograder")
})

app.get('/testcase/1bit', (req, res) => {
    let length
    if (req.query.length)
        length = parseInt(req.query.length)
    else
        length = 100
    if (isNaN(length) || length < 0) {
        length = 100
    }
    let input = testGen.genTest(length)
    let tests = {
        input,
        output: testGen.oneBitTest(input)
    }
    res.json(tests)
})

app.get('/testcase/2bit', (req, res) => {
    let length
    if (req.query.length)
        length = parseInt(req.query.length)
    else
        length = 100
    if (isNaN(length) || length < 0) {
        length = 100
    }
    let input = testGen.genTest(length)
    let tests = {
        input,
        output: testGen.twoBitTest(input)
    }
    res.json(tests)
})

app.get('/testcase/table', (req, res) => {
    let length
    if (req.query.length)
        length = parseInt(req.query.length)
    else
        length = 100
    if (isNaN(length) || length < 0) {
        length = 100
    }
    let input = testGen.genTest(length)
    let tests = {
        input,
        output: testGen.tableTest(input)
    }
    res.json(tests)
})

app.listen(13002, () => {
    console.log("Listening on port 13002")
})

// console.log(testGen.genTest(100))