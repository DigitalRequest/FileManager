const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

const iconsFolder = path.join(__dirname, '..', 'assets', 'Icons');
const folderSingle = path.join(iconsFolder, 'FolderSingle.svg').replace(/\\/g, '/');
const textFile = path.join(iconsFolder, 'txt-file.svg').replace(/\\/g, '/');

var foldersOpened = {};

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('get-dir', 'arg');
    ipcRenderer.on('dir', (event, dir) => {
        const body = document.querySelector('body');
        const filesField = document.getElementsByClassName('fe-files');
        const rootDir = document.getElementById('dirNameTest');
        var dir_name = dir.split("\\");
        dir_name = dir_name[dir_name.length - 1];


        rootDir.textContent = dir_name;
        rootDir.id = dir_name;
        rootDir.setAttribute('index', dir.split("\\").length - 1);

        body.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('folder')) {

                if (Object.keys(foldersOpened).length > 30) {
                    delete foldersOpened[Object.keys(foldersOpened)[0]];
                }
                var folderName;
                if (target.hasChildNodes())
                    var folderName = target.childNodes[0].textContent;
                else
                    var folderName = target.textContent;
                const folderAt = document.getElementById(folderName);
                const folderIndex = folderAt.getAttribute('index');
                const clickedFolder = path.join(dir, folderName);

                if (fs.existsSync(clickedFolder)) {
                    dir = clickedFolder;
                }
                else {
                    let dirParent = dir.split("\\").slice(0, folderIndex).join('\\');
                    dir = path.join(dirParent, folderName);
                    Object.keys(foldersOpened).forEach((elm) => {
                        if (fs.existsSync(path.join(elm, folderName))) {
                            dir = path.join(elm, folderName);
                        }
                    })
                }

                fs.readdirSync(dir).forEach((elm) => {
                    if (!foldersOpened.hasOwnProperty(dir))
                        foldersOpened[dir] = [];
                    if (!foldersOpened[dir].includes(elm)) {
                        foldersOpened[dir].push(elm);
                    }
                });


                if (folderAt.childNodes.length < 2) {
                    ipcRenderer.send('folder-clicked-show', dir);
                }
                else {
                    ipcRenderer.send('folder-clicked-collapse', dir);
                }

                removeFiles(filesField[0]);
                createFiles(dir, filesField[0]);
            }
        });

        ipcRenderer.send('get-file', 'arg');
        ipcRenderer.on('file', (event, file) => {
            const body = document.getElementsByClassName('fe-files');
            body[0].addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('file-body')) {
                    const fileClicked = path.join(dir, target.id);
                    if (fs.lstatSync(fileClicked).isDirectory()) {
                        fs.opendir(fileClicked, { encoding: "utf8", bufferSize: 64 });
                    } else {

                    }
                }
            });

        });
    });


    ipcRenderer.on('add-folders-list', (event, folder_dir) => {
        var folder_name = folder_dir.split("\\");
        folder_name = folder_name[folder_name.length - 1];

        let folder_document = document.getElementById(folder_name);

        updateList(folder_dir, folder_document);
    });

    ipcRenderer.on('collapse-folders-list', (event, folder_dir) => {
        var folder_name = folder_dir.split("\\");
        folder_name = folder_name[folder_name.length - 1];

        let folder_document = document.getElementById(folder_name);

        collapseList(folder_document);
    });
});

function updateList(dir, div) {
    let ul = document.createElement('ul');

    direcs = fs.readdirSync(dir);
    direcs.forEach(elm => {
        let elmPath = dir + "\\" + elm;
        if (fs.lstatSync(elmPath).isDirectory()) {
            let dir_child = document.createElement('div');
            dir_child.setAttribute('class', 'folder');
            dir_child.setAttribute('id', elm);
            dir_child.setAttribute('index', elmPath.split("\\").length - 1);
            dir_child.textContent = elm;

            ul.appendChild(dir_child);
        }
    });
    div.appendChild(ul);
}

function collapseList(div) {
    while (div.childNodes[1]) {
        div.childNodes[1].remove();
    }
}

function createFiles(dir, fileField) {
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const fileDiv = document.createElement('div');

        fileDiv.setAttribute('class', 'file-body');
        fileDiv.setAttribute('id', file.toString());
        if (fs.lstatSync(filePath).isDirectory())
            fileDiv.style.backgroundImage = `url('${folderSingle}')`;
        else if (file.endsWith('.txt') || file.endsWith('.rts'))
            fileDiv.style.backgroundImage = `url('${textFile}')`;

        if (file.length < 10) {
            fileDiv.textContent = file.toLowerCase();
        }
        else {
            fileDiv.textContent = file.slice(0, 9).toLowerCase() + "...";
        }

        fileField.appendChild(fileDiv);
    });
}

function removeFiles(fileField) {
    let div = fileField.querySelectorAll('.file-body');
    div.forEach(file => {
        file.remove();
    });
}