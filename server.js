var express = require('express');
var bodyParser = require('body-parser')

var exporter = require('./exporter');
var fs = require("fs");

var app = express();
app.use(bodyParser.json());

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

  exporter.generateDoc(template, data, options, function(filepath) {
    res.setHeader('Content-disposition', 'inline; filename="' + filepath.split("/").pop() + '"');
    res.setHeader('Content-type', 'application/pdf');

  var stream = fs.createReadStream(filepath);
  // Be careful of special characters

  var filename = encodeURIComponent(filepath.split("/").pop());
  // Ideally this should strip them

  res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');


  stream.on('end', function () {
    console.log("file downloaded")
    fs.unlink(filepath);
  });

  stream.pipe(res);


  });
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000');
});