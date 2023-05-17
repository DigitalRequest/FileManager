const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('get-dir', 'arg');
    ipcRenderer.on('dir', (event, dir) => {
        let dir_name = dir.split("\\");

        let list = document.getElementById("list-test");
        dir_name = dir_name[dir_name.length - 1];
        document.getElementById('dirNameTest').textContent = dir_name;

        updateList(dir, list);
        list.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('folder')) {
                const folderName = target.childNodes[0].textContent;
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
        console.log(folder_dir);
        var folder_name = folder_dir.split("\\");
        folder_name = folder_name[folder_name.length - 1];

        let folder_document = document.getElementById(folder_name);

        collapseList(folder_dir, folder_document);
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

function collapseList(dir, div) {
    while (div.childNodes[1]) {
        div.childNodes[1].remove();
    }
}