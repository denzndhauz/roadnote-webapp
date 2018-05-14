echo 'Install global packages'
npm install -g bower
npm install -g http-server

echo 'Install local packages'
npm install

echo 'Running server @ localhost:8080'
sh serve.sh