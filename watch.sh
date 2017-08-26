#!/usr/bin/env bash
# script:  watch
# author:  Mike Smullin <mike@smullindesign.com>
# license: GPLv3
# description:
#   watches the given path for changes
#   and executes a given command when changes occur
# usage:
#   watch <path> <cmd...>
#

#path=$1
path="js/"
shift
#cmd=$*
cmd="./node_modules/.bin/brunch build"
sha=0
update_sha() {
  sha=`ls -lR --time-style=full-iso $path | sha1sum`
}
update_sha
previous_sha=$sha

build() {
  echo -en " building...  "
  result=`$cmd`
  notify-send 'brunch build' "$result"
}

compare() {
  update_sha
  if [[ $sha != $previous_sha ]] ; then
    echo -n "change detected, "
    build
    previous_sha=$sha
  else
    #echo -n .
    true
  fi
}

do_exit() {
  echo ""
  echo "--> exiting now..."
  echo ""
  exit
}

trap build SIGQUIT
trap do_exit SIGINT

echo -e  "--> Press Ctrl+\\ to force build, Ctrl+c to exit."
echo -e "--> watching \"$path\""
while true; do
  compare
  sleep 1
done
