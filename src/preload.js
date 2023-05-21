const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

const iconsFolder = path.join(__dirname, '..', 'assets', 'Icons');
const folderSingle = path.join(iconsFolder, 'FolderSingle.svg').replace(/\\/g, '/');
const textFile = path.join(iconsFolder, 'txt-file.svg').replace(/\\/g, '/');
const imageFile = path.join(iconsFolder, 'ImageFile.svg').replace(/\\/g, '/');
const soundFile = path.join(iconsFolder, 'MusicFile.svg').replace(/\\/g, '/');
const otherFiles = path.join(iconsFolder, 'OtherFiles.svg').replace(/\\/g, '/');
const selectedFolders = [];

var foldersOpened = {};

window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('get-dir', 'arg');
    ipcRenderer.on('dir', (event, dir) => {
        const body = document.querySelector('body');
        const navigationBar = document.querySelector('.navigationBar');
        const filesField = document.getElementsByClassName('fe-files');
        const rootDir = document.getElementById('dirNameTest');
        var dir_name = dir.split("\\");
        dir_name = dir_name[dir_name.length - 1];

        rootDir.textContent = dir_name;
        rootDir.id = dir_name;
        rootDir.setAttribute('index', dir.split("\\").length - 1);

        body.addEventListener('click', (event) => {
            const target = event.target;
            if (selectedFolders.length > 0 && !event.ctrlKey) {
                selectedFolders.forEach((folder) => {
                    if (target != folder) {
                        folder.classList.remove('clicked');
                    }
                });
            }
            if (target.classList.contains('buttonRoot')) {
                dir = updateDirectory(dir_name, dir);

                // Remove files at the files field
                removeFiles(filesField[0]);
                createFiles(dir, filesField[0]);

                // Updates the navigation bar
                updateNavigationBar(navigationBar, dir);
            }
            if (target.classList.contains('buttonBack')) {
                dirLenght = dir.split('\\').length;
                if (dirLenght > 2) {
                    dirArray = dir.split('\\').slice(0, dirLenght - 1);
                    dir = dirArray.join('\\');
                } else {
                    // TODO: Error page
                }
                console.log(dir);

                // Remove files at the files field
                removeFiles(filesField[0]);
                createFiles(dir, filesField[0]);

                // Updates the navigation bar
                updateNavigationBar(navigationBar, dir);
            }
            if (target.classList.contains('file-body-f')) {
                if (target.classList.contains('clicked')) {
                    target.classList.remove('clicked');
                } else {
                    target.classList.add('clicked');
                    selectedFolders.push(target);
                }

                dir = updateDirectory(target.id, dir);
            }
            if (target.classList.contains('folder')) {

                dir = updateDirectory(target.id, dir);

                // Send a message to collapse or show the new directories inside
                if (document.getElementById(target.id).childNodes.length < 2) {
                    ipcRenderer.send('folder-clicked-show', dir);
                }
                else {
                    ipcRenderer.send('folder-clicked-collapse', dir);
                }

                // Remove files at the files field
                removeFiles(filesField[0]);
                createFiles(dir, filesField[0]);

                // Updates the navigation bar
                updateNavigationBar(navigationBar, dir);
            }
        });

        body.addEventListener('keypress', (event) => {
            switch (event.key) {
                case 'Enter':
                    if (selectedFolders.length > 0 && document.activeElement != navigationBar) {
                        const folderAt = document.getElementById(path.basename(dir));
                        // Send a message to collapse or show the new directories inside
                        if (folderAt.childNodes.length < 2) {
                            ipcRenderer.send('folder-clicked-show', dir);
                        }
                        else {
                            ipcRenderer.send('folder-clicked-collapse', dir);
                        }

                        // Remove files at the files field
                        removeFiles(filesField[0]);
                        createFiles(dir, filesField[0]);

                        // Updates the navigation bar
                        updateNavigationBar(navigationBar, dir);
                        selectedFolders.length = 0;
                    } else {
                        if (fs.existsSync(navigationBar.value) && fs.lstatSync(navigationBar.value).isDirectory()) {
                            dir = navigationBar.value;

                            const folderAt = document.getElementById(path.basename(dir));
                            // Send a message to collapse or show the new directories inside
                            if (folderAt.childNodes.length < 2) {
                                ipcRenderer.send('folder-clicked-show', dir);
                            }
                            else {
                                ipcRenderer.send('folder-clicked-collapse', dir);
                            }

                            // Remove files at the files field
                            removeFiles(filesField[0]);
                            createFiles(dir, filesField[0]);

                            // Updates the navigation bar
                            updateNavigationBar(navigationBar, dir);
                            selectedFolders.length = 0;
                        }
                    }
                    break;
            }
        });
        body.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'c':
                    if (event.ctrlKey) {
                        console.log(selectedFolders);
                    }
                    break;
            }
        });
        body.addEventListener('mouseover', (event) => {
            const target = event.target;
            if (target.classList.contains('file-body-f')) {
                target.classList.add('selected');
            }
        });
        body.addEventListener('mouseout', (event) => {
            const target = event.target;
            if (target.classList.contains('file-body-f')) {
                target.classList.remove('selected');
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

function updateNavigationBar(navigationBar, dir) {
    // Updates the navigation bar
    if (navigationBar.scrollWidth < navigationBar.clientWidth) {
        navigationBar.value = dir;
    }
    else {
        navigationBar.value = dir;
        navigationBar.scrollLeft = navigationBar.scrollWidth;
    }
}

function updateDirectory(folderName, dir) {
    // Delete the keys for dictionary if too large
    if (Object.keys(foldersOpened).length > 30) {
        delete foldersOpened[Object.keys(foldersOpened)[0]];
    }

    // Get folder name
    const folderAt = document.getElementById(folderName);
    const folderIndex = folderAt.getAttribute('index');
    const clickedFolder = path.join(dir, folderName);


    // Set the new directory at
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

    // Create a key for the directories inside the current directory
    fs.readdirSync(dir).forEach((elm) => {
        if (!foldersOpened.hasOwnProperty(dir))
            foldersOpened[dir] = [];
        if (!foldersOpened[dir].includes(elm)) {
            foldersOpened[dir].push(elm);
        }
    });

    return dir;
}

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
        const fileIndex = filePath.split("\\").length - 1;
        const fileDiv = document.createElement('div');

        fileDiv.setAttribute('class', 'file-body-f');
        fileDiv.setAttribute('id', file.toString());
        if (fs.lstatSync(filePath).isDirectory()) {
            fileDiv.setAttribute('index', fileIndex);
        }
        if (fs.lstatSync(filePath).isDirectory())
            fileDiv.style.backgroundImage = `url('${folderSingle}')`;
        else if (file.endsWith('.txt') || file.endsWith('.rtf'))
            fileDiv.style.backgroundImage = `url('${textFile}')`;
        else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
            fileDiv.style.backgroundImage = `url('${imageFile}')`;
        else if (file.endsWith('.mp3') || file.endsWith('.wav'))
            fileDiv.style.backgroundImage = `url('${soundFile}')`;
        else
            fileDiv.style.backgroundImage = `url('${otherFiles}')`;

        if (file.length < 10) {
            fileDiv.textContent = file;
        }
        else {
            fileDiv.textContent = file.slice(0, 9) + "...";
        }

        fileField.appendChild(fileDiv);
    });
}

function removeFiles(fileField) {
    let div = fileField.querySelectorAll('.file-body-f');
    div.forEach(file => {
        file.remove();
    });
}