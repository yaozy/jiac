let path = require('path');
let fs = require('fs');



function loadFiles(dir, outputs) {

    let files = fs.readdirSync(dir);

    for (let i = 0, l = files.length; i < l; i++)
    {
        let file = path.join(dir, files[i]);

        if (fs.statSync(file).isDirectory())
        {
            loadFiles(file, outputs);
        }
        else
        {
            outputs.push(file);
        }
    }
}



module.exports = function (sourcePath, targetPath) {
    
    let pwd = process.cwd();
    let files = [];
    
    sourcePath = path.join(pwd, sourcePath);
    targetPath = path.join(pwd, targetPath);

    loadFiles(sourcePath, files);

    require('node-watch')(sourcePath, { recursive: true }, function (event, name) {

        console.log(`${name} file`, event);
    });
}
