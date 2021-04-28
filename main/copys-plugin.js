const path = require('path');
var rimraf = require("rimraf");
const fs = require('fs');
const pinPath = process.platform === 'darwin' ? '/' : '\\';
const projectRoot = process.cwd();
module.exports = class CpPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.done.tap(
            'CpPlugin',
            (status) => {
                let { from, to } = this.options || {};
                from = path.join(projectRoot, from).replace(/\//g, pinPath);
                deleteDir(to);
                to = path.join(projectRoot, to).replace(/\//g, pinPath);
                console.log(from, '---from', to, '---to');
                copyDir(
                    from,
                    to,
                    function (err) {
                        if (err) {
                            console.log('编译失败！');
                        } else {
                            console.log('编译成功！');
                        }
                    }
                )
            }
        );
    }
}

function deleteDir(p) {
    let deleteTo = '';
    let log = 0;
    for (let index = 0; index < p.length; index++) {
        if (p[index] === '/') {
            log++;
        }
        if (log === 3) {
            break;
        } else {
            deleteTo += p[index];
        }
    }
    deleteTo = path.join(projectRoot, deleteTo).replace(/\//g, pinPath);
    try {
        rimraf.sync(deleteTo);
    } catch (e) {
        console.log('不存在文件');
    }
}

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, callback) {
    fs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            fs.mkdirSync(dist, { recursive: true });
        }
        _copy(null, src, dist + pinPath);
    });

    function _copy(err, src, dist) {
        if (err) {
            callback(err);
        } else {
            fs.readdir(src, function (err, paths) {
                if (err) {
                    callback(err)
                } else {
                    paths.forEach(function (path) {
                        var _src = src + pinPath + path;
                        var _dist = dist + pinPath + path;
                        fs.stat(_src, function (err, stat) {
                            if (err) {
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if (stat.isFile()) {
                                    fs.writeFileSync(_dist, fs.readFileSync(_src));
                                } else if (stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    copyDir(_src, _dist, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
    }
}