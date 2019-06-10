ENV ?= dev

setup-env:
	# yarn
	echo "Start setup Environment"
	cp ./environments/$(ENV)/.env .env

install:
	make setup-env

start:
	backpack | bunyan

deploy-heroku-dev:
	# docker build -t registry.heroku.com/ms-dev-bbfootball-bot-api/web .
	# docker push registry.heroku.com/ms-dev-bbfootball-bot-api/web
	heroku container:push --recursive -a ms-dev-bbfootball-bot-api
	heroku container:release web clock worker -a ms-dev-bbfootball-bot-api
	heroku ps:scale clock=1 worker=1 -a ms-dev-bbfootball-bot-api

deploy-heroku-pro:
	# make setup-env
	docker build -t registry.heroku.com/ms-bbfootball-bot-api/web .
	docker push registry.heroku.com/ms-bbfootball-bot-api/web
	heroku container:release web -a ms-bbfootball-bot-api
