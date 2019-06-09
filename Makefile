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
	# make setup-env
	docker build -t registry.heroku.com/ms-dev-bbfootball-bot-api/web .
	docker push registry.heroku.com/ms-dev-bbfootball-bot-api/web
	heroku container:release web -a ms-dev-bbfootball-bot-api

deploy-heroku-pro:
	# make setup-env
	docker build -t registry.heroku.com/ms-bbfootball-bot-api/web .
	docker push registry.heroku.com/ms-bbfootball-bot-api/web
	heroku container:release web -a ms-bbfootball-bot-api
