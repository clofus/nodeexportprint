var express = require('express');
var bodyParser = require('body-parser')

var exporter = require('./exporter');
var fs = require("fs");

var app = express();


var allowCrossDomain = function (req, res, next) {
    //console.log("REQUEST RECEIVED"+ req.headers)
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization, refresh_token, grant_type, enctype, client_id');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Authorization', 'text/plain');

        next();
    };


app.use(bodyParser.json());
app.use(allowCrossDomain);

app.get('/favicon.ico', function(req,res){
   res.send(200);
})


app.post('/export.pdf', function(req, res) {
  var data = "", options = {
      paperSize: "A4",
      orientation: "portrait"
  }

  var template = req.body.template;
  data = req.body.data;

  if(req.body.paperSize){
    options.paperSize = req.body.options.paperSize
  }

  if(req.body.orientation){
    options.orientation = req.body.options.orientation
  }

  console.log("page export")
  options.mimetype = { format:"pdf"};
  exporter.generateDoc(template, data, options, function(filepath) {
/*
    res.setHeader('Content-disposition', 'inline; filename="' + filepath.split("/").pop() + '"');
    res.setHeader('Content-type', 'application/pdf');

  var stream = fs.createReadStream(filepath);
  // Be careful of special characters

  var filename = encodeURIComponent(filepath.split("/").pop());
  // Ideally this should strip them

  res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');


  stream.on('end', function () {
    console.log("file downloaded "+ filepath)
    //fs.unlink(filepath);
  });

  stream.pipe(res);
*/


  var filename = {
       name:filepath.split("/").pop()
   }


  res.send(JSON.stringify(filename));

  });
});


app.get("/:filename", function(req,res){
  var filepath = __dirname + "/" + req.params.filename;
  res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

  var stream = fs.createReadStream(filepath);
  // Be careful of special characters

  var filename = encodeURIComponent(filepath.split("/").pop());
  // Ideally this should strip them

  res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');


  stream.on('end', function () {
    console.log("file downloaded "+ filepath)
    fs.unlink(filepath);
  });

  stream.pipe(res);

})




app.listen(5000, function() {
  console.log('Example app listening on port 5000');
});
