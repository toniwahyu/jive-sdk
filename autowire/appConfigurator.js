/*
 * Copyright 2013 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

var jive = require('../api');
var jiveClient = require('../lib/client');

/**
 * Loads the application specified by jiveclientconfiguration.json into memory,
 * or attempts to register a new application based on jiveclientconfiguration.json if the
 * app doesn't exist.
 * @param app
 */
exports.configureApplication = function( app ) {
    var config = jive.config.fetch();
    var appName = config.appName;

    // configure global routes
    console.log('Configuring global framework routes.');
    app.get('/tiles', jive.routes.tiles);
    app.get('/tilesInstall', jive.routes.installTiles);
    app.post('/registration', jive.routes.registration);

    if ( config.clientId && config.clientSecret ) {
        // client id and secret are specified in configuration file

        jive.applications.findByID(config.clientId).execute( function(foundApp ) {
            if ( foundApp ) {
                // exists
                console.log("Finished client config");
                app.emit('event:jiveConfigurationComplete', app);
            }  else {
                // check if still valid
                jiveClient.Applications.retrieve( config.clientId,
                    function(application) {
                        // persist
                        jive.applications.save( application ).execute(function(){
                            config.clientId = application.clientId;
                            config.clientSecret = application.clientSecret;

                            console.log("Finished client config");
                            app.emit('event:jiveConfigurationComplete', app);
                        });
                    },
                    function() {
                        // invalid client ID
                        console.log("Failed client config");
                        app.emit('event:jiveConfigurationFailed', "Invalid client ID");
                    }
                );
            }
        });

    } else {

        jive.applications.findByAppName(appName).execute( function(foundApp) {
            if ( foundApp ) {
                config.clientId = foundApp.clientId;
                console.log("Finished client config");
                app.emit('event:jiveConfigurationComplete', app );
            } else {
                // register app, and proceed
                jiveClient.Applications.register(
                    {
                        'appName' : config.appName,
                        'appDescription': config.appDescription,
                        'userEmail': config.userEmail,
                        'userPassword': config.userPassword,
                        'callbackURL': config.callbackURL
                    },
                    function( application ) {
                        // set clientId
                        config.clientId = application.clientId;
                        application.name = config.appName;
                        jive.applications.save( application ).execute(function(){
                            console.log("Finished client config");
                            app.emit('event:jiveConfigurationComplete', app);
                        });
                    },
                    function(){
                        console.log("Failed client config");
                        app.emit('event:jiveConfigurationFailed', "Unable to register application");
                    }
                );
            }
        });

    }

};

