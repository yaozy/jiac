const fs = require("fs");
const path = require("path");


const mkdir = fs.mkdir.bind(fs);
const mkdirSync = fs.mkdirSync.bind(fs);

const write = fs.writeFile.bind(fs);
const writeSync = fs.writeFileSync.bind(fs);

const writeFile = fs.writeFile.bind(fs);
const writeFileSync = fs.writeFileSync.bind(fs);



function mkdirAll(dirname, callback) {

    fs.exists(dirname, function (exists) {

        if (exists)
        {
            callback();
        }
        else
        {
            mkdirAll(path.dirname(dirname), function () {

                mkdir(dirname, callback);
            });
        }
    });
}


function mkdirAllSync(dirname) {

    if (fs.existsSync(dirname))
    {
        return true;
    }
    
    if (mkdirAllSync(path.dirname(dirname)))
    {
        mkdirSync(dirname);
        return true;
    }
}


function write( fd, buffer, offset, length, position, callback) {

    fs.write
}