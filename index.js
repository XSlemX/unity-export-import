var mkdirp = require('mkdirp');
var path = require('path');
var ncp = require('ncp');
var gulp = require('gulp');
var shell = require('gulp-shell');
var jsonFile = require('./package.json');
var rimraf = require('rimraf');
var pathExists = require('path-exists');

// var prefix = "__rav";
const COMMAND_PATH = "-projectPath ";
const UNITY_PARAMETERS = " -quit -batchmode -nographics ";
const COMMAND_IMPORT = " -importPackage ";
const COMMAND_EXPORT = " -exportPackage ";
const space = " ";
let unityPath = "\"E:\\Apps\\Unity 5\\Editor\\Unity.exe\""; //Need to make this editable

var src = path.join(__dirname, '.', 'Assets');
const projectRoot = path.join(__dirname, '..', '..');
//Since we are under node_modules we need to find the project asset folder
let projectPath = path.join(projectRoot, 'Assets');

/**
 * options {unityPath, projectPath, destination, moveThese}
 */
exports.importPackage = function (options) {
    if (options.unityPath) {
        unityPath = options.unityPath;
    }
    if (options.projectPath) {
        projectPath = options.projectPath;
    }

    pathExists(projectPath).then(projectExists => {
        if (!projectExists) {
            console.error('Cannot find project path ' + projectPath);
            return;
        }

        importPackage('*.unitypackage',
            unityPath + space + COMMAND_PATH + space + " \"" + projectRoot + "\" " + UNITY_PARAMETERS + COMMAND_IMPORT
        ).then(() => {
            if (!options.destination) {
                console.log('Finished without moving files');
                return;
            } else {
                if (!options.moveThese) {
                    console.error('If you want to move files to a certain destination you need to specify the files to be moved');
                    return;
                }
            }

            var destination = path.join(projectPath, options.destination);
            return createDirectory(destination).then(() => {
                moveFiles(options.moveThese, destination)
                    .then(() => { console.log('finished moving files') })
                    .catch(error => {
                        console.error(error);
                    });
            }).catch(error => {
                console.error(error);
            });;
        }).catch(error => {
            console.error(error);
        });;
    }).catch(error => {
        console.error(error);
    });
};

exports.exportPackage = function (packageName, assetsPaths) {
    exportPackage(packageName, assetsPaths).then(() => {
        console.log('Assets exported ' + packageName);
    }).catch(err => {
        console.log(err);
    });
}

function createDirectory(directory) {
    return new Promise((resolve, reject) => {
        mkdirp(directory, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function deleteFiles(assetPath) {
    return new Promise((resolve, reject) => {
        console.log('deleting files from ' + assetPath);
        setTimeout(() => {
            pathExists(assetPath).then(exists => {
                if (exists) {
                    rimraf(assetPath, {}, function (error) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                } else {
                    reject('Could not find path ' + assetPath);
                }
            });
        }, 1000);
    });
}

function moveFiles(assetPaths, dest) {
    return Promise.all(
        assetPaths.map(function (assetPath) {
            //TODO: Make const
            if(!assetPath.startWith('Assets/')) {
                assetPath = 'Assets/'.concat(assetPath);
            }
            console.log('Moving files :' + assetPath);
            var origin = path.join(projectRoot, assetPath);
            var destination = path.join(dest, assetPath);
            createDirectory(destination).then(() => {
                console.log('Copying files from ' + origin + ' to ' + destination);
                return copyFiles(origin, destination).then(() => {
                    return deleteFiles(origin);
                });
            });
        }));
}

function copyFiles(source, dest) {
    return new Promise((resolve, reject) => {
        console.log('Copying files from ' + source + ' to ' + dest);
        setTimeout(() => {
            pathExists(source).then(exists => {
                if (exists) {
                    ncp(source, dest, function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                } else {
                    reject('Could not copy files from ' + source + ' to ' + dest);
                }
            }).catch(() => reject('no such path: ' + source));
        }, 1000);
    })
}

function importPackage(fileRegex, command) {
    return new Promise(function (resolve, reject) {
        return gulp.src(fileRegex, { read: false })
            .pipe(shell([
                'echo <%= f(file.path) %>',
                '<%= f(file.path) %>',
                'ls -l <%= file.path %>'
            ],
                {
                    templateData: {
                        f: function (s) {
                            return command + " \"" + s + "\"";
                        }
                    }
                }
            ))
            .on('error', reject)
            .on('end', resolve);
    });
}

function exportPackage(packageName, assetFileList) {
    return new Promise((resolve, reject) => {
        return gulp.src('package.json', { read: false })
            .pipe(shell([
                'echo <%= f(file.path) %>',
                '<%= f(file.path) %>',
                'ls -l <%= file.path %>'
            ],
                {
                    templateData: {
                        f: function (s) {
                            let paths = "";
                            assetFileList.filter((file) => {
                                return file.indexOf('.js') == -1 && file.indexOf('.unitypackage') == -1;
                            }).map((file) => {
                                return paths += "\"" + file + "\" ";
                            });

                            return unityPath + space + COMMAND_PATH + projectRoot + space + UNITY_PARAMETERS + COMMAND_EXPORT + space + paths + " " + packageName + ".unitypackage";
                        }
                    }
                }
            ))
            .on('error', reject)
            .on('end', resolve);;
    });
}
