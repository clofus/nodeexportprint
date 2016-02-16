var generateDoc = function(template, data, options, callback) {

    //var phantom = require('phantom');
    var handlebars = require("node-handlebars");

    var templatesDir = "templates"

    var hbs = handlebars.create({
        partialsDir: templatesDir
    });

    var session;
    var createPhantomSession = function(cb) {
        if (session) {
            return cb(session);
        } else {
            require('phantom').create({}, function(_session) {
                session = _session;
                return cb(session);
            });
        }
    };

    process.on('exit', function(code, signal) {
        session.exit();
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
        //console.log(html);


        var expectedLocation = 'http://www.clofus.com/';
        createPhantomSession(function(phsession) {
            //ph.createPage(function(page) {

            var page;
            console.log("page set")
            try {
                phsession.createPage(function(_page) {
                    page = _page;

                    page.setContent(html, expectedLocation);
                    page.set('paperSize', {
                        format: options.paperSize,
                        orientation: options.orientation,
                        margin: '1cm'
                    }, function() {

                        var i=0;
                        var renderPdf = function(success){
                            var filename = generateFilename(".pdf");
                            console.log("file rendered "+i)
                            page.render(filename, function() {
                                page.close();
                                page = null;
                                //phsession.exit();
                                var filepath = __dirname + "/" + filename;
                                callback(filepath);
                            });
                            i++;
                            /*page.render('google_home.jpeg', {format: 'jpeg', quality: '100'},function () {
                                ph.exit();
                            });*/
                        }

                        page.onResourceRequested(
                            function(requestData, request, arg1, arg2) {
                                console.log(requestData.url)
                                request.abort();
                            },
                            function(requestData) {
                                console.log(requestData.url);
                                //page.set('onLoadFinished', renderPdf);
                            });

                        page.set("onLoadFinished", function(status) {
                            if(i==0){
                                console.log('Status: ' + status + " "+i);
                                renderPdf();
                            }else{
                                page.unset("onLoadFinished")
                            }
                        });

                    });
                });
            } catch (e) {
                try {
                    if (page != null) {
                        page.close(); // try close the page in case it opened but never rendered a pdf due to other issues
                    }
                } catch (e) {
                    // ignore as page may not have been initialised
                }
                callback('Exception rendering pdf:' + e.toString());
            }



            //});

        });
    });

}

module.exports = {
    generateDoc: generateDoc
}