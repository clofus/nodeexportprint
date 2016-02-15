var generateDoc = function(template, data, options, callback) {

    var phantom = require('phantom');
    var handlebars = require("node-handlebars");

    var templatesDir = "templates"

    var hbs = handlebars.create({
        partialsDir: templatesDir
    });



    var generateFilename = function(ext) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return "Export_" + s4() + s4() + s4() + ext;
    };

    hbs.engine(templatesDir + "/" + template + ".html", data, function(err, html) {
        if (err) {
            throw err;
        }
        console.log(html); 


        var expectedLocation = 'http://www.clofus.com/';
        phantom.create(function(ph) {
            ph.createPage(function(page) {
                page.setContent(html, expectedLocation);

                page.evaluate(function() {
                    return document.title;
                }, function(result) {
                    console.log('Page title is ' + result);

                    page.set('paperSize', {
                        format: options.paperSize,
                        orientation: options.orientation,
                        margin: '1cm'
                    }, function() {

                        page.onResourceRequested(
                            function(requestData, request, arg1, arg2) {
                                console.log(requestData.url)
                                request.abort();
                            },
                            function(requestData) {
                                console.log(requestData.url)
                            });

                        /*
                         page.onResourceRequested(function(requestData, request) {
                         console.log('::loading', requestData['url']);  // this does get logged now
                         };
                         */

                        page.set('onLoadFinished', function(success) {
                            var filename = generateFilename(".pdf");
                            page.render(filename, function() {
                                ph.exit();
                                var filepath = __dirname + "/" + filename;
                                callback(filepath);
                            });

                            /*page.render('google_home.jpeg', {format: 'jpeg', quality: '100'},function () {
                                ph.exit();
                            });*/
                        });

                    });

                });

            });

        });
    });

}

module.exports = {
    generateDoc: generateDoc
}