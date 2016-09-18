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
//Since we are under node_modules we need to find the project asset folder
const projectPath = path.join(__dirname, '..', '..', 'Assets');
var destination = path.join(projectPath, prefix, jsonFile.name);

exports.importPackage = function (folderName) {
    pathExists(folderName).then((exists) => {
        console.log(parentProject + " " + exists);
        if (exists) {
            createDirectory().then(() => {
                importPackage('*.unitypackage', unityPath + space + COMMAND_PATH + space + UNITY_PARAMETERS +  " \"" + path.join(__dirname, '..', '..') + "\" " + COMMAND_IMPORT).then(
                    () => {
                        copyAllFiles(jsonFile._directories);
                    });
            });
        }
    });
};

exports.exportPackage = function (packageName, assetsPaths) {
    exportPackage(packageName, assetsPaths).then( () => {
        console.log('Assets exported ' + packageName);
    }).catch( err => {
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
        rimraf(assetPath, {}, function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        })
    });
}

function copyAllFiles(assetPaths, dest) {
    return Promise.all(
        assetPaths.map(function (assetPath) {
            return copyFiles(assetPath, dest).then(() => {
                return deleteFiles(assetPath);
            });
        }));
}

function copyFiles(source, dest) {
    return new Promise((resolve, reject) => {
        pathExists(source).then(exists => {
            if (exists) {
                ncp(source, dir, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        }).catch(() => reject('no such path: ' + source));
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
                            let command = "";
                            assetFileList.filter((file) => {
                                return file.indexOf('.js') == -1 && file.indexOf('.unitypackage') == -1;
                            }).map((file) => {
                                return command += "\"" + file + "\" ";
                            });

                            return unityPath + COMMAND_EXPORT + command + " " + packageName + ".unitypackage";
                        }
                    }
                }
            ))
            .on('error', reject)
            .on('end', resolve);;
    });
}
