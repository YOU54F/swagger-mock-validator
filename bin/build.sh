echo ==== Load nvm ====
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

echo ==== Test using node 4.x ====
nvm install 4.8.1
rm -rf node_modules
npm install
npm test

echo ==== Test using node 6.x ====
nvm install 6.10.1
rm -rf node_modules
npm install
npm test
curl -sSL https://download.sourceclear.com/ci.sh | bash

echo ==== Test using node 7.x ====
nvm install 7.7.4
rm -rf node_modules
npm install
npm test
