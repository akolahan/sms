app.controller('controller', function ($rootScope, $scope, $webSql, $routeParams) {

    $scope.userAgent = navigator.userAgent;

    $rootScope.$on('$routeChangeStart', function () {
        $rootScope.loading = true;
    });

    $rootScope.$on('$routeChangeSuccess', function () {
        $rootScope.loading = false;
    });

    $scope.create_tables = function () {
        $scope.db.createTable('users', {
            "id": {
                "type": "INTEGER",
                "null": "NOT NULL",
                "primary": true,
                "auto_increment": true
            },
            "group_id": {
                "type": "INTEGER",
                "null": "NOT NULL",
                "index": true
            },
            "name": {
                "type": "TEXT"
            },
            "phone": {
                "type": "TEXT",
                "index": true
            }
        });
        $scope.db.createTable('groups', {
            "id": {
                "type": "INTEGER",
                "null": "NOT NULL",
                "primary": true,
                "auto_increment": true
            },
            "name": {
                "type": "TEXT"
            }
        });
    };

    $scope.insert_user = function (group_id, name, phone) {
        $scope.db.insert('users', {"group_id": group_id, "name": name, "phone": phone}).then(function (results) {
            $scope.insert_user_status = true;
        });
    };

    $scope.delete_user = function (id) {
        $scope.db.del('users', {"id": id}).then(function (results) {
            $scope.delete_user_status = true;
            $scope.select_users();
        });
    };

    $scope.select_users = function () {
        $scope.db.selectAll("users").then(function (results) {
            $scope.users = [];
            for (var i = 0; i < results.rows.length; i++) {
                $scope.users.push(results.rows.item(i));
            }
        });
    };

    $scope.select_group_users = function (group_id) {
        $scope.db.select("users", {"group_id": group_id}).then(function (results) {
            $scope.group_users = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.group_users.push(results.rows.item(i));
            }
        })
    };

    $scope.select_user = function (id) {
        $scope.db.select("users", {"id": id}).then(function (results) {
            $scope.user = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.user.push(results.rows.item(i));
            }
        })
    };

    $scope.select_user_by_param = function () {
        $scope.select_user($routeParams.user_id);
    };

    $scope.insert_group = function (name) {
        $scope.db.insert('groups', {"name": name}).then(function (results) {
            $scope.insert_group_status = true;
        });
    };

    $scope.delete_group = function (id) {
        $scope.db.del('groups', {"id": id}).then(function (results) {
            $scope.delete_group_status = true;
            $scope.select_groups();
        });
    };

    $scope.delete_group_by_param = function () {
        $scope.delete_group($routeParams.group_id);
    };

    $scope.select_groups = function () {
        $scope.db.selectAll("groups").then(function (results) {
            $scope.groups = [];
            for (var i = 0; i < results.rows.length; i++) {
                $scope.groups.push(results.rows.item(i));
            }
        });
    };

    $scope.select_group = function (id) {
        $scope.db.select("groups", {"id": id}).then(function (results) {
            $scope.group = [];
            for (i = 0; i < results.rows.length; i++) {
                $scope.group.push(results.rows.item(i));
            }
        })
    };

    $scope.select_group_by_param = function () {
        $scope.select_group($routeParams.group_id);
        $scope.select_group_users($routeParams.group_id);
    };

    $scope.delete_status = function () {
        $scope.insert_user_status = false;
        $scope.insert_group_status = false;
    };

    $scope.backup_sql = function () {
        $scope.return = {};
        $scope.db.selectAll("users").then(function (results) {
            $scope.return.users = [];
            for (var i = 0; i < results.rows.length; i++) {
                $scope.return.users.push(results.rows.item(i));
            }
            $scope.db.selectAll("groups").then(function (results) {
                $scope.return.groups = [];
                for (var i = 0; i < results.rows.length; i++) {
                    $scope.return.groups.push(results.rows.item(i));
                }
                $scope.return = JSON.stringify($scope.return);
                $scope.alert = 'start';
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                    $scope.alert += 'file system open: ' + fs.name;
                    fs.root.getFile("newPersistentFile.txt", {create: true, exclusive: false}, function (fileEntry) {
                        $scope.alert += "fileEntry is file?" + fileEntry.isFile.toString();
                        $scope.writeFile(fileEntry, null);
                    }, $scope.onErrorCreateFile);
                }, $scope.onErrorLoadFs);
            });
        });
    };

    $scope.restore_sql = function () {
    };

    $scope.writeFile = function (fileEntry, dataObj) {
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function () {
                $scope.alert += "Successful file write...";
                readFile(fileEntry);
            };
            fileWriter.onerror = function (e) {
                $scope.alert += "Failed file write: " + e.toString();
            };
            if (!dataObj) {
                dataObj = new Blob(['some file data'], {type: 'text/plain'});
            }
            fileWriter.write(dataObj);
        });
    };

    $scope.readFile = function (fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function () {
                $scope.alert += "Successful file read: " + this.result;
                displayFileData(fileEntry.fullPath + ": " + this.result);
            };
            reader.readAsText(file);
        }, onErrorReadFile);
    };

    $scope.onErrorCreateFile = function () {
        $scope.alert += 'error1';
    };

    $scope.onErrorLoadFs = function () {
        $scope.alert += 'error2';
    };

    $scope.db = $webSql.openDatabase('mydb', '1.0', 'sms', 20 * 1024 * 1024);
    $scope.create_tables();
});
