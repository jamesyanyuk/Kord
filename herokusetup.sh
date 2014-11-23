git fetch --all
git reset --hard origin/live
mv app/* .
rm -rf app
npm install
git add .
git commit -am "Pushing to production"
git push heroku master -f

