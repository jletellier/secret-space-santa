# Secret Space Santa

This application was originally built to manage a Secret Santa event for the Young ESRIN community in 2015.

The initial development took less than 3 hours. It was just a small exercise to showcase how fast one can prototype an application with Meteor. Don't take this little experiment too seriously!

The application uses

- [Meteor](https://www.meteor.com/),
- [mongoDB](https://www.mongodb.com/), and
- standardized web technologies.

## Development Instructions

- Install [Meteor](https://www.meteor.com/)
- Checkout this git repository
- Run `meteor npm install`
- Run `meteor` and start hacking

## Deployment with Docker

- Checkout this git repository
- CD into `app` folder
  - Run `meteor npm install`
  - Run `meteor build ../build --directory --architecture os.linux.x86_64` (or similar)
- Adjust settings in `docker-compose.yml`
- Run `docker-compose build`
- Run `docker-compose pull`
- Run `docker-compose up`

## Contributing

If you want to contribute to this project, 
[clone it, make commits and open a pull request](https://opensource.guide/how-to-contribute/).

List of awesome people that have already contributed:

- [Julien Letellier](https://github.com/jletellier)
- Luise Lange
