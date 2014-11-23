git fetch --all
git reset --hard origin/live
mv app/* .
rm -rf app
npm install

