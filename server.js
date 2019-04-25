'use strict';

require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const { Client } = require('pg');
const express = require('express'),
  app = express(),
  PORT = process.env.PORT || 3000,
  WEATHER_API_KEY = process.env.WEATHER_API_KEY,
  GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

app.use(cors());

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

// ERRORS
function handleError(err, res) {
  console.log('ERR', err);
  if (res) res.status(500).send('Sorry, something went wrong');
}



// LOCATION ------------------------------------------------------------


// CREATE LOCATION ROUTE
app.get('/location', getLocation);
// CREATE WEATHER ROUTE
// app.get('/weather', getWeather);

function getLocation(request, response) {
  const locationHandler = {

    query: request.query.data,

    cacheHit: (results) => {
      console.log('Got data from SQL');
      response.send(results.rows[0]);
    },

    cacheMiss: () => {
      Location.fetchLocation(request.query.data)
        .then(data => response.send(data));
    }
  };
  Location.lookupLocation(locationHandler);
}

function Location(query, data) {
  this.search_query = query;
  this.formatted_query = data.formatted_query;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

Location.prototype.save = function () {
  let SQL = `
  INSERT INTO locations
  (search_query, formatted_query, latitude, longitude)
  VALUES($1,$2,$3,$4)
  RETURNING id
  `;
  let values = Object.values(this);
  return client.query(SQL, values);
};

// STATIC METHOD: fetch location from google
Location.fetchLocation = (query) => {
  const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(_URL)
    .then(data => {
      console.log('Got data from google API');
      if (!data.body.results.length) { throw 'No Data'; }
      else {
        // create an instance and save it to database
        let location = new Location(query, data.body.results[0]);
        return location.save()
          .then(result => {
            location.id = result.rows[0].id;
            return location;
          });
      }
    });
};

// STATIC METHOD
Location.lookupLocation = (handler) => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1`;
  const values = [handler.query];

  return client.query(SQL, values)
    .then(results => {
      if (results.rowCount > 0) {
        handler.cacheHit(results);
      }
      else {
        handler.cacheMiss();
      }
    })
    .catch(console.error);
};


//CREATE A NEW LOCATION OBJECT FOR THE USER'S QUERY
// const searchToLatLong = (request, response) => {
//   let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request}&key=${WEATHER_API_KEY}`;
//   return superagent.get(url)
//     .then(res => {
//       response.send(new Location(request, res));
//     }).catch(error => {
//       response.status(500).send('Please enter a valid location!');
//     });
// };

// RETURN ALL WEATHER RECORDS FOR THE USER'S LOCATION QUERY
// const getWeather = (request, response) => {
//   // const darkskyData = require('./data/darksky.json');
//   let url = `https://api.darksky.net/forecast/${WEATHER_API_KEY}/${request.query.lat},${request.query.lng}`;
//   return superagent.get(url)
//     .then(res => {
//       console.log(res.body);
//       const weatherSummaries = [];
//       res.body.daily.data.forEach(day => {
//         weatherSummaries.push(new Weather(day));
//       });
//       // response.send(new Location(request, res));
//       response.send(weatherSummaries);
//     }).catch(error => {
//       response.status(500).send('Please enter a valid location!');
//     });

//   // const weatherSummaries = darkskyData.daily.data.map(day => new Weather(day));
//   // return weatherSummaries;
//   //http://localhost:3000/weather?lat=40.834074&lng=-94.548645
// };

// function Weather(day) {
//   this.forecast = day.summary,
//     this.time = new Date(day.time * 1000).toString().slice(0, 15);
// }


// const errorHandler = (res, status, message) => res.send({ status, message });

app.listen(PORT, () => console.log('App is up on ${PORT}'));
