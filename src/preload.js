const { ipcRenderer, ipcMain } = require('electron');
const fs = require('fs');

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('get-dir', 'arg');
    ipcRenderer.on('dir', (event, dir) => {
        let dir_name = dir.split("\\");

        let list = document.getElementById("list-test");
        dir_name = dir_name[dir_name.length - 1];
        document.getElementById('dirNameTest').textContent = dir_name;

        updateList(dir, list);
    });
    
});

function updateList(dir, list) {
    let ul = document.createElement('ul');

    direcs = fs.readdirSync(dir);
    direcs.forEach(elm => {
        if (fs.lstatSync(dir + "\\" + elm).isDirectory()) {
            let dir_child = document.createElement('li');
            dir_child.setAttribute('class', 'folder');
            dir_child.textContent = elm;

            ul.appendChild(dir_child);
        }
    });
    list.appendChild(ul);
}