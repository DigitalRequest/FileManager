const { ipcRenderer } = require('electron');
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
                let folder_path = dir + "\\" + target.childNodes[0].textContent;
                let folder_at = document.getElementById(target.childNodes[0].textContent);

                if (folder_at.childNodes.length < 2) {
                    ipcRenderer.send('folder-clicked-show', folder_path);
                }
                else {
                    ipcRenderer.send('folder-clicked-collapse', folder_path);
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
    console.log(div.childNodes[1]);
    while (div.childNodes[1])
    {
        div.childNodes[1].remove();
    }
}