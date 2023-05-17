const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('get-dir', 'arg');
    ipcRenderer.on('dir', (event, dir) => {
        const body = document.querySelector('body');
        const filesField = document.getElementsByClassName('fe-files');
        var dir_name = dir.split("\\");
        dir_name = dir_name[dir_name.length - 1];

        document.getElementById('dirNameTest').textContent = dir_name;
        document.getElementById('dirNameTest').id = dir_name;

        body.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('folder')) {
                var folderName;
                if (target.hasChildNodes())
                    var folderName = target.childNodes[0].textContent;
                else
                    var folderName = target.textContent;
                const folderAt = document.getElementById(folderName);
                const parentDir = path.dirname(dir);
                const dirPaths = dir.split('\\');

                if (folderName != path.basename(dir)) {
                    dir = path.join(dir, folderName);
                }
                if (dirPaths.includes(folderName)) {
                    let index = dirPaths.indexOf(folderName);
                    dir = dirPaths.slice(0, index + 1).join('\\');
                }
                if (fs.readdirSync(parentDir).includes(folderName)) {
                    dir = path.join(parentDir, folderName);
                }

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
        if (fs.lstatSync(dir + "\\" + elm).isDirectory()) {
            let dir_child = document.createElement('div');
            dir_child.setAttribute('class', 'folder');
            dir_child.setAttribute('id', elm);
            dir_child.textContent = elm;

            ul.appendChild(dir_child);
        }
    });
    div.appendChild(ul);
}

function collapseList(div) {
    console.log(div);
    while (div.childNodes[1]) {
        div.childNodes[1].remove();
    }
}

function createFiles(dir, fileField) {
    fs.readdirSync(dir).forEach((file) => {
        let fileDiv = document.createElement('div');
        fileDiv.setAttribute('class', 'file-body');
        fileDiv.setAttribute('id', file.toString());
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