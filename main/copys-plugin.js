const path = require('path');
const fs = require('fs');
module.exports = class CpPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.done.tap(
            'CpPlugin',
            (status) => {
                const { from, to, pub } = this.options || {};
                const projectRoot = process.cwd();
                copyDir(
                    path.join(projectRoot, from),
                    path.join(projectRoot, to),
                    pub,
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



/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, pub, callback) {
    fs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            fs.mkdirSync(dist);
            fs.mkdirSync(dist + '/' + pub);
        }
        _copy(null, src, dist + '/' + pub);
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
                        var _src = src + '/' + path;
                        var _dist = dist + '/' + path;
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