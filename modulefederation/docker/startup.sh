#!/bin/bash

# extract the protocol
proto="$(echo $1 | grep :// | sed -e's,^\(.*://\).*,\1,g')"
# remove the protocol
url="$(echo ${1/$proto/})"
# extract the user (if any)
user="$(echo $url | grep @ | cut -d@ -f1)"
# extract the host and port
hostport="$(echo ${url/$user@/} | cut -d/ -f1)"
# by request host without port
host="$(echo $hostport | sed -e 's,:.*,,g')"
# by request - try to extract the port
port="$(echo $hostport | sed -e 's,^.*:,:,g' -e 's,.*:\([0-9]*\).*,\1,g' -e 's,[^0-9],,g')"
# extract the path (if any)
path="$(echo $url | grep / | cut -d/ -f2-)"

port=80

# remove possibly old entries and first line

sed -i '/"remoteEntry"/d' $2
sed -i '/"healthCheck"/d' $2
sed -i '1d' $2

ip="$(hostname -i)"

# add beginning

echo "{" > result
echo "  \"remoteEntry\": \"${REMOTE}\"," >> result
echo "  \"healthCheck\": \"$proto$ip:$port\"," >> result

# add the rest

cat  $2 >> result

# copy back

mv result $2

# tell the administration server

curl --retry 10 -f --retry-all-errors --retry-delay 5 -s -o /dev/null -X POST -H "Content-Type: application/json" -d @/usr/share/nginx/html/assets/manifest.json http://administration-server:8083/portal-administration/register-manifest
#curl --retry 10 -f --retry-all-errors --retry-delay 5 -s -o /dev/null "http://example.com/foo.html"
