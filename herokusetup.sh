git fetch --all
git reset --hard origin/live
rm -rf public
mv app/* .
npm install
git add .
git commit -am "Pushing to production"
git push heroku master -f

