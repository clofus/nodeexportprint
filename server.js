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


app.post('/export', function(req, res) {
  var data = "",
      options = {
        paperSize: "A4",
        orientation: "portrait",
        mimetype : { format:"pdf"}
     };

  var template = req.body.template;
  data = req.body.data;

  if(req.body.paperSize){
    options.paperSize = req.body.options.paperSize
  }

  if(req.body.orientation){
      options.orientation = req.body.options.orientation
  }

  if(req.body.options.mimetype){
      options.mimetype = req.body.options.mimetype
  }

  console.log("page export")
  exporter.generateDoc(template, data, options, function(filepath) {

  var filename = {
       name:filepath.split("/").pop()
  };

  res.send(JSON.stringify(filename));

  });
});


app.get("/download/:filename", function(req,res){
  var filepath = __dirname + "/" + req.params.filename;
  var filename = encodeURIComponent(filepath.split("/").pop());
  var ext = filename.split(".").pop();
    console.log("ext "+ ext);

  res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

  var stream = fs.createReadStream(filepath);
  // Be careful of special characters

  // Ideally this should strip them

  res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');

  if(ext == "pdf")
    res.setHeader('Content-type', 'application/pdf');
  else
    res.setHeader('Content-type', 'image/'+ext);

  stream.on('end', function () {
    console.log("file downloaded "+ filepath)
    fs.unlink(filepath);
  });

  stream.pipe(res);

});


app.listen(5000, function() {
  console.log('Example app listening on port 5000');
});
