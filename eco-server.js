{
    "apps"[{
      "name"        : "jinnmail",
      "script"      : "./build/server.js",
      "args"        : ["--log_dir=./build/logs"],
      "watch"       : false,
      "merge_logs"  : true,
      "instances"  : 1,
      "exec_mode"  : "cluster_mode",
      "error_file" : "/var/log/jinnmail/warn.json",
      "out_file"   : "/var/log/jinnmail/info.json",
      "env" : {
        "NODE_ENV" : "dev"
      }
    }]
}