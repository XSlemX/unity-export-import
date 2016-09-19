# unity-export-import
Import and export for unitypackages

> BEWARE: This project may be useful for some, but was mainly made for personal use. May contain the odd bug

> Also: No tests!

## Install
```
npm install --save unity-export-import
```

## Options
```
var options = {
    unityPath: 'pathToUnity executable',
    projectPath: 'optional path to project',
    destination: 'relative destination for assets after import',
    moveThese: 'files/folders to move after import
}
```
> Do make sure at least you pass in the path to the absolute path to the unity executable, or else the operations will fail.

## Usage
```

var importExport = require('unity-export-import');
//with gulp
gulp.task('import', () => importExport.importPackage({}));
gulp.task('export', () => importExport.exportPackage('name of package, foldersToExport));

//Or
importExport.importPackage(optionalOptions);
importExport.exportPackage('name of package, foldersToExport);
```
