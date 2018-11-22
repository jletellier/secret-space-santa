# Secret Space Santa

This application was originally built to manage the upcoming Secret Santa event for the Young ESRIN community in 2015.

It uses cutting-edge technology to handle the *vast amount of data*, eg.

- [Meteor](https://www.meteor.com/) and
- [mongoDB](https://www.mongodb.com/).
                 
## Important Note

The initial development of the entire application took less than 3 hours. It was just a small exercise to showcase how fast one can prototype an application with Meteor. Don't take this little experiment too seriously!

## Build Instructions (with Docker)

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
[clone it, make commits and open a pull request](https://guides.github.com/activities/contributing-to-open-source/).
